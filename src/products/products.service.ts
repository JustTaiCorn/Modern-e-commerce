import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findMany(query: QueryProductDto) {
    const limit = parseInt(query.limit ?? '10');
    const page = parseInt(query.page ?? '1');
    const keyword = query.keyword ? decodeURIComponent(query.keyword) : '';

    const whereClause = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' as const } },
            { description: { contains: keyword, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const count = await this.prisma.product.count({ where: whereClause });
    const products = await this.prisma.product.findMany({
      where: whereClause,
      take: limit,
      skip: limit * (page - 1),
      include: {
        variants: true,
        category: true,
        brand: true,
      },
    });

    const formattedItems = products.map((product) => {
      const prices = product.variants.map((v) => Number(v.price));
      const totalStock = product.variants.reduce((sum, v) => sum + v.countInStock, 0);
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

  async findById(id: number) {
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
    const totalStock = product.variants.reduce((sum, v) => sum + v.countInStock, 0);

    return {
      ...product,
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
      totalStock,
    };
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

    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
      },
    });
  }

  async delete(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }
}
