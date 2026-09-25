'use client';

// ponytail: Danh sách đơn hàng phía admin hỗ trợ ID số và hiển thị tên người dùng
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Order } from '@apps/shared/types/order';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { formatPrice } from '@/lib/utils';

interface OrdersListProps {
  orders: Order[];
}

export function OrdersList({ orders }: OrdersListProps) {
  const { toast } = useToast();
  const router = useRouter();

  const markAsDelivered = async (orderId: string | number) => {
    try {
      await apiClient.put(`/orders/${orderId}/deliver`);
      toast({
        title: 'Thành công',
        description: 'Đã đánh dấu đơn hàng đã giao',
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể đánh dấu giao hàng',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-2xl font-bold">Danh sách đơn hàng</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>MÃ ĐƠN</TableHead>
            <TableHead>KHÁCH HÀNG</TableHead>
            <TableHead>NGÀY ĐẶT</TableHead>
            <TableHead>TỔNG TIỀN</TableHead>
            <TableHead>THANH TOÁN</TableHead>
            <TableHead>GIAO HÀNG</TableHead>
            <TableHead className="text-right">THAO TÁC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders?.map(order => {
            const orderId = order.id || order._id || '';
            const isPaid =
              order.status === 'PAID' ||
              order.status === 'DELIVERED' ||
              Boolean(order.paidAt) ||
              Boolean(order.isPaid);
            const isDelivered =
              order.status === 'DELIVERED' ||
              Boolean(order.deliveredAt) ||
              Boolean(order.isDelivered);
            const userName =
              typeof order.user === 'object' && order.user !== null
                ? order.user.name ||
                  (order.user as any).username ||
                  order.user.email ||
                  'Khách hàng'
                : String(order.user || 'Khách hàng');

            return (
              <TableRow key={orderId}>
                <TableCell className="font-medium">#{orderId}</TableCell>
                <TableCell>{userName}</TableCell>
                <TableCell>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : ''}
                </TableCell>
                <TableCell>
                  {formatPrice(Number(order.totalPrice || 0))}
                </TableCell>
                <TableCell>
                  {isPaid ? (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100">
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      Đã thanh toán
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="mr-1 h-3.5 w-3.5" />
                      Chưa thanh toán
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {isDelivered ? (
                    <Badge variant="default">
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      Đã giao hàng
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="mr-1 h-3.5 w-3.5" />
                      Đang xử lý
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/orders/${orderId}`}>Xem</Link>
                  </Button>
                  {isPaid && !isDelivered && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => markAsDelivered(orderId)}
                    >
                      Đã giao
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
