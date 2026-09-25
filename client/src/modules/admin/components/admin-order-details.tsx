'use client';

// ponytail: Chi tiết đơn hàng cho Admin, tương thích Prisma schema và an toàn types
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Order } from '@apps/shared/types/order';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { formatPrice } from '@/lib/utils';

interface AdminOrderDetailsProps {
  order: Order;
}

export function AdminOrderDetails({ order }: AdminOrderDetailsProps) {
  const { toast } = useToast();
  const router = useRouter();

  if (!order) return null;

  const orderId = order.id || order._id;
  const isPaid =
    order.status === 'PAID' ||
    order.status === 'DELIVERED' ||
    Boolean(order.paidAt) ||
    Boolean(order.isPaid);
  const isDelivered =
    order.status === 'DELIVERED' ||
    Boolean(order.deliveredAt) ||
    Boolean(order.isDelivered);
  const shipping = (order as any).shippingDetail || order.shippingDetails;

  const markAsDelivered = async () => {
    try {
      await apiClient.put(`/orders/${orderId}/deliver`);
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật trạng thái đơn hàng: Đã giao hàng',
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái giao hàng',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Đơn hàng #{orderId}</h1>
        <div className="space-x-4">
          <Badge
            variant={isPaid ? 'default' : 'destructive'}
            className="text-sm"
          >
            {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
          </Badge>
          <Badge
            variant={isDelivered ? 'default' : 'secondary'}
            className="text-sm"
          >
            {isDelivered ? 'Đã giao hàng' : 'Đang xử lý'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 lg:gap-6 md:grid-cols-1">
        <div className="col-span-8 space-y-6 md:col-span-1">
          {/* Shipping Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Khách hàng: </span>
                {order.user?.name || (order.user as any)?.username || 'N/A'} (
                {order.user?.email || 'N/A'})
              </p>
              <p>
                <span className="font-medium">Địa chỉ: </span>
                {shipping?.address || 'N/A'}, {shipping?.city || 'N/A'},{' '}
                {shipping?.postalCode || 'N/A'}, {shipping?.country || 'Vietnam'}
              </p>
              {isDelivered ? (
                <Alert variant="default" className="mt-4">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Đã giao hàng vào{' '}
                    {order.deliveredAt
                      ? new Date(order.deliveredAt).toLocaleDateString()
                      : ''}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive" className="mt-4">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>Chưa giao hàng</AlertDescription>
                </Alert>
              )}
            </div>
          </Card>

          {/* Payment Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin thanh toán</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Hình thức: </span>
                {order.paymentMethod === 'sepay'
                  ? 'Chuyển khoản VietQR qua SePay'
                  : order.paymentMethod}
              </p>
              {isPaid ? (
                <Alert variant="default" className="mt-4">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Đã thanh toán vào{' '}
                    {order.paidAt
                      ? new Date(order.paidAt).toLocaleDateString()
                      : ''}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive" className="mt-4">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>Chưa thanh toán</AlertDescription>
                </Alert>
              )}
            </div>
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Sản phẩm trong đơn</h2>
            <div className="space-y-4">
              {order.orderItems?.map(item => (
                <div
                  key={item.id || item.variantId || item.productId}
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

        {/* Order Summary & Actions */}
        <div className="col-span-4 md:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Tóm tắt đơn hàng</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tiền hàng</span>
                <span>{formatPrice(Number(order.itemsPrice || 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí ship</span>
                <span>
                  {Number(order.shippingPrice || 0) === 0
                    ? 'Miễn phí'
                    : formatPrice(Number(order.shippingPrice || 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thuế VAT</span>
                <span>{formatPrice(Number(order.taxPrice || 0))}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium text-lg">
                <span>Tổng cộng</span>
                <span>{formatPrice(Number(order.totalPrice || 0))}</span>
              </div>

              {isPaid && !isDelivered && (
                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={markAsDelivered}
                >
                  Đánh dấu đã giao hàng
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
