import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaymentResultDto } from './dto/payment-result.dto';
import { OrderStatus } from 'generated/prisma/enums';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private mapOrder(order: any) {
    if (!order) return null;
    const items = (order.orderItems || []).map((i: any) => ({
      id: i.id,
      orderId: i.orderId,
      productId: i.productId,
      variantId: i.variantId,
      productName: i.name,
      name: i.name,
      variantLabel: i.variantLabel,
      image: i.image,
      unitPrice: Number(i.price),
      price: Number(i.price),
      quantity: i.qty,
      qty: i.qty,
      lineTotal: Number(i.price) * i.qty,
      product: i.product,
      variant: i.variant,
    }));

    const totalQty = items.reduce((acc: number, cur: any) => acc + cur.quantity, 0);

    return {
      ...order,
      code: order.invoiceNumber || `ORD-${order.id}`,
      grandTotal: Number(order.totalPrice),
      subtotal: Number(order.itemsPrice),
      shippingFee: Number(order.shippingPrice),
      taxPrice: Number(order.taxPrice),
      discountTotal: 0,
      totalItems: totalQty,
      paymentStatus: order.paidAt ? 'PAID' : 'UNPAID',
      items,
      orderItems: order.orderItems,
      shippingAddressSnapshot: order.shippingDetail
        ? {
            fullName: order.user?.fullName || order.user?.username,
            phone: order.user?.phone,
            address: order.shippingDetail.address,
            ward: '',
            province: order.shippingDetail.city,
          }
        : undefined,
    };
  }

  async create(dto: any, userId: number) {
    let orderItems: Array<{
      productId: number;
      variantId: number;
      name: string;
      qty: number;
      image: string;
      price: number;
    }> = [];

    if (dto.orderItems && Array.isArray(dto.orderItems) && dto.orderItems.length > 0) {
      orderItems = dto.orderItems;
    } else {
      const cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: { product: true, variant: true },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('No order items received and cart is empty.');
      }

      orderItems = cart.items.map((ci) => ({
        productId: ci.productId,
        variantId: ci.variantId,
        name: ci.name,
        qty: ci.qty,
        image: ci.image,
        price: Number(ci.price),
      }));
    }

    const itemQtyByVariant = new Map<number, number>();
    for (const item of orderItems) {
      itemQtyByVariant.set(
        item.variantId,
        (itemQtyByVariant.get(item.variantId) || 0) + item.qty,
      );
    }
    const sortedVariantIds = Array.from(itemQtyByVariant.keys()).sort((a, b) => a - b);

    const calculatedItemsPrice = orderItems.reduce(
      (sum, item) => sum + Number(item.price) * item.qty,
      0,
    );
    const itemsPrice = dto.itemsPrice !== undefined ? Number(dto.itemsPrice) : calculatedItemsPrice;
    const shippingPrice = dto.shippingPrice !== undefined ? Number(dto.shippingPrice) : 30000;
    const taxPrice = dto.taxPrice !== undefined ? Number(dto.taxPrice) : 0;
    let totalPrice = dto.totalPrice !== undefined ? Number(dto.totalPrice) : itemsPrice + shippingPrice + taxPrice;

    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode },
      });
      if (coupon && coupon.isActive) {
        totalPrice = Math.max(0, totalPrice - Number(coupon.value));
      }
    }

    const shippingAddress = dto.shippingAddress || {};
    const shippingDetails = dto.shippingDetails || {};
    const address = shippingAddress.address || shippingDetails.address || 'Địa chỉ nhận hàng';
    const city = shippingAddress.province || shippingDetails.city || 'Hồ Chí Minh';
    const postalCode = shippingDetails.postalCode || '70000';
    const country = shippingAddress.country || shippingDetails.country || 'Vietnam';

    return this.prisma.$transaction(async (tx) => {
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

      const invoiceNumber = `HD-${Date.now()}`;
      const order = await tx.order.create({
        data: {
          userId,
          invoiceNumber,
          paymentMethod: dto.paymentMethod || 'COD',
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice,
          status: 'NEW',
          orderItems: {
            create: orderItems.map((item) => ({
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
              address,
              city,
              postalCode,
              country,
            },
          },
        },
        include: {
          user: { select: { id: true, username: true, email: true, fullName: true, phone: true } },
          orderItems: true,
          shippingDetail: true,
          paymentResult: true,
        },
      });

      const userCart = await tx.cart.findUnique({ where: { userId } });
      if (userCart) {
        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }

      return this.mapOrder(order);
    });
  }

  async findAll() {
    const orders = await this.prisma.order.findMany({
      include: {
        user: { select: { id: true, username: true, email: true, fullName: true, phone: true } },
        orderItems: true,
        shippingDetail: true,
        paymentResult: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o) => this.mapOrder(o));
  }

  async findById(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, email: true, fullName: true, phone: true } },
        orderItems: true,
        shippingDetail: true,
        paymentResult: true,
      },
    });

    if (!order) throw new NotFoundException('No order with given ID.');
    return this.mapOrder(order);
  }

  async findUserOrders(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        user: { select: { id: true, username: true, email: true, fullName: true, phone: true } },
        orderItems: true,
        shippingDetail: true,
        paymentResult: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o) => this.mapOrder(o));
  }

  async updateStatus(id: number, statusInput: string | OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('No order with given ID.');

    const statusUpper = String(statusInput).toUpperCase() as OrderStatus;
    const updateData: any = { status: statusUpper };

    if (statusUpper === 'PAID' && !order.paidAt) {
      updateData.paidAt = new Date();
    }
    if (statusUpper === 'SHIPPED' && !order.shippedAt) {
      updateData.shippedAt = new Date();
    }
    if (statusUpper === 'DELIVERED' && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
    }
    if (statusUpper === 'CANCELLED' && !order.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, username: true, email: true, fullName: true, phone: true } },
        orderItems: true,
        shippingDetail: true,
        paymentResult: true,
      },
    });

    return this.mapOrder(updated);
  }

  async cancelOrder(id: number, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });
    if (!order) throw new NotFoundException('No order with given ID.');
    if (order.status === 'CANCELLED') return this.mapOrder(order);

    return this.prisma.$transaction(async (tx) => {
      for (const item of order.orderItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { countInStock: { increment: item.qty } },
          }).catch(() => {});
        }
      }

      const updated = await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelReason: reason || 'Đã hủy đơn hàng',
        },
        include: {
          user: { select: { id: true, username: true, email: true, fullName: true, phone: true } },
          orderItems: true,
          shippingDetail: true,
          paymentResult: true,
        },
      });

      return this.mapOrder(updated);
    });
  }

  async updatePaid(id: number, result: PaymentResultDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('No order with given ID.');

    const updated = await this.prisma.order.update({
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
        user: { select: { id: true, username: true, email: true, fullName: true, phone: true } },
        orderItems: true,
        shippingDetail: true,
        paymentResult: true,
      },
    });

    return this.mapOrder(updated);
  }

  async updateDelivered(id: number) {
    return this.updateStatus(id, 'DELIVERED');
  }
}
