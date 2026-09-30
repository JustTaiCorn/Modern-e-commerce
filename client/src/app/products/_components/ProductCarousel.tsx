"use client";

import React, { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ProductItem, { ProductItemProps } from "./ProductItem";

interface ProductCarouselProps {
  products: ProductItemProps[];
  title?: string;
  subtitle?: string;
  onAddToCart?: (productId: number) => void;
  autoPlay?: boolean;
  showArrows?: boolean;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  title,
  onAddToCart,
  autoPlay = true,
  showArrows = true,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Header */}
      {title && (
        <div className="flex items-center w-full gap-4 px-4 md:px-8 max-w-6xl mx-auto my-10">
          <div className="h-[2px] bg-gradient-to-r from-gray-900 to-transparent flex-1" />
          <h2 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight text-center whitespace-nowrap">
            {title}
          </h2>
          <div className="h-[2px] bg-gradient-to-l from-gray-900 to-transparent flex-1" />
        </div>
      )}

      {/* Carousel */}
      <div className="relative px-2 md:px-10">
        <Carousel
          opts={{
            align: "start",
            loop: autoPlay,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.map((product, index) => (
              <CarouselItem
                key={product.id}
                className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="p-1">
                  <ProductItem
                    {...product}
                    isHovered={hoveredIndex === index}
                    isFocused={hoveredIndex !== null && hoveredIndex !== index}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {showArrows && (
            <>
              <CarouselPrevious className="hidden md:flex -left-5 bg-white shadow-md border-gray-200 hover:bg-gray-100" />
              <CarouselNext className="hidden md:flex -right-5 bg-white shadow-md border-gray-200 hover:bg-gray-100" />
            </>
          )}
        </Carousel>
      </div>
    </div>
  );
};

export default ProductCarousel;
