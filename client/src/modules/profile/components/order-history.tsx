'use client';

// ponytail: Bảng lịch sử đơn hàng hỗ trợ ID Prisma, format tiền tệ và trạng thái đa dạng
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
import { formatPrice } from '@/lib/utils';

interface OrderHistoryProps {
  orders: Order[];
}

export function OrderHistory({ orders }: OrderHistoryProps) {
  if (!orders || orders.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Lịch sử đơn hàng</h2>
        <p className="text-muted-foreground mb-4">Bạn chưa có đơn hàng nào.</p>
        <Button asChild>
          <Link href="/products">Mua sắm ngay</Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-2xl font-bold">Lịch sử đơn hàng</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>MÃ ĐƠN</TableHead>
            <TableHead>NGÀY ĐẶT</TableHead>
            <TableHead>TỔNG TIỀN</TableHead>
            <TableHead>THANH TOÁN</TableHead>
            <TableHead>VẬN CHUYỂN</TableHead>
            <TableHead className="text-right">THAO TÁC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => {
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
            const totalPrice = Number(order.totalPrice || 0);

            return (
              <TableRow key={orderId}>
                <TableCell className="font-semibold">#{orderId}</TableCell>
                <TableCell>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : ''}
                </TableCell>
                <TableCell className="font-medium">
                  {formatPrice(totalPrice)}
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
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/orders/${orderId}`}>Chi tiết</Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
