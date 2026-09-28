import privateClient from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Review, CreateReviewData } from "@/types";
import { toast } from "sonner";

export const reviewService = {
  getReviewsByProduct: async (productId: number): Promise<Review[]> => {
    try {
      const response = await privateClient.get(`/reviews/product/${productId}`);
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

  getReviewsByUser: async (userId: number | undefined): Promise<Review[]> => {
    if (!userId) return [];
    try {
      const response = await privateClient.get(`/reviews/user/${userId}`);
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

  createReview: async (reviewData: CreateReviewData): Promise<Review> => {
    const response = await privateClient.post("/reviews", reviewData);
    return response.data?.data || response.data;
  },

  deleteReview: async (reviewId: number, userId: number): Promise<void> => {
    await privateClient.delete(`/reviews/${reviewId}`, {
      params: { userId },
    });
  },
};

export const useReviewsByProduct = (productId: number | undefined | null) => {
  return useQuery({
    queryKey: ["reviews", "product", productId],
    queryFn: () => reviewService.getReviewsByProduct(productId!),
    enabled: !!productId,
  });
};

export const useReviewsByUser = (userId: number | undefined) => {
  return useQuery({
    queryKey: ["reviews", "user", userId],
    queryFn: () => reviewService.getReviewsByUser(userId),
    enabled: !!userId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewData: CreateReviewData) =>
      reviewService.createReview(reviewData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", "product", variables.product_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["reviews", "user", variables.user_id],
      });
      toast.success("Đánh giá thành công!");
    },
    onError: () => {
      toast.error("Không thể gửi đánh giá");
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, userId }: { reviewId: number; userId: number }) =>
      reviewService.deleteReview(reviewId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Đã xóa đánh giá");
    },
    onError: () => {
      toast.error("Không thể xóa đánh giá");
    },
  });
};

export default reviewService;
