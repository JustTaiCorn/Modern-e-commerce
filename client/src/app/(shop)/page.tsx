"use client";

import GridLetter from "@/components/common/GridLetter";
import Heroslide from "@/components/features/images/Heroslide";
import ListPolicy from "@/components/common/ListPolicy";
import OfferBanner from "@/components/features/images/OfferBanner";
import FeaturedProducts from "@/app/products/_components/FeaturedProducts";
import BestSellerProduct from "@/app/products/_components/BestSellerProduct";
import NewsProduct from "@/app/products/_components/NewsProduct";
import { useProductsQuery } from "@/services/productService";

export default function Home() {
  const { data: products = [], isLoading } = useProductsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
          <p className="text-gray-600 text-sm font-medium">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Heroslide />
      <FeaturedProducts products={products} />
      <GridLetter />
      <BestSellerProduct products={products} />
      <OfferBanner />
      <NewsProduct products={products} />
      <ListPolicy />
    </div>
  );
}
