import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SaveShippingDetailsDto } from './dto/save-shipping-details.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: number) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: { images: true },
                },
              },
            },
          },
        },
        shippingDetail: true,
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
          paymentMethod: 'sepay',
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: { images: true },
                  },
                },
              },
            },
          },
          shippingDetail: true,
        },
      });
    }

    return cart;
  }

  private async recalculatePrices(cartId: number) {
    const items = await this.prisma.cartItem.findMany({
      where: { cartId },
    });

    const itemsPrice = items.reduce(
      (acc, item) => acc + Number(item.price) * item.qty,
      0,
    );
    const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    return this.prisma.cart.update({
      where: { id: cartId },
      data: {
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: { images: true },
                },
              },
            },
          },
        },
        shippingDetail: true,
      },
    });
  }

  async addCartItem(userId: number, variantId: number, qty: number) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { include: { images: true } } },
    });
    if (!variant) throw new NotFoundException('Product variant not found');

    const cart = await this.getCart(userId);
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, variantId },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { qty },
      });
    } else {
      const primaryImage = variant.product.images?.[0]?.url || '';
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: variant.productId,
          variantId,
          name: variant.product.name,
          price: variant.price,
          qty,
          countInStock: variant.countInStock,
          image: primaryImage,
        },
      });
    }

    return this.recalculatePrices(cart.id);
  }

  async updateCartItemQty(userId: number, variantId: number, qty: number) {
    const cart = await this.getCart(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, variantId },
    });
    if (!item) throw new NotFoundException('Item not found in cart');

    if (qty > item.countInStock) {
      throw new BadRequestException('Not enough stock');
    }

    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: { qty },
    });

    return this.recalculatePrices(cart.id);
  }

  async removeCartItem(userId: number, variantId: number) {
    const cart = await this.getCart(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, variantId },
    });

    if (item) {
      await this.prisma.cartItem.delete({ where: { id: item.id } });
    }

    return this.recalculatePrices(cart.id);
  }

  async saveShipping(userId: number, details: SaveShippingDetailsDto) {
    const cart = await this.getCart(userId);
    return this.prisma.shippingDetail.upsert({
      where: { cartId: cart.id },
      update: { ...details },
      create: { ...details, cartId: cart.id },
    });
  }

  async savePaymentMethod(userId: number, paymentMethod: string) {
    const cart = await this.getCart(userId);
    return this.prisma.cart.update({
      where: { id: cart.id },
      data: { paymentMethod },
    });
  }

  async clearCart(userId: number) {
    const cart = await this.getCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.recalculatePrices(cart.id);
  }
}
