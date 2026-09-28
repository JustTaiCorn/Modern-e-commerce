"use client";

import { useState, useEffect } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CustomModal from "@/components/common/CustomModal";
import { useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import {
  Edit,
  Trash2,
  MoreHorizontal,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

export default function AdminProductListPage() {
  const {
    products,
    fetchProducts,
    deleteProduct,
    isLoading,
    currentPage,
    pageSize,
    hasNextPage,
  } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    productId: number;
    productName: string;
  }>({
    open: false,
    productId: 0,
    productName: "",
  });

  useEffect(() => {
    fetchProducts(1, 15);
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchProducts(currentPage - 1, pageSize);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      fetchProducts(currentPage + 1, pageSize);
    }
  };

  const handleDeleteProduct = (productId: number, productName: string) => {
    setDeleteModal({ open: true, productId, productName });
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(deleteModal.productId);
      setDeleteModal({ open: false, productId: 0, productName: "" });
      fetchProducts(currentPage, pageSize);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Quản lý Sản phẩm
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Danh sách tất cả sản phẩm và phân loại trong cửa hàng
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/add">
            <Plus className="mr-2 h-4 w-4" />
            Thêm sản phẩm mới
          </Link>
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Danh sách sản phẩm</CardTitle>
          <CardDescription>
            Hiển thị sản phẩm trang {currentPage}
          </CardDescription>
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
                    <TableHead className="w-12 text-center">STT</TableHead>
                    <TableHead className="w-20">Ảnh</TableHead>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Mã SKU</TableHead>
                    <TableHead>Giá gốc</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Không có sản phẩm nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product, index) => {
                      const category = categories.find(
                        (c) => c.id === product.category?.id
                      );
                      const firstImage = product.images?.[0]?.image_url || product.images?.[0]?.url;

                      return (
                        <TableRow key={product.id}>
                          <TableCell className="text-center font-medium text-xs text-muted-foreground">
                            {(currentPage - 1) * pageSize + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="w-12 h-12 bg-gray-100 rounded-md border flex items-center justify-center overflow-hidden relative">
                              {firstImage ? (
                                <Image
                                  src={firstImage}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <span className="text-[10px] text-gray-400">Không ảnh</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-sm text-gray-900">{product.name}</div>
                            {product.description && (
                              <div className="text-xs text-muted-foreground truncate max-w-[240px]">
                                {product.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {product.sku || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-sm text-gray-900">
                              {formatPrice(product.basePrice)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-medium text-gray-600">
                              {category?.name || product.category?.name || "Chưa phân loại"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={product.isPublished ? "default" : "secondary"}
                              className={product.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}
                            >
                              {product.isPublished ? "Đang bán" : "Ẩn"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/products/${product.id}`} className="cursor-pointer">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Chỉnh sửa
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/products/${product.id}`} target="_blank" className="cursor-pointer">
                                    <Eye className="mr-2 h-4 w-4" />
                                    Xem trên web
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteProduct(product.id, product.name)}
                                  className="text-red-600 focus:text-red-600 cursor-pointer"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <span className="text-xs text-muted-foreground">
              Trang {currentPage}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage <= 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Trang trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!hasNextPage || isLoading}
              >
                Trang sau
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <CustomModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, productId: 0, productName: "" })}
        onConfirm={confirmDelete}
        title="Xóa sản phẩm"
        description={`Bạn có chắc chắn muốn xóa sản phẩm "${deleteModal.productName}"? Hành động này sẽ xóa tất cả biến thể và không thể hoàn tác.`}
        confirmText="Xóa sản phẩm"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  );
}
