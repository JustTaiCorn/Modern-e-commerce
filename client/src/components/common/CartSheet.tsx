"use client";

import { useState, useMemo, useEffect } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cartStore";
import { useProductStore } from "@/stores/productStore";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import useAuthStore from "@/stores/useAuthStore";

export function CartSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    items,
    getTotalItems,
    getCartSummary,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCartItems,
  } = useCartStore();
  const { products } = useProductStore();
  const { authUser } = useAuthStore();
  const itemCount = getTotalItems();
  const summary = getCartSummary();

  useEffect(() => {
    if (authUser?.id) {
      fetchCartItems(authUser.id);
    }
  }, [authUser?.id, fetchCartItems]);

  const enrichedItems = useMemo(() => {
    return items
      .map((item) => {
        const variant = item.variant;
        const product =
          variant?.product ||
          products?.find(
            (p) =>
              p.id === variant?.productId ||
              p.id === (variant as any)?.product_id
          );

        const img =
          item.variant?.image ||
          item.variant?.imageUrl ||
          product?.images?.[0]?.url ||
          (product?.images?.[0] as any)?.image_url ||
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300";

        return {
          ...item,
          product,
          productName: item.productName || product?.name || "Sản phẩm",
          image: img,
          colorName: variant?.color?.name || (variant as any)?.colorName,
          sizeName: variant?.size?.name || (variant as any)?.sizeName,
        };
      })
      .filter(Boolean);
  }, [items, products]);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 rounded-full px-1.5 py-0.2 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-primary-foreground">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Giỏ hàng của bạn
            {itemCount > 0 && (
              <Badge variant="outline" className="ml-auto">
                {itemCount} món
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          {enrichedItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-1">Giỏ hàng trống</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Chưa có sản phẩm nào trong giỏ hàng của bạn.
              </p>
              <Button asChild onClick={() => setIsOpen(false)}>
                <Link href="/products">Khám phá sản phẩm</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y">
                {enrichedItems.map((item) => (
                  <div key={item.id} className="flex gap-3 pt-3 first:pt-0">
                    <div className="relative w-16 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {item.productName}
                      </h4>
                      <div className="text-xs text-muted-foreground mt-0.5 space-x-2">
                        {item.colorName && <span>Màu: {item.colorName}</span>}
                        {item.sizeName && <span>Size: {item.sizeName}</span>}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-primary">
                        {formatPrice(item.unitPrice)}
                      </div>

                      <div className="flex items-center gap-1 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-7 text-center text-xs font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive self-start"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Cart Footer */}
              <div className="p-4 border-t bg-muted/20 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(summary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Phí vận chuyển:</span>
                    <span>{formatPrice(summary.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t text-foreground">
                    <span>Tổng cộng:</span>
                    <span className="text-primary font-extrabold">
                      {formatPrice(summary.total)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <Button
                    asChild
                    className="w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/checkout">Thanh toán ngay</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/cart">Xem chi tiết giỏ hàng</Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default CartSheet;
