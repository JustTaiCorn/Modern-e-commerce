"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import privateClient from "@/lib/axios";
import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ProductGrid from "@/app/products/_components/ProductGrid";
import { convertProductToItemProps } from "@/app/products/_components/ProductItem";
import { Product } from "@/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      searchProducts(query);
    } else {
      setProducts([]);
    }
  }, [query]);

  const searchProducts = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      // Modern_ecommerce backend supports /products?keyword=...
      const response = await privateClient.get("/products", {
        params: { keyword: searchQuery, limit: 50 },
      });
      const data = response.data?.items || response.data?.data || response.data || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      try {
        // Fallback to /products/search
        const response = await privateClient.get("/products/search", {
          params: { name: searchQuery },
        });
        const data = response.data?.data || response.data || [];
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Search error:", err);
        setProducts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayedProducts = useMemo(() => {
    return products
      .slice(0, displayCount)
      .map(convertProductToItemProps);
  }, [products, displayCount]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + 12, products.length));
      setIsLoadingMore(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Trang chủ</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="font-semibold text-gray-800">Tìm kiếm</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Về trang chủ
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Kết quả tìm kiếm cho: &ldquo;{query}&rdquo;
          </h1>
          <p className="text-gray-500 text-sm">
            {isLoading
              ? "Đang tìm kiếm sản phẩm..."
              : `Tìm thấy ${products.length} sản phẩm phù hợp`}
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
          </div>
        )}

        {!isLoading && products.length === 0 && (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-100 p-8 max-w-lg mx-auto shadow-sm">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy sản phẩm nào
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Thử tìm kiếm với từ khóa khác hoặc khám phá các danh mục thời trang của chúng tôi.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <ProductGrid
            products={displayedProducts}
            showLoadMore={displayCount < products.length}
            onLoadMore={handleLoadMore}
            isLoading={isLoadingMore}
          />
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <SearchContent />
    </Suspense>
  );
}
