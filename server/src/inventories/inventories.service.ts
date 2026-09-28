import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class InventoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private formatVariantToInventory(variant: any, product?: any) {
    const p = product || variant.product;
    const colorAv = variant.attributeValues?.find(
      (av: any) =>
        av.attributeValue?.type?.name?.toLowerCase() === 'color' ||
        Boolean(av.attributeValue?.colorHex),
    );
    const sizeAv = variant.attributeValues?.find(
      (av: any) =>
        av.attributeValue?.type?.name?.toLowerCase() === 'size' ||
        (!av.attributeValue?.colorHex &&
          av.attributeValue?.type?.name?.toLowerCase() !== 'color'),
    );

    return {
      id: variant.id,
      quantity: variant.countInStock,
      productVariant: {
        id: variant.id,
        sku: variant.sku,
        price: Number(variant.price),
        productId: variant.productId,
        product: p
          ? {
              id: p.id,
              name: p.name,
              sku: variant.sku,
            }
          : undefined,
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

  async findAll(productId?: number) {
    const where: any = {};
    if (productId) {
      where.productId = productId;
    }

    const variants = await this.prisma.productVariant.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: { select: { id: true, name: true } },
          },
        },
        attributeValues: {
          include: {
            attributeValue: {
              include: { type: true },
            },
          },
        },
      },
      orderBy: [{ productId: 'asc' }, { id: 'asc' }],
    });

    return variants.map((v) => this.formatVariantToInventory(v));
  }

  async findOne(variantId: number) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: { select: { id: true, name: true } },
          },
        },
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
      throw new NotFoundException(`Biến thể #${variantId} không tồn tại`);
    }

    return this.formatVariantToInventory(variant);
  }

  async findByProduct(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });
    if (!product) {
      throw new NotFoundException(`Sản phẩm #${productId} không tồn tại`);
    }

    return this.findAll(productId);
  }

  async updateStock(variantId: number, quantity: number) {
    const existing = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!existing) {
      throw new NotFoundException(`Biến thể #${variantId} không tồn tại`);
    }

    await this.prisma.productVariant.update({
      where: { id: variantId },
      data: { countInStock: quantity },
    });

    // Invalidate Redis cache
    await this.redis.del(`product:${existing.productId}`);

    return this.findOne(variantId);
  }
}
