"use client";

import React, { useState } from "react";
import ProductGrid from "./ProductGrid";
import { convertProductToItemProps } from "./ProductItem";
import { Product } from "@/types";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [displayCount, setDisplayCount] = useState(8);
  const [isLoading, setIsLoading] = useState(false);

  const rawList = Array.isArray(products)
    ? products
    : Array.isArray((products as any)?.items)
    ? (products as any).items
    : [];

  const allProducts = rawList
    .filter((p) => p.isPublished !== false && p.isActive !== false)
    .map(convertProductToItemProps);
  const displayedProducts = allProducts.slice(0, displayCount);

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount((prev) => Math.min(prev + 8, allProducts.length));
      setIsLoading(false);
    }, 400);
  };

  return (
    <section className="py-6">
      <div className="w-full mx-auto px-4 md:px-10 lg:px-12">
        <ProductGrid
          products={displayedProducts}
          title="Sản Phẩm Nổi Bật"
          showLoadMore={displayCount < allProducts.length}
          onLoadMore={handleLoadMore}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
}
