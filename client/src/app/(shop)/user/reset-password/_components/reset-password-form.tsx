"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Lock, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";
import useAuthStore from "@/stores/useAuthStore";
import { ResetPasswordData } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ResetPasswordFormProps extends React.ComponentProps<"form"> {
  token: string;
}

export function ResetPasswordForm({
  className,
  token,
  ...props
}: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword, isResettingPassword } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordData>();

  const watchPassword = watch("password");

  const onSubmit = handleSubmit(
    async (data: ResetPasswordData) => {
      if (data.password !== data.confirmPassword) {
        toast.error("Mật khẩu xác nhận không trùng khớp");
        return;
      }

      try {
        await resetPassword(token, data.password);
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/user/login");
        }, 2500);
      } catch (error) {
        console.log("Reset password failed:", error);
      }
    },
    (formErrors) => {
      Object.values(formErrors).forEach((err) => toast.error(err.message));
    }
  );

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">Mật khẩu đã đổi thành công</h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Hệ thống sẽ tự động chuyển hướng bạn đến trang đăng nhập sau vài giây...
          </p>
        </div>
        <Link href="/user/login" className="w-full">
          <Button className="w-full bg-black hover:bg-gray-800 text-white">Đăng nhập ngay</Button>
        </Link>
      </div>
    );
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={onSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Đặt lại mật khẩu
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm">
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      <div className="grid gap-4">
        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-semibold">
            Mật khẩu mới
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Tối thiểu 6 ký tự"
              className={cn("pl-9 pr-9 h-10", errors.password && "border-red-500")}
              {...register("password", {
                required: "Vui lòng nhập mật khẩu mới",
                minLength: {
                  value: 6,
                  message: "Mật khẩu tối thiểu 6 ký tự",
                },
              })}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs font-semibold">
            Xác nhận mật khẩu mới
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              className={cn("pl-9 pr-9 h-10", errors.confirmPassword && "border-red-500")}
              {...register("confirmPassword", {
                required: "Vui lòng xác nhận mật khẩu",
                validate: (value) =>
                  value === watchPassword || "Mật khẩu xác nhận không khớp",
              })}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-black text-white hover:bg-gray-800 h-10 text-sm font-semibold shadow-sm mt-2"
          disabled={isResettingPassword}
        >
          {isResettingPassword ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Đang đặt lại mật khẩu...
            </>
          ) : (
            "Cập nhật mật khẩu mới"
          )}
        </Button>
      </div>
    </form>
  );
}
