"use client";

import { useState, useEffect } from "react";
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
import { useCategoryStore } from "@/stores/categoryStore";
import { usePagination } from "@/lib/usePagination";
import PaginationBar from "@/components/common/PaginationBar";
import CustomModal from "@/components/common/CustomModal";
import { Category } from "@/types";

export default function AdminSubcategoriesPage() {
  const { categories, deleteCategory, fetchCategories, isLoading } =
    useCategoryStore();

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    categoryId: number | null;
    categoryName: string;
  }>({
    open: false,
    categoryId: null,
    categoryName: "",
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Only take subcategories (where parentId exists)
  const subcategories = categories.filter(
    (category) => category.parentId !== undefined && category.parentId !== null
  );

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteDialog({
      open: true,
      categoryId: id,
      categoryName: name,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.categoryId) {
      deleteCategory(deleteDialog.categoryId);
      setDeleteDialog({ open: false, categoryId: null, categoryName: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, categoryId: null, categoryName: "" });
  };

  const getParentName = (parentId?: number | Category | null) => {
    if (!parentId) return "—";
    if (typeof parentId === "object") return parentId.name || "—";
    const parent = categories.find((c) => c.id === parentId);
    return parent?.name || "—";
  };

  const {
    currentPage,
    setPage,
    totalPages,
    startIndex,
    pageNumbers,
    slice,
  } = usePagination({
    totalItems: subcategories.length,
    itemsPerPage: 10,
    showPages: 5,
  });

  const paginatedList = slice(subcategories);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Danh mục con
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quản lý các danh mục chi tiết trực thuộc danh mục cha (Áo sơ mi, Quần tây, Áo phông...)
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/subcategories/add">
            <Plus className="mr-2 h-4 w-4" />
            Thêm danh mục con
          </Link>
        </Button>
      </div>

      {/* Subcategories Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Danh sách danh mục con ({subcategories.length})
          </CardTitle>
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
                    <TableHead>Tên danh mục con</TableHead>
                    <TableHead>Thuộc danh mục chính</TableHead>
                    <TableHead>Đường dẫn (Slug)</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Chưa có danh mục con nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedList.map((category, index) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium text-xs text-muted-foreground">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900 text-sm">
                          {category.name}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-gray-700">
                          {getParentName(category.parentId)}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-500">
                          {category.slug || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={category.isActive ? "default" : "secondary"}
                            className={category.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}
                          >
                            {category.isActive ? "Hoạt động" : "Tạm ẩn"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                              <Link href={`/admin/subcategories/edit/${category.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteClick(category.id, category.name)
                              }
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
        title="Xóa danh mục con"
        description={`Bạn có chắc chắn muốn xóa danh mục con "${deleteDialog.categoryName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  );
}
