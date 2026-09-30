"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Mail, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import useAuthStore from "@/stores/useAuthStore";
import { toast } from "sonner";

interface ForgotPasswordData {
  email: string;
}

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, isForgettingPassword } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordData>();

  const onSubmit = handleSubmit(
    async (data: ForgotPasswordData) => {
      try {
        await forgotPassword(data.email);
        setIsSubmitted(true);
      } catch (error) {
        console.log("Forgot password failed:", error);
      }
    },
    (formErrors) => {
      Object.values(formErrors).forEach((err) => toast.error(err.message));
    }
  );

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={onSubmit}
      {...props}
    >
      {!isSubmitted ? (
        <>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Quên mật khẩu
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Nhập email để nhận liên kết khôi phục mật khẩu tài khoản
            </p>
          </div>

          <div className="grid gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                Email của bạn
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={cn("pl-9 h-10", errors.email && "border-red-500")}
                  {...register("email", {
                    required: "Vui lòng nhập địa chỉ email",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Địa chỉ email không hợp lệ",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800 h-10 text-sm font-semibold shadow-sm"
              disabled={isForgettingPassword}
            >
              {isForgettingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Đang gửi yêu cầu...
                </>
              ) : (
                "Gửi liên kết khôi phục"
              )}
            </Button>
          </div>

          <div className="text-center text-xs">
            <Link
              href="/user/login"
              className="inline-flex items-center gap-1.5 text-gray-600 hover:text-black font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại đăng nhập
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">Email đã được gửi</h2>
              <p className="text-gray-600 text-xs sm:text-sm">
                Nếu tài khoản <strong>{getValues("email")}</strong> có trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu trong hộp thư.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={() => setIsSubmitted(false)}
            >
              Gửi lại email khác
            </Button>
            <Link href="/user/login" className="w-full">
              <Button variant="ghost" className="w-full text-xs">
                Quay lại đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      )}
    </form>
  );
}
