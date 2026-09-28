"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Shield,
  Users,
  User as UserIcon,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAssignRole, useUserById } from "@/services/usersService";
import { Role } from "@/types";
import { RoleGuard } from "@/components/auth/RoleGuard";

interface RoleOption {
  id: number;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const availableRoles: RoleOption[] = [
  {
    id: 1,
    name: "Staff",
    description: "Nhân viên - có quyền quản lý sản phẩm, đơn hàng và kho hàng",
    icon: Users,
    color: "bg-blue-600 text-white",
  },
  {
    id: 2,
    name: "Customer",
    description: "Khách hàng - chỉ có quyền mua sắm và xem đơn cá nhân",
    icon: UserIcon,
    color: "bg-emerald-600 text-white",
  },
];

export default function AssignRolePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);
  const { mutate: assignRoles, isPending } = useAssignRole();
  const { data: user, isLoading } = useUserById(id);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  const handleAssignRole = async () => {
    if (!selectedRoleId || !user) return;

    try {
      const selectedRole = availableRoles.find(
        (role) => role.id === selectedRoleId
      );
      if (!selectedRole) {
        toast.error("Vai trò không hợp lệ");
        return;
      }
      const roleToAssign: Role = {
        id: selectedRole.id,
        name: selectedRole.name.toUpperCase(),
      };
      assignRoles(
        { userId: user.id, role: roleToAssign },
        {
          onSuccess: () => {
            router.push("/admin/users");
          },
        }
      );
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error("Có lỗi xảy ra khi phân quyền");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  const selectedRole = availableRoles.find(
    (role) => role.id === selectedRoleId
  );
  const currentRole = user.roles?.[0];

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
            <h1 className="text-3xl font-bold tracking-tight">Phân quyền tài khoản</h1>
            <p className="text-muted-foreground">
              Thay đổi quyền hạn và vai trò hoạt động của người dùng trong hệ thống
            </p>
          </div>
        </div>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Thông tin tài khoản</CardTitle>
            <CardDescription>
              Người dùng đang được phân quyền
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                {(user.fullName || "User")
                  .split(" ")
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{user.fullName}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-muted-foreground">
                    Vai trò hiện tại:
                  </span>
                  {currentRole ? (
                    <Badge variant="secondary" className="font-medium">
                      {currentRole.name}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Chưa có vai trò</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Chọn vai trò mới</CardTitle>
            <CardDescription>
              Chọn vai trò phù hợp cho người dùng này
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vai trò mới *</label>
              <Select
                value={selectedRoleId?.toString()}
                onValueChange={(value) => setSelectedRoleId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Chọn vai trò --" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      <div className="flex items-center gap-2">
                        <role.icon className="h-4 w-4" />
                        <span>{role.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Preview */}
            {selectedRole && (
              <div className="p-4 border rounded-xl bg-muted/30 space-y-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg ${selectedRole.color} flex items-center justify-center`}
                  >
                    <selectedRole.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base">{selectedRole.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedRole.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/users">Hủy</Link>
          </Button>
          <Button
            onClick={handleAssignRole}
            disabled={
              isPending || !selectedRoleId || selectedRoleId === currentRole?.id
            }
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang phân quyền...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Xác nhận phân quyền
              </>
            )}
          </Button>
        </div>
      </div>
    </RoleGuard>
  );
}
