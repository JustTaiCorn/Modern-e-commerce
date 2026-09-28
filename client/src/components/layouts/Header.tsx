"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Menu, X, Phone, Mail, User, Headphones, ShieldCheck } from "lucide-react";
import { CartSheet } from "@/components/common/CartSheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import useAuthStore from "@/stores/useAuthStore";
import { useCategoryStore } from "@/stores/categoryStore";
import Logo from "../common/Logo";
import SearchBar from "../common/SearchBar";

const ListItem = ({
  className,
  title,
  children,
  href,
  ...props
}: {
  className?: string;
  title: string;
  children?: React.ReactNode;
  href: string;
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-semibold uppercase leading-none">{title}</div>
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { authUser, isAdminOrStaff } = useAuthStore();
  const { categories, fetchCategories } = useCategoryStore();

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
                          <Link
                            href={`/categories/${parent.slug}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {parent.name}
                          </Link>
                        </NavigationMenuTrigger>

                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 p-4">
                            {children.map((child) => (
                              <ListItem
                                key={child.id}
                                title={child.name}
                                href={`/categories/${parent.slug}/${child.slug}`}
                              >
                                Xem bộ sưu tập {child.name}
                              </ListItem>
                            ))}
                          </ul>
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

              {/* User Account */}
              <Link
                href={authUser ? "/user" : "/user/login"}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-700 transition-colors"
                title={authUser ? `Xin chào, ${authUser.fullName}` : "Đăng nhập"}
              >
                <User className="w-5 h-5" />
              </Link>

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
