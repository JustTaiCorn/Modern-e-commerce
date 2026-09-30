"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ReviewForm from "@/app/user/reviews/_components/ReviewForm";
import ReviewList from "@/app/user/reviews/_components/ReviewList";
import { Review } from "@/types";
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Scissors,
  CheckCircle2,
  Droplets,
  Wind,
  Star,
} from "lucide-react";

interface Product {
  id: number;
  name?: string;
  description?: string;
  category?: { name: string };
  brand?: { name: string };
}

interface ProductTabsProps {
  product: Product;
  reviews: Review[];
  orderId: number;
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export default function ProductTabs({
  product,
  reviews,
  orderId,
  activeTab,
  setActiveTab,
}: ProductTabsProps) {
  // Compute average rating
  const averageRating = React.useMemo(() => {
    if (!reviews || reviews.length === 0) return 5.0;
    const total = reviews.reduce((sum, r) => sum + (r.rating || 5), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Minimalist Tab Navigation Bar */}
        <div className="border-b border-border/80">
          <TabsList className="h-auto bg-transparent p-0 flex flex-wrap gap-8 justify-start">
            <TabsTrigger
              value="description"
              className="group relative px-0 py-3.5 bg-transparent rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-b-foreground data-[state=active]:border-t-transparent data-[state=active]:border-x-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-semibold tracking-wide text-muted-foreground data-[state=active]:text-foreground transition-all cursor-pointer focus-visible:ring-0 focus-visible:outline-none focus:outline-none outline-none shadow-none -mb-px hover:text-foreground"
            >
              Mô tả chi tiết
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="group relative px-0 py-3.5 bg-transparent rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-b-foreground data-[state=active]:border-t-transparent data-[state=active]:border-x-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-semibold tracking-wide text-muted-foreground data-[state=active]:text-foreground transition-all cursor-pointer focus-visible:ring-0 focus-visible:outline-none focus:outline-none outline-none shadow-none -mb-px hover:text-foreground"
            >
              Thông số & Hướng dẫn bảo quản
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="group relative px-0 py-3.5 bg-transparent rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-b-foreground data-[state=active]:border-t-transparent data-[state=active]:border-x-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-semibold tracking-wide text-muted-foreground data-[state=active]:text-foreground transition-all cursor-pointer flex items-center gap-2 focus-visible:ring-0 focus-visible:outline-none focus:outline-none outline-none shadow-none -mb-px hover:text-foreground"
            >
              <span>Đánh giá từ khách hàng</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground group-data-[state=active]:bg-foreground/10 group-data-[state=active]:text-foreground transition-colors">
                {reviews?.length || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="policy"
              className="group relative px-0 py-3.5 bg-transparent rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-b-foreground data-[state=active]:border-t-transparent data-[state=active]:border-x-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-semibold tracking-wide text-muted-foreground data-[state=active]:text-foreground transition-all cursor-pointer focus-visible:ring-0 focus-visible:outline-none focus:outline-none outline-none shadow-none -mb-px hover:text-foreground"
            >
              Chính sách giao nhận
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Mô tả sản phẩm */}
        <TabsContent value="description" className="mt-8 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Narrative */}
            <div className="lg:col-span-8 space-y-6">
              <div className="prose prose-neutral max-w-none">
                <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line font-normal">
                  {product.description ||
                    "Thiết kế mang phong cách tối giản đương đại, chú trọng vào tỉ lệ phom dáng chuẩn mực cùng chất liệu cao cấp mang lại sự thoải mái tối ưu suốt cả ngày dài hoạt động. Phù hợp diện trong mọi hoàn cảnh từ công sở chuyên nghiệp tới những buổi gặp gỡ thường nhật."}
                </p>
              </div>

              {/* Garment Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3 p-4 rounded-xl border border-border/60 bg-muted/20">
                  <div className="p-2 rounded-lg bg-background border border-border/80 text-foreground">
                    <Droplets className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      Chất liệu cao cấp
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Sợi dệt mịn màng, có độ thoáng khí tự nhiên và giữ form chuẩn sau nhiều lần giặt.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl border border-border/60 bg-muted/20">
                  <div className="p-2 rounded-lg bg-background border border-border/80 text-foreground">
                    <Scissors className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      Kỹ thuật may tinh xảo
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Từng đường kim mũi chỉ được hoàn thiện bởi thợ thủ công lành nghề với độ chính xác cao.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl border border-border/60 bg-muted/20">
                  <div className="p-2 rounded-lg bg-background border border-border/80 text-foreground">
                    <Wind className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      Thoáng mát & Kháng khuẩn
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Công nghệ dệt hiện đại giúp thoát ẩm nhanh chóng, hạn chế mùi và tạo cảm giác dịu nhẹ.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl border border-border/60 bg-muted/20">
                  <div className="p-2 rounded-lg bg-background border border-border/80 text-foreground">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      Thiết kế đa dụng
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Dễ dàng phối cùng quần tây, jeans hoặc short tạo phong cách thanh lịch vượt thời gian.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Quick Summary Card */}
            <div className="lg:col-span-4">
              <div className="p-6 rounded-2xl border border-border/80 bg-muted/30 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Điểm nhấn sản phẩm
                </h4>
                <ul className="space-y-3">
                  {[
                    "Chính hãng ATINO Design Studio",
                    "Đạt tiêu chuẩn an toàn sợi dệt OEKO-TEX",
                    "Đổi trả miễn phí trong 7 ngày nếu lỗi",
                    "Bảo hành đường may 6 tháng",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-foreground/90">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Thông số & Bảo quản */}
        <TabsContent value="specs" className="mt-8 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Technical Specs Table */}
            <div className="border border-border/80 rounded-2xl overflow-hidden bg-background">
              <div className="px-5 py-4 bg-muted/40 border-b border-border/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Thông số thiết kế
                </h4>
              </div>
              <div className="divide-y divide-border/60 text-xs">
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-muted-foreground">Phân loại</span>
                  <span className="font-medium text-foreground">{product.category?.name || "Thời trang cao cấp"}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-muted-foreground">Thương hiệu</span>
                  <span className="font-medium text-foreground">{product.brand?.name || "ATINO Studio"}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-muted-foreground">Phom dáng (Fit)</span>
                  <span className="font-medium text-foreground">Modern Regular Fit</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-muted-foreground">Chất liệu chính</span>
                  <span className="font-medium text-foreground">95% Premium Cotton dệt kim, 5% Spandex</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-muted-foreground">Nơi sản xuất</span>
                  <span className="font-medium text-foreground">Việt Nam (Handcrafted in Vietnam)</span>
                </div>
              </div>
            </div>

            {/* Care Guide */}
            <div className="border border-border/80 rounded-2xl overflow-hidden bg-background">
              <div className="px-5 py-4 bg-muted/40 border-b border-border/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Hướng dẫn bảo quản đúng cách
                </h4>
              </div>
              <div className="p-5 space-y-4 text-xs text-muted-foreground leading-relaxed">
                <div className="flex items-start gap-3">
                  <span className="size-5 rounded-full bg-muted font-bold text-foreground flex items-center justify-center shrink-0">1</span>
                  <p>Giặt máy ở chế độ nhẹ nhàng với nước lạnh (dưới 30°C) để giữ nguyên độ đàn hồi của sợi vải.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="size-5 rounded-full bg-muted font-bold text-foreground flex items-center justify-center shrink-0">2</span>
                  <p>Không dùng thuốc tẩy clo hoặc chất tẩy rửa có tính kiềm mạnh. Nên lộn trái sản phẩm trước khi giặt.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="size-5 rounded-full bg-muted font-bold text-foreground flex items-center justify-center shrink-0">3</span>
                  <p>Phơi trong bóng râm, tránh ánh nắng trực tiếp gay gắt làm ảnh hưởng đến độ bền màu.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="size-5 rounded-full bg-muted font-bold text-foreground flex items-center justify-center shrink-0">4</span>
                  <p>Ủi hơi nước ở nhiệt độ trung bình (tối đa 110°C) nếu cần thiết.</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Đánh giá */}
        <TabsContent value="reviews" className="mt-8 focus-visible:outline-none">
          <div className="space-y-8">
            {/* Rating Summary Header */}
            <div className="p-6 rounded-2xl border border-border/80 bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-extrabold tracking-tight text-foreground font-mono">
                  {averageRating}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="size-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dựa trên {reviews?.length || 0} đánh giá thực tế từ khách mua hàng
                  </p>
                </div>
              </div>

              {orderId > 0 && (
                <div className="shrink-0">
                  <ReviewForm productId={product.id} orderId={orderId} />
                </div>
              )}
            </div>

            <ReviewList productId={product.id} reviews={reviews || []} />
          </div>
        </TabsContent>

        {/* Tab 4: Chính sách giao nhận */}
        <TabsContent value="policy" className="mt-8 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border/80 bg-background space-y-3">
              <div className="size-10 rounded-xl bg-muted/60 flex items-center justify-center text-foreground">
                <Truck className="size-5" />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                Giao hàng toàn quốc
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Đồng giá vận chuyển tiêu chuẩn 30.000đ. Miễn phí vận chuyển cho đơn hàng từ 500.000đ. Nhận hàng sau 2-4 ngày làm việc.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/80 bg-background space-y-3">
              <div className="size-10 rounded-xl bg-muted/60 flex items-center justify-center text-foreground">
                <RotateCcw className="size-5" />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                Đổi trả trong 7 ngày
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hỗ trợ đổi size hoặc mẫu khác tận nhà trong vòng 7 ngày kể từ khi nhận hàng. Sản phẩm còn nguyên tem mác chưa qua sử dụng.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/80 bg-background space-y-3">
              <div className="size-10 rounded-xl bg-muted/60 flex items-center justify-center text-foreground">
                <ShieldCheck className="size-5" />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                Cam kết chính hãng
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                100% hình ảnh thực tế được chụp tại studio của ATINO. Hoàn tiền gấp đôi nếu phát hiện sản phẩm không đúng mô tả.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
