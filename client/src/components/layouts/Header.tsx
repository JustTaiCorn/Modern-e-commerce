"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Menu,
  X,
  Phone,
  Mail,
  User,
  Headphones,
  ShieldCheck,
  LogIn,
  UserPlus,
  LogOut,
  Package,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { CartSheet } from "@/components/common/CartSheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import useAuthStore from "@/stores/useAuthStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { Category } from "@/types";
import Logo from "../common/Logo";
import SearchBar from "../common/SearchBar";

const ListItem = React.forwardRef<
  React.ElementRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link> & { title: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-xl p-3 leading-none no-underline outline-none transition-all hover:bg-muted/80 focus:bg-muted/80 group",
            className
          )}
          {...props}
        >
          <div className="text-sm font-semibold leading-none text-foreground group-hover:text-primary transition-colors">
            {title}
          </div>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground mt-1.5 font-normal">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

const getCategoryDescription = (child: Category, parentName?: string): string => {
  if (
    child.description &&
    child.description.trim() &&
    child.description.trim().toLowerCase() !== child.name.trim().toLowerCase()
  ) {
    return child.description;
  }

  const slug = (child.slug || "").toLowerCase();
  const name = (child.name || "").toLowerCase();

  if (slug.includes("thun") || name.includes("thun")) {
    return "Cotton compact cao cấp 100% thoáng mát, thấm hút mồ hôi tối ưu";
  }
  if (slug.includes("polo") || name.includes("polo")) {
    return "Dệt pique thanh lịch, cổ bẻ đứng form tôn dáng nam tính chuẩn mực";
  }
  if (slug.includes("so-mi") || name.includes("sơ mi")) {
    return "Chống nhăn công sở, chất liệu Oxford & lụa mềm mại sang trọng";
  }
  if (slug.includes("khoac") || name.includes("khoác")) {
    return "Bomber, gió dù 2 lớp chống gió nước, phong cách trẻ trung năng động";
  }
  if (slug.includes("jeans") || name.includes("jeans")) {
    return "Denim co giãn thoải mái, form slimfit & regular tôn dáng thời thượng";
  }
  if (slug.includes("kaki") || name.includes("kaki")) {
    return "Chino cao cấp mềm êm, phom ôm nhẹ lịch lãm nơi công sở và dạo phố";
  }
  if (slug.includes("short") || name.includes("short") || name.includes("sooc")) {
    return "Năng động, thoáng nhẹ và co giãn linh hoạt cho ngày hè thoải mái";
  }
  if (slug.includes("tay") || name.includes("tây") || name.includes("au") || name.includes("âu")) {
    return "May đo cao cấp, cạp tăng đơ co giãn thông minh, chuẩn phom quý ông";
  }
  if (
    slug.includes("that-lung") ||
    name.includes("thắt lưng") ||
    name.includes("day-nit") ||
    name.includes("dây nịt")
  ) {
    return "Da bò thật nguyên tấm, mặt khóa kim loại tự động tinh xảo bền bỉ";
  }
  if (slug.includes("vi-da") || name.includes("ví") || name.includes("bóp")) {
    return "Thiết kế nhỏ gọn nhiều ngăn, chất da cao cấp chống xước tiện dụng";
  }
  if (slug.includes("giay") || name.includes("giày")) {
    return "Giày da bò êm chân và sneaker trẻ trung dẫn đầu xu hướng thời trang";
  }
  if (slug.includes("tat") || name.includes("vớ")) {
    return "Khử mùi kháng khuẩn, sợi tre tự nhiên mềm mịn và êm ái";
  }

  return `Bộ sưu tập ${child.name} thiết kế mới nhất với chất liệu cao cấp và phom dáng chuẩn`;
};

