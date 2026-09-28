import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import privateClient from "@/lib/axios";
import { toast } from "sonner";
import useAuthStore from "@/stores/useAuthStore";
import { AxiosError } from "axios";
import { CartItem } from "@/types";

export const cartService = {
  getCartItems: async (userId?: number): Promise<CartItem[]> => {
    try {
      let res;
      try {
        res = await privateClient.get("/cart");
      } catch {
        if (userId) {
          res = await privateClient.get(`/carts/${userId}`);
        } else {
          return [];
        }
      }
      const data = res.data?.data || res.data;
      const raw = data?.items || (Array.isArray(data) ? data : []);
      return raw.map((item: any) => ({
        id: item.id,
        productVariantId: item.variantId || item.productVariantId || item.variant?.id,
        productName: item.name || item.productName || item.variant?.product?.name || "Sản phẩm",
        unitPrice: Number(item.price || item.unitPrice || item.variant?.price || 0),
        quantity: item.qty || item.quantity || 1,
        variant: item.variant || { image: item.image },
      }));
    } catch {
      return [];
    }
  },

  addToCart: async (userId: number, variantId: number, quantity: number) => {
    try {
      return await privateClient.post("/cart/items", { variantId, qty: quantity });
    } catch {
      return await privateClient.post(
        `/carts/${userId}/add?variantId=${variantId}&quantity=${quantity}`
      );
    }
  },

  removeFromCart: async (userId: number, itemId: number) => {
    try {
      return await privateClient.delete(`/cart/items/${itemId}`);
    } catch {
      return await privateClient.delete(`/carts/${userId}/remove/${itemId}`);
    }
  },

  updateQuantity: async (userId: number, itemId: number, quantity: number) => {
    try {
      return await privateClient.put(`/cart/items/${itemId}`, { qty: quantity });
    } catch {
      return await privateClient.put(
        `/carts/${userId}/update?itemId=${itemId}&quantity=${quantity}`
      );
    }
  },

  clearCart: async (userId: number) => {
    try {
      return await privateClient.delete("/cart");
    } catch {
      return await privateClient.delete(`/carts/${userId}/clear`);
    }
  },
};

export const useCartQuery = () => {
  const userId = useAuthStore((state) => state.authUser?.id);

  return useQuery({
    queryKey: ["cart", userId],
    queryFn: () => cartService.getCartItems(userId),
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: true,
  });
};

export const useAddToCart = () => {
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.authUser?.id);

  return useMutation({
    mutationFn: async ({
      variantId,
      quantity,
    }: {
      variantId: number;
      quantity: number;
    }) => {
      if (!userId) throw new Error("Vui lòng đăng nhập");
      return await cartService.addToCart(userId, variantId, quantity);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Đã thêm vào giỏ hàng");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng");
    },
  });
};

export const useRemoveFromCart = () => {
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.authUser?.id);

  return useMutation({
    mutationFn: async (itemId: number) => {
      if (!userId) throw new Error("Vui lòng đăng nhập");
      return await cartService.removeFromCart(userId, itemId);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Đã xóa khỏi giỏ hàng");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Lỗi khi xóa");
    },
  });
};

export const useUpdateCartQuantity = () => {
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.authUser?.id);

  return useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: number;
      quantity: number;
    }) => {
      if (!userId) throw new Error("Vui lòng đăng nhập");
      return await cartService.updateQuantity(userId, itemId, quantity);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật");
    },
  });
};

export const useClearCart = () => {
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.authUser?.id);

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Vui lòng đăng nhập");
      return await cartService.clearCart(userId);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Lỗi khi xóa giỏ hàng");
    },
  });
};

export default cartService;
