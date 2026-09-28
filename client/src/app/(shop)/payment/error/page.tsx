"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function PaymentErrorContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 py-16">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-9 h-9" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Thanh toán thất bại
        </h1>
        <p className="text-sm text-gray-600 mb-2 leading-relaxed">
          Giao dịch không được thực hiện thành công. Đơn hàng của bạn vẫn được
          lưu, bạn có thể thử thanh toán lại.
        </p>
        {orderId && (
          <p className="text-xs text-gray-400 mb-6">
            Mã đơn hàng: <span className="font-mono font-medium">{orderId}</span>
          </p>
        )}

        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-black text-white hover:bg-gray-800"
          >
            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Thử lại thanh toán
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link
              href="/user/orders"
              className="flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Xem lịch sử đơn hàng
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-gray-500 text-sm">Đang tải...</div>
        </div>
      }
    >
      <PaymentErrorContent />
    </Suspense>
  );
}
