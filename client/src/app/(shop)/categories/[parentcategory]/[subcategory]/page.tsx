"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCategoryStore } from "@/stores/categoryStore";
import ProductGrid from "@/app/products/_components/ProductGrid";
import { convertProductToItemProps } from "@/app/products/_components/ProductItem";
import { priceRanges } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useProductsQuery } from "@/services/productService";
import { useColors } from "@/services/colorService";
import { useSizes } from "@/services/sizeService";

interface Filters {
  priceRange: [number, number];
  colorIds: number[];
  sizeIds: number[];
  sortBy: "name" | "price" | "rating" | "newest";
  sortOrder: "asc" | "desc";
}

export default function SubCategoryPage() {
  const { parentcategory, subcategory } = useParams();
  const { data: products = [] } = useProductsQuery();
  const [displayCount, setDisplayCount] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { getCategoryBySlug } = useCategoryStore();
  const { data: colors = [] } = useColors();
  const { data: sizes = [] } = useSizes();

  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 5000000],
    colorIds: [],
    sizeIds: [],
    sortBy: "newest",
    sortOrder: "desc",
  });

  const parentCat = useMemo(() => {
    if (typeof parentcategory === "string") {
      return getCategoryBySlug(parentcategory);
    }
    return null;
  }, [parentcategory, getCategoryBySlug]);

  const subCategory = useMemo(() => {
    if (typeof subcategory === "string") {
      return getCategoryBySlug(subcategory);
    }
    return null;
  }, [subcategory, getCategoryBySlug]);

  const categoryTitle = subCategory?.name || "Danh mục con";

  const filteredProducts = useMemo(() => {
    const rawList = Array.isArray(products)
      ? products
      : Array.isArray((products as any)?.items)
      ? (products as any).items
      : [];

    let filtered = rawList.filter((p: any) => p.isPublished !== false && p.isActive !== false);

    if (subCategory) {
      filtered = filtered.filter(
        (product: any) => product.category?.id === subCategory.id
      );
    }

    const getPrice = (p: any) =>
      p.basePrice ?? p.minPrice ?? (p.variants?.[0]?.price ? Number(p.variants[0].price) : 0);

    filtered = filtered.filter((product: any) => {
      const price = getPrice(product);
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    if (filters.colorIds.length > 0) {
      filtered = filtered.filter((product: any) =>
        product.variants?.some((v: any) => {
          if (v.color?.id && filters.colorIds.includes(v.color.id)) return true;
          return v.attributeValues?.some((av: any) =>
            filters.colorIds.includes(av.attributeValue?.id || av.attributeValueId || av.id)
          );
        })
      );
    }

    if (filters.sizeIds.length > 0) {
      filtered = filtered.filter((product: any) =>
        product.variants?.some((v: any) => {
          if (v.size?.id && filters.sizeIds.includes(v.size.id)) return true;
          return v.attributeValues?.some((av: any) =>
            filters.sizeIds.includes(av.attributeValue?.id || av.attributeValueId || av.id)
          );
        })
      );
    }

    filtered.sort((a: any, b: any) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          comparison = getPrice(a) - getPrice(b);
          break;
        case "rating":
          const ratingA = a.reviews?.length ? a.reviews.reduce((s: number, r: any) => s + r.rating, 0) / a.reviews.length : 0;
          const ratingB = b.reviews?.length ? b.reviews.reduce((s: number, r: any) => s + r.rating, 0) / b.reviews.length : 0;
          comparison = ratingA - ratingB;
          break;
        case "newest":
          comparison = b.id - a.id;
          break;
        default:
          break;
      }
      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [subCategory, filters, products]);

  const displayedProducts = useMemo(() => {
    return filteredProducts
      .slice(0, displayCount)
      .map(convertProductToItemProps);
  }, [filteredProducts, displayCount]);

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + 12, filteredProducts.length));
      setIsLoading(false);
    }, 400);
  };

  const handleColorFilter = (colorId: number) => {
    setFilters((prev) => ({
      ...prev,
      colorIds: prev.colorIds.includes(colorId)
        ? prev.colorIds.filter((id) => id !== colorId)
        : [...prev.colorIds, colorId],
    }));
    setDisplayCount(12);
  };

  const handleSizeFilter = (sizeId: number) => {
    setFilters((prev) => ({
      ...prev,
      sizeIds: prev.sizeIds.includes(sizeId)
        ? prev.sizeIds.filter((id) => id !== sizeId)
        : [...prev.sizeIds, sizeId],
    }));
    setDisplayCount(12);
  };

  const handlePriceRangeFilter = (range: [number, number]) => {
    setFilters((prev) => ({ ...prev, priceRange: range }));
    setDisplayCount(12);
  };

  const handleSortChange = (
    sortBy: Filters["sortBy"],
    sortOrder: Filters["sortOrder"]
  ) => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 5000000],
      colorIds: [],
      sizeIds: [],
      sortBy: "newest",
      sortOrder: "desc",
    });
    setDisplayCount(12);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Trang chủ</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {parentCat && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={`/categories/${parentCat.slug || parentCat.id}`}>
                        {parentCat.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <span className="font-semibold text-gray-800">{categoryTitle}</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {categoryTitle}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{filteredProducts.length} sản phẩm</p>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`w-64 flex-shrink-0 space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Khoảng giá</h3>
                <div className="space-y-1.5">
                  {priceRanges.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => handlePriceRangeFilter(range.value)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        filters.priceRange[0] === range.value[0] &&
                        filters.priceRange[1] === range.value[1]
                          ? "bg-black text-white font-medium"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {colors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Màu sắc</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => handleColorFilter(color.id)}
                        className={`w-7 h-7 rounded-full border transition-all ${
                          filters.colorIds.includes(color.id)
                            ? "border-black ring-2 ring-black/20 scale-110"
                            : "border-gray-300 hover:border-gray-500"
                        }`}
                        style={{ backgroundColor: color.code }}
                        title={color.name}
                        type="button"
                      />
                    ))}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Kích cỡ</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => handleSizeFilter(size.id)}
                        className={`py-1.5 px-2 border rounded-md text-xs font-medium transition-colors ${
                          filters.sizeIds.includes(size.id)
                            ? "border-black bg-black text-white"
                            : "border-gray-200 hover:border-gray-400 bg-white text-gray-800"
                        }`}
                        type="button"
                      >
                        {size.code || size.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>

          {/* Main List */}
          <div className="flex-1">
            <div className="bg-white p-3.5 rounded-lg border border-gray-100 shadow-sm mb-6 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium"
                >
                  Bộ lọc
                </button>
                <span className="text-gray-500 text-xs sm:text-sm">
                  Hiển thị {Math.min(displayCount, filteredProducts.length)} / {filteredProducts.length} sản phẩm
                </span>
              </div>

              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split("-");
                  handleSortChange(
                    sortBy as Filters["sortBy"],
                    sortOrder as Filters["sortOrder"]
                  );
                }}
                className="border border-gray-200 rounded-md px-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-black bg-white"
              >
                <option value="newest-desc">Mới nhất</option>
                <option value="price-asc">Giá: Thấp đến cao</option>
                <option value="price-desc">Giá: Cao đến thấp</option>
                <option value="name-asc">Tên: A-Z</option>
                <option value="name-desc">Tên: Z-A</option>
                <option value="rating-desc">Đánh giá cao nhất</option>
              </select>
            </div>

            <ProductGrid
              products={displayedProducts}
              showLoadMore={displayCount < filteredProducts.length}
              onLoadMore={handleLoadMore}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
