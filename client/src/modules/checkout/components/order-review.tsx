'use client';

// ponytail: Đồng bộ tạo đơn hàng chính xác với CreateOrderDto của NestJS
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import { useCheckout } from '../context/checkout-context';
import { useCart } from '@/modules/cart/context/cart-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { TAX_RATE } from '@/config/constants';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';

export function OrderReview() {
  const { shippingAddress: shippingDetails, paymentMethod } = useCheckout();
  const { items, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsPrice = items.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((itemsPrice * TAX_RATE).toFixed(2));
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast({
        title: 'Giỏ hàng trống',
        description: 'Vui lòng thêm sản phẩm vào giỏ trước khi đặt hàng.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = items.map(item => ({
        productId: Number(item.productId),
        variantId: Number(item.variantId || item.productId),
        name: item.name,
        qty: item.qty,
        image: item.image || '/placeholder.png',
        price: Number(item.price),
      }));

      const payload = {
        orderItems,
        shippingDetails: {
          address: shippingDetails?.address || 'Chưa cập nhật',
          city: shippingDetails?.city || 'Hà Nội',
          postalCode: shippingDetails?.postalCode || '100000',
          country: shippingDetails?.country || 'Vietnam',
        },
        paymentMethod: paymentMethod || 'sepay',
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      };

      const response = await apiClient.post('/orders', payload);
      const createdOrder = response.data;
      const orderId = createdOrder.id || createdOrder._id;

      await clearCart();
      toast({
        title: 'Đặt hàng thành công',
        description: `Đơn hàng #${orderId} đã được tạo thành công!`,
      });
      router.push(`/orders/${orderId}`);
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast({
        title: 'Lỗi đặt hàng',
        description:
          error?.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-8 lg:gap-6 md:grid-cols-1">
      <div className="col-span-8 space-y-6 md:col-span-1">
        {/* Shipping Address */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Địa chỉ giao hàng</h2>
          <p className="text-muted-foreground">
            <strong>Địa chỉ: </strong>
            {shippingDetails?.address || 'N/A'}, {shippingDetails?.city || 'N/A'},{' '}
            {shippingDetails?.postalCode || 'N/A'}, {shippingDetails?.country || 'Vietnam'}
          </p>
        </Card>

        {/* Payment Method */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
          <p className="text-muted-foreground">
            <strong>Phương thức: </strong>
            {paymentMethod === 'sepay' || paymentMethod === 'VietQR'
              ? 'Chuyển khoản VietQR qua SePay'
              : paymentMethod}
          </p>
        </Card>

        {/* Order Items */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Sản phẩm trong đơn</h2>
          <div className="space-y-4">
            {items.map(item => (
              <div
                key={item.variantId || item.productId}
                className="flex items-center space-x-4"
              >
                <div className="relative h-20 w-20 bg-muted rounded-md overflow-hidden">
                  <Image
                    src={item.image || '/placeholder.png'}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <Link
                    href={`/products/${item.productId}`}
                    className="font-medium hover:underline"
                  >
                    {item.name}
                  </Link>
                  {item.sku && (
                    <p className="text-xs text-muted-foreground">
                      Mã: {item.sku}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {item.qty} x {formatPrice(item.price)} ={' '}
                    {formatPrice(item.qty * item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="col-span-4 md:col-span-1">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Tóm tắt đơn hàng</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tiền hàng</span>
              <span>{formatPrice(itemsPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phí vận chuyển</span>
              <span>
                {shippingPrice === 0 ? 'Miễn phí' : formatPrice(shippingPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Thuế VAT</span>
              <span>{formatPrice(taxPrice)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium text-lg">
              <span>Tổng thanh toán</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang tạo đơn hàng...' : 'Xác nhận đặt hàng'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
