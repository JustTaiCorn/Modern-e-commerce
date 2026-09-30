"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function AuthenticateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { confirmEmail } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("Mã xác thực không hợp lệ hoặc không tìm thấy.");
      return;
    }

    const verify = async () => {
      try {
        await confirmEmail(token);
        setStatus("success");
        setTimeout(() => {
          router.push("/user/login");
        }, 2500);
      } catch {
        setStatus("error");
        setErrorMessage(
          "Không thể kích hoạt tài khoản. Liên kết có thể đã hết hạn."
        );
      }
    };

    verify();
  }, [searchParams, confirmEmail, router]);

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="border border-gray-100 shadow-sm text-center p-8">
          <CardContent className="p-0">
            {status === "loading" && (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 text-black animate-spin mx-auto" />
                <h2 className="text-xl font-bold text-gray-900">Đang kích hoạt tài khoản...</h2>
                <p className="text-xs text-gray-500">Vui lòng đợi trong giây lát</p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                <h2 className="text-xl font-bold text-gray-900">Kích hoạt thành công!</h2>
                <p className="text-xs text-gray-500">
                  Tài khoản của bạn đã sẵn sàng. Đang chuyển hướng bạn đến trang đăng nhập...
                </p>
                <Button asChild className="w-full bg-black text-white hover:bg-gray-800 text-xs">
                  <Link href="/user/login">Đăng nhập ngay</Link>
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <XCircle className="w-12 h-12 text-red-600 mx-auto" />
                <h2 className="text-xl font-bold text-gray-900">Xác thực thất bại</h2>
                <p className="text-xs text-gray-500">{errorMessage}</p>
                <div className="space-y-2 pt-2">
                  <Button asChild className="w-full bg-black text-white hover:bg-gray-800 text-xs">
                    <Link href="/user/signup">Đăng ký lại</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full text-xs">
                    <Link href="/user/login">Quay lại đăng nhập</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthenticatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <AuthenticateContent />
    </Suspense>
  );
}
