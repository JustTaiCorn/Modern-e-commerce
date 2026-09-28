"use client";

import { useState, useMemo } from "react";
import { compareDesc } from "date-fns";
import { OrderTable } from "./_components/OrderTable";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import UserLayout from "@/components/layouts/UserLayout";
import useAuthStore from "@/stores/useAuthStore";
import { useUserOrders } from "@/services/orderService";
import { Order, OrderStatus } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OrdersPage() {
  const { authUser } = useAuthStore();
  const {
    data: orders = [],
    isLoading,
  } = useUserOrders({ userId: authUser?.id });

  const [currentTab, setCurrentTab] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter orders by status
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (currentTab === "ALL") return orders;
    return orders.filter((order) => {
      if (currentTab === "NEW") return order.status === "NEW" || order.status === "CONFIRMED";
      if (currentTab === "SHIPPED") return order.status === "SHIPPED" || order.status === "PACKING";
      if (currentTab === "DELIVERED") return order.status === "DELIVERED";
      if (currentTab === "CANCELLED") return order.status === "CANCELLED";
      return true;
    });
  }, [orders, currentTab]);

  // Sort orders by created_at (newest first)
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      return compareDesc(new Date(a.createdAt || 0), new Date(b.createdAt || 0));
    });
  }, [filteredOrders]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

  const handleTabChange = (val: string) => {
    setCurrentTab(val);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    const half = Math.floor(showPages / 2);

    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + showPages - 1);

    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (isLoading) {
    return (
      <UserLayout>
        <div className="space-y-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Đơn hàng của tôi</h1>
          <p className="text-gray-600 text-sm">
            Quản lý và theo dõi tiến độ các đơn hàng ({orders.length} đơn hàng)
          </p>
        </div>

        {/* Filter Tabs */}
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="ALL">Tất cả</TabsTrigger>
            <TabsTrigger value="NEW">Chờ xử lý</TabsTrigger>
            <TabsTrigger value="SHIPPED">Đang giao</TabsTrigger>
            <TabsTrigger value="DELIVERED">Đã giao</TabsTrigger>
            <TabsTrigger value="CANCELLED">Đã hủy</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Orders Table */}
        <OrderTable orders={paginatedOrders} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Hiển thị {startIndex + 1}-{Math.min(endIndex, sortedOrders.length)} trong {sortedOrders.length} đơn hàng
            </div>
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                )}

                {getPageNumbers().map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      isActive={pageNum === currentPage}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
