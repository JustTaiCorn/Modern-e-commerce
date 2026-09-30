import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import privateClient from "@/lib/axios";
import { Role, User } from "@/types";
import { toast } from "sonner";
import { AxiosError } from "axios";

export interface CreateStaffData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: "STAFF";
  isActive?: boolean;
}

export const usersService = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await privateClient.get("/users");
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  getUserById: async (userId: number): Promise<User> => {
    const response = await privateClient.get(`/users/${userId}`);
    return response.data?.data || response.data;
  },

  lockUser: async (userId: number) => {
    await privateClient.put(`/users/${userId}/lock`);
  },

  unlockUser: async (userId: number) => {
    await privateClient.put(`/users/${userId}/unlock`);
  },

  deleteUser: async (userId: number) => {
    await privateClient.delete(`/users/${userId}`);
  },

  updateUser: async (userId: number, userData: Partial<User>) => {
    try {
      await privateClient.patch(`/users/${userId}`, {
        fullName: userData.fullName,
        phone: userData.phone,
      });
    } catch {
      await privateClient.put(`/users/change/${userId}`, {
        fullName: userData.fullName,
        phone: userData.phone,
      });
    }
  },

  assignRole: async (id: number, role: Role) => {
    await privateClient.put(`/users/${id}/roles`, {
      id: role.id,
      name: role.name.toUpperCase(),
    });
  },

  createStaff: async (staffData: CreateStaffData) => {
    const response = await privateClient.post("/users/create", {
      email: staffData.email,
      password: staffData.password,
      fullName: staffData.fullName,
      phone: staffData.phone,
      roleIds: [1],
    });
    return response.data?.data || response.data;
  },
};

export const useAllUsers = () => {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => usersService.getAllUsers(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserById = (userId: number) => {
  return useQuery<User>({
    queryKey: ["user", userId],
    queryFn: () => usersService.getUserById(userId),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const users = queryClient.getQueryData<User[]>(["users"]) || [];
      const currentUser = users.find((user) => user.id === userId);

      if (!currentUser) {
        throw new Error("Không tìm thấy người dùng");
      }

      if (currentUser.isActive) {
        await usersService.lockUser(userId);
      } else {
        await usersService.unlockUser(userId);
      }

      return { userId, wasActive: currentUser.isActive };
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi thay đổi trạng thái";
      toast.error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Đã thay đổi trạng thái tài khoản thành công");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      await usersService.deleteUser(userId);
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Xóa tài khoản thành công!");
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi xóa tài khoản";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      userData,
    }: {
      userId: number;
      userData: Partial<User>;
    }) => {
      await usersService.updateUser(userId, userData);
      return { userId, userData };
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi cập nhật tài khoản";
      toast.error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Cập nhật tài khoản thành công!");
    },
  });
};

export const useAssignRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: Role }) => {
      await usersService.assignRole(userId, role);
      return { userId, role };
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi gán vai trò";
      toast.error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Gán vai trò thành công!");
    },
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staffData: CreateStaffData) => {
      const response = await usersService.createStaff(staffData);
      return response;
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi tạo tài khoản";
      toast.error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Tạo tài khoản nhân viên thành công!");
    },
  });
};

export default usersService;
