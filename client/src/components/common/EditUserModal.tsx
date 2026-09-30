"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Save, X, User as UserIcon } from "lucide-react";
import { User } from "@/types";

interface EditUserFormData {
  fullName: string;
  phone: string;
}

interface EditUserModalProps {
  user: User;
  trigger?: React.ReactNode;
  onSubmit: (userId: number, userData: Partial<User>) => Promise<void>;
}

export default function EditUserModal({
  user,
  trigger,
  onSubmit,
}: EditUserModalProps) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditUserFormData>({
    defaultValues: {
      fullName: user.fullName || "",
      phone: user.phone || "",
    },
  });

  useEffect(() => {
    if (open && user) {
      reset({
        fullName: user.fullName || "",
        phone: user.phone || "",
      });
    }
  }, [open, user, reset]);

  const onSubmitForm = async (data: EditUserFormData) => {
    const updatedData: Partial<User> = {
      fullName: data.fullName,
      phone: data.phone,
    };
    await onSubmit(user.id, updatedData);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
    reset();
  };

  const initials = (user.fullName || "User")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Chỉnh sửa thông tin</h2>
            </div>
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cá nhân của tài khoản
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserIcon className="h-4 w-4" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  {...register("fullName", {
                    required: "Họ tên không được để trống",
                  })}
                  className={errors.fullName ? "border-destructive" : ""}
                  disabled={isSubmitting}
                  placeholder="Nhập họ và tên"
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input
                  id="phone"
                  {...register("phone", {
                    required: "Số điện thoại không được để trống",
                    pattern: {
                      value: /^[0-9]{10,11}$/,
                      message: "Số điện thoại không hợp lệ (10-11 chữ số)",
                    },
                  })}
                  className={errors.phone ? "border-destructive" : ""}
                  disabled={isSubmitting}
                  placeholder="Nhập số điện thoại"
                />
                {errors.phone && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Thông tin vai trò</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Vai trò:</span>
                <div>{user.roles?.[0]?.name || "Khách hàng"}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Trạng thái:</span>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Hoạt động" : "Bị khóa"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-1.5" />
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-1.5"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1.5" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
