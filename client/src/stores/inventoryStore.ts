import { create } from "zustand";
import { persist } from "zustand/middleware";
import privateClient from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";

export interface Inventory {
  id: number;
  productVariant: {
    id: number;
    sku: string;
    sizeId?: number;
    colorId?: number;
    price: number;
    product?: {
      id: number;
      name: string;
      sku: string;
    };
    size?: {
      id: number;
      name: string;
      code: string;
    };
    color?: {
      id: number;
      name: string;
      code: string;
    };
  };
  quantity: number;
}

export interface UpdateInventoryRequest {
  variantId: number;
  quantity: number;
}

interface InventoryState {
  inventories: Inventory[];
  isLoading: boolean;
  error: string | null;

  fetchAllInventories: () => Promise<void>;
  fetchInventoryByVariant: (variantId: number) => Promise<Inventory | null>;
  fetchInventoriesByProduct: (productId: number) => Promise<Inventory[]>;
  updateInventory: (request: UpdateInventoryRequest) => Promise<boolean>;
  clearError: () => void;
  getInventoryByVariantId: (variantId: number) => Inventory | undefined;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      inventories: [],
      isLoading: false,
      error: null,

      fetchAllInventories: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.get("/inventories");
          const data = response.data?.data || response.data || [];
          set({ inventories: Array.isArray(data) ? data : [], isLoading: false });
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Lỗi khi tải danh sách tồn kho";
          set({ error: errorMessage, isLoading: false });
        }
      },

      fetchInventoryByVariant: async (variantId: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.get(`/inventories/${variantId}`);
          const data = response.data?.data || response.data;
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ isLoading: false });
          return null;
        }
      },

      fetchInventoriesByProduct: async (productId: number) => {
        set({ isLoading: true, error: null });
        try {
          let response;
          try {
            response = await privateClient.get("/inventories", {
              params: { productId },
            });
          } catch {
            response = await privateClient.get(
              `/products/${productId}/variants`
            );
          }
          const data = response.data?.data || response.data || [];
          set({ isLoading: false });
          return Array.isArray(data) ? data : [];
        } catch (error) {
          set({ isLoading: false });
          return [];
        }
      },

      updateInventory: async (request: UpdateInventoryRequest) => {
        set({ isLoading: true, error: null });
        try {
          let response;
          try {
            response = await privateClient.patch(
              `/inventories/${request.variantId}`,
              { quantity: request.quantity }
            );
          } catch {
            response = await privateClient.patch(
              `/products/variants/${request.variantId}/stock`,
              { quantity: request.quantity }
            );
          }
          const updatedInventory = response.data?.data || response.data;

          set((state) => ({
            inventories: state.inventories.map((inv) =>
              inv.productVariant?.id === request.variantId
                ? {
                    ...inv,
                    quantity: request.quantity,
                    productVariant: {
                      ...inv.productVariant,
                      ...(updatedInventory?.productVariant || {}),
                    },
                  }
                : inv
            ),
            isLoading: false,
          }));
          return true;
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Lỗi khi cập nhật tồn kho";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          return false;
        }
      },

      clearError: () => set({ error: null }),

      getInventoryByVariantId: (variantId: number) => {
        return get().inventories.find(
          (inv) => inv.productVariant?.id === variantId
        );
      },
    }),
    {
      name: "inventory-storage",
      partialize: (state) => ({ inventories: state.inventories }),
    }
  )
);
