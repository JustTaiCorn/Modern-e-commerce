"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2, User, Phone } from "lucide-react";
import Link from "next/link";
import { SignUpData } from "@/types";

interface SignupFormProps extends React.ComponentProps<"form"> {
  handleSignup?: (data: SignUpData) => Promise<void>;
  isLoading?: boolean;
}

export function SignupForm({
  className,
  handleSignup,
  isLoading = false,
  ...props
}: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpData>();

  const handleFormSubmit = async (data: SignUpData) => {
    if (handleSignup) {
      await handleSignup(data);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(handleFormSubmit)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Tạo tài khoản mới
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm">
          Nhập các thông tin bên dưới để đăng ký thành viên
        </p>
      </div>

      <div className="grid gap-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs font-semibold">
            Họ và tên
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <User className="w-4 h-4" />
            </div>
            <Input
              id="fullName"
              type="text"
              placeholder="Nguyễn Văn A"
              className={cn("pl-9 h-10", errors.fullName && "border-red-500")}
              {...register("fullName", {
                required: "Vui lòng nhập họ và tên",
                minLength: {
                  value: 2,
                  message: "Họ và tên phải có ít nhất 2 ký tự",
                },
              })}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-red-500">{errors.fullName.message}</p>
          )}
        </div>

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

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-semibold">
            Số điện thoại
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Phone className="w-4 h-4" />
            </div>
            <Input
              id="phone"
              type="tel"
              placeholder="0912345678"
              className={cn("pl-9 h-10", errors.phone && "border-red-500")}
              {...register("phone", {
                required: "Vui lòng nhập số điện thoại",
                pattern: {
                  value: /^[0-9]{10,11}$/,
                  message: "Số điện thoại phải từ 10-11 chữ số",
                },
              })}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-semibold">
            Mật khẩu
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

        <Button
          type="submit"
          className="w-full bg-black text-white hover:bg-gray-800 h-10 text-sm font-semibold shadow-sm mt-2"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Đang đăng ký tài khoản...
            </>
          ) : (
            "Đăng ký ngay"
          )}
        </Button>
      </div>

      <div className="text-center text-xs text-gray-600">
        Đã có tài khoản?{" "}
        <Link href="/user/login" className="text-black font-semibold hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </form>
  );
}
