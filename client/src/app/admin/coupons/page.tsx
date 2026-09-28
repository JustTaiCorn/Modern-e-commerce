"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import CustomModal from "@/components/common/CustomModal";
import { formatDate, formatPrice } from "@/lib/utils";
import { Coupon, useAllCoupons, useDeleteCoupon } from "@/services/couponService";
import { usePagination } from "@/lib/usePagination";
import PaginationBar from "@/components/common/PaginationBar";

const getCouponStatus = (coupon: Coupon): "active" | "expired" | "upcoming" | "inactive" => {
  const now = new Date();
  if (!coupon.isActive) return "inactive";
  if (!coupon.startsAt || !coupon.endsAt) return "active";

  const startDate = new Date(coupon.startsAt);
  const endDate = new Date(coupon.endsAt);

  if (now < startDate) return "upcoming";
  if (now > endDate) return "expired";

  return "active";
};

export default function AdminCouponListPage() {
  const { mutate: deleteCoupon } = useDeleteCoupon();
  const { data: coupons = [], isLoading } = useAllCoupons();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    couponId: number | null;
    couponCode: string;
  }>({
    open: false,
    couponId: null,
    couponCode: "",
  });

  const handleDeleteClick = (id: number, code: string) => {
    setDeleteDialog({
      open: true,
      couponId: id,
      couponCode: code,
    });
  };

  const getStatusBadge = (coupon: Coupon) => {
    const status = getCouponStatus(coupon);

    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
            Đang áp dụng
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-500">
            Hết hạn
          </Badge>
        );
      case "upcoming":
        return (
          <Badge variant="outline" className="border-blue-400 text-blue-600">
            Sắp diễn ra
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            Tạm dừng
          </Badge>
        );
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.couponId) {
      deleteCoupon(deleteDialog.couponId);
      setDeleteDialog({ open: false, couponId: null, couponCode: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, couponId: null, couponCode: "" });
  };

  const {
    currentPage,
    setPage,
    totalPages,
    startIndex,
    pageNumbers,
    slice,
  } = usePagination({
    totalItems: coupons.length,
    itemsPerPage: 10,
    showPages: 5,
  });

  const paginatedCoupons = slice(coupons);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý Mã giảm giá (Coupons)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tạo và cấu hình các voucher ưu đãi, mã giảm giá cho khách hàng ({coupons.length} mã)
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/coupons/add">
            <Plus className="mr-2 h-4 w-4" />
            Tạo mã ưu đãi mới
          </Link>
        </Button>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Danh sách voucher ưu đãi</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">STT</TableHead>
                    <TableHead>Mã Voucher</TableHead>
                    <TableHead>Tên chương trình</TableHead>
                    <TableHead>Mức giảm</TableHead>
                    <TableHead>Đơn tối thiểu</TableHead>
                    <TableHead>Hạn sử dụng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Chưa có mã giảm giá nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCoupons.map((coupon, index) => (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-medium text-xs text-muted-foreground">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-bold text-xs bg-primary/10 text-primary px-2.5 py-1 rounded">
                            {coupon.code}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 text-sm">
                          {coupon.name}
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-600 text-sm">
                          {formatPrice(coupon.value)}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {coupon.minOrderTotal ? formatPrice(coupon.minOrderTotal) : "Không yêu cầu"}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {coupon.endsAt ? formatDate(coupon.endsAt) : "Vô thời hạn"}
                        </TableCell>
                        <TableCell>{getStatusBadge(coupon)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                              <Link href={`/admin/coupons/edit/${coupon.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(coupon.id, coupon.code)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            pageNumbers={pageNumbers}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <CustomModal
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xóa mã giảm giá"
        description={`Bạn có chắc chắn muốn xóa mã "${deleteDialog.couponCode}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  );
}
