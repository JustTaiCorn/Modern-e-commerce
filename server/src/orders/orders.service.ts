import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentResultDto } from './dto/payment-result.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto, userId: number) {
    if (dto.orderItems.length < 1) {
      throw new BadRequestException('No order items received.');
    }

    // Aggregate required quantity by variantId and sort IDs ascending to prevent transaction deadlocks
    const itemQtyByVariant = new Map<number, number>();
    for (const item of dto.orderItems) {
      itemQtyByVariant.set(
        item.variantId,
        (itemQtyByVariant.get(item.variantId) || 0) + item.qty,
      );
    }
    const sortedVariantIds = Array.from(itemQtyByVariant.keys()).sort((a, b) => a - b);

    return this.prisma.$transaction(async (tx) => {
      // 1. Deduct stock atomically with conditional check (Fail-Fast)
      for (const variantId of sortedVariantIds) {
        const requiredQty = itemQtyByVariant.get(variantId)!;

        const updateResult = await tx.productVariant.updateMany({
          where: {
            id: variantId,
            countInStock: { gte: requiredQty },
          },
          data: {
            countInStock: { decrement: requiredQty },
          },
        });

        if (updateResult.count === 0) {
          const variant = await tx.productVariant.findUnique({
            where: { id: variantId },
            select: { sku: true, countInStock: true },
          });

          if (!variant) {
            throw new NotFoundException(`Product variant with ID ${variantId} not found.`);
          }

          throw new BadRequestException(
            `Not enough stock for variant SKU: ${variant.sku}. Available: ${variant.countInStock}, requested: ${requiredQty}`,
          );
        }
      }

      // 2. Create order and associated details
      const order = await tx.order.create({
        data: {
          userId,
          paymentMethod: dto.paymentMethod,
          itemsPrice: dto.itemsPrice,
          taxPrice: dto.taxPrice,
          shippingPrice: dto.shippingPrice,
          totalPrice: dto.totalPrice,
          orderItems: {
            create: dto.orderItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              name: item.name,
              qty: item.qty,
              image: item.image,
              price: item.price,
            })),
          },
          shippingDetail: {
            create: {
              address: dto.shippingDetails.address,
              city: dto.shippingDetails.city,
              postalCode: dto.shippingDetails.postalCode,
              country: dto.shippingDetails.country,
            },
          },
        },
        include: {
          orderItems: true,
          shippingDetail: true,
        },
      });

      return order;
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: { user: true },
    });
  }

  async findById(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { username: true, email: true } },
        orderItems: true,
        shippingDetail: true,
        paymentResult: true,
      },
    });

    if (!order) throw new NotFoundException('No order with given ID.');
    return order;
  }

  async updatePaid(id: number, result: PaymentResultDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('No order with given ID.');

    return this.prisma.order.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paymentResult: {
          create: {
            externalId: result.id,
            status: result.status,
            updateTime: result.updateTime,
            emailAddress: result.emailAddress,
          },
        },
      },
      include: {
        paymentResult: true,
      },
    });
  }

  async updateDelivered(id: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('No order with given ID.');

    return this.prisma.order.update({
      where: { id },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
      },
    });
  }

  async findUserOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { orderItems: true },
    });
  }
}
