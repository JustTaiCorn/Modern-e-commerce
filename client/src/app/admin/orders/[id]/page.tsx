"use client";

import { useParams, useRouter } from "next/navigation";
import { InvoiceTemplate } from "../_components/InvoiceTemplate";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrderById } from "@/services/orderService";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string, 10);
  const { data: order, isLoading } = useOrderById(orderId);

  const handleGoBack = () => {
    router.push("/admin/orders");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          Không tìm thấy đơn hàng
        </h2>
        <p className="text-sm text-gray-500">
          Đơn hàng bạn tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Button onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách đơn hàng
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleGoBack} title="Quay lại">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Hóa đơn đơn hàng #{order.code}
          </h1>
          <p className="text-xs text-muted-foreground">
            Xem và in thông tin hóa đơn bán lẻ
          </p>
        </div>
      </div>

      {/* Invoice Content */}
      <InvoiceTemplate order={order} />
    </div>
  );
}
