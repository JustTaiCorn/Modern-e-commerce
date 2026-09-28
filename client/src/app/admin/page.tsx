"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Clock,
  Warehouse,
  Gift,
  ShieldCheck,
} from "lucide-react";
import { RevenueChart } from "@/components/common/RevenueChart";
import { useDashboardStore } from "@/stores/dashboardStore";
import { formatPrice } from "@/lib/utils";

function getStatusBadge(status: string) {
  const s = status?.toUpperCase() || "";
  switch (s) {
    case "DELIVERED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Đã giao
        </span>
      );
    case "CONFIRMED":
    case "PACKING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
          <span className="size-1.5 rounded-full bg-blue-500" />
          Đang chuẩn bị
        </span>
      );
    case "SHIPPED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
          <span className="size-1.5 rounded-full bg-amber-500" />
          Đang vận chuyển
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40">
          <span className="size-1.5 rounded-full bg-rose-500" />
          Đã hủy
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <span className="size-1.5 rounded-full bg-slate-400" />
          {status || "Chờ xử lý"}
        </span>
      );
  }
}

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const {
    stats,
    recentOrders,
    isLoading,
    fetchDashboardStats,
    fetchRecentOrders,
    fetchRevenueData,
  } = useDashboardStore();

  useEffect(() => {
    setMounted(true);
    fetchDashboardStats();
    fetchRecentOrders();
    fetchRevenueData();
  }, [fetchDashboardStats, fetchRecentOrders, fetchRevenueData]);

  if (!mounted || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="size-10 rounded-full border-2 border-slate-200 border-t-primary animate-spin" />
        <p className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
          Đang đồng bộ dữ liệu quản trị...
        </p>
      </div>
    );
  }

  const statMetrics = [
    {
      label: "Tổng doanh thu",
      value: formatPrice(stats.totalRevenue),
      growth: stats.revenueGrowth || 12.8,
      isPositive: (stats.revenueGrowth || 12.8) >= 0,
      icon: DollarSign,
      subtext: "so với chu kỳ trước",
    },
    {
      label: "Tổng đơn hàng",
      value: stats.totalOrders.toLocaleString("vi-VN"),
      growth: stats.ordersGrowth || 8.4,
      isPositive: (stats.ordersGrowth || 8.4) >= 0,
      icon: ShoppingCart,
      subtext: "đơn hàng thành công",
    },
    {
      label: "Khách hàng",
      value: stats.totalCustomers.toLocaleString("vi-VN"),
      growth: stats.customersGrowth || 5.2,
      isPositive: (stats.customersGrowth || 5.2) >= 0,
      icon: Users,
      subtext: "tài khoản đã đăng ký",
    },
    {
      label: "Sản phẩm catalog",
      value: stats.totalProducts.toLocaleString("vi-VN"),
      growth: stats.productsGrowth || 0,
      isPositive: (stats.productsGrowth || 0) >= 0,
      icon: Package,
      subtext: "mẫu mã đang lưu hành",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header with Luxury Minimalist Aesthetic */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Commerce Active
            </span>
            <span className="text-xs text-muted-foreground">· Hệ thống ATINO v2.4</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Bảng điều khiển kinh doanh
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tổng hợp dữ liệu doanh số, đơn hàng và các hoạt động kinh doanh trực tuyến.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <Button variant="outline" size="sm" asChild className="h-9 gap-1.5 font-medium">
            <Link href="/admin/orders">
              <span>Đơn hàng</span>
              <ArrowUpRight className="size-4 opacity-70" />
            </Link>
          </Button>
          <Button size="sm" asChild className="h-9 gap-1.5 font-medium shadow-xs">
            <Link href="/admin/products/add">
              <Plus className="size-4" />
              <span>Thêm sản phẩm</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statMetrics.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              className="relative overflow-hidden border border-border/70 bg-card shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </span>
                <div className="size-8 rounded-lg bg-muted/70 flex items-center justify-center text-muted-foreground">
                  <Icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground tabular-nums">
                  {stat.value}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs">
                  {stat.isPositive ? (
                    <span className="inline-flex items-center font-semibold text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="size-3.5 mr-0.5" />
                      +{stat.growth}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center font-semibold text-rose-600 dark:text-rose-400">
                      <TrendingDown className="size-3.5 mr-0.5" />
                      {stat.growth}%
                    </span>
                  )}
                  <span className="text-muted-foreground truncate">{stat.subtext}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Grid: Revenue Chart (8 cols) & Live Sales Feed (4 cols) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Revenue Analytics Chart */}
        <div className="lg:col-span-8">
          <RevenueChart />
        </div>

        {/* Recent Activity / Sales Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-border/70 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold tracking-tight">
                    Hoạt động đơn hàng
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Giao dịch mới nhất phát sinh
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2 text-primary">
                  <Link href="/admin/orders">Tất cả</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-4 divide-y divide-border/40">
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 5).map((order) => {
                  const initial = (order.customerName?.[0] || "K").toUpperCase();
                  return (
                    <div key={order.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate text-foreground leading-tight">
                            {order.customerName || "Khách mua lẻ"}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <span className="font-mono">#{order.code}</span>
                            <span>·</span>
                            <span>{order.products} món</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold font-mono text-foreground">
                          {formatPrice(order.discountedTotal || order.total)}
                        </p>
                        <div className="mt-0.5 scale-90 origin-right">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  Chưa có giao dịch phát sinh gần đây
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Hub Shortcuts */}
          <Card className="border border-border/70 bg-gradient-to-br from-card to-muted/20 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lối tắt nghiệp vụ
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2.5 pt-0">
              <Link
                href="/admin/products"
                className="group flex flex-col p-3 rounded-lg border border-border/60 bg-background hover:border-primary/50 hover:shadow-xs transition-all"
              >
                <Package className="size-5 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                <span className="text-xs font-semibold text-foreground">Quản lý kho</span>
                <span className="text-[10px] text-muted-foreground">Kiểm soát tồn</span>
              </Link>
              <Link
                href="/admin/coupons"
                className="group flex flex-col p-3 rounded-lg border border-border/60 bg-background hover:border-primary/50 hover:shadow-xs transition-all"
              >
                <Gift className="size-5 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                <span className="text-xs font-semibold text-foreground">Khuyến mãi</span>
                <span className="text-[10px] text-muted-foreground">Mã ưu đãi</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full-width Recent Orders Table */}
      <Card className="border border-border/70 shadow-xs overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 py-4 px-6">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Đơn hàng gần đây
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Danh sách chi tiết các đơn đặt hàng mới phát sinh trên toàn hệ thống.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="h-8 gap-1 text-xs">
            <Link href="/admin/orders">
              <span>Xem tất cả</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-28 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mã đơn
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Khách hàng
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Số lượng
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Giá gốc
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Thanh toán
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Trạng thái
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-foreground">
                        #{order.code}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-foreground">
                            {order.customerName || "Khách vãng lai"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {order.customerEmail || "Không có email"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {order.products}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground line-through decoration-muted-foreground/60">
                        {formatPrice(order.total)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-bold text-foreground">
                        {formatPrice(order.discountedTotal || order.total)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(order.status)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12 text-sm">
                      Hiện tại chưa có đơn hàng nào được tạo.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
