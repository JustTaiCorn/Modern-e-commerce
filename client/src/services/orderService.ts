import privateClient from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  OrderItem,
  Shipment,
  OrderStatusHistory,
  CreateOrderRequest,
} from "@/types";

export type {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  OrderItem,
  Shipment,
  OrderStatusHistory,
  CreateOrderRequest,
};

export const orderService = {
  getUserOrders: async (userId: number | undefined): Promise<Order[]> => {
    if (!userId) return [];
    try {
      const response = await privateClient.get(`/orders/user/${userId}`);
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

  getAllOrders: async (): Promise<Order[]> => {
    try {
      const response = await privateClient.get("/orders");
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

  getALLOrders: async (): Promise<Order[]> => {
    return orderService.getAllOrders();
  },

  getOrderById: async (orderId: number): Promise<Order> => {
    const response = await privateClient.get(`/orders/${orderId}`);
    return response.data?.data || response.data;
  },

  createOrder: async (
    userId: number,
    request: CreateOrderRequest
  ): Promise<Order> => {
    // Try /orders then /orders/:userId
    let response;
    try {
      response = await privateClient.post("/orders", request);
    } catch {
      response = await privateClient.post(`/orders/${userId}`, request);
    }
    return response.data?.data || response.data;
  },

  cancelOrder: async (userId: number, orderId: number): Promise<void> => {
    try {
      await privateClient.patch(`/orders/${orderId}/cancel`);
    } catch {
      await privateClient.patch(`/orders/${userId}/${orderId}/cancel`);
    }
  },

  updateOrderStatus: async (
    orderId: number,
    status: OrderStatus
  ): Promise<void> => {
    await privateClient.patch(`/orders/${orderId}/status?status=${status}`);
  },
};

export const useUserOrders = (userIdOrObj?: number | { userId?: number }) => {
  const userId = typeof userIdOrObj === "object" ? userIdOrObj?.userId : userIdOrObj;
  return useQuery({
    queryKey: ["orders", "user", userId],
    queryFn: () => orderService.getUserOrders(userId),
    enabled: !!userId,
  });
};

export const useAllOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => orderService.getAllOrders(),
  });
};

export const useAllOrder = useAllOrders;

export const useOrderById = (orderId: number) => {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      request,
    }: {
      userId: number;
      request: CreateOrderRequest;
    }) => orderService.createOrder(userId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["orders", "user", variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Đặt hàng thành công!");
    },
    onError: (error) => {
      console.error("Failed to create order:", error);
      toast.error("Không thể đặt hàng. Vui lòng thử lại sau.");
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: any) => {
      const userId = args?.userId ?? (Array.isArray(args) ? args[0] : undefined);
      const orderId = args?.orderId ?? (Array.isArray(args) ? args[1] : undefined);
      return orderService.cancelOrder(userId, orderId);
    },
    onSuccess: (_, variables: any) => {
      const userId = variables?.userId ?? (Array.isArray(variables) ? variables[0] : undefined);
      const orderId = variables?.orderId ?? (Array.isArray(variables) ? variables[1] : undefined);
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ["orders", "user", userId],
        });
      }
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
      }
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Đã hủy đơn hàng thành công!");
    },
    onError: (error) => {
      console.error("Failed to cancel order:", error);
      toast.error("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: number;
      status: OrderStatus;
    }) => orderService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Cập nhật trạng thái đơn hàng thành công");
    },
    onError: (error) => {
      console.error("Failed to update order status:", error);
      toast.error(
        "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau."
      );
    },
  });
};

export default orderService;
