"use client";

import { ResetPasswordForm } from "@/app/(shop)/user/reset-password/_components/reset-password-form";
import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const { authUser } = useAuthStore();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  useEffect(() => {
    if (authUser) {
      router.push("/user");
    }
  }, [authUser, router]);

  if (!token) {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <Card className="border border-gray-100 shadow-sm text-center p-6">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Liên kết không hợp lệ
            </h2>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Liên kết khôi phục mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại liên kết mới.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full bg-black hover:bg-gray-800 text-white text-xs">
                <Link href="/user/forgot-password">Yêu cầu liên kết mới</Link>
              </Button>
              <Button asChild variant="outline" className="w-full text-xs">
                <Link href="/user/login">Quay lại đăng nhập</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-8">
            <ResetPasswordForm token={token} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
