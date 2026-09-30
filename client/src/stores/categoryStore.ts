import { create } from "zustand";
import { persist } from "zustand/middleware";
import privateClient from "@/lib/axios";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Category } from "@/types";

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  createCategory: (categoryData: {
    name: string;
    parentId?: number;
    isActive?: boolean;
  }) => Promise<void>;
  updateCategory: (id: number, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;

  // Queries
  getCategory: (id: number) => Category | undefined;
  getCategoryBySlug: (slug: string) => Category | undefined;
  getChildCategories: (parentId: number) => Category[];
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: [],
      isLoading: false,
      error: null,

      fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.get("/categories");
          const categories = response.data?.data || response.data || [];
          set({ categories, isLoading: false });
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Lỗi khi tải danh sách danh mục";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Fetch categories error:", errorMessage);
        }
      },

      createCategory: async (categoryData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.post(
            "/categories",
            categoryData
          );
          const newCategory = response.data?.data || response.data;

          set((state) => ({
            categories: [newCategory, ...state.categories],
            isLoading: false,
          }));

          toast.success("Thêm danh mục thành công");
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Lỗi khi thêm danh mục";

          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      updateCategory: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.put(
            `/categories/${id}`,
            updates
          );
          const updatedCategory = response.data?.data || response.data;

          set((state) => ({
            categories: state.categories.map((category) =>
              category.id === id
                ? { ...category, ...updatedCategory }
                : category
            ),
            isLoading: false,
          }));

          toast.success("Cập nhật danh mục thành công");
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Lỗi khi cập nhật danh mục";

          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      deleteCategory: async (id) => {
        const hasSubcategories = get().categories.some((cat) => {
          const pId = typeof cat.parentId === "object" ? (cat.parentId as any)?.id : cat.parentId;
          return pId === id;
        });

        if (hasSubcategories) {
          toast.error("Không thể xóa danh mục đang có danh mục con");
          return;
        }
        set({ isLoading: true, error: null });
        try {
          await privateClient.delete(`/categories/${id}`);

          set((state) => ({
            categories: state.categories.filter(
              (category) => category.id !== id
            ),
            isLoading: false,
          }));

          toast.success("Xóa danh mục thành công");
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Lỗi khi xóa danh mục";

          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      getCategory: (id) => {
        const { categories } = get();
        return categories.find((category) => category.id === id);
      },

      getCategoryBySlug: (slug) => {
        const { categories } = get();
        return categories.find((category) => category.slug === slug);
      },

      getChildCategories: (parentId) => {
        const { categories } = get();
        return categories.filter((category) => {
          const pId = typeof category.parentId === "object" ? (category.parentId as any)?.id : category.parentId;
          return pId === parentId && category.isActive;
        });
      },

      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "category-storage",
      partialize: (state) => ({
        categories: state.categories,
      }),
    }
  )
);
