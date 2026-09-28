"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import UserLayout from "@/components/layouts/UserLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Star, Package, MessageSquare } from "lucide-react";
import useAuthStore from "@/stores/useAuthStore";
import { formatPrice } from "@/lib/utils";
import { useReviewsByUser } from "@/services/reviewsService";
import { Order } from "@/types";
import { useUserOrders } from "@/services/orderService";
import ReviewForm from "./_components/ReviewForm";
import ReviewList from "./_components/ReviewList";

interface ReviewableProduct {
  orderId: number;
  orderCode: string;
  productId: number;
  productName: string;
  variantId?: number;
  sku: string;
  unitPrice: number;
  quantity: number;
  hasReviewed: boolean;
}

export default function ReviewsPage() {
  const router = useRouter();
  const { authUser } = useAuthStore();
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
      if (order.items && order.items.length > 0) {
        order.items.forEach((item) => {
          const prodId = item.productId || item.product?.id;
          if (!prodId) return;

          // Check if user has already reviewed this product for this order
          const hasReviewed = userReviews.some(
            (review) =>
              review.product_id === prodId ||
              review.product?.id === prodId ||
              (review.order_id === order.id && review.product_id === prodId)
          );

          products.push({
            orderId: order.id,
            orderCode: order.code,
            productId: prodId,
            productName: item.productName || item.product?.name || "Sản phẩm",
            variantId: item.variantId,
            sku: item.sku || "",
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            hasReviewed,
          });
        });
      }
    });

    return products;
  }, [orders, userReviews]);

  const pendingReviews = reviewableProducts.filter((p) => !p.hasReviewed);

  const isLoading = isLoadingOrders || isLoadingReviews;

  if (isLoading) {
    return (
      <UserLayout>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-sm text-gray-500">Đang tải danh sách đánh giá...</span>
            </div>
          </CardContent>
        </Card>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đánh giá sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">
            Chia sẻ cảm nhận về các sản phẩm bạn đã mua để giúp đỡ người mua khác
          </p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="pending">
              Chờ đánh giá ({pendingReviews.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              Đã đánh giá ({userReviews.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Reviews Tab */}
          <TabsContent value="pending" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {pendingReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Không có sản phẩm nào chờ đánh giá
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                      Bạn đã đánh giá tất cả các sản phẩm đã nhận hoặc chưa có đơn hàng nào hoàn tất.
                    </p>
                    <Button onClick={() => router.push("/")} variant="outline">
                      Tiếp tục mua sắm
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingReviews.map((product, index) => (
                      <div
                        key={`${product.orderId}-${product.productId}-${index}`}
                        className="border rounded-lg p-4 hover:shadow-sm transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <h4 className="font-semibold text-gray-900">
                            {product.productName}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span>Mã đơn: #{product.orderCode}</span>
                            {product.sku && <span>• SKU: {product.sku}</span>}
                            <span>• Số lượng: {product.quantity}</span>
                          </div>
                          <p className="text-sm font-medium text-primary">
                            {formatPrice(product.unitPrice)}
                          </p>
                        </div>

                        <div className="self-end sm:self-center">
                          <ReviewForm
                            productId={product.productId}
                            orderId={product.orderId}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review History Tab */}
          <TabsContent value="history" className="mt-4">
            <ReviewList reviews={userReviews} />
          </TabsContent>
        </Tabs>
      </div>
    </UserLayout>
  );
}
