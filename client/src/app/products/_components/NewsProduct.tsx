"use client";

import React, { useMemo } from "react";
import ProductCarousel from "./ProductCarousel";
import { convertProductToItemProps } from "./ProductItem";
import { Product } from "@/types";

interface NewsProductProps {
  products: Product[];
}

export default function NewsProduct({ products }: NewsProductProps) {
  const newsProducts = useMemo(() => {
    const rawList = Array.isArray(products)
      ? products
      : Array.isArray((products as any)?.items)
      ? (products as any).items
      : [];
    return rawList
      .filter((p: any) => p.isPublished !== false && p.isActive !== false)
      .map(convertProductToItemProps)
      .sort((a: any, b: any) => b.id - a.id)
      .slice(0, 8);
  }, [products]);

  return (
    <section className="py-4 bg-white">
      <div className="w-full mx-auto">
        <ProductCarousel
          products={newsProducts}
          title="Sản phẩm mới nhất"
          autoPlay={true}
          showArrows={true}
        />
      </div>
    </section>
  );
}
