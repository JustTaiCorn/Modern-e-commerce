"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, AlertTriangle, Search, Filter, Edit } from "lucide-react";
import Link from "next/link";
import { useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { formatPrice } from "@/lib/utils";
import StatCard from "@/components/common/StatCard";
import { usePagination } from "@/lib/usePagination";
import PaginationBar from "@/components/common/PaginationBar";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export default function AdminStockOverviewPage() {
  const { products, fetchProducts } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { fetchAllInventories, inventories } = useInventoryStore();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchAllInventories();
  }, [fetchProducts, fetchCategories, fetchAllInventories]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");

  const inventoryData = useMemo(() => {
    return products.map((product) => {
      const productInventories = inventories.filter(
        (inv) => inv.productVariant?.product?.id === product.id
      );

      const totalStock = productInventories.reduce(
        (sum, inv) => sum + (inv.quantity || 0),
        0
      );

      let status: StockStatus = "in_stock";
      if (totalStock === 0) status = "out_of_stock";
      else if (totalStock <= 10) status = "low_stock";

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        categoryName: product.category?.name || "N/A",
        categoryId: product.category?.id,
        totalStock,
        status,
        basePrice: product.basePrice,
      };
    });
  }, [products, inventories]);

  const filteredData = useMemo(() => {
    let filtered = inventoryData;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.sku.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.categoryId === categoryFilter);
    }

    return filtered;
  }, [inventoryData, searchTerm, statusFilter, categoryFilter]);

  const totalProducts = inventoryData.length;
  const inStockCount = inventoryData.filter((i) => i.status === "in_stock").length;
  const lowStockCount = inventoryData.filter((i) => i.status === "low_stock").length;
  const outOfStockCount = inventoryData.filter((i) => i.status === "out_of_stock").length;

  const statCards = [
    {
      title: "Tổng sản phẩm",
      value: totalProducts.toString(),
      icon: Package,
    },
    {
      title: "Còn hàng (Dồi dào)",
      value: inStockCount.toString(),
      icon: Package,
    },
    {
      title: "Sắp hết hàng (<= 10)",
      value: lowStockCount.toString(),
      icon: AlertTriangle,
    },
    {
      title: "Hết hàng (Hết kho)",
      value: outOfStockCount.toString(),
      icon: AlertTriangle,
    },
  ];

  const getStatusBadge = (status: StockStatus) => {
    switch (status) {
      case "in_stock":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
            Còn hàng
          </Badge>
        );
      case "low_stock":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Sắp hết hàng
          </Badge>
        );
      case "out_of_stock":
        return (
          <Badge variant="destructive">
            Hết hàng
          </Badge>
        );
    }
  };

  const {
    currentPage,
    setPage,
    totalPages,
    startIndex,
    pageNumbers,
    slice,
  } = usePagination({
    totalItems: filteredData.length,
    itemsPerPage: 10,
    showPages: 5,
  });

  const paginatedData = slice(filteredData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Quản lý Kho hàng (Stock)
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Theo dõi số lượng tồn kho từng sản phẩm, cảnh báo hàng sắp hết
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Tìm theo tên sản phẩm, SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val as any);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái tồn kho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="in_stock">Còn hàng</SelectItem>
              <SelectItem value="low_stock">Sắp hết hàng</SelectItem>
              <SelectItem value="out_of_stock">Hết hàng</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={categoryFilter === "all" ? "all" : String(categoryFilter)}
            onValueChange={(val) => {
              setCategoryFilter(val === "all" ? "all" : Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stock Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Danh sách tồn kho sản phẩm</CardTitle>
          <CardDescription>
            Hiển thị tổng số lượng tồn kho của các phân loại biến thể
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">STT</TableHead>
                  <TableHead>Mã SKU</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Giá gốc</TableHead>
                  <TableHead className="text-center">Tổng tồn kho</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Điều chỉnh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Không có sản phẩm nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-xs text-muted-foreground">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded">
                          {item.sku}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-sm text-gray-900">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {item.categoryName}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatPrice(item.basePrice)}
                      </TableCell>
                      <TableCell className="text-center font-bold text-sm">
                        {item.totalStock}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                          <Link href={`/admin/stock/${item.id}`} title="Cập nhật số lượng kho">
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            pageNumbers={pageNumbers}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
