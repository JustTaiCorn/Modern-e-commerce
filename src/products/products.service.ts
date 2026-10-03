import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ProductSortBy,
  QueryProductDto,
  SortOrder,
} from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findMany(query: QueryProductDto) {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const keyword = query.keyword ? decodeURIComponent(query.keyword).trim() : '';
    const sortBy = query.sortBy ?? ProductSortBy.CREATED_AT;
    const sortOrder = query.sortOrder ?? SortOrder.DESC;

    // ponytail: Xây dựng whereClause động, gọn nhẹ và type-safe
    const whereClause: Prisma.ProductWhereInput = {};

    if (keyword) {
      whereClause.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (query.categoryId) {
      whereClause.categoryId = query.categoryId;
    } else if (query.categorySlug) {
      whereClause.category = { slug: query.categorySlug };
    }

    if (query.brandId) {
      whereClause.brandId = query.brandId;
    } else if (query.brandSlug) {
      whereClause.brand = { slug: query.brandSlug };
    }

    // Lọc theo giá & tồn kho trên bảng quan hệ variants
    const variantWhere: Prisma.ProductVariantWhereInput = {};
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      variantWhere.price = {
        ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
      };
    }
    if (query.inStock) {
      variantWhere.countInStock = { gt: 0 };
    }
    if (Object.keys(variantWhere).length > 0) {
      whereClause.variants = { some: variantWhere };
    }

    const includeRelations = {
      variants: true,
      category: true,
      brand: true,
    };

    let count: number;
    let products: any[];

    if (sortBy === ProductSortBy.PRICE) {
      // ponytail: Sắp xếp theo giá biến thể qua lightweight aggregate query, không cần sửa DB schema hay raw SQL phức tạp
      const matching = await this.prisma.product.findMany({
        where: whereClause,
        select: {
          id: true,
          variants: { select: { price: true } },
        },
      });

      count = matching.length;
      const sorted = matching
        .map((p) => ({
          id: p.id,
          minPrice: p.variants.length
            ? Math.min(...p.variants.map((v) => Number(v.price)))
            : 0,
        }))
        .sort((a, b) =>
          sortOrder === SortOrder.ASC
            ? a.minPrice - b.minPrice
            : b.minPrice - a.minPrice,
        );

      const pagedIds = sorted
        .slice(limit * (page - 1), limit * page)
        .map((p) => p.id);

      if (pagedIds.length === 0) {
        products = [];
      } else {
        const unordered = await this.prisma.product.findMany({
          where: { id: { in: pagedIds } },
          include: includeRelations,
        });
        const productMap = new Map(unordered.map((p) => [p.id, p]));
        products = pagedIds
          .map((id) => productMap.get(id))
          .filter((p): p is NonNullable<typeof p> => Boolean(p));
      }
    } else {
      // Mặc định hoặc theo thời gian: native Prisma query song song
      [count, products] = await Promise.all([
        this.prisma.product.count({ where: whereClause }),
        this.prisma.product.findMany({
          where: whereClause,
          take: limit,
          skip: limit * (page - 1),
          orderBy: { createdAt: sortOrder },
          include: includeRelations,
        }),
      ]);
    }

    const formattedItems = products.map((product) => {
      const prices = product.variants.map((v: any) => Number(v.price));
      const totalStock = product.variants.reduce(
        (sum: number, v: any) => sum + v.countInStock,
        0,
      );
      return {
        ...product,
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
        totalStock,
      };
    });

    return {
      items: formattedItems,
      total: count,
      page,
      pages: Math.ceil(count / limit),
    };
  }

  // ponytail: Cache chi tiết sản phẩm 1h, tránh query JOIN nhiều tầng
  async findById(id: number) {
    return this.redis.getOrSet(`product:${id}`, 3600, async () => {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          variants: {
            include: {
              attributeValues: {
                include: {
                  attributeValue: {
                    include: {
                      type: true,
                    },
                  },
                },
              },
            },
          },
          category: true,
          brand: true,
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  profile_img: true,
                },
              },
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      const prices = product.variants.map((v) => Number(v.price));
      const totalStock = product.variants.reduce(
        (sum, v) => sum + v.countInStock,
        0,
      );

      return {
        ...product,
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
        totalStock,
      };
    });
  }

  async create(dto: CreateProductDto) {
    const { name, description, categoryId, brandId, variants } = dto;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    return this.prisma.product.create({
      data: {
        name,
        slug,
        description,
        categoryId,
        brandId,
        variants: {
          create: variants.map((variant) => ({
            sku: variant.sku,
            price: variant.price,
            countInStock: variant.countInStock ?? 0,
            attributeValues: variant.attributeValueIds
              ? {
                  create: variant.attributeValueIds.map((valId) => ({
                    attributeValue: { connect: { id: valId } },
                  })),
                }
              : undefined,
          })),
        },
      },
      include: {
        variants: true,
      },
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
      },
    });

    // ponytail: Xóa cache khi cập nhật sản phẩm
    await this.redis.del(`product:${id}`);
    return updated;
  }

  async delete(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.prisma.product.delete({ where: { id } });
    // ponytail: Xóa cache khi xóa sản phẩm
    await this.redis.del(`product:${id}`);
    return { success: true };
  }
}
