"use client";

import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { EnrichedCartItem } from "@/types/cart";
import { useCartQuery } from "@/services/cartService";
import { useProductsQuery } from "@/services/productService";

export default function CartPage() {
  const { data: items = [], isLoading: isLoadingCart } = useCartQuery();
  const {
    getTotalItems,
    getCartSummary,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCartStore();
  const { data: products } = useProductsQuery();
  const itemCount = getTotalItems();
  const summary = getCartSummary();
  const router = useRouter();

  const enrichedItems: EnrichedCartItem[] = useMemo(() => {
    return items
      .map((item) => {
        const variant = item.variant;
        if (!variant) return null;
        const product = products?.find(
          (p) => p.id === variant.product?.id || variant.product_id
        );
        let maxStock = Infinity;
        if (product?.inventories) {
          const inv = product.inventories.find(
            (i) => i.productVariant?.id === variant.id
          );
          if (inv) {
            maxStock = inv.quantity;
          }
        }

        return {
          ...item,
          product,
          color: variant.color,
          size: variant.size,
          maxStock,
        } as EnrichedCartItem;
      })
      .filter((item): item is EnrichedCartItem => item !== null);
  }, [items, products]);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
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
                <span className="font-semibold text-gray-800">Giỏ hàng</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="w-6 h-6 text-gray-900" />
          <h1 className="text-2xl font-bold text-gray-900">
            Giỏ hàng của bạn
          </h1>
          {itemCount > 0 && (
            <Badge variant="outline" className="ml-2 font-mono">
              {itemCount} sản phẩm
            </Badge>
          )}
        </div>

        {isLoadingCart ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Đang tải giỏ hàng...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <Card className="text-center py-16 max-w-lg mx-auto border border-gray-100 shadow-sm">
            <CardContent className="pt-6">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Giỏ hàng của bạn đang trống
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Chưa có sản phẩm nào được chọn. Hãy khám phá ngay các bộ sưu tập của chúng tôi!
              </p>
              <Button asChild className="bg-black hover:bg-gray-800 text-white">
                <Link href="/">Tiếp tục mua sắm</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2">
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                  <CardTitle className="text-base font-semibold">Danh sách sản phẩm</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs h-8"
                    onClick={clearCart}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Xóa tất cả
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {enrichedItems.map((item) => {
                      if (!item || !item.product) return null;

                      const productImage =
                        item.product.images?.[0]?.image_url ||
                        "/images/placeholder.jpg";

                      return (
                        <div key={item.id} className="p-4 sm:p-5">
                          <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0">
                              <Image
                                src={productImage}
                                alt={item.product.name}
                                width={80}
                                height={80}
                                className="rounded-md object-cover w-20 h-20 border border-gray-100"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                                <Link
                                  href={`/products/${item.product.id}`}
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  {item.product.name}
                                </Link>
                              </h4>

                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                                {item.color && (
                                  <div className="flex items-center gap-1.5">
                                    <span>Màu:</span>
                                    <div
                                      className="w-3.5 h-3.5 rounded-full border border-gray-300"
                                      style={{ backgroundColor: item.color.code }}
                                    />
                                    <span>{item.color.name}</span>
                                  </div>
                                )}
                                {item.size && (
                                  <div>Kích cỡ: <span className="font-semibold text-gray-700">{item.size.code}</span></div>
                                )}
                              </div>

                              <div className="font-bold text-sm text-gray-900">
                                {formatPrice(item.unitPrice)}
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-red-500 p-1 h-7 w-7"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>

                              <div className="flex items-center gap-1 border border-gray-200 rounded-md p-0.5 bg-white">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-gray-100"
                                  onClick={() =>
                                    handleQuantityChange(item.id, item.quantity - 1)
                                  }
                                  disabled={item.quantity === 1}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-7 text-center text-xs font-semibold">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-gray-100"
                                  onClick={() =>
                                    handleQuantityChange(item.id, item.quantity + 1)
                                  }
                                  disabled={item.quantity >= (item.maxStock ?? Infinity)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>

                              <div className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
                                {formatPrice(item.unitPrice * item.quantity)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6 border border-gray-100 shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base font-semibold">Tóm tắt đơn hàng</CardTitle>
                  <CardDescription className="text-xs">
                    {enrichedItems.length} mặt hàng
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tạm tính:</span>
                      <span className="font-medium text-gray-900">
                        {formatPrice(summary.subtotal)}
                      </span>
                    </div>
                    {summary.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá:</span>
                        <span className="font-semibold">
                          -{formatPrice(summary.discount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phí vận chuyển:</span>
                      <span className="font-medium text-gray-900">
                        {summary.shippingFee === 0 ? "Miễn phí" : formatPrice(summary.shippingFee)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center text-base font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-red-600">
                        {formatPrice(summary.total)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400">
                    * Bạn có thể chọn mã khuyến mãi tại trang thanh toán
                  </p>

                  <div className="space-y-2.5 pt-2">
                    <Button
                      className="w-full bg-black text-white hover:bg-gray-800 h-11 text-sm font-medium"
                      onClick={() => router.push("/checkout")}
                    >
                      Tiến hành đặt hàng
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-xs h-10 border-gray-200"
                      onClick={() => router.push("/")}
                    >
                      Tiếp tục mua hàng
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
