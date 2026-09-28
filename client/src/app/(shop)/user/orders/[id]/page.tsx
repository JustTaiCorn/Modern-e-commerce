"use client";

import { use, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { InvoiceTemplate } from "../_components/InvoiceTemplate";
import { CancelOrderDialog } from "@/components/common/CancelOrderDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import UserLayout from "@/components/layouts/UserLayout";
import { toast } from "sonner";
import useAuthStore from "@/stores/useAuthStore";
import { useCancelOrder, useOrderById } from "@/services/orderService";
import { OrderStatus } from "@/types";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string, 10);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const { authUser } = useAuthStore();
  const { data: currentOrder, isLoading } = useOrderById(orderId);
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  const handleGoBack = () => {
    router.replace("/user/orders");
  };

  const canCancelOrder = (status: OrderStatus): boolean => {
    return status === "NEW" || status === "CONFIRMED";
  };

  const handleCancelOrder = async () => {
    if (!authUser?.id) {
      toast.error("Vui lòng đăng nhập để hủy đơn hàng!");
      return;
    }
    try {
      cancelOrder({ userId: authUser.id, orderId });
      setIsCancelDialogOpen(false);

      if (
        currentOrder?.paymentMethod === "WALLET" &&
        currentOrder?.paymentStatus === "PAID"
      ) {
        toast.info("Đơn hàng đã thanh toán qua ví. Quy trình hoàn tiền sẽ được xử lý trong 24-48h.");
      }
    } catch (error) {
      toast.error("Không thể hủy đơn hàng. Vui lòng thử lại!");
      console.error("Error cancelling order:", error);
    }
  };

  if (isLoading) {
    return (
      <UserLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </UserLayout>
    );
  }

  if (!currentOrder) {
    return (
      <UserLayout>
        <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-gray-600">
            Đơn hàng bạn tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Button onClick={handleGoBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách đơn hàng
          </Button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={handleGoBack} title="Quay lại">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Chi tiết đơn hàng #{currentOrder.code}</h1>
              <p className="text-sm text-gray-500">Xem thông tin và in hóa đơn</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canCancelOrder(currentOrder.status) && (
              <Button
                variant="destructive"
                onClick={() => setIsCancelDialogOpen(true)}
                disabled={isCancelling}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Hủy đơn hàng
              </Button>
            )}

            {!canCancelOrder(currentOrder.status) &&
              currentOrder.status !== "CANCELLED" && (
                <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                  Đơn hàng đang xử lý / vận chuyển (không thể tự hủy)
                </span>
              )}
          </div>
        </div>

        {/* Invoice Component */}
        <InvoiceTemplate order={currentOrder} />

        {/* Cancel Order Dialog */}
        <CancelOrderDialog
          open={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
          onConfirm={handleCancelOrder}
          orderCode={currentOrder.code}
          paymentMethod={currentOrder.paymentMethod}
          paymentStatus={currentOrder.paymentStatus}
        />
      </div>
    </UserLayout>
  );
}
