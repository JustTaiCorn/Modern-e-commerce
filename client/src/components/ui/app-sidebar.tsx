"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import useAuthStore from "@/stores/useAuthStore";
import { toast } from "sonner";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Palette,
  ClipboardList,
  Gift,
  LogOut,
  FolderTree,
  Warehouse,
  Ruler,
  ChevronRight,
  ChevronsUpDown,
  ExternalLink,
  ShieldCheck,
  Folder,
  Tag,
  Package,
} from "lucide-react";

interface MenuItemChild {
  title: string;
  url: string;
  icon: React.ElementType;
}

interface MenuItem {
  title: string;
  url?: string;
  icon: React.ElementType;
  children?: MenuItemChild[];
  requireRole?: "ADMIN" | "STAFF";
  badge?: string;
}

interface MenuGroup {
  groupLabel: string;
  items: MenuItem[];
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { authUser, logout } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutDialog(false);
      toast.success("Đã đăng xuất thành công");
      router.push("/user/login");
    } catch (error) {
      console.error("Logout error:", error);
      setShowLogoutDialog(false);
      toast.error("Đăng xuất thất bại");
    }
  };

  const menuGroups: MenuGroup[] = [
    {
      groupLabel: "Tổng quan",
      items: [
        {
          title: "Trang tổng quan",
          url: "/admin",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      groupLabel: "Bán hàng",
      items: [
        {
          title: "Quản lý đơn hàng",
          url: "/admin/orders",
          icon: ClipboardList,
        },
        {
          title: "Quản lý mã giảm giá",
          url: "/admin/coupons",
          icon: Gift,
        },
      ],
    },
    {
      groupLabel: "Sản phẩm & Danh mục",
      items: [
        {
          title: "Quản lý sản phẩm",
          url: "/admin/products",
          icon: Package,
        },
        {
          title: "Quản lý danh mục",
          icon: FolderTree,
          children: [
            {
              title: "Danh mục chính",
              url: "/admin/categories",
              icon: Folder,
            },
            {
              title: "Danh mục con",
              url: "/admin/subcategories",
              icon: Tag,
            },
          ],
        },
        {
          title: "Quản lý màu sắc",
          url: "/admin/colors",
          icon: Palette,
        },
        {
          title: "Quản lý kích thước",
          url: "/admin/sizes",
          icon: Ruler,
        },
        {
          title: "Quản lý kho hàng",
          url: "/admin/stock",
          icon: Warehouse,
        },
      ],
    },
    {
      groupLabel: "Hệ thống",
      items: [
        {
          title: "Quản lý tài khoản",
          url: "/admin/users",
          icon: Users,
          requireRole: "ADMIN",
        },
      ],
    },
  ];

  // Helper checking if a URL is active
  const isUrlActive = (url?: string) => {
    if (!url) return false;
    if (url === "/admin") return pathname === "/admin";
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  // User initials for Avatar fallback
  const userInitials = React.useMemo(() => {
    if (!authUser?.fullName) return "AD";
    const parts = authUser.fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [authUser?.fullName]);

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
        {/* Brand Header */}
        <SidebarHeader className="border-b border-sidebar-border/60 h-14 flex items-center justify-center px-4 group-data-[collapsible=icon]:px-0">
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden w-full">
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-foreground text-sm leading-none">
              <span>ATINO STORE</span>
              <span className="rounded bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                Admin
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground truncate mt-1">
              Hệ thống Quản trị
            </span>
          </div>
          {/* Collapsed Brand Icon */}
          <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-xs">
              A
            </div>
          </div>
        </SidebarHeader>

        {/* Content Navigation */}
        <SidebarContent className="px-2 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2">
          {menuGroups.map((group) => {
            const visibleItems = group.items.filter((item) => {
              if (!item.requireRole) return true;
              return authUser?.roles?.some(
                (r) => r.name?.toUpperCase() === item.requireRole
              );
            });

            if (visibleItems.length === 0) return null;

            return (
              <SidebarGroup key={group.groupLabel} className="py-1 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:py-1">
                <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase px-2 mb-1 group-data-[collapsible=icon]:hidden">
                  {group.groupLabel}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="group-data-[collapsible=icon]:items-center">
                    {visibleItems.map((item) => {
                      if (item.children) {
                        const hasActiveChild = item.children.some((child) =>
                          isUrlActive(child.url)
                        );

                        return (
                          <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen={hasActiveChild || true}
                            className="group/collapsible"
                          >
                            <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                              <CollapsibleTrigger asChild>
                                <SidebarMenuButton
                                  tooltip={item.title}
                                  isActive={hasActiveChild}
                                  className="w-full font-medium"
                                >
                                  <item.icon className="size-4 shrink-0 text-muted-foreground group-data-[active=true]/menu-button:text-primary" />
                                  <span className="truncate">{item.title}</span>
                                  <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <SidebarMenuSub className="ml-3.5 border-l border-sidebar-border px-1 py-1">
                                  {item.children.map((subItem) => {
                                    const subActive = isUrlActive(subItem.url);
                                    return (
                                      <SidebarMenuSubItem key={subItem.title}>
                                        <SidebarMenuSubButton
                                          asChild
                                          isActive={subActive}
                                          className="text-xs"
                                        >
                                          <Link href={subItem.url}>
                                            <subItem.icon className="size-3.5 shrink-0" />
                                            <span className="truncate">{subItem.title}</span>
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    );
                                  })}
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            </SidebarMenuItem>
                          </Collapsible>
                        );
                      }

                      const active = isUrlActive(item.url);

                      return (
                        <SidebarMenuItem key={item.title} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                          <SidebarMenuButton
                            asChild
                            tooltip={item.title}
                            isActive={active}
                            className="font-medium"
                          >
                            <Link href={item.url || "#"}>
                              <item.icon className="size-4 shrink-0 text-muted-foreground group-data-[active=true]/menu-button:text-primary" />
                              <span className="truncate">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </SidebarContent>

        {/* User Profile Footer */}
        <SidebarFooter className="border-t border-sidebar-border/60 p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:py-2">
          <SidebarMenu className="group-data-[collapsible=icon]:items-center">
            <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:p-0!"
                  >
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-primary/10 font-bold text-xs text-primary">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold text-foreground">
                        {authUser?.fullName || "Quản trị viên"}
                      </span>
                      <span className="truncate text-[11px] text-muted-foreground">
                        {authUser?.email || "admin@atino.vn"}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side="top"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="size-8 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary/10 font-bold text-xs text-primary">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-xs leading-tight">
                        <span className="truncate font-semibold">
                          {authUser?.fullName || "Quản trị viên"}
                        </span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {authUser?.email || "admin@atino.vn"}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/users/profile" className="flex items-center gap-2 cursor-pointer">
                        <ShieldCheck className="size-4" />
                        <span>Hồ sơ cá nhân</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/" target="_blank" className="flex items-center gap-2 cursor-pointer">
                        <ExternalLink className="size-4" />
                        <span>Xem trang chủ Shop</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowLogoutDialog(true)}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="size-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị hệ thống ATINO?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Đăng xuất
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