export default function Header() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { authUser, isAdminOrStaff, logout } = useAuthStore();
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/user/login");
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const parentCategories = categories.filter(
    (cat) => (!cat.parentId || (typeof cat.parentId === "object" && !cat.parentId?.id)) && cat.isActive
  );

  return (
    <>
      {/* Top Header Bar */}
      <div className="bg-black text-white py-1.5 text-xs">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span>HOTLINE: 1900 1234</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>support@atino.vn</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAdminOrStaff() && (
                <Link
                  href="/admin"
                  className="flex items-center space-x-1.5 text-yellow-400 hover:text-yellow-300 font-semibold"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>TRANG QUẢN TRỊ</span>
                </Link>
              )}
              <Link
                href="/news"
                className="hover:underline flex items-center space-x-1"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>CHÍNH SÁCH</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 py-2 border-b border-gray-100 shadow-xs">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Logo />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <NavigationMenu>
                <NavigationMenuList>
                  {/* Trang chủ */}
                  <NavigationMenuItem className="px-1">
                    <Link href="/">
                      <NavigationMenuLink asChild>
                        <span className="uppercase font-bold text-sm tracking-wide hover:text-primary transition-colors cursor-pointer px-3 py-2 inline-block">
                          Trang chủ
                        </span>
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  {/* Danh mục */}
                  {parentCategories.map((parent) => {
                    const children = categories.filter((child) => {
                      if (!child.isActive) return false;
                      if (child.parentId && typeof child.parentId === "object") {
                        return child.parentId.id === parent.id;
                      }
                      return child.parentId === parent.id;
                    });

                    if (children.length === 0) {
                      return (
                        <NavigationMenuItem key={parent.id} className="px-1">
                          <Link href={`/categories/${parent.slug}`}>
                            <NavigationMenuLink asChild>
                              <span className="uppercase font-bold text-sm tracking-wide hover:text-primary transition-colors cursor-pointer px-3 py-2 inline-block">
                                {parent.name}
                              </span>
                            </NavigationMenuLink>
                          </Link>
                        </NavigationMenuItem>
                      );
                    }

                    return (
                      <NavigationMenuItem key={parent.id} className="px-1">
                        <NavigationMenuTrigger className="uppercase font-bold text-sm tracking-wide">
                          {parent.name}
                        </NavigationMenuTrigger>

                        <NavigationMenuContent>
                          <div className="grid gap-3 p-4 md:w-[540px] lg:w-[640px] lg:grid-cols-[210px_1fr]">
                            {/* Featured Parent Collection Card */}
                            <div className="h-full">
                              <NavigationMenuLink asChild>
                                <Link
                                  href={`/categories/${parent.slug}`}
                                  className="flex h-full w-full select-none flex-col justify-end rounded-xl bg-gradient-to-b from-primary/10 via-muted/40 to-muted p-5 no-underline outline-none transition-all hover:bg-muted/80 group"
                                >
                                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <Sparkles className="w-4 h-4" />
                                  </div>
                                  <div className="mb-1 text-sm font-bold uppercase tracking-wider text-foreground">
                                    BST {parent.name}
                                  </div>
                                  <p className="text-xs leading-relaxed text-muted-foreground font-normal line-clamp-3">
                                    {parent.description ||
                                      `Khám phá toàn bộ bộ sưu tập ${parent.name} thời trang nam cao cấp của ATINO.`}
                                  </p>
                                  <span className="text-xs font-bold text-primary mt-3 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
                                  </span>
                                </Link>
                              </NavigationMenuLink>
                            </div>

                            {/* Subcategories Grid with Meaningful Descriptions */}
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 list-none m-0 p-0">
                              {children.map((child) => (
                                <ListItem
                                  key={child.id}
                                  title={child.name}
                                  href={`/categories/${parent.slug}/${child.slug}`}
                                >
                                  {getCategoryDescription(child, parent.name)}
                                </ListItem>
                              ))}
                            </ul>
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    );
                  })}

                  {/* Tin tức */}
                  <NavigationMenuItem className="px-1">
                    <Link href="/news">
                      <NavigationMenuLink asChild>
                        <span className="uppercase font-bold text-sm tracking-wide hover:text-primary transition-colors cursor-pointer px-3 py-2 inline-block">
                          Tin tức
                        </span>
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right icons: Search, Cart, User */}
            <div className="flex items-center space-x-3">
              {/* Desktop Search */}
              <SearchBar className="hidden md:block" />

              {/* Mobile Search Button */}
              <button
                className="md:hidden p-2 hover:bg-gray-100 rounded-full text-gray-700"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Tìm kiếm"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart Drawer */}
              <CartSheet />

              {/* User Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-700 transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
                    aria-label="Tài khoản"
                    title={mounted && authUser ? `Xin chào, ${authUser.fullName}` : "Tài khoản"}
                  >
                    {mounted && authUser ? (
                      <div className="w-6 h-6 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">
                        {(authUser.fullName || "U")[0]?.toUpperCase()}
                      </div>
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 mt-1">
                  {mounted && authUser ? (
                    <>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1 py-0.5">
                          <p className="text-sm font-semibold text-gray-900 leading-none truncate">
                            {authUser.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {authUser.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem asChild>
                        <Link href="/user" className="flex items-center gap-2 cursor-pointer w-full">
                          <User className="w-4 h-4 text-gray-600" />
                          <span>Tài khoản của tôi</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href="/user/orders" className="flex items-center gap-2 cursor-pointer w-full">
                          <Package className="w-4 h-4 text-gray-600" />
                          <span>Đơn hàng của tôi</span>
                        </Link>
                      </DropdownMenuItem>

                      {isAdminOrStaff() && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center gap-2 cursor-pointer w-full text-yellow-600 focus:text-yellow-600">
                            <ShieldCheck className="w-4 h-4 text-yellow-600" />
                            <span>Trang quản trị</span>
                          </Link>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold">
                        Tài khoản
                      </DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href="/user/login" className="flex items-center gap-2 cursor-pointer w-full">
                          <LogIn className="w-4 h-4 text-gray-600" />
                          <span>Đăng nhập</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/user/signup" className="flex items-center gap-2 cursor-pointer w-full">
                          <UserPlus className="w-4 h-4 text-gray-600" />
                          <span>Đăng ký</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 text-gray-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t space-y-2 animate-in slide-in-from-top duration-200">
              <Link
                href="/"
                className="block py-2 text-sm font-semibold uppercase text-gray-900 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Trang chủ
              </Link>

              {parentCategories.map((parent) => {
                const children = categories.filter((child) => {
                  if (!child.isActive) return false;
                  if (child.parentId && typeof child.parentId === "object") {
                    return child.parentId.id === parent.id;
                  }
                  return child.parentId === parent.id;
                });

                if (children.length === 0) {
                  return (
                    <Link
                      key={parent.id}
                      href={`/categories/${parent.slug}`}
                      className="block py-2 text-sm font-semibold uppercase text-gray-800 hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {parent.name}
                    </Link>
                  );
                }

                return (
                  <div key={parent.id} className="py-2">
                    <Link
                      href={`/categories/${parent.slug}`}
                      className="font-bold text-sm uppercase text-gray-900 mb-1.5 block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {parent.name}
                    </Link>
                    <div className="pl-4 space-y-1.5 border-l-2 border-gray-100">
                      {children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/categories/${parent.slug}/${child.slug}`}
                          className="block text-xs font-medium text-gray-600 hover:text-primary py-0.5"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}

              <Link
                href="/news"
                className="block py-2 text-sm font-semibold uppercase text-gray-800 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Tin tức & Chính sách
              </Link>

              {/* Mobile Account Section */}
              <div className="pt-3 border-t space-y-1">
                {mounted && authUser ? (
                  <>
                    <div className="px-1 py-1 text-xs text-muted-foreground truncate">
                      Đăng nhập bởi: <span className="font-semibold text-gray-900">{authUser.fullName}</span>
                    </div>
                    <Link
                      href="/user"
                      className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700 hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      <span>Tài khoản của tôi</span>
                    </Link>
                    <Link
                      href="/user/orders"
                      className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700 hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Package className="w-4 h-4 text-gray-500" />
                      <span>Đơn hàng của tôi</span>
                    </Link>
                    {isAdminOrStaff() && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 py-2 text-sm font-medium text-yellow-600 hover:text-yellow-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <ShieldCheck className="w-4 h-4 text-yellow-600" />
                        <span>Trang quản trị</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2 w-full text-left py-2 text-sm font-medium text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3 pt-1">
                    <Link
                      href="/user/login"
                      className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Đăng nhập</span>
                    </Link>
                    <span className="text-gray-300">|</span>
                    <Link
                      href="/user/signup"
                      className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:underline"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Đăng ký</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile Search input */}
          {isSearchOpen && (
            <div className="md:hidden py-3 border-t">
              <SearchBar
                isMobile={true}
                onClose={() => setIsSearchOpen(false)}
              />
            </div>
          )}
        </div>
      </header>
    </>
  );
}
