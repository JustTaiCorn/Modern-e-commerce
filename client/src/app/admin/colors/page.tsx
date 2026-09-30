"use client";

import { useState } from "react";
import { useColors, useDeleteColor } from "@/services/colorService";
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
import { Plus, Edit, Trash2, Palette } from "lucide-react";
import Link from "next/link";
import PaginationBar from "@/components/common/PaginationBar";
import { usePagination } from "@/lib/usePagination";

export default function AdminColorListPage() {
  const { data: colors = [], isLoading } = useColors();
  const deleteColorMutation = useDeleteColor();

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    colorId: number | null;
    colorName: string;
  }>({
    open: false,
    colorId: null,
    colorName: "",
  });

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({
      open: true,
      colorId: id,
      colorName: name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.colorId) {
      await deleteColorMutation.mutateAsync(deleteModal.colorId);
      setDeleteModal({ open: false, colorId: null, colorName: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, colorId: null, colorName: "" });
  };

  const {
    currentPage,
    setPage,
    totalPages,
    startIndex,
    pageNumbers,
    slice,
  } = usePagination({
    totalItems: colors.length,
    itemsPerPage: 10,
    showPages: 5,
  });

  const paginatedColors = slice(colors);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý Màu sắc
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Danh mục các màu sắc dùng để tạo biến thể sản phẩm ({colors.length} màu)
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/colors/add">
            <Plus className="mr-2 h-4 w-4" />
            Thêm màu mới
          </Link>
        </Button>
      </div>

      {/* Colors Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Danh sách màu sắc</CardTitle>
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
                    <TableHead className="w-24">Mẫu màu</TableHead>
                    <TableHead>Tên màu</TableHead>
                    <TableHead>Mã màu Hex</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Chưa có màu sắc nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedColors.map((color, index) => (
                      <TableRow key={color.id}>
                        <TableCell className="font-medium text-xs text-muted-foreground">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full border shadow-xs"
                              style={{ backgroundColor: color.code }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900 text-sm">
                          {color.name}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded w-fit">
                          {color.code}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                              <Link href={`/admin/colors/edit/${color.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(color.id, color.name)}
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
        title="Xóa màu sắc"
        description={`Bạn có chắc chắn muốn xóa màu "${deleteModal.colorName}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  );
}
