"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 py-16">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Thanh toán thành công!
        </h1>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Cảm ơn bạn đã tin tưởng mua sắm. Đơn hàng của bạn đã được ghi nhận và đang được chúng tôi xử lý chuẩn bị giao hàng.
        </p>

        <div className="space-y-3">
          <Button asChild className="w-full bg-black text-white hover:bg-gray-800">
            <Link href="/user/orders" className="flex items-center justify-center gap-2">
              Xem lịch sử đơn hàng
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/">Tiếp tục mua sắm</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
