"use client";

import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 py-16">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-9 h-9" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Giao dịch chưa hoàn tất
        </h1>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Giao dịch thanh toán đã bị hủy hoặc gặp gián đoạn. Đừng lo lắng, giỏ hàng của bạn vẫn được lưu giữ an toàn.
        </p>

        <div className="space-y-3">
          <Button asChild className="w-full bg-black text-white hover:bg-gray-800">
            <Link href="/checkout" className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Thử lại thanh toán
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/cart">Quay lại giỏ hàng</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
