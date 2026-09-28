"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useAuthStore from "@/stores/useAuthStore";
import { toast } from "sonner";
import { Rating, RatingButton } from "@/components/ui/rating";
import { useCreateReview } from "@/services/reviewsService";
import { useForm, Controller, SubmitHandler } from "react-hook-form";

interface ReviewFormProps {
  productId: number;
  orderId?: number;
}

interface ReviewFormValues {
  rating: number;
  title: string;
  content: string;
}

export default function ReviewForm({ productId, orderId }: ReviewFormProps) {
  const { authUser } = useAuthStore();
  const { mutate: addReview, isPending: isLoading } = useCreateReview();
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    defaultValues: {
      rating: 5,
      title: "",
      content: "",
    },
  });

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

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          Viết đánh giá
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Viết đánh giá sản phẩm</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>
              Đánh giá sao <span className="text-red-500">*</span>
            </Label>
            <div>
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
                    className="gap-1.5"
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <RatingButton
                        key={i}
                        size={28}
                        className="text-yellow-400 hover:text-yellow-500"
                      />
                    ))}
                  </Rating>
                )}
              />
            </div>
            {errors.rating && (
              <p className="text-xs text-red-500">{errors.rating.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề (Không bắt buộc)</Label>
            <Input
              id="title"
              placeholder="Tóm tắt cảm nhận của bạn (vd: Vải mát, đúng size)"
              maxLength={255}
              {...register("title")}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Nội dung chi tiết <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Chia sẻ trải nghiệm của bạn về độ vừa vặn, chất liệu, màu sắc..."
              rows={4}
              {...register("content", {
                required: "Vui lòng nhập nội dung đánh giá",
              })}
            />
            {errors.content && (
              <p className="text-xs text-red-500">{errors.content.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
