"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import useAuthStore from "@/stores/useAuthStore";
import { LoginData } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>();

  const onSubmit = handleSubmit(
    async (data: LoginData) => {
      try {
        await login(data);
        router.push("/user");
      } catch (error) {
        console.log("Login failed:", error);
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
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Đăng nhập tài khoản
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm">
          Nhập email và mật khẩu của bạn để tiếp tục
        </p>
      </div>

      <div className="grid gap-5">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold">
            Email
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

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold">
              Mật khẩu
            </Label>
            <Link
              href="/user/forgot-password"
              className="text-xs text-blue-600 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              className={cn("pl-9 pr-9 h-10", errors.password && "border-red-500")}
              {...register("password", {
                required: "Vui lòng nhập mật khẩu",
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

        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-black text-white hover:bg-gray-800 h-10 text-sm font-semibold shadow-sm"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </div>

      <div className="text-center text-xs text-gray-600">
        Chưa có tài khoản?{" "}
        <Link href="/user/signup" className="text-black font-semibold hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </form>
  );
}
