"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { OrderStatusBadge, PaymentMethodBadge } from "./StatusBadges";
import { useRouter } from "next/navigation";
import { formatDate, formatPrice } from "@/lib/utils";
import { Order, OrderStatus } from "@/types";
import { useUpdateOrderStatus } from "@/services/orderService";

interface OrderTableProps {
  orders: Order[];
}

export function OrderTable({ orders }: OrderTableProps) {
  const router = useRouter();
  const { mutate: updateOrderStatus } = useUpdateOrderStatus();

  const getValidNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    const statusFlow: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ["PENDING", "NEW", "CANCELLED"],
      NEW: ["NEW", "CONFIRMED", "CANCELLED"],
      CONFIRMED: ["CONFIRMED", "PACKING", "CANCELLED"],
      PACKING: ["PACKING", "SHIPPED"],
      PAID: ["PAID", "PROCESSING", "CANCELLED"],
      PROCESSING: ["PROCESSING", "SHIPPED"],
      SHIPPED: ["SHIPPED", "DELIVERED"],
      DELIVERED: ["DELIVERED"],
      CANCELLED: ["CANCELLED"],
    };
    return statusFlow[currentStatus] || [currentStatus];
  };

  const getStatusLabel = (status: OrderStatus): string => {
    const labels: Record<OrderStatus, string> = {
      PENDING: "Chờ thanh toán",
      NEW: "Chờ xử lý",
      CONFIRMED: "Đã xác nhận",
      PACKING: "Đang đóng gói",
      PAID: "Đã thanh toán",
      PROCESSING: "Đang xử lý",
      SHIPPED: "Đang giao",
      DELIVERED: "Đã giao",
      CANCELLED: "Đã hủy",
    };
    return labels[status] || status;
  };

  const getStatusSelectClass = (status: OrderStatus): string => {
    const colorClasses: Record<OrderStatus, string> = {
      PENDING: "bg-orange-100 text-orange-800 border-orange-300",
      NEW: "bg-gray-100 text-gray-800 border-gray-300",
      CONFIRMED: "bg-yellow-100 text-yellow-800 border-yellow-300",
      PACKING: "bg-purple-100 text-purple-800 border-purple-300",
      PAID: "bg-green-100 text-green-800 border-green-300",
      PROCESSING: "bg-indigo-100 text-indigo-800 border-indigo-300",
      SHIPPED: "bg-cyan-100 text-cyan-800 border-cyan-300",
      DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-300",
      CANCELLED: "bg-red-100 text-red-800 border-red-300",
    };
    return colorClasses[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const handleViewInvoice = (orderId: number) => {
    router.push(`/admin/orders/${orderId}`);
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500 text-base font-medium">
          Không tìm thấy đơn hàng nào
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Chưa có đơn hàng phát sinh hoặc không có kết quả phù hợp với bộ lọc
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/75">
              <TableHead className="font-semibold text-xs text-gray-700">Mã đơn hàng</TableHead>
              <TableHead className="font-semibold text-xs text-gray-700">Thời gian đặt</TableHead>
              <TableHead className="font-semibold text-xs text-gray-700">Khách hàng</TableHead>
              <TableHead className="font-semibold text-xs text-gray-700">Phương thức</TableHead>
              <TableHead className="font-semibold text-xs text-gray-700">Tổng tiền</TableHead>
              <TableHead className="font-semibold text-xs text-gray-700">Cập nhật trạng thái</TableHead>
              <TableHead className="font-semibold text-xs text-gray-700">Trạng thái</TableHead>
              <TableHead className="font-semibold text-xs text-gray-700 text-center">Hóa đơn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-gray-50/50">
                <TableCell className="font-mono text-xs font-semibold text-gray-900">
                  #{order.code}
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {order.createdAt ? formatDate(order.createdAt) : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="font-medium text-sm text-gray-900">
                      {order.user?.fullName || (order as any).customerName || "Khách hàng"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {order.user?.email || (order as any).customerEmail || ""}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <PaymentMethodBadge method={order.paymentMethod} />
                </TableCell>
                <TableCell className="font-semibold text-sm text-gray-900">
                  {formatPrice(order.grandTotal)}
                </TableCell>
                <TableCell>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus({
                        orderId: order.id,
                        status: e.target.value as OrderStatus,
                      })
                    }
                    className={`rounded-md px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer border ${getStatusSelectClass(
                      order.status
                    )}`}
                    disabled={
                      order.status === "DELIVERED" || order.status === "CANCELLED"
                    }
                  >
                    {getValidNextStatuses(order.status).map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleViewInvoice(order.id)}
                    title="Xem chi tiết & hóa đơn"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
