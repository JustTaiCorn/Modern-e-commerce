import { create } from "zustand";
import privateClient from "@/lib/axios";
import { toast } from "sonner";
import { AxiosError } from "axios";
import useAuthStore from "./useAuthStore";
import { Cart, CartItem, CartSummary, ProductVariant } from "@/types";

interface CartState {
  currentCart: Cart | null;
  items: CartItem[];
  shippingFee: number;
  isLoading: boolean;
  error: string | null;

  fetchCartItems: (userId?: number) => Promise<void>;
  createCart: (userId: number) => void;
  clearCart: () => Promise<void>;

  addToCart: (variant: ProductVariant | { id: number; [key: string]: any }, quantity?: number) => Promise<void>;
  buyNow: (variant: ProductVariant | { id: number; [key: string]: any }, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  getCartSummary: () => CartSummary;

  getTotalItems: () => number;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const initialState = {
  currentCart: null,
  items: [],
  shippingFee: 30000,
  isLoading: false,
  error: null,
};

const normalizeCartItems = (rawItems: any[]): CartItem[] => {
  if (!Array.isArray(rawItems)) return [];
  return rawItems.map((item) => {
    const variant = item.variant || {};
    const vId = item.variantId || item.productVariantId || item.variant_id || variant.id || 0;
    return {
      id: item.id,
      cart_id: item.cart_id || item.cartId || 0,
      variant_id: vId,
      productVariantId: vId,
      productName: item.name || item.productName || variant.product?.name || "Sản phẩm",
      unitPrice: Number(item.price || item.unitPrice || variant.price || 0),
      quantity: item.qty || item.quantity || 1,
      variant: {
        id: vId,
        sku: variant.sku || "",
        price: Number(item.price || variant.price || 0),
        image: item.image || variant.image || variant.product?.images?.[0]?.url || "",
        colorName: variant.color?.name || "",
        sizeName: variant.size?.name || "",
        ...variant,
      },
    };
  });
};

export const useCartStore = create<CartState>()((set, get) => ({
  ...initialState,

  fetchCartItems: async (userId?: number) => {
    set({ isLoading: true, error: null });
    try {
      // Thử endpoint /cart (của Modern_ecommerce backend), fallback /carts/:userId
      let res;
      try {
        res = await privateClient.get("/cart");
      } catch (e) {
        const uid = userId || useAuthStore.getState().authUser?.id;
        if (uid) {
          res = await privateClient.get(`/carts/${uid}`);
        } else {
          throw e;
        }
      }

      const cartData = res.data?.data || res.data;
      const rawItems = cartData?.items || (Array.isArray(cartData) ? cartData : []);
      const normalizedItems = normalizeCartItems(rawItems);

      set({
        items: normalizedItems,
        currentCart: cartData,
        isLoading: false,
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi tải giỏ hàng";
      set({ error: errorMessage, isLoading: false });
    }
  },

  createCart: (userId) => {
    const newCart: Cart = {
      id: Date.now(),
      userId,
      items: [],
    };
    set({
      currentCart: newCart,
      items: [],
    });
  },

  clearCart: async () => {
    const userId = useAuthStore.getState().authUser?.id;
    if (!userId) {
      set({ items: [], currentCart: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      try {
        await privateClient.delete("/cart");
      } catch {
        await privateClient.delete(`/carts/${userId}/clear`);
      }
      set({ items: [], currentCart: null, isLoading: false });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi xóa giỏ hàng";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  addToCart: async (variant, quantity = 1) => {
    const userId = useAuthStore.getState().authUser?.id;
    if (!userId) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      throw new Error("User not authenticated");
    }

    set({ isLoading: true, error: null });
    try {
      // Modern_ecommerce backend: POST /cart/items { variantId, qty }
      try {
        await privateClient.post("/cart/items", {
          variantId: variant.id,
          qty: quantity,
        });
      } catch {
        // Fallback to legacy endpoint
        await privateClient.post(
          `/carts/${userId}/add?variantId=${variant.id}&quantity=${quantity}`
        );
      }

      await get().fetchCartItems(userId);
      toast.success("Đã thêm vào giỏ hàng");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi thêm vào giỏ hàng";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  buyNow: async (variant, quantity = 1) => {
    const userId = useAuthStore.getState().authUser?.id;
    if (!userId) {
      toast.error("Vui lòng đăng nhập để mua hàng");
      throw new Error("User not authenticated");
    }

    set({ isLoading: true, error: null });
    try {
      await get().clearCart();
      try {
        await privateClient.post("/cart/items", {
          variantId: variant.id,
          qty: quantity,
        });
      } catch {
        await privateClient.post(
          `/carts/${userId}/add?variantId=${variant.id}&quantity=${quantity}`
        );
      }
      await get().fetchCartItems(userId);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi mua hàng";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  removeFromCart: async (itemId) => {
    const userId = useAuthStore.getState().authUser?.id;
    if (!userId) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const item = get().items.find((i) => i.id === itemId);
      const variantId = item?.productVariantId || itemId;

      try {
        await privateClient.delete(`/cart/items/${variantId}`);
      } catch {
        await privateClient.delete(`/carts/${userId}/remove/${itemId}`);
      }

      set((state) => ({
        items: state.items.filter((i) => i.id !== itemId),
        isLoading: false,
      }));
      toast.success("Đã xóa khỏi giỏ hàng");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi xóa khỏi giỏ hàng";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  updateQuantity: async (itemId, quantity) => {
    if (quantity <= 0) {
      await get().removeFromCart(itemId);
      return;
    }

    const userId = useAuthStore.getState().authUser?.id;
    if (!userId) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const item = get().items.find((i) => i.id === itemId);
      const variantId = item?.productVariantId || itemId;

      try {
        await privateClient.put(`/cart/items/${variantId}`, { qty: quantity });
      } catch {
        await privateClient.put(
          `/carts/${userId}/update?itemId=${itemId}&quantity=${quantity}`
        );
      }

      set((state) => ({
        items: state.items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        ),
        isLoading: false,
      }));
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi cập nhật số lượng";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  getCartSummary: (): CartSummary => {
    const { items, shippingFee } = get();

    const subtotal = items.reduce(
      (total, item) => total + (item.unitPrice || 0) * item.quantity,
      0
    );

    const discount = 0;
    const subtotalAfterDiscount = subtotal - discount;
    const total = subtotalAfterDiscount + (subtotal > 0 ? shippingFee : 0);

    return {
      subtotal,
      discount,
      shippingFee: subtotal > 0 ? shippingFee : 0,
      total,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
    };
  },

  getTotalItems: () => {
    const authUser = useAuthStore.getState().authUser;
    if (!authUser?.id) {
      return 0;
    }
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));
