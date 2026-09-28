"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, UserPlus, Shield } from "lucide-react";
import Link from "next/link";
import { CreateStaffData, useCreateStaff } from "@/services/usersService";
import { RoleGuard } from "@/components/auth/RoleGuard";

type StaffFormData = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
};

export default function AddStaffPage() {
  const router = useRouter();
  const { mutateAsync: createStaff, isPending } = useCreateStaff();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StaffFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const passwordValue = watch("password");

  const onSubmit = async (data: StaffFormData) => {
    try {
      const payload: CreateStaffData = {
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || undefined,
        password: data.password,
        role: "STAFF",
      };

      await createStaff(payload);
      router.push("/admin/users");
    } catch (e) {
      console.error(e);
    }
  };

  const ErrorText = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-sm text-destructive mt-1">{msg}</p> : null;

  return (
    <RoleGuard requireAdmin>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tạo tài khoản nhân viên</h1>
            <p className="text-muted-foreground">
              Thêm tài khoản mới cho nhân viên với quyền truy cập quản trị hệ thống
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Thông tin cá nhân</CardTitle>
              <CardDescription>
                Nhập thông tin cơ bản của nhân viên
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  maxLength={100}
                  {...register("fullName", {
                    required: "Họ và tên là bắt buộc",
                    minLength: {
                      value: 2,
                      message: "Họ và tên phải có ít nhất 2 ký tự",
                    },
                    setValueAs: (v) =>
                      typeof v === "string" ? v.trimStart() : v,
                  })}
                />
                <ErrorText msg={errors.fullName?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email đăng nhập *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nhanvien@company.com"
                  maxLength={255}
                  {...register("email", {
                    required: "Email là bắt buộc",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Email không hợp lệ",
                    },
                    setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                  })}
                />
                <ErrorText msg={errors.email?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại (tùy chọn)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0901234567"
                  maxLength={15}
                  {...register("phone", {
                    pattern: {
                      value: /^[0-9+\-\s()]{10,15}$/,
                      message: "Số điện thoại không hợp lệ",
                    },
                    setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
                  })}
                />
                <ErrorText msg={errors.phone?.message} />
              </div>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Mật khẩu & Phân quyền</CardTitle>
              <CardDescription>Thiết lập mật khẩu bảo mật và quyền hạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu ban đầu *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mật khẩu tối thiểu 6 ký tự"
                  maxLength={50}
                  {...register("password", {
                    required: "Mật khẩu là bắt buộc",
                    minLength: {
                      value: 6,
                      message: "Mật khẩu phải có ít nhất 6 ký tự",
                    },
                  })}
                />
                <ErrorText msg={errors.password?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  maxLength={50}
                  {...register("confirmPassword", {
                    required: "Xác nhận mật khẩu là bắt buộc",
                    validate: (v) =>
                      v === passwordValue || "Mật khẩu xác nhận không khớp",
                  })}
                />
                <ErrorText msg={errors.confirmPassword?.message} />
              </div>

              <div className="space-y-2 pt-2">
                <Label>Vai trò gán mặc định</Label>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/40">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Nhân viên (STAFF)</p>
                    <p className="text-xs text-muted-foreground">Có quyền quản lý sản phẩm, đơn hàng, danh mục và kho hàng</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              asChild
            >
              <Link href="/admin/users">Hủy</Link>
            </Button>
            <Button
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo tài khoản...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Tạo nhân viên
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}
