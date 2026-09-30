"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import UserLayout from "@/components/layouts/UserLayout";
import useAuthStore from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Lock, Eye, EyeOff, User, Phone, Mail } from "lucide-react";

type ProfileForm = {
  fullName: string;
  email: string;
  phone?: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function UserProfilePage() {
  const { authUser, updateProfile, changePassword } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isSaving },
    reset,
    setValue,
  } = useForm<ProfileForm>({
    defaultValues: {
      fullName: authUser?.fullName || "",
      email: authUser?.email || "",
      phone: authUser?.phone ?? "",
    },
  });

  useEffect(() => {
    if (authUser) {
      reset({
        fullName: authUser.fullName || "",
        email: authUser.email || "",
        phone: authUser.phone ?? "",
      });
    }
  }, [authUser, reset]);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isChangingPassword },
    reset: resetPassword,
    watch,
  } = useForm<PasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = watch("newPassword");

  const onSubmit = async (data: ProfileForm) => {
    try {
      await updateProfile({
        fullName: data.fullName.trim(),
        phone: data.phone?.trim(),
      });
      setIsEditing(false);
      setValue("fullName", data.fullName.trim());
      toast.success("Cập nhật thông tin thành công");
    } catch {
      toast.error("Cập nhật thông tin thất bại");
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      await changePassword(data.currentPassword, data.newPassword);
      resetPassword();
      toast.success("Đổi mật khẩu thành công");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Profile Info */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg font-bold text-gray-900">
              Thông Tin Cá Nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="flex items-center space-x-4 mb-2">
                <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {authUser?.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "KH"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {authUser?.fullName}
                  </h2>
                  <p className="text-xs text-gray-500">{authUser?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-semibold">
                    Họ và Tên
                  </Label>
                  <Input
                    id="fullName"
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50 text-gray-600" : ""}
                    {...register("fullName", {
                      required: "Họ và tên là bắt buộc",
                    })}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-500">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">
                    Địa chỉ Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    disabled
                    className="bg-gray-50 text-gray-500"
                    {...register("email")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold">
                    Số Điện Thoại
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50 text-gray-600" : ""}
                    {...register("phone")}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                {isEditing ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-black hover:bg-gray-800 text-white"
                      disabled={isSaving}
                    >
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Chỉnh sửa thông tin
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-700" />
              Đổi Mật Khẩu
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs font-semibold">
                  Mật khẩu hiện tại
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...registerPassword("currentPassword", {
                      required: "Vui lòng nhập mật khẩu hiện tại",
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-red-500">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-xs font-semibold">
                  Mật khẩu mới
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Tối thiểu 6 ký tự"
                    {...registerPassword("newPassword", {
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
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-xs text-red-500">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold">
                  Xác nhận mật khẩu mới
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    {...registerPassword("confirmPassword", {
                      required: "Vui lòng xác nhận mật khẩu mới",
                      validate: (value) =>
                        value === newPasswordValue || "Mật khẩu xác nhận không khớp",
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
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-black hover:bg-gray-800 text-white"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}
