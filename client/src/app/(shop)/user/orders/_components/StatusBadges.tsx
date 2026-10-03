import { Badge } from "@/components/ui/badge";
import { OrderStatus, PaymentMethod } from "@/types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config: Record<OrderStatus, { label: string; variant: "secondary"; className: string }> = {
    PENDING: {
      label: "Chờ thanh toán",
      variant: "secondary" as const,
      className: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    },
    NEW: {
      label: "Mới",
      variant: "secondary" as const,
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
    CONFIRMED: {
      label: "Đã xác nhận",
      variant: "secondary" as const,
      className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    },
    PACKING: {
      label: "Đang đóng gói",
      variant: "secondary" as const,
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    },
    PAID: {
      label: "Đã thanh toán",
      variant: "secondary" as const,
      className: "bg-green-100 text-green-800 hover:bg-green-200",
    },
    PROCESSING: {
      label: "Đang xử lý",
      variant: "secondary" as const,
      className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    },
    SHIPPED: {
      label: "Đang giao",
      variant: "secondary" as const,
      className: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
    },
    DELIVERED: {
      label: "Đã giao",
      variant: "secondary" as const,
      className: "bg-green-100 text-green-800 hover:bg-green-200",
    },
    CANCELLED: {
      label: "Đã hủy",
      variant: "secondary" as const,
      className: "bg-red-100 text-red-800 hover:bg-red-200",
    },
  };

  const { label, variant, className } = config[status] ?? {
    label: status,
    variant: "secondary" as const,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}

export function PaymentMethodBadge({ method }: PaymentMethodBadgeProps) {
  const { label, className } = {
    COD: {
      label: "Tiền mặt",
      className: "bg-green-50 text-green-700 border-green-200",
    },
    WALLET: {
      label: "Ví điện tử / VNPAY",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    SEPAY: {
      label: "SePay QR",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
  }[method] || {
    label: method,
    className: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
