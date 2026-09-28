"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Rating, RatingButton } from "@/components/ui/rating";

export interface ProductItemProps {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  images?: { image_url: string; position?: number }[];
  rating?: number;
  reviewCount?: number;
  isHovered?: boolean;
  isFocused?: boolean;
  isOutOfStock?: boolean;
}

export const convertProductToItemProps = (
  product: Product | any
): ProductItemProps => {
  const isOutOfStock =
    product.inventories && product.inventories.length > 0
      ? product.inventories.every((inv: any) => inv.quantity === 0)
      : (product.totalStock !== undefined ? product.totalStock === 0 : false);

  const basePrice =
    product.basePrice ??
    product.minPrice ??
    (product.variants?.[0]?.price ? Number(product.variants[0].price) : 0);

  const images = Array.isArray(product.images)
    ? product.images
        .slice()
        .sort((a: any, b: any) => (a.sortOrder ?? a.position ?? 0) - (b.sortOrder ?? b.position ?? 0))
        .map((img: any) => ({
          image_url: img.url || img.image_url || "",
          position: img.sortOrder ?? img.position ?? 0,
        }))
    : [];

  const rating =
    product.rating !== undefined && product.rating !== null
      ? Number(product.rating)
      : (product.reviews && product.reviews.length > 0
          ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) /
            product.reviews.length
          : 0);

  const reviewCount = product.numReviews ?? product.reviews?.length ?? 0;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    basePrice,
    images,
    isOutOfStock,
    rating,
    reviewCount,
  };
};

const ProductItem: React.FC<ProductItemProps> = ({
  id,
  name,
  basePrice,
  images = [],
  isHovered: isHoveredFromParent,
  isFocused = false,
  isOutOfStock = false,
  rating,
  reviewCount,
}) => {
  const [currentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const imageUrls = images.map((img) => img.image_url);
  const currentImage =
    imageUrls[currentImageIndex] || "/images/placeholder.jpg";

  const renderStars = (starRating: number) => {
    return (
      <Rating value={starRating} readOnly>
        {Array.from({ length: 5 }).map((_, index) => (
          <RatingButton className="text-yellow-500" key={index} size={14} />
        ))}
      </Rating>
    );
  };

  return (
    <div
      className={`group overflow-hidden rounded-lg bg-white border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer relative ${
        isFocused ? "scale-[0.98]" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link href={`/products/${id}`}>
          <Image
            src={currentImage}
            alt={name}
            fill
            className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
              isOutOfStock ? "opacity-60" : ""
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
        </Link>

        {/* Out of stock badge */}
        {isOutOfStock && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-red-500 text-white px-2.5 py-0.5 text-xs font-semibold rounded shadow-sm">
              Hết hàng
            </span>
          </div>
        )}

        {/* Hover Overlay with Wishlist button */}
        <div
          className={`absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <Button
            size="icon"
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              toast.info("Tính năng danh sách yêu thích đang phát triển");
            }}
            className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white text-gray-700 hover:text-red-500"
            title="Thêm vào yêu thích"
          >
            <Heart className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 text-center">
        <h3
          className={`font-medium text-sm mb-1 line-clamp-2 ${
            isOutOfStock ? "text-gray-400" : "text-gray-900 group-hover:text-primary transition-colors"
          }`}
        >
          <Link href={`/products/${id}`}>{name}</Link>
        </h3>

        <div className="mb-2">
          <span className="text-base font-bold text-gray-900">
            {formatPrice(basePrice)}
          </span>
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <div className="flex text-yellow-400">
            {renderStars(rating || 0)}
          </div>
          <span className="text-xs text-gray-500">({reviewCount})</span>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
