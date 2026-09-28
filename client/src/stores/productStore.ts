import { create } from "zustand";
import { persist } from "zustand/middleware";
import privateClient from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Product, ProductVariant } from "@/types";

interface ProductState {
  products: Product[];
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  isLoading: boolean;
  error: string | null;

  fetchProducts: (current?: number, pageSize?: number) => Promise<void>;
  setProducts: (products: Product[]) => void;
  addProductWithVariants: (
    productData: any,
    selectedSizes: number[],
    selectedColors: number[],
    imageFiles: File[]
  ) => Promise<void>;
  updateProduct: (
    id: number,
    productData: any,
    selectedSizes: number[],
    selectedColors: number[],
    imageFiles?: File[],
    keepImageUrls?: string[]
  ) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  getProduct: (id: number) => Product | undefined;
  getVariantById: (variantId: number) => ProductVariant | undefined;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],
      currentPage: 1,
      pageSize: 10,
      hasNextPage: true,
      isLoading: false,
      error: null,

      fetchProducts: async (current = 1, pageSize = 20) => {
        set({ isLoading: true, error: null });
        try {
          const res = await privateClient.get(
            `/products?current=${current}&pageSize=${pageSize}`
          );
          const raw = res.data?.data || res.data;
          const data = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.items)
            ? raw.items
            : [];
          set({
            products: data,
            currentPage: current,
            pageSize,
            hasNextPage: data.length === pageSize,
            isLoading: false,
          });
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const message =
            axiosError?.response?.data?.message ||
            "Lỗi khi tải danh sách sản phẩm";
          set({ error: message, isLoading: false });
        }
      },

      setProducts: (products: Product[]) => {
        set({ products });
      },

      addProductWithVariants: async (
        productData,
        selectedSizes,
        selectedColors,
        imageFiles
      ) => {
        set({ isLoading: true, error: null });
        try {
          const baseSku = productData.sku?.trim() || `PRD-${Date.now()}`;
          const price = Number(productData.basePrice || productData.price || 0);

          const variants: Array<{
            sku: string;
            price: number;
            countInStock: number;
            attributeValueIds?: number[];
          }> = [];

          if (selectedColors.length > 0 && selectedSizes.length > 0) {
            for (const colorId of selectedColors) {
              for (const sizeId of selectedSizes) {
                variants.push({
                  sku: `${baseSku}-C${colorId}-S${sizeId}`,
                  price,
                  countInStock: 100,
                  attributeValueIds: [colorId, sizeId],
                });
              }
            }
          } else if (selectedColors.length > 0) {
            for (const colorId of selectedColors) {
              variants.push({
                sku: `${baseSku}-C${colorId}`,
                price,
                countInStock: 100,
                attributeValueIds: [colorId],
              });
            }
          } else if (selectedSizes.length > 0) {
            for (const sizeId of selectedSizes) {
              variants.push({
                sku: `${baseSku}-S${sizeId}`,
                price,
                countInStock: 100,
                attributeValueIds: [sizeId],
              });
            }
          } else {
            variants.push({
              sku: baseSku,
              price,
              countInStock: 100,
              attributeValueIds: [],
            });
          }

          const payload = {
            name: productData.name,
            description: productData.description || "",
            categoryId: Number(productData.category?.id || productData.categoryId),
            ...(productData.brandId ? { brandId: Number(productData.brandId) } : {}),
            variants,
          };

          const res = await privateClient.post("/products", payload);
          const created = res.data?.data || res.data;
          const productId = created.id;

          if (imageFiles && imageFiles.length > 0 && productId) {
            const formData = new FormData();
            imageFiles.forEach((file) => {
              formData.append("files", file);
            });

            try {
              await privateClient.post(
                `/products/${productId}/upload-image`,
                formData,
                {
                  headers: { "Content-Type": "multipart/form-data" },
                }
              );
            } catch (imgErr) {
              console.warn("Failed to upload product images:", imgErr);
            }

            try {
              const updatedRes = await privateClient.get(`/products/${productId}`);
              const updatedProduct = updatedRes.data?.data || updatedRes.data;

              set((state) => ({
                products: [updatedProduct, ...state.products.filter((p) => p.id !== productId)],
                isLoading: false,
              }));
            } catch {
              set((state) => ({
                products: [created, ...state.products.filter((p) => p.id !== productId)],
                isLoading: false,
              }));
            }
          } else {
            set((state) => ({
              products: [created, ...state.products.filter((p) => p.id !== productId)],
              isLoading: false,
            }));
          }

          toast.success("Thêm sản phẩm thành công");
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string | string[] }>;
          const message =
            Array.isArray(axiosError?.response?.data?.message)
              ? axiosError?.response?.data?.message.join(", ")
              : axiosError?.response?.data?.message || "Lỗi khi thêm sản phẩm";
          set({ error: message, isLoading: false });
          toast.error(message);
          throw error;
        }
      },

      updateProduct: async (
        id,
        productData,
        selectedSizes,
        selectedColors,
        imageFiles,
        keepImageUrls = []
      ) => {
        set({ isLoading: true, error: null });
        try {
          const payload: any = {
            name: productData.name,
            description: productData.description || "",
            categoryId: Number(productData.category?.id || productData.categoryId),
          };
          if (productData.brandId) {
            payload.brandId = Number(productData.brandId);
          }

          await privateClient.patch(`/products/${id}`, payload);

          if (imageFiles && imageFiles.length > 0) {
            const formData = new FormData();
            imageFiles.forEach((file) => {
              formData.append("files", file);
            });

            try {
              await privateClient.post(`/products/${id}/upload-image`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
            } catch (imgErr) {
              console.warn("Failed to upload product images:", imgErr);
            }
          }

          await get().fetchProducts();
          toast.success("Cập nhật sản phẩm thành công");
          set({ isLoading: false });
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string | string[] }>;
          const message =
            Array.isArray(axiosError?.response?.data?.message)
              ? axiosError?.response?.data?.message.join(", ")
              : axiosError?.response?.data?.message || "Lỗi khi cập nhật sản phẩm";
          set({ error: message, isLoading: false });
          toast.error(message);
          throw error;
        }
      },

      deleteProduct: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await privateClient.delete(`/products/${id}`);
          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
            isLoading: false,
          }));
          toast.success("Xóa sản phẩm thành công");
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const message =
            axiosError?.response?.data?.message || "Lỗi khi xóa sản phẩm";
          set({ error: message, isLoading: false });
          toast.error(message);
          throw error;
        }
      },

      getProduct: (id) => {
        const { products } = get();
        return products.find((product) => product.id === id);
      },

      getVariantById: (variantId) => {
        const { products } = get();
        for (const product of products) {
          const variant = product.variants?.find((v) => v.id === variantId);
          if (variant) return variant;
        }
        return undefined;
      },

      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "product-storage",
      partialize: (state) => ({ products: state.products }),
    }
  )
);
