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

    return this.prisma.$transaction(async (tx) => {
      // Create order
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

      // Subtract variant stock
      for (const item of dto.orderItems) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (!variant || variant.countInStock < item.qty) {
          throw new BadRequestException(`Not enough stock for variant SKU: ${variant?.sku}`);
        }

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            countInStock: variant.countInStock - item.qty,
          },
        });
      }

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
