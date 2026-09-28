"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Trash2, CheckCircle2, MessageSquare, ExternalLink, Package, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useAuthStore from "@/stores/useAuthStore";
import { formatDate } from "@/lib/utils";
import { useDeleteReview } from "@/services/reviewsService";
import { Review } from "@/types";

interface ReviewListProps {
  productId?: number;
  reviews?: Review[];
  onGoToPending?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  5: "Tuyệt vời",
  4: "Hài lòng",
  3: "Bình thường",
  2: "Chưa hài lòng",
  1: "Thất vọng",
};

export default function ReviewList({ reviews = [], onGoToPending }: ReviewListProps) {
  const { authUser } = useAuthStore();
  const { mutate: deleteReview, isPending: isLoading } = useDeleteReview();
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleDeleteConfirm = () => {
    if (!deleteTargetId || !authUser?.id) return;
    deleteReview({ reviewId: deleteTargetId, userId: authUser.id });
    setDeleteTargetId(null);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= rating
                  ? "fill-amber-400 text-amber-400"
                  : "fill-muted text-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-foreground ml-1">
          {rating}.0
        </span>
        <span className="text-xs text-muted-foreground">
          • {RATING_LABELS[rating] || "Đánh giá"}
        </span>
      </div>
    );
  };

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center transition-all">
        <div className="relative mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
          <Star className="w-8 h-8 text-amber-500 fill-amber-500/20" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">
          Chưa có đánh giá nào được gửi
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
          Tất cả đánh giá bạn đã hoàn thành sẽ xuất hiện tại đây. Nhận xét của bạn
          giúp hàng nghìn khách hàng khác đưa ra quyết định mua sắm chính xác!
        </p>
        {onGoToPending && (
          <Button
            onClick={onGoToPending}
            variant="outline"
            className="rounded-xl px-5 h-10 gap-2 cursor-pointer shadow-2xs hover:bg-muted font-medium"
          >
            <MessageSquare className="w-4 h-4 text-amber-500" />
            Kiểm tra sản phẩm chờ đánh giá
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const prodName = review.product?.name || "Sản phẩm đã mua";
        const prodSlug = review.product?.slug || review.product?.id;
        const prodImage = (review.product as any)?.image;

        return (
          <Card
            key={review.id}
            className="border-border/80 shadow-2xs hover:shadow-xs transition-all duration-200 rounded-xl overflow-hidden bg-card"
          >
            <CardContent className="p-5 sm:p-6 space-y-4">
              {/* Product & Header info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-lg bg-muted shrink-0 border border-border/80 overflow-hidden flex items-center justify-center">
                    {prodImage ? (
                      <Image
                        src={prodImage}
                        alt={prodName}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-muted-foreground/60" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={prodSlug ? `/products/${prodSlug}` : "#"}
                        className="font-bold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1 group truncate"
                      >
                        <span className="truncate">{prodName}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" />
                        Đã mua hàng
                      </span>
                      <span>•</span>
                      <span>Đánh giá ngày {formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Rating & Delete Action */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  {renderStars(review.rating)}

                  {authUser && authUser.id === review.user_id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTargetId(review.id)}
                          disabled={isLoading}
                          className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                          title="Xóa đánh giá này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xóa đánh giá sản phẩm?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa bài đánh giá này? Hành động này sẽ cập nhật lại điểm trung bình của sản phẩm và không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
                          >
                            Xác nhận xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>

              {/* Review Content */}
              <div className="space-y-2 pt-0.5">
                {review.title && (
                  <h5 className="font-bold text-foreground text-sm leading-snug">
                    {review.title}
                  </h5>
                )}

                <p className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">
                  {review.content || (review as any).comment || "Không có nhận xét chi tiết."}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
