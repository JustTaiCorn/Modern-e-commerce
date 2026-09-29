import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CloudinaryService } from '../cloudinary/services/cloudinary.service';
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
    private readonly cloudinary: CloudinaryService,
  ) {}

  async findMany(query: QueryProductDto) {
    const limit = query.limit
      ? Number(query.limit)
      : query.pageSize
        ? Number(query.pageSize)
        : 10;
    const page = query.page
      ? Number(query.page)
      : query.current
        ? Number(query.current)
        : 1;
    const rawKeyword = query.keyword ?? query.search ?? query.name;
    const keyword = rawKeyword ? decodeURIComponent(rawKeyword).trim() : '';
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
      variants: {
        include: {
          attributeValues: {
            include: {
              attributeValue: {
                include: { type: true },
              },
            },
          },
        },
      },
      category: true,
      brand: true,
      images: true,
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

    const formattedItems = products.map((product) =>
      this.formatProduct(product),
    );

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
          images: {
            orderBy: { sortOrder: 'asc' },
          },
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

      return this.formatProduct(product);
    });
  }

  private formatProduct(product: any) {
    if (!product) return null;
    const variants = product.variants || [];
    const prices = variants.map((v: any) => Number(v.price));
    const totalStock = variants.reduce(
      (sum: number, v: any) => sum + (v.countInStock || 0),
      0,
    );
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const defaultSku = variants[0]?.sku || `PRD-${product.id}`;

    // Trích xuất danh sách colors và sizes duy nhất từ biến thể
    const colorsMap = new Map<number, any>();
    const sizesMap = new Map<number, any>();
    variants.forEach((v: any) => {
      if (v.attributeValues) {
        v.attributeValues.forEach((av: any) => {
          const val = av.attributeValue || av;
          if (val) {
            if (val.colorHex || val.type?.name?.toLowerCase() === 'color') {
              colorsMap.set(val.id, {
                id: val.id,
                name: val.displayName || val.value,
                code: val.colorHex || val.value,
              });
            } else {
              sizesMap.set(val.id, {
                id: val.id,
                name: val.displayName || val.value,
                code: val.value,
              });
            }
          }
        });
      }
    });

    // ponytail: Gắn thông tin phân loại (Màu sắc) cho từng ảnh nếu ảnh thuộc về variant
    const imagesWithClassification = (product.images || []).map((img: any) => {
      let colorId: number | null = null;
      let colorName: string | null = null;
      let colorCode: string | null = null;

      if (img.variantId) {
        const matchingVariant = variants.find(
          (v: any) => v.id === img.variantId,
        );
        if (matchingVariant && matchingVariant.attributeValues) {
          const colorAv = matchingVariant.attributeValues.find(
            (av: any) =>
              (av.attributeValue || av).colorHex ||
              (av.attributeValue || av).type?.name?.toLowerCase() === 'color',
          );
          const colorVal = colorAv?.attributeValue || colorAv;
          if (colorVal) {
            colorId = colorVal.id;
            colorName = colorVal.displayName || colorVal.value;
            colorCode = colorVal.colorHex || colorVal.value;
          }
        }
      }

      return {
        ...img,
        colorId,
        colorName,
        colorCode,
      };
    });

    return {
      ...product,
      images: imagesWithClassification,
      sku: defaultSku,
      basePrice: minPrice,
      minPrice,
      maxPrice,
      totalStock,
      isPublished: true,
      isActive: variants.some((v: any) => v.isActive !== false),
      colors: Array.from(colorsMap.values()),
      sizes: Array.from(sizesMap.values()),
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
        variants: {
          include: {
            attributeValues: {
              include: { attributeValue: true },
            },
          },
        },
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

  // ponytail: Upload ảnh có thể gán theo từng phân loại (variantId)
  async uploadImages(
    productId: number,
    files: Express.Multer.File[],
    variantId?: number,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (!files || files.length === 0) {
      return { message: 'No files uploaded' };
    }

    const uploadedImages: any[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadResult = await this.cloudinary.uploadImage(file);
      const url = (uploadResult as any).secure_url || uploadResult.url;
      const publicId = (uploadResult as any).public_id;

      const img = await this.prisma.productImage.create({
        data: {
          productId,
          variantId: variantId || null,
          url,
          publicId,
          isMain: i === 0 && !variantId,
          sortOrder: i,
        },
      });
      uploadedImages.push(img);
    }

    await this.redis.del(`product:${productId}`);
    return uploadedImages;
  }

  // ponytail: Xóa ảnh khỏi DB và Cloudinary
  async deleteImage(productId: number, imageId: number) {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!image) {
      throw new NotFoundException(
        `Image with ID ${imageId} not found for product ${productId}`,
      );
    }

    if (image.publicId) {
      try {
        await this.cloudinary.deleteImage(image.publicId);
      } catch (err) {
        console.warn('Failed to delete image from Cloudinary:', err);
      }
    }

    await this.prisma.productImage.delete({ where: { id: imageId } });
    await this.redis.del(`product:${productId}`);
    return { success: true };
  }

  // ponytail: Cập nhật phân loại (variantId) hoặc thuộc tính của ảnh đã có
  async updateImage(
    productId: number,
    imageId: number,
    data: { variantId?: number | null; isMain?: boolean; sortOrder?: number },
  ) {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!image) {
      throw new NotFoundException(
        `Image with ID ${imageId} not found for product ${productId}`,
      );
    }

    const updated = await this.prisma.productImage.update({
      where: { id: imageId },
      data: {
        ...(data.variantId !== undefined ? { variantId: data.variantId } : {}),
        ...(data.isMain !== undefined ? { isMain: data.isMain } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      },
    });

    await this.redis.del(`product:${productId}`);
    return updated;
  }

  // --- Inventory management ---

  async getVariantsByProduct(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const variants = await this.prisma.productVariant.findMany({
      where: { productId },
      include: {
        attributeValues: {
          include: {
            attributeValue: {
              include: { type: true },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    // Build inventory-style response that client inventoryStore expects
    return variants.map((variant) => {
      const colorAv = variant.attributeValues.find(
        (av) =>
          av.attributeValue.type?.name?.toLowerCase() === 'color' ||
          av.attributeValue.colorHex,
      );
      const sizeAv = variant.attributeValues.find(
        (av) =>
          av.attributeValue.type?.name?.toLowerCase() === 'size' ||
          !av.attributeValue.colorHex,
      );

      return {
        id: variant.id,
        quantity: variant.countInStock,
        productVariant: {
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          product: {
            id: product.id,
            name: product.name,
            sku: variant.sku || '',
          },
          color: colorAv
            ? {
                id: colorAv.attributeValue.id,
                name:
                  colorAv.attributeValue.displayName ||
                  colorAv.attributeValue.value,
                code: colorAv.attributeValue.colorHex || '#000000',
              }
            : null,
          size: sizeAv
            ? {
                id: sizeAv.attributeValue.id,
                name:
                  sizeAv.attributeValue.displayName ||
                  sizeAv.attributeValue.value,
                code: sizeAv.attributeValue.value,
              }
            : null,
        },
      };
    });
  }

  async updateVariantStock(variantId: number, quantity: number) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) {
      throw new NotFoundException(`Variant with ID ${variantId} not found`);
    }

    const updated = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: { countInStock: quantity },
    });

    // Xóa cache sản phẩm liên quan
    await this.redis.del(`product:${variant.productId}`);

    return {
      id: updated.id,
      quantity: updated.countInStock,
      productVariant: {
        id: updated.id,
        sku: updated.sku,
        price: updated.price,
      },
    };
  }

  async getAllInventories() {
    const variants = await this.prisma.productVariant.findMany({
      include: {
        product: { select: { id: true, name: true } },
        attributeValues: {
          include: {
            attributeValue: {
              include: { type: true },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return variants.map((variant) => {
      const colorAv = variant.attributeValues.find(
        (av) =>
          av.attributeValue.type?.name?.toLowerCase() === 'color' ||
          av.attributeValue.colorHex,
      );
      const sizeAv = variant.attributeValues.find(
        (av) =>
          av.attributeValue.type?.name?.toLowerCase() === 'size' ||
          !av.attributeValue.colorHex,
      );

      return {
        id: variant.id,
        quantity: variant.countInStock,
        productVariant: {
          id: variant.id,
          sku: variant.sku,
          price: Number(variant.price),
          product: {
            id: variant.product.id,
            name: variant.product.name,
            sku: variant.sku,
          },
          color: colorAv
            ? {
                id: colorAv.attributeValue.id,
                name:
                  colorAv.attributeValue.displayName ||
                  colorAv.attributeValue.value,
                code: colorAv.attributeValue.colorHex || '#000000',
              }
            : null,
          size: sizeAv
            ? {
                id: sizeAv.attributeValue.id,
                name:
                  sizeAv.attributeValue.displayName ||
                  sizeAv.attributeValue.value,
                code: sizeAv.attributeValue.value,
              }
            : null,
        },
      };
    });
  }

  async getInventoryByVariant(variantId: number) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: { select: { id: true, name: true } },
        attributeValues: {
          include: {
            attributeValue: {
              include: { type: true },
            },
          },
        },
      },
    });
    if (!variant) {
      throw new NotFoundException(`Variant with ID ${variantId} not found`);
    }

    const colorAv = variant.attributeValues.find(
      (av) =>
        av.attributeValue.type?.name?.toLowerCase() === 'color' ||
        av.attributeValue.colorHex,
    );
    const sizeAv = variant.attributeValues.find(
      (av) =>
        av.attributeValue.type?.name?.toLowerCase() === 'size' ||
        !av.attributeValue.colorHex,
    );

    return {
      id: variant.id,
      quantity: variant.countInStock,
      productVariant: {
        id: variant.id,
        sku: variant.sku,
        price: Number(variant.price),
        product: {
          id: variant.product.id,
          name: variant.product.name,
          sku: variant.sku,
        },
        color: colorAv
          ? {
              id: colorAv.attributeValue.id,
              name:
                colorAv.attributeValue.displayName ||
                colorAv.attributeValue.value,
              code: colorAv.attributeValue.colorHex || '#000000',
            }
          : null,
        size: sizeAv
          ? {
              id: sizeAv.attributeValue.id,
              name:
                sizeAv.attributeValue.displayName ||
                sizeAv.attributeValue.value,
              code: sizeAv.attributeValue.value,
            }
          : null,
      },
    };
  }
}
