"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Share2,
  Ruler,
  Star,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import useAuthStore from "@/stores/useAuthStore";
import { formatPrice } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ProductTabs from "@/app/products/_components/ProductTabs";
import { useProductQuery } from "@/services/productService";
import { useReviewsByProduct } from "@/services/reviewsService";
import { Color, Product, Review, Size } from "@/types";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const numericProductId = useMemo(() => {
    const id = Array.isArray(productId) ? productId[0] : productId;
    return id ? parseInt(id, 10) : 0;
  }, [productId]);

  // Eliminating waterfalls: fetch product and reviews in parallel
  const { data: product, isLoading } = useProductQuery(numericProductId);
  const { data: reviews } = useReviewsByProduct(numericProductId);

  // Rerender optimization: atomic selectors from Zustand stores
  const addToCart = useCartStore((s) => s.addToCart);
  const buyNow = useCartStore((s) => s.buyNow);
  const cartItems = useCartStore((s) => s.items);
  const authUser = useAuthStore((s) => s.authUser);

  const orderId = parseInt(searchParams.get("orderId") || "0", 10);

  const [activeTab, setActiveTab] = useState("description");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  useEffect(() => {
    const shouldReview = searchParams.get("review");
    if (shouldReview === "true") {
      setActiveTab("reviews");
    }
  }, [searchParams]);

  // Extract images safely, prioritizing the active selected color
  const productImages = useMemo(() => {
    if (!product?.images || product.images.length === 0) return [];

    const allImages = [...product.images];

    if (selectedColor) {
      // Find images specifically attached to selected color
      const matchingColorImages = allImages.filter((img: any) => {
        if (img.colorId && img.colorId === selectedColor.id) return true;
        if (img.variant?.attributeValues) {
          return img.variant.attributeValues.some(
            (av: any) =>
              (av.attributeValueId || av.attributeValue?.id || av.id) ===
              selectedColor.id
          );
        }
        return false;
      });

      // Images not bound to any specific color (general images)
      const generalImages = allImages.filter(
        (img: any) => !img.variantId && !img.colorId
      );

      // Images belonging to other colors
      const otherColorImages = allImages.filter(
        (img: any) =>
          (img.variantId || img.colorId) && !matchingColorImages.includes(img)
      );

      // If we have photos for this color, put them first, then general photos, then other colors
      if (matchingColorImages.length > 0) {
        return [...matchingColorImages, ...generalImages, ...otherColorImages]
          .map((img: any) => img.image_url || img.url || "")
          .filter((url): url is string => Boolean(url));
      }
    }

    return allImages
      .map((img: any) => img.image_url || img.url || "")
      .filter((url): url is string => Boolean(url));
  }, [product, selectedColor]);

  // When selected color changes, reset gallery to first image
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedColor?.id]);

  // Extract available colors with full fallback support
  const availableColors = useMemo(() => {
    if (product?.colors && product.colors.length > 0) return product.colors;
    const map = new Map<number, Color>();
    product?.variants?.forEach((v: any) => {
      if (v.color) {
        map.set(v.color.id, v.color);
      }
      v.attributeValues?.forEach((av: any) => {
        const val = av.attributeValue || av;
        if (val?.type?.name?.toLowerCase() === "color" || val?.colorHex) {
          map.set(val.id, {
            id: val.id,
            name: val.displayName || val.value,
            code: val.colorHex || val.value,
          });
        }
      });
    });
    return Array.from(map.values());
  }, [product]);

  // Extract available sizes with full fallback support
  const availableSizes = useMemo(() => {
    if (product?.sizes && product.sizes.length > 0) return product.sizes;
    const map = new Map<number, Size>();
    product?.variants?.forEach((v: any) => {
      if (v.size) {
        map.set(v.size.id, v.size);
      }
      v.attributeValues?.forEach((av: any) => {
        const val = av.attributeValue || av;
        if (
          val?.type?.name?.toLowerCase() === "size" ||
          (!val?.colorHex && val?.type?.name !== "Color")
        ) {
          map.set(val.id, {
            id: val.id,
            name: val.displayName || val.value,
            code: val.value,
          });
        }
      });
    });
    return Array.from(map.values());
  }, [product]);

  // Auto-select first available color & size on load
  useEffect(() => {
    if (!selectedColor && availableColors.length > 0) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors, selectedColor]);

  useEffect(() => {
    if (!selectedSize && availableSizes.length > 0) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  // Map variant inventory
  const variantQuantityMap = useMemo(() => {
    const map: Record<number, number> = {};
    if (product?.inventories) {
      product.inventories.forEach((inv) => {
        if (inv.productVariant) {
          map[inv.productVariant.id] = inv.quantity;
        }
      });
    }
    return map;
  }, [product]);

  // Resolve matching variant
  const selectedVariant = useMemo(() => {
    const variants = product?.variants || [];
    if (variants.length === 0) return null;

    if (availableColors.length === 0 && availableSizes.length === 0) {
      return variants[0];
    }

    const found = variants.find((v: any) => {
      const matchColor =
        !selectedColor ||
        v.color?.id === selectedColor.id ||
        v.attributeValues?.some(
          (av: any) =>
            (av.attributeValue?.id || av.attributeValueId) === selectedColor.id
        );
      const matchSize =
        !selectedSize ||
        v.size?.id === selectedSize.id ||
        v.attributeValues?.some(
          (av: any) =>
            (av.attributeValue?.id || av.attributeValueId) === selectedSize.id
        );
      return matchColor && matchSize;
    });

    return found || variants[0];
  }, [product, selectedColor, selectedSize, availableColors, availableSizes]);

  // Stock calculations
  const selectedStock = useMemo(() => {
    if (!selectedVariant) return (product as any)?.totalStock ?? 100;
    return (
      (selectedVariant as any).countInStock ??
      variantQuantityMap[selectedVariant.id] ??
      100
    );
  }, [selectedVariant, product, variantQuantityMap]);

  const quantityInCart = useMemo(() => {
    if (!selectedVariant) return 0;
    const cartItem = cartItems.find(
      (item) =>
        item.variant?.id === selectedVariant.id ||
        item.productVariantId === selectedVariant.id ||
        item.variant_id === selectedVariant.id
    );
    return cartItem ? cartItem.quantity : 0;
  }, [selectedVariant, cartItems]);

  const maxQuantity = useMemo(() => {
    const remaining = selectedStock - quantityInCart;
    return Math.max(0, remaining);
  }, [selectedStock, quantityInCart]);

  const isOutOfStock = selectedStock <= 0;

  // Price calculations
  const displayPrice = useMemo(() => {
    if (selectedVariant?.price) return Number(selectedVariant.price);
    if (product?.basePrice) return Number(product.basePrice);
    if ((product as any)?.minPrice) return Number((product as any).minPrice);
    return 0;
  }, [selectedVariant, product]);

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 5.0;
    return (
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    );
  }, [reviews]);

  const handleQuantityChange = (action: "increment" | "decrement") => {
    if (action === "increment" && quantity < maxQuantity) {
      setQuantity((prev) => prev + 1);
    } else if (action === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (isAddingToCart || isBuyingNow) return;

    if (!authUser) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng", {
        action: {
          label: "Đăng nhập",
          onClick: () => router.push(`/user/login?redirect=/products/${numericProductId}`),
        },
      });
      router.push(`/user/login?redirect=/products/${numericProductId}`);
      return;
    }

    if (availableSizes.length > 0 && !selectedSize) {
      toast.error("Vui lòng chọn kích cỡ");
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      toast.error("Vui lòng chọn màu sắc");
      return;
    }
    if (!selectedVariant) {
      toast.error("Phiên bản sản phẩm chưa sẵn sàng");
      return;
    }

    if (maxQuantity <= 0) {
      toast.error("Bạn đã thêm hết số lượng có sẵn của phiên bản này vào giỏ hàng");
      return;
    }

    if (quantity > maxQuantity) {
      toast.error(`Chỉ có thể thêm tối đa ${maxQuantity} sản phẩm nữa`);
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(selectedVariant, quantity);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      const variantDetails = [
        selectedSize?.code || selectedSize?.name ? `Size ${selectedSize?.code || selectedSize?.name}` : "",
        selectedColor?.name ? `Màu ${selectedColor.name}` : "",
      ]
        .filter(Boolean)
        .join(" - ");

      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, {
        description: variantDetails ? `${product?.name} (${variantDetails})` : product?.name,
        action: {
          label: "Xem giỏ hàng",
          onClick: () => router.push("/cart"),
        },
      });
      setQuantity(1);
    } catch {
      // Error đã được hiển thị toast qua cartStore
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (isAddingToCart || isBuyingNow) return;

    if (!authUser) {
      toast.error("Vui lòng đăng nhập để tiến hành mua hàng", {
        action: {
          label: "Đăng nhập",
          onClick: () => router.push(`/user/login?redirect=/products/${numericProductId}`),
        },
      });
      router.push(`/user/login?redirect=/products/${numericProductId}`);
      return;
    }

    if (availableSizes.length > 0 && !selectedSize) {
      toast.error("Vui lòng chọn kích cỡ");
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      toast.error("Vui lòng chọn màu sắc");
      return;
    }
    if (!selectedVariant) {
      toast.error("Phiên bản sản phẩm chưa sẵn sàng");
      return;
    }

    if (isOutOfStock) {
      toast.error("Sản phẩm hiện đang tạm hết hàng");
      return;
    }

    setIsBuyingNow(true);
    try {
      await buyNow(selectedVariant, quantity);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      router.push("/checkout");
    } catch {
      // Error đã được hiển thị toast qua cartStore
    } finally {
      setIsBuyingNow(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] bg-background flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Không tìm thấy sản phẩm
          </h1>
          <p className="text-muted-foreground mb-6 text-sm">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã được chuyển vào kho lưu trữ.
          </p>
          <Button asChild className="rounded-full px-6">
            <Link href="/">Quay về cửa hàng</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Hairline Breadcrumb */}
      <div className="border-b border-border/40 bg-background/60 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb>
            <BreadcrumbList className="text-xs text-muted-foreground">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="hover:text-foreground transition-colors">
                    Trang chủ
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/categories" className="hover:text-foreground transition-colors">
                    Sản phẩm
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {product.category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link
                        href={`/categories/${product.category.slug || product.category.id}`}
                        className="hover:text-foreground transition-colors font-medium text-foreground/80"
                      >
                        {product.category.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="font-semibold text-foreground truncate max-w-xs">
                  {product.name}
                </span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: High-Impact Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary High-Res Frame */}
            <div className="relative aspect-[4/5] sm:aspect-square w-full rounded-2xl overflow-hidden bg-muted/30 border border-border/60 shadow-xs group">
              {productImages.length > 0 ? (
                <Image
                  src={productImages[selectedImageIndex] || productImages[0]}
                  alt={product.name}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  priority
                  unoptimized={productImages[selectedImageIndex]?.includes("cloudinary")}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  Hình ảnh đang được cập nhật
                </div>
              )}

              {/* Status Badge Over Image */}
              {isOutOfStock ? (
                <span className="absolute top-4 left-4 rounded-full bg-rose-600/90 backdrop-blur px-3 py-1 text-xs font-semibold text-white tracking-wide shadow-sm">
                  Hết hàng
                </span>
              ) : (
                <span className="absolute top-4 left-4 rounded-full bg-slate-900/80 backdrop-blur px-3 py-1 text-xs font-semibold text-white tracking-wide shadow-sm">
                  Chính hãng ATINO
                </span>
              )}

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => {
                  setIsWishlisted(!isWishlisted);
                  toast.success(
                    isWishlisted ? "Đã bỏ khỏi danh sách yêu thích" : "Đã lưu vào danh sách yêu thích"
                  );
                }}
                className="absolute top-4 right-4 size-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur flex items-center justify-center text-foreground hover:scale-110 active:scale-95 transition-all shadow-sm border border-border/40"
              >
                <Heart
                  className={`size-4.5 transition-colors ${
                    isWishlisted ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
                  }`}
                />
              </button>
            </div>

            {/* Thumbnail Ribbon */}
            {productImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {productImages.map((img, idx) => {
                  const matchedImg = product?.images?.find(
                    (item: any) => (item.image_url || item.url) === img
                  );
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedImageIndex(idx);
                        if (matchedImg?.colorId && availableColors.length > 0) {
                          const targetColor = availableColors.find(
                            (c) => c.id === matchedImg.colorId
                          );
                          if (targetColor && targetColor.id !== selectedColor?.id) {
                            setSelectedColor(targetColor);
                          }
                        }
                      }}
                      className={`group relative size-20 sm:size-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 ${
                        selectedImageIndex === idx
                          ? "border-primary ring-2 ring-primary/20 scale-102"
                          : "border-border/60 hover:border-foreground/40 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized={img.includes("cloudinary")}
                      />
                      {matchedImg?.colorCode && (
                        <span
                          className="absolute bottom-1.5 right-1.5 size-3 rounded-full border border-white shadow-xs"
                          style={{ backgroundColor: matchedImg.colorCode }}
                          title={matchedImg.colorName || undefined}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Trust Assurance Strip */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border/50 text-center">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/20 border border-border/40">
                <Truck className="size-5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Freeship từ 500k</span>
                <span className="text-[10px] text-muted-foreground">Giao hàng toàn quốc</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/20 border border-border/40">
                <RotateCcw className="size-5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Đổi trả 7 ngày</span>
                <span className="text-[10px] text-muted-foreground">Miễn phí nếu có lỗi</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/20 border border-border/40">
                <ShieldCheck className="size-5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Chính hãng 100%</span>
                <span className="text-[10px] text-muted-foreground">Bảo hành tiêu chuẩn</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Purchasing Module (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            {/* Header / Brand info */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary">
                  {product.category?.name || "Bộ sưu tập ATINO"}
                </span>
                {selectedVariant?.sku && (
                  <span className="text-[11px] font-mono text-muted-foreground tracking-wider">
                    SKU: {selectedVariant.sku}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                {product.name}
              </h1>

              {/* Rating Summary */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="size-4 fill-amber-500 text-amber-500" />
                  <span className="text-sm font-bold text-foreground">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">·</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                >
                  {reviews?.length || 0} đánh giá từ khách hàng
                </button>
              </div>
            </div>

            {/* Price Presentation */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">
                  Giá niêm yết
                </span>
                <div className="text-3xl font-extrabold font-mono tracking-tight text-foreground">
                  {formatPrice(displayPrice)}
                </div>
              </div>

              <div className="text-right">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200">
                    <span className="size-1.5 rounded-full bg-rose-500" />
                    Hết hàng
                  </span>
                ) : selectedStock <= 10 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
                    <span className="size-1.5 rounded-full bg-amber-500 animate-ping" />
                    Còn lại {selectedStock}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Sẵn hàng ({selectedStock})
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground block mt-1">Đã gồm VAT</span>
              </div>
            </div>

            {/* Color Swatches */}
            {availableColors.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                    Màu sắc
                  </span>
                  <span className="font-medium text-foreground">
                    {selectedColor?.name || "Vui lòng chọn"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {availableColors.map((color) => {
                    const isSelected = selectedColor?.id === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`group relative size-9 rounded-full border transition-all duration-200 flex items-center justify-center ${
                          isSelected
                            ? "border-foreground ring-2 ring-foreground/20 scale-108"
                            : "border-border/80 hover:border-foreground/50"
                        }`}
                        style={{ backgroundColor: color.code }}
                        title={color.name}
                      >
                        {isSelected && (
                          <Check
                            className={`size-4 drop-shadow-sm ${
                              color.code?.toLowerCase() === "#ffffff" ||
                              color.name?.toLowerCase() === "trắng"
                                ? "text-slate-900"
                                : "text-white"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {availableSizes.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                    Kích thước
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Ruler className="size-3.5" />
                    <span>Bảng size chuẩn ATINO</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {availableSizes.map((size) => {
                    const isSelected = selectedSize?.id === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`h-11 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                          isSelected
                            ? "bg-foreground text-background border-foreground shadow-xs scale-102"
                            : "bg-background text-foreground border-border/70 hover:border-foreground/40"
                        }`}
                      >
                        {size.code || size.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Số lượng
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center h-11 border border-border/80 rounded-lg bg-background overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange("decrement")}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="size-11 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-12 text-center font-mono font-bold text-sm text-foreground select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange("increment")}
                    disabled={quantity >= maxQuantity || isOutOfStock}
                    className="size-11 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                <div className="text-xs text-muted-foreground">
                  {quantityInCart > 0 && (
                    <span className="text-primary font-medium">
                      Đã có {quantityInCart} trong giỏ
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart || isBuyingNow}
                className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold text-sm tracking-wide shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-99 disabled:opacity-50"
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="size-4.5 animate-spin" />
                    <span>Đang thêm vào giỏ...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="size-4.5" />
                    <span>{isOutOfStock ? "Sản phẩm đã hết hàng" : "Thêm vào giỏ hàng"}</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock || isAddingToCart || isBuyingNow}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-99 disabled:opacity-50"
              >
                {isBuyingNow ? (
                  <>
                    <Loader2 className="size-4.5 animate-spin" />
                    <span>Đang xử lý mua ngay...</span>
                  </>
                ) : (
                  <>
                    <Zap className="size-4.5" />
                    <span>Mua ngay — Giao hàng siêu tốc</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Description, Reviews, Specs */}
        <div className="mt-16 lg:mt-24 border-t border-border/60 pt-10">
          <ProductTabs
            product={product}
            reviews={reviews || []}
            orderId={orderId}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
}
