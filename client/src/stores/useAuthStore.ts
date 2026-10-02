import { create } from "zustand";
import { toast } from "sonner";
import { SignUpData, LoginData, User, Address, Role } from "@/types";
import privateClient from "@/lib/axios";
import { AxiosError } from "axios";
import { persist } from "zustand/middleware";
import { useCartStore } from "./cartStore";

interface AuthStore {
  authUser: User | null;
  accessToken: string | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isLoading: boolean;
  isForgettingPassword: boolean;
  isResettingPassword: boolean;
  isConfirmingEmail: boolean;

  // Token management
  setAccessToken: (token: string | null) => void;
  getAccessToken: () => string | null;

  // User management
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;

  // Address management
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Omit<Address, "id" | "user_id">) => Promise<void>;
  updateAddress: (id: number, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
  setDefaultAddress: (id: number) => Promise<void>;
  getDefaultAddress: () => Address | undefined;

  // Role checks
  hasRole: (roleName: string) => boolean;
  isAdmin: () => boolean;
  isStaff: () => boolean;
  isAdminOrStaff: () => boolean;
  isCustomer: () => boolean;

  // Auth actions
  signup: (data: SignUpData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  confirmEmail: (token: string) => Promise<void>;
  clearState: () => void;
}

const normalizeRoles = (rawRoles: any): Role[] => {
  if (!rawRoles || !Array.isArray(rawRoles)) return [];
  return rawRoles.map((r: any, idx: number) => {
    if (typeof r === "string") return { id: idx, name: r };
    if (r.role?.name) return { id: r.role.id || idx, name: r.role.name };
    if (r.name) return { id: r.id || idx, name: r.name };
    return { id: idx, name: String(r) };
  });
};

const normalizeUser = (user: any): User => {
  if (!user) return user;
  return {
    ...user,
    fullName: user.fullName || user.username || user.name || "Người dùng",
    roles: normalizeRoles(user.roles),
  };
};

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      authUser: null,
      accessToken: null,
      isSigningUp: false,
      isLoggingIn: false,
      isLoading: false,
      isForgettingPassword: false,
      isResettingPassword: false,
      isConfirmingEmail: false,

      setAccessToken: (token: string | null) => {
        set({ accessToken: token });
      },

      getAccessToken: () => {
        return get().accessToken;
      },

      login: async (data: LoginData) => {
        set({ isLoggingIn: true, isLoading: true });
        try {
          const res = await privateClient.post("/auth/login", data);
          const resData = res.data?.data || res.data;
          const token = resData?.accesstoken || resData?.accessToken;

          let rawUser = resData?.user || resData;

          // If user object not fully returned with login, fetch /auth/me with the token
          if (!rawUser?.email || !rawUser?.roles) {
            try {
              const meRes = await privateClient.get("/auth/me", {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              });
              rawUser = meRes.data?.data || meRes.data || rawUser;
            } catch (meError) {
              console.warn("Could not fetch user profile immediately:", meError);
            }
          }

          const user = normalizeUser(rawUser);

          set({
            authUser: user,
            accessToken: token,
          });

          toast.success("Đăng nhập thành công");
        } catch (error: unknown) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Đã xảy ra lỗi khi đăng nhập";

          console.log("❌ Login error:", errorMessage);
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoggingIn: false, isLoading: false });
        }
      },

      signup: async (data: SignUpData) => {
        set({ isSigningUp: true, isLoading: true });
        try {
          await privateClient.post("/auth/register", data);
          toast.success(
            "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
          );
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Đăng ký thất bại";
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isSigningUp: false, isLoading: false });
        }
      },

      logout: async () => {
        try {
          await privateClient.post("/auth/logout");
        } catch (error) {
          console.log("Logout error:", error);
        } finally {
          set({ authUser: null, accessToken: null });
          useCartStore.setState({
            items: [],
            currentCart: null,
            error: null,
          });
          toast.success("Đăng xuất thành công");
        }
      },

      forgotPassword: async (email: string) => {
        set({ isForgettingPassword: true, isLoading: true });
        try {
          await privateClient.post("/auth/forgot-password", { email });
          toast.success(
            "Liên kết khôi phục mật khẩu đã được gửi đến email của bạn"
          );
        } catch (error: unknown) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Không thể gửi email khôi phục mật khẩu. Vui lòng thử lại sau.";
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isForgettingPassword: false, isLoading: false });
        }
      },

      resetPassword: async (token: string, password: string) => {
        set({ isResettingPassword: true, isLoading: true });
        try {
          const response = await privateClient.put("/auth/reset-password", {
            token,
            newPassword: password,
          });
          toast.success("Mật khẩu đã được đặt lại thành công");
          return response.data;
        } catch (error: unknown) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.";
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isResettingPassword: false, isLoading: false });
        }
      },

      confirmEmail: async (token: string) => {
        set({ isConfirmingEmail: true, isLoading: true });
        try {
          const response = await privateClient.get("/auth/verify-email", {
            params: { token },
          });
          toast.success(
            "Xác thực email thành công! Bạn có thể đăng nhập ngay."
          );
          return response.data;
        } catch (error: unknown) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Có lỗi xảy ra khi xác thực email. Token có thể đã hết hạn.";
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isConfirmingEmail: false, isLoading: false });
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          const currentUser = get().authUser;
          if (!currentUser?.id) {
            throw new Error("User not authenticated");
          }
          await privateClient.patch(`/users/${currentUser.id}`, {
            fullName: data.fullName,
            phone: data.phone,
          });

          const updatedUser: User = {
            ...currentUser,
            fullName: data.fullName || currentUser.fullName,
            phone: data.phone || currentUser.phone,
          };
          set({ authUser: updatedUser });
          toast.success("Cập nhật thông tin thành công");
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Cập nhật thông tin thất bại";
          toast.error(errorMessage);
          throw error;
        }
      },

      changePassword: async (oldPassword: string, newPassword: string) => {
        try {
          const currentUser = get().authUser;
          if (!currentUser?.email) {
            throw new Error("User not authenticated");
          }

          await privateClient.put("/users/change-password", {
            email: currentUser.email,
            oldPassword,
            newPassword,
          });
          toast.success("Đổi mật khẩu thành công");
        } catch (error: unknown) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Đổi mật khẩu thất bại";
          toast.error(errorMessage);
          throw error;
        }
      },

      fetchAddresses: async () => {
        try {
          const currentUser = get().authUser;
          if (!currentUser?.id) return;

          const response = await privateClient.get(
            `/addresses/user/${currentUser.id}`
          );
          const addresses = response.data?.data || response.data || [];

          const currentAddresses = currentUser.addresses || [];
          if (
            currentAddresses.length === addresses.length &&
            JSON.stringify(currentAddresses) === JSON.stringify(addresses)
          ) {
            return;
          }

          set({
            authUser: {
              ...currentUser,
              addresses,
            },
          });
        } catch (error) {
          console.error("Fetch addresses error:", error);
        }
      },

      addAddress: async (address: Omit<Address, "id" | "user_id">) => {
        try {
          const currentUser = get().authUser;
          if (!currentUser?.id) throw new Error("User not authenticated");

          const response = await privateClient.post("/addresses", {
            ...address,
            userId: currentUser.id,
          });
          const newAddress = response.data?.data || response.data;

          let updatedAddresses = [...(currentUser.addresses || []), newAddress];
          if (newAddress.isDefault) {
            updatedAddresses = updatedAddresses.map((addr) =>
              addr.id === newAddress.id ? addr : { ...addr, isDefault: false }
            );
          }

          set({
            authUser: {
              ...currentUser,
              addresses: updatedAddresses,
            },
          });
          toast.success("Thêm địa chỉ thành công");
        } catch (error) {
          toast.error("Thêm địa chỉ thất bại");
          throw error;
        }
      },

      updateAddress: async (id: number, address: Partial<Address>) => {
        try {
          const currentUser = get().authUser;
          if (!currentUser?.id) throw new Error("User not authenticated");

          const response = await privateClient.put(`/addresses/${id}`, {
            ...address,
            userId: currentUser.id,
          });
          const updatedAddress = response.data?.data || response.data;
          let updatedAddresses = currentUser.addresses?.map((addr) =>
            addr.id === id ? updatedAddress : addr
          );

          if (updatedAddress.isDefault) {
            updatedAddresses = updatedAddresses?.map((addr) =>
              addr.id === id ? addr : { ...addr, isDefault: false }
            );
          }

          set({
            authUser: {
              ...currentUser,
              addresses: updatedAddresses,
            },
          });
          toast.success("Cập nhật địa chỉ thành công");
        } catch (error) {
          toast.error("Cập nhật địa chỉ thất bại");
          throw error;
        }
      },

      deleteAddress: async (id: number) => {
        try {
          await privateClient.delete(`/addresses/${id}`);
          const currentUser = get().authUser;
          if (currentUser) {
            const updatedAddresses = currentUser.addresses?.filter(
              (addr) => addr.id !== id
            );
            set({
              authUser: {
                ...currentUser,
                addresses: updatedAddresses,
              },
            });
            toast.success("Xóa địa chỉ thành công");
          }
        } catch (error) {
          toast.error("Xóa địa chỉ thất bại");
          throw error;
        }
      },

      setDefaultAddress: async (id: number) => {
        try {
          await privateClient.put(`/addresses/${id}/default`);
          const currentUser = get().authUser;
          if (currentUser) {
            const updatedAddresses = currentUser.addresses?.map((addr) => ({
              ...addr,
              isDefault: addr.id === id,
            }));
            set({
              authUser: {
                ...currentUser,
                addresses: updatedAddresses,
              },
            });
            toast.success("Đặt địa chỉ mặc định thành công");
          }
        } catch (error) {
          toast.error("Đặt địa chỉ mặc định thất bại");
          throw error;
        }
      },

      getDefaultAddress: () => {
        const currentUser = get().authUser;
        return currentUser?.addresses?.find((addr) => addr.isDefault);
      },

      hasRole: (roleName: string) => {
        const currentUser = get().authUser;
        if (!currentUser?.roles) return false;
        return currentUser.roles.some(
          (role) => role.name?.toLowerCase() === roleName.toLowerCase()
        );
      },

      isAdmin: () => {
        return get().hasRole("ADMIN") || get().hasRole("admin");
      },

      isStaff: () => {
        return get().hasRole("STAFF") || get().hasRole("staff");
      },

      isAdminOrStaff: () => {
        return get().isAdmin() || get().isStaff();
      },

      isCustomer: () => {
        return get().hasRole("CUSTOMER") || get().hasRole("customer");
      },

      clearState: () => {
        set({ authUser: null, accessToken: null, isLoading: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        authUser: state.authUser,
        accessToken: state.accessToken,
      }),
    }
  )
);

export default useAuthStore;
