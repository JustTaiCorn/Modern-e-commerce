"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Sparkles, Check, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useAuthStore from "@/stores/useAuthStore";
import { Rating, RatingButton } from "@/components/ui/rating";
import { useCreateReview } from "@/services/reviewsService";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { formatPrice } from "@/lib/utils";

interface ReviewFormProps {
  productId: number;
  orderId?: number;
  productName?: string;
  productImage?: string;
  orderCode?: string;
  unitPrice?: number;
}

interface ReviewFormValues {
  rating: number;
  title: string;
  content: string;
}

const RATING_FEEDBACK: Record<number, { text: string; color: string; bg: string }> = {
  5: { text: "Cực kỳ hài lòng & Tuyệt vời!", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  4: { text: "Hài lòng, đúng như kỳ vọng", color: "text-teal-700", bg: "bg-teal-50 border-teal-200" },
  3: { text: "Bình thường, tạm chấp nhận được", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  2: { text: "Chưa hài lòng, còn nhiều thiếu sót", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  1: { text: "Rất thất vọng về sản phẩm", color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
};

const QUICK_TAGS = [
  "Chất lượng vượt trội",
  "Đúng như mô tả",
  "Giao hàng siêu nhanh",
  "Đóng gói rất cẩn thận",
  "Đáng giá tiền",
  "Chất vải mềm mịn",
  "Đường may tinh xảo",
  "Sẽ ủng hộ tiếp",
];

export default function ReviewForm({
  productId,
  orderId,
  productName,
  productImage,
  orderCode,
  unitPrice,
}: ReviewFormProps) {
  const { authUser } = useAuthStore();
  const { mutate: addReview, isPending: isLoading } = useCreateReview();
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    defaultValues: {
      rating: 5,
      title: "",
      content: "",
    },
  });

  const currentRating = watch("rating") || 5;
  const currentContent = watch("content") || "";

  const handleTagClick = (tag: string) => {
    const trimmed = currentContent.trim();
    if (!trimmed) {
      setValue("content", tag, { shouldValidate: true });
    } else if (!trimmed.includes(tag)) {
      setValue("content", `${trimmed}. ${tag}`, { shouldValidate: true });
    }
  };

  const onSubmit: SubmitHandler<ReviewFormValues> = async (data) => {
    try {
      addReview({
        user_id: authUser?.id,
        product_id: productId,
        order_id: orderId,
        rating: data.rating,
        title: data.title.trim() || undefined,
        content: data.content.trim(),
      });
      setIsOpen(false);
      reset();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      reset();
    }
  };

  if (!authUser) return null;

  const sentiment = RATING_FEEDBACK[currentRating] || RATING_FEEDBACK[5];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-xs hover:shadow-md transition-all rounded-xl font-medium px-4 h-9 cursor-pointer"
        >
          <Star className="w-4 h-4 fill-white" />
          <span>Viết đánh giá</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
        {/* Modal Top Banner */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 border-b border-border/60">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300">
                <Sparkles className="w-3 h-3" />
                Chia sẻ trải nghiệm
              </span>
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Đánh giá sản phẩm
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Cảm nhận chân thực của bạn là nguồn cảm hứng lớn cho người mua khác.
            </DialogDescription>
          </DialogHeader>

          {/* Product context card */}
          {productName && (
            <div className="mt-4 flex items-center gap-3.5 p-3 rounded-xl bg-background/80 backdrop-blur-xs border border-border/80 shadow-2xs">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0 border border-border flex items-center justify-center">
                {productImage ? (
                  <Image
                    src={productImage}
                    alt={productName}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <Package className="w-6 h-6 text-muted-foreground/60" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground truncate">
                  {productName}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  {orderCode && <span>Đơn hàng #{orderCode}</span>}
                  {unitPrice !== undefined && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-foreground">
                        {formatPrice(unitPrice)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Interactive Star Rating */}
          <div className="space-y-2.5 text-center">
            <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground block">
              Mức độ hài lòng của bạn
            </Label>
            <div className="flex justify-center">
              <Controller
                name="rating"
                control={control}
                rules={{
                  required: "Vui lòng chọn số sao đánh giá",
                  min: { value: 1, message: "Vui lòng chọn số sao đánh giá" },
                }}
                render={({ field }) => (
                  <Rating
                    value={field.value}
                    onValueChange={field.onChange}
                    className="gap-2 p-1"
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <RatingButton
                        key={i}
                        size={32}
                        className="text-amber-400 hover:text-amber-500 transition-transform hover:scale-115"
                      />
                    ))}
                  </Rating>
                )}
              />
            </div>

            {/* Dynamic Sentiment Chip */}
            <div className="flex justify-center">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all duration-200 ${sentiment.bg} ${sentiment.color}`}
              >
                {sentiment.text}
              </span>
            </div>

            {errors.rating && (
              <p className="text-xs text-rose-500 mt-1">{errors.rating.message}</p>
            )}
          </div>

          {/* Quick Tag Pills */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Gợi ý nhanh (chạm để thêm):
            </Label>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {QUICK_TAGS.map((tag) => {
                const isSelected = currentContent.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                        : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/80"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold text-foreground">
              Tiêu đề đánh giá <span className="text-muted-foreground font-normal">(Không bắt buộc)</span>
            </Label>
            <Input
              id="title"
              placeholder="VD: Rất ưng ý, vải dày dặn và phom chuẩn đẹp..."
              maxLength={150}
              className="rounded-xl h-10 text-sm border-border focus-visible:ring-amber-500/30"
              {...register("title")}
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="content" className="text-xs font-semibold text-foreground">
                Nội dung chi tiết <span className="text-rose-500">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {currentContent.length}/500 ký tự
              </span>
            </div>
            <Textarea
              id="content"
              placeholder="Hãy chia sẻ thêm về chất lượng vải, kích cỡ thực tế, màu sắc so với ảnh, và trải nghiệm sử dụng của bạn nhé..."
              rows={4}
              maxLength={500}
              className="rounded-xl text-sm border-border focus-visible:ring-amber-500/30 resize-none"
              {...register("content", {
                required: "Vui lòng nhập nội dung đánh giá",
                minLength: {
                  value: 10,
                  message: "Nội dung nhận xét tối thiểu 10 ký tự",
                },
              })}
            />
            {errors.content && (
              <p className="text-xs text-rose-500">{errors.content.message}</p>
            )}
          </div>

          {/* Dialog Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              className="rounded-xl h-10 px-5 text-sm cursor-pointer"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl h-10 px-6 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer"
            >
              {isLoading ? "Đang gửi..." : "Gửi đánh giá ngay"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
