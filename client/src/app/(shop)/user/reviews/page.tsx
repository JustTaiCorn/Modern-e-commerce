"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import UserLayout from "@/components/layouts/UserLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Star,
  Package,
  Clock,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  PackageCheck,
  HelpCircle,
} from "lucide-react";
import useAuthStore from "@/stores/useAuthStore";
import { formatPrice, formatDate } from "@/lib/utils";
import { useReviewsByUser } from "@/services/reviewsService";
import { useUserOrders } from "@/services/orderService";
import ReviewForm from "./_components/ReviewForm";
import ReviewList from "./_components/ReviewList";

interface ReviewableProduct {
  orderId: number;
  orderCode: string;
  orderDate?: string;
  productId: number;
  productName: string;
  productImage?: string;
  variantId?: number;
  variantLabel?: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  hasReviewed: boolean;
}

export default function ReviewsPage() {
  const router = useRouter();
  const { authUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>("pending");

  const { data: orders = [], isLoading: isLoadingOrders } = useUserOrders({
    userId: authUser?.id,
  });

  const { data: userReviews = [], isLoading: isLoadingReviews } = useReviewsByUser(
    authUser?.id
  );

  const reviewableProducts = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    const products: ReviewableProduct[] = [];

    // Filter only DELIVERED orders
    const deliveredOrders = orders.filter((order) => order.status === "DELIVERED");

    deliveredOrders.forEach((order) => {
      const orderDate = (order as any).deliveredAt || order.createdAt || order.placedAt;
      const orderItems = order.items || (order as any).orderItems || [];

      if (orderItems && orderItems.length > 0) {
        orderItems.forEach((item: any) => {
          const prodId = item.productId || item.product?.id;
          if (!prodId) return;

          // Check if user has already reviewed this product
          const hasReviewed = userReviews.some(
            (review) =>
              review.product_id === prodId ||
              (review as any).productId === prodId ||
              review.product?.id === prodId ||
              (review.order_id === order.id && review.product_id === prodId)
          );

          products.push({
            orderId: order.id,
            orderCode: order.code || `ORD-${order.id}`,
            orderDate: orderDate ? formatDate(orderDate) : undefined,
            productId: prodId,
            productName: item.productName || item.name || item.product?.name || "Sản phẩm đã mua",
            productImage:
              item.image ||
              item.product?.images?.[0]?.url ||
              item.product?.images?.[0]?.image_url,
            variantId: item.variantId,
            variantLabel: item.variantLabel,
            sku: item.sku || "",
            unitPrice: Number(item.unitPrice || item.price || 0),
            quantity: item.quantity || item.qty || 1,
            hasReviewed,
          });
        });
      }
    });

    return products;
  }, [orders, userReviews]);

  const pendingReviews = useMemo(() => {
    return reviewableProducts.filter((p) => !p.hasReviewed);
  }, [reviewableProducts]);

  // Average rating calculated from user reviews
  const averageRating = useMemo(() => {
    if (userReviews.length === 0) return null;
    const total = userReviews.reduce((sum, r) => sum + (r.rating || 5), 0);
    return (total / userReviews.length).toFixed(1);
  }, [userReviews]);

  const isLoading = isLoadingOrders || isLoadingReviews;

  if (isLoading) {
    return (
      <UserLayout>
        <div className="space-y-6">
          <div className="animate-pulse space-y-3">
            <div className="h-7 w-48 bg-muted rounded-lg" />
            <div className="h-4 w-96 bg-muted/60 rounded-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/40 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-muted/30 rounded-2xl animate-pulse" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Page Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-amber-500/5 border border-border/80 p-6 sm:p-8 shadow-xs">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold tracking-wide border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TRUNG TÂM ĐÁNH GIÁ & ĐÓNG GÓP</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Đánh giá sản phẩm
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chia sẻ cảm nhận chân thực về các món đồ bạn đã trải nghiệm để giúp cộng đồng mua sắm thông thái hơn và nhận ưu đãi từ cửa hàng.
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none opacity-60" />
        </div>

        {/* Quick Stat Metric Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Chờ đánh giá */}
          <div className="rounded-xl p-4 bg-card border border-border/80 shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Chờ đánh giá
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {pendingReviews.length}
                </span>
                <span className="text-xs text-muted-foreground">sản phẩm</span>
              </div>
            </div>
            <div className="relative w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
              {pendingReviews.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
          </div>

          {/* Card 2: Đã gửi nhận xét */}
          <div className="rounded-xl p-4 bg-card border border-border/80 shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Đã đánh giá
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {userReviews.length}
                </span>
                <span className="text-xs text-muted-foreground">bài nhận xét</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Điểm TB đã cho */}
          <div className="rounded-xl p-4 bg-card border border-border/80 shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Điểm đánh giá TB
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-500">
                  {averageRating ? `${averageRating} ★` : "--"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {averageRating ? "Mức hài lòng" : "Chưa có dữ liệu"}
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Main Tabbed Interface */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex flex-col gap-6"
        >
          {/* Segmented Pill Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <TabsList className="h-auto p-1.5 bg-muted/60 border border-border/80 rounded-2xl flex flex-wrap gap-2 w-full sm:w-auto">
              <TabsTrigger
                value="pending"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center gap-2.5 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Chờ đánh giá</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
                    pendingReviews.length > 0
                      ? "bg-amber-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {pendingReviews.length}
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="history"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs flex items-center gap-2.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Đã đánh giá</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-muted text-muted-foreground">
                  {userReviews.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <span className="text-xs text-muted-foreground hidden lg:inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Đánh giá được xác thực bởi tài khoản mua hàng
            </span>
          </div>

          {/* Pending Reviews Tab */}
          <TabsContent value="pending" className="mt-0 outline-none">
            {pendingReviews.length === 0 ? (
              /* Rich Celebratory Empty State */
              <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 sm:p-14 text-center transition-all">
                <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/20 via-amber-500/10 to-transparent flex items-center justify-center mb-5 ring-8 ring-amber-500/5">
                  <PackageCheck className="w-10 h-10 text-amber-500" />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">
                  Bạn không có sản phẩm nào chờ đánh giá
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
                  Tuyệt vời! Bạn đã hoàn thành nhận xét cho toàn bộ sản phẩm đã nhận hoặc chưa có đơn hàng nào vừa hoàn tất.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button
                    onClick={() => router.push("/")}
                    className="rounded-xl h-10 px-6 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Tiếp tục mua sắm</span>
                  </Button>

                  <Button
                    onClick={() => router.push("/user/orders")}
                    variant="outline"
                    className="rounded-xl h-10 px-6 gap-2 border-border/80 hover:bg-muted font-medium cursor-pointer"
                  >
                    <span>Xem đơn hàng của tôi</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>

                {/* Helpful Tip Pill */}
                <div className="mt-8 pt-6 border-t border-border/60 max-w-lg mx-auto text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    Chỉ những đơn hàng đã giao thành công (DELIVERED) mới có thể gửi đánh giá.
                  </span>
                </div>
              </div>
            ) : (
              /* Active Pending Products List */
              <div className="space-y-4">
                {pendingReviews.map((product, index) => (
                  <Card
                    key={`${product.orderId}-${product.productId}-${index}`}
                    className="rounded-xl border border-border/80 shadow-2xs hover:shadow-sm hover:border-border transition-all duration-200 overflow-hidden bg-card"
                  >
                    <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-muted shrink-0 border border-border/80 overflow-hidden flex items-center justify-center shadow-2xs">
                          {product.productImage ? (
                            <Image
                              src={product.productImage}
                              alt={product.productName}
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="72px"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-muted-foreground/50" />
                          )}
                        </div>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <Link
                            href={`/products/${product.productId}`}
                            className="font-bold text-foreground text-base hover:text-primary transition-colors block truncate"
                          >
                            {product.productName}
                          </Link>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground bg-muted px-2 py-0.5 rounded-md">
                              Đơn #{product.orderCode}
                            </span>
                            {product.orderDate && (
                              <span>• Giao ngày {product.orderDate}</span>
                            )}
                            {product.variantLabel && (
                              <span>• Phân loại: {product.variantLabel}</span>
                            )}
                            <span>• SL: {product.quantity}</span>
                          </div>

                          <p className="text-sm font-bold text-primary pt-0.5">
                            {formatPrice(product.unitPrice)}
                          </p>
                        </div>
                      </div>

                      {/* Action Button: Opens ReviewForm Dialog */}
                      <div className="self-end sm:self-center shrink-0">
                        <ReviewForm
                          productId={product.productId}
                          orderId={product.orderId}
                          productName={product.productName}
                          productImage={product.productImage}
                          orderCode={product.orderCode}
                          unitPrice={product.unitPrice}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Review History Tab */}
          <TabsContent value="history" className="mt-0 outline-none">
            <ReviewList
              reviews={userReviews}
              onGoToPending={() => setActiveTab("pending")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </UserLayout>
  );
}
