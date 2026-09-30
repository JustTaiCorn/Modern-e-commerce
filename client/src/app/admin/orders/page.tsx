"use client";

import { useMemo, useState } from "react";
import { OrderTable } from "./_components/OrderTable";
import { CheckCircle, Clock, DollarSign, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import StatCard from "@/components/common/StatCard";
import { usePagination } from "@/lib/usePagination";
import PaginationBar from "@/components/common/PaginationBar";
import { useAllOrder } from "@/services/orderService";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export default function AdminOrdersPage() {
  const { data: orders = [], isLoading } = useAllOrder();
  const [currentTab, setCurrentTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status === "DELIVERED" || o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "NEW" || o.status === "CONFIRMED").length;
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;

  const statscard = [
    {
      title: "Tổng đơn hàng",
      value: totalOrders.toString(),
      icon: ShoppingBag,
    },
    {
      title: "Tổng doanh thu",
      value: formatPrice(totalRevenue),
      icon: DollarSign,
    },
    {
      title: "Đơn chờ xử lý",
      value: pendingOrders.toString(),
      icon: Clock,
    },
    {
      title: "Đơn hoàn thành",
      value: deliveredOrders.toString(),
      icon: CheckCircle,
    },
  ];

  // Filter orders by tab and search term
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (currentTab !== "ALL" && order.status !== currentTab) {
        return false;
      }
      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const codeMatch = order.code?.toLowerCase().includes(term);
        const nameMatch = order.user?.fullName?.toLowerCase().includes(term) ||
          (order as any).customerName?.toLowerCase().includes(term);
        const emailMatch = order.user?.email?.toLowerCase().includes(term);
        return codeMatch || nameMatch || emailMatch;
      }
      return true;
    });
  }, [orders, currentTab, searchTerm]);

  const {
    currentPage,
    setPage,
    totalPages,
    startIndex,
    endIndex,
    pageNumbers,
    slice,
  } = usePagination({
    totalItems: filteredOrders.length,
    itemsPerPage: 10,
    showPages: 5,
  });

  const paginatedOrders = slice(filteredOrders);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm font-medium">Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Quản lý Đơn hàng
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Theo dõi trạng thái, doanh thu và xử lý giao vận cho khách hàng ({orders.length} đơn hàng)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statscard.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        <Tabs
          value={currentTab}
          onValueChange={(val) => {
            setCurrentTab(val);
            setPage(1);
          }}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-3 sm:flex">
            <TabsTrigger value="ALL">Tất cả</TabsTrigger>
            <TabsTrigger value="NEW">Chờ xử lý</TabsTrigger>
            <TabsTrigger value="CONFIRMED">Đã xác nhận</TabsTrigger>
            <TabsTrigger value="SHIPPED">Đang giao</TabsTrigger>
            <TabsTrigger value="DELIVERED">Đã giao</TabsTrigger>
            <TabsTrigger value="CANCELLED">Đã hủy</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Tìm theo mã đơn, tên, email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <OrderTable orders={paginatedOrders} />

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          pageNumbers={pageNumbers}
          onPageChange={setPage}
        />
      )}

      {/* Results info */}
      <div className="text-center text-xs text-muted-foreground">
        Hiển thị {filteredOrders.length > 0 ? startIndex + 1 : 0}-
        {Math.min(endIndex, filteredOrders.length)} trong{" "}
        {filteredOrders.length} đơn hàng phù hợp
      </div>
    </div>
  );
}
