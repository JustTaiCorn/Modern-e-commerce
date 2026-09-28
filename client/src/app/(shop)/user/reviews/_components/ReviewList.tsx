"use client";

import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import useAuthStore from "@/stores/useAuthStore";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useDeleteReview } from "@/services/reviewsService";
import { Review } from "@/types";

interface ReviewListProps {
  productId?: number;
  reviews?: Review[];
}

export default function ReviewList({ reviews = [] }: ReviewListProps) {
  const { authUser } = useAuthStore();
  const { mutate: deleteReview, isPending: isLoading } = useDeleteReview();

  const handleDelete = (reviewId: number) => {
    if (!authUser?.id) return;
    deleteReview({ reviewId, userId: authUser.id });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Star className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium">Chưa có đánh giá nào</p>
          <p className="text-sm text-gray-400 mt-1">
            Đánh giá của bạn sẽ xuất hiện tại đây sau khi hoàn tất mua hàng
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="border-gray-200">
          <CardContent className="p-5">
            <div className="flex gap-4">
              {/* Avatar */}
              <Avatar className="w-10 h-10 border border-gray-100">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {review.user?.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "U"}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {review.user?.fullName || "Người dùng"}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-xs text-gray-400">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions - Only show for review owner */}
                  {authUser && authUser.id === review.user_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(review.id)}
                      disabled={isLoading}
                      className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title="Xóa đánh giá"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Title */}
                {review.title && (
                  <h5 className="font-semibold text-gray-800 text-sm mt-3">
                    {review.title}
                  </h5>
                )}

                {/* Content */}
                <p className="text-gray-600 text-sm mt-2 whitespace-pre-wrap leading-relaxed">
                  {review.content}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
