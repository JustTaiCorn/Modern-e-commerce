"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const { login, isLoading, authUser } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (authUser) {
      router.replace(callbackUrl);
    }
  }, [authUser, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      await login({ email, password });
    } catch (error) {
      console.log("Admin login failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-gray-200">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Cổng Quản Trị Hệ Thống
                </h1>
                <p className="text-xs text-gray-500">
                  Đăng nhập dành cho Quản trị viên và Nhân viên
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold">
                  Tài khoản Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold">
                  Mật khẩu
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-10"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-800 h-10 font-semibold text-sm shadow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xác thực...
                  </>
                ) : (
                  "Đăng nhập Quản trị"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
