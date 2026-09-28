"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import useAuthStore from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  User,
  Package,
  LogOut,
  ChevronRight,
  Home,
  MapPin,
  Star,
} from "lucide-react";
import { toast } from "sonner";

interface UserLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  {
    href: "/user",
    label: "Thông Tin Cá Nhân",
    icon: User,
  },
  {
    href: "/user/orders",
    label: "Đơn Hàng Của Tôi",
    icon: Package,
  },
  {
    href: "/user/address",
    label: "Sổ Địa Chỉ",
    icon: MapPin,
  },
  {
    href: "/user/reviews",
    label: "Đánh Giá Của Tôi",
    icon: Star,
  },
];

export default function UserLayout({ children }: UserLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { authUser, logout } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    // Check if not logged in
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) {
      router.replace("/user/login");
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutDialog(false);
      router.push("/user/login");
    } catch {
      setShowLogoutDialog(false);
      toast.error("Đăng xuất thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Breadcrumb */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-xs md:text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground flex items-center">
              <Home className="h-3.5 w-3.5 mr-1" />
              Trang chủ
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Tài khoản cá nhân</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl shadow-xs border p-5 space-y-6">
              {/* User Info */}
              <div className="flex items-center space-x-3 pb-5 border-b">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {(authUser?.fullName || "U")[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-muted-foreground block">
                    Tài khoản của
                  </span>
                  <h3 className="text-base font-bold text-foreground truncate">
                    {authUser?.fullName || "Người dùng"}
                  </h3>
                  <span className="text-xs text-muted-foreground truncate block">
                    {authUser?.email}
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <div className="pt-4 border-t">
                <AlertDialog
                  open={showLogoutDialog}
                  onOpenChange={setShowLogoutDialog}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Đăng Xuất
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn đăng xuất khỏi tài khoản của mình?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLogout}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        Đăng Xuất
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          {/* Main User Content */}
          <div className="lg:col-span-9">{children}</div>
        </div>
      </div>
    </div>
  );
}
