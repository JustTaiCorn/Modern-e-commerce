"use client";

import { useState } from "react";
import { useSizes, useDeleteSize } from "@/services/sizeService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/common/CustomModal";
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
import { usePagination } from "@/lib/usePagination";
import PaginationBar from "@/components/common/PaginationBar";

export default function AdminSizeListPage() {
  const { data: sizes = [], isLoading } = useSizes();
  const deleteSizeMutation = useDeleteSize();

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    sizeId: number | null;
    sizeName: string;
  }>({
    open: false,
    sizeId: null,
    sizeName: "",
  });

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({
      open: true,
      sizeId: id,
      sizeName: name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.sizeId) {
      await deleteSizeMutation.mutateAsync(deleteModal.sizeId);
      setDeleteModal({ open: false, sizeId: null, sizeName: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, sizeId: null, sizeName: "" });
  };

  const sortedSizes = [...sizes].sort((a, b) => a.sortOrder - b.sortOrder);

  const {
    currentPage,
    setPage,
    totalPages,
    startIndex,
    pageNumbers,
    slice,
  } = usePagination({
    totalItems: sizes.length,
    itemsPerPage: 10,
    showPages: 5,
  });

  const paginatedSizes = slice(sortedSizes);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý Kích thước
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Danh mục các kích cỡ áp dụng cho sản phẩm ({sizes.length} size)
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/sizes/add">
            <Plus className="mr-2 h-4 w-4" />
            Thêm kích thước mới
          </Link>
        </Button>
      </div>

      {/* Sizes Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Danh sách kích thước</CardTitle>
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
                    <TableHead>Mã kích thước</TableHead>
                    <TableHead>Tên mô tả</TableHead>
                    <TableHead>Thứ tự hiển thị</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sizes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Chưa có kích thước nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSizes.map((size, index) => (
                      <TableRow key={size.id}>
                        <TableCell className="font-medium text-xs text-muted-foreground">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-sm bg-gray-100 px-2.5 py-1 rounded text-gray-800">
                            {size.code}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 text-sm">
                          {size.name}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {size.sortOrder}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                              <Link href={`/admin/sizes/edit/${size.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(size.id, size.name)}
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
        open={deleteModal.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xóa kích thước"
        description={`Bạn có chắc chắn muốn xóa kích thước "${deleteModal.sizeName}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  );
}
