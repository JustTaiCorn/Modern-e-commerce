"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { orderService } from "@/services/orderService";

type PollStatus = "polling" | "paid" | "timeout" | "error";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [pollStatus, setPollStatus] = useState<PollStatus>(
    orderId ? "polling" : "paid"
  );

  useEffect(() => {
    if (!orderId) return;

    let attempts = 0;
    const maxAttempts = 10; // poll tối đa 10 lần (10 * 2s = 20s)
    let timer: ReturnType<typeof setTimeout>;

    const check = async () => {
      try {
        const order = await orderService.getOrderById(Number(orderId));
        const status = order?.status as string;

        if (status === "PAID") {
          setPollStatus("paid");
          return;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          setPollStatus("timeout");
          return;
        }

        timer = setTimeout(check, 2000);
      } catch {
        setPollStatus("error");
      }
    };

    timer = setTimeout(check, 1500); // bắt đầu sau 1.5s (chờ IPN)

    return () => clearTimeout(timer);
  }, [orderId]);

  // Đang chờ IPN cập nhật
  if (pollStatus === "polling") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 py-16">
        <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-5" />
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Đang xác nhận thanh toán...
          </h1>
          <p className="text-sm text-gray-500">
            Vui lòng chờ trong giây lát, hệ thống đang xử lý giao dịch của bạn.
          </p>
        </div>
      </div>
    );
  }

  // IPN không đến kịp trong 20s (vẫn hiển thị success vì user đã thanh toán)
  if (pollStatus === "timeout") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 py-16">
        <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thanh toán đã gửi!
          </h1>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Thanh toán của bạn đã được gửi thành công. Trạng thái đơn hàng sẽ
            được cập nhật trong vài phút. Vui lòng kiểm tra lại lịch sử đơn hàng.
          </p>
          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              <Link
                href="/user/orders"
                className="flex items-center justify-center gap-2"
              >
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

  // Lỗi khi gọi API
  if (pollStatus === "error") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 py-16">
        <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
            <XCircle className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Không thể xác nhận
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Không thể kiểm tra trạng thái đơn hàng. Nếu bạn đã thanh toán,
            vui lòng kiểm tra lịch sử đơn hàng hoặc liên hệ hỗ trợ.
          </p>
          <Button asChild className="w-full bg-black text-white hover:bg-gray-800">
            <Link href="/user/orders">Xem lịch sử đơn hàng</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Đã xác nhận PAID (hoặc không có orderId)
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
          Cảm ơn bạn đã tin tưởng mua sắm. Đơn hàng của bạn đã được ghi nhận
          và đang được chúng tôi xử lý chuẩn bị giao hàng.
        </p>

        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-black text-white hover:bg-gray-800"
          >
            <Link
              href="/user/orders"
              className="flex items-center justify-center gap-2"
            >
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

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessContent />
    </Suspense>
  );
}
