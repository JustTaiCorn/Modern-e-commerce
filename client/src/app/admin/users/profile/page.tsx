"use client";

import { useState, useEffect } from "react";
import useAuthStore from "@/stores/useAuthStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Lock, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { authUser, updateProfile, changePassword } = useAuthStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: authUser?.fullName || "",
    phone: authUser?.phone || "",
  });

  useEffect(() => {
    if (authUser) {
      setProfileData({
        fullName: authUser.fullName || "",
        phone: authUser.phone || "",
      });
    }
  }, [authUser]);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProfile(true);

    try {
      await updateProfile(profileData);
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setIsSubmittingPassword(true);

    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      fullName: authUser?.fullName || "",
      phone: authUser?.phone || "",
    });
    setIsEditingProfile(false);
  };

  const handleCancelPassword = () => {
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý thông tin tài khoản quản trị và bảo mật của bạn
        </p>
      </div>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">
                Thông tin cá nhân
              </CardTitle>
              <CardDescription className="mt-1">
                Xem và cập nhật thông tin liên hệ của bạn
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isEditingProfile ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 rounded-lg bg-muted/40">
                <User className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Họ và tên</p>
                  <p className="font-medium text-base">{authUser?.fullName || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-lg bg-muted/40">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-base">{authUser?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-lg bg-muted/40">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium text-base">
                    {authUser?.phone || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-lg bg-muted/40">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Vai trò</p>
                  <div className="flex gap-1.5 mt-0.5">
                    {authUser?.roles?.map((role) => (
                      <Badge key={role.id || role.name} variant="secondary">
                        {role.name}
                      </Badge>
                    )) || <span className="font-medium text-sm">Chưa có vai trò</span>}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setIsEditingProfile(true)}
                className="w-full"
              >
                Chỉnh sửa thông tin
              </Button>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, fullName: e.target.value })
                  }
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={authUser?.email || ""}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Email không thể thay đổi
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmittingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSubmittingProfile}
                  className="flex-1"
                >
                  Hủy
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Đổi mật khẩu</CardTitle>
          <CardDescription>
            Cập nhật mật khẩu để bảo vệ tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Mật khẩu hiện tại *</Label>
              <Input
                id="oldPassword"
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    oldPassword: e.target.value,
                  })
                }
                placeholder="Nhập mật khẩu hiện tại"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới *</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Nhập lại mật khẩu mới"
                required
                minLength={6}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmittingPassword}
                className="flex-1"
              >
                <Lock className="h-4 w-4 mr-2" />
                {isSubmittingPassword
                  ? "Đang cập nhật..."
                  : "Cập nhật mật khẩu"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelPassword}
                disabled={isSubmittingPassword}
                className="flex-1"
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
