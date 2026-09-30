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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCategoryStore } from "@/stores/categoryStore";
import CustomModal from "@/components/common/CustomModal";

export default function AdminCategoriesPage() {
  const { deleteCategory, categories, fetchCategories, isLoading, error } =
    useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    categoryId: number | null;
    categoryName: string;
  }>({
    open: false,
    categoryId: null,
    categoryName: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const rootCategories = categories.filter((category) => !category.parentId);

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

  const totalPages = Math.ceil(rootCategories.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = rootCategories.slice(startIndex, endIndex);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Danh mục chính
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quản lý các nhóm danh mục cấp cao nhất (Nam, Nữ, Phụ kiện...)
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/add">
            <Plus className="mr-2 h-4 w-4" />
            Thêm danh mục chính
          </Link>
        </Button>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Danh sách danh mục chính ({rootCategories.length})
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
                    <TableHead>Tên danh mục</TableHead>
                    <TableHead>Đường dẫn (Slug)</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rootCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Chưa có danh mục chính nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCategories.map((category, index) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium text-xs text-muted-foreground">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900 text-sm">
                          {category.name}
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
                              <Link href={`/admin/categories/edit/${category.id}`}>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
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
        </CardContent>
      </Card>

      <CustomModal
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xóa danh mục chính"
        description={`Bạn có chắc chắn muốn xóa danh mục "${deleteDialog.categoryName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  );
}
