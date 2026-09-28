"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Ticket, Check, ChevronRight } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { CartSummary, Coupon } from "@/types";
import { EnrichedCartItem } from "@/types/cart";

interface OrderSummaryProps {
  items: EnrichedCartItem[];
  summary: CartSummary;
  appliedCoupon: Coupon | null;
  availableCoupons: Coupon[];
  showCouponList: boolean;
  isSubmitting: boolean;
  paymentMethod?: "COD" | "WALLET";
  onToggleCouponList: () => void;
  onApplyCoupon: (couponCode: string) => void;
  onRemoveCoupon: () => void;
  onSubmitOrder: (e?: any) => void | Promise<void>;
  onBackToCart: () => void;
}

export default function OrderSummary({
  items,
  summary,
  appliedCoupon,
  availableCoupons,
  showCouponList,
  isSubmitting,
  onToggleCouponList,
  onApplyCoupon,
  onRemoveCoupon,
  onSubmitOrder,
  onBackToCart,
}: OrderSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Products List */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {items.map((item) => {
          if (!item || !item.product) return null;

          const productImage =
            item.product.images?.[0]?.image_url || "/images/placeholder.jpg";

          return (
            <div key={item.id} className="flex gap-3 items-center">
              <div className="relative flex-shrink-0">
                <Image
                  src={productImage}
                  alt={item.product.name}
                  width={56}
                  height={56}
                  className="rounded-md object-cover w-14 h-14 border border-gray-100"
                />
                <Badge
                  className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 flex items-center justify-center p-0 text-[10px] bg-black text-white"
                  variant="secondary"
                >
                  {item.quantity}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-medium line-clamp-1 text-gray-900">
                  {item.product.name}
                </h4>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {item.color?.name && (
                    <span>
                      {item.color.name}
                      {item.size?.code && " / "}
                    </span>
                  )}
                  {item.size?.code && <span>{item.size.code}</span>}
                </div>
                <div className="text-xs font-semibold text-gray-900 mt-0.5">
                  {formatPrice(item.unitPrice * item.quantity)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Coupon Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-black" />
          <Label className="text-xs font-semibold text-gray-700">Mã khuyến mãi</Label>
        </div>

        {appliedCoupon ? (
          <div className="flex items-center justify-between p-2.5 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-800">
                {appliedCoupon.code} (-{appliedCoupon.value}%)
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveCoupon}
              className="text-red-500 hover:text-red-700 h-7 text-xs px-2"
            >
              Hủy
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full text-xs h-9 justify-start font-medium"
            onClick={onToggleCouponList}
            type="button"
          >
            <Ticket className="w-3.5 h-3.5 mr-2" />
            Chọn mã giảm giá
          </Button>
        )}

        {/* Coupon List Dropdown */}
        {showCouponList && !appliedCoupon && (
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50/50">
            {availableCoupons && availableCoupons.length > 0 ? (
              availableCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex items-center justify-between p-2.5 border border-gray-200 rounded bg-white hover:border-black cursor-pointer transition-colors"
                  onClick={() => onApplyCoupon(coupon.code)}
                >
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono border-black">
                        {coupon.code}
                      </Badge>
                      <span className="text-xs font-bold text-red-600">
                        Giảm {coupon.value}%
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                      {coupon.description || coupon.name}
                    </p>
                    {coupon.minOrderTotal && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Đơn từ {formatPrice(coupon.minOrderTotal)}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </div>
              ))
            ) : (
              <div className="text-center py-3 text-xs text-gray-500">
                Hiện không có mã giảm giá nào phù hợp
              </div>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Summary calculations */}
      <div className="space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Tạm tính:</span>
          <span className="font-medium text-gray-900">{formatPrice(summary.subtotal)}</span>
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

      <Separator />

      {/* Grand Total */}
      <div className="flex justify-between items-center text-base sm:text-lg font-bold">
        <span>Tổng thanh toán:</span>
        <span className="text-red-600">{formatPrice(summary.total)}</span>
      </div>

      {/* Action buttons */}
      <Button
        className="w-full bg-black text-white hover:bg-gray-800 h-11 text-sm font-medium"
        onClick={onSubmitOrder}
        disabled={isSubmitting}
        type="button"
      >
        {isSubmitting ? "Đang xử lý đặt hàng..." : "Hoàn tất đặt hàng"}
      </Button>

      <Button
        variant="ghost"
        className="w-full text-xs text-gray-500 hover:text-black"
        onClick={onBackToCart}
        type="button"
      >
        Quay lại giỏ hàng
      </Button>
    </div>
  );
}
