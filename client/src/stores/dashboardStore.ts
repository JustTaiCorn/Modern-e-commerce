import { create } from "zustand";
import privateClient from "@/lib/axios";
import { Role, User, Order } from "@/types";
import { compareDesc, format, subMonths } from "date-fns";

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
}

export interface RecentOrder {
  id: number;
  code: string;
  customerName: string;
  customerEmail: string;
  products: number;
  total: number;
  discountedTotal: number;
  status: string;
  createdAt: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
}

interface DashboardState {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  revenueData: RevenueData[];
  isLoading: boolean;
  error: string | null;

  fetchDashboardStats: () => Promise<void>;
  fetchRecentOrders: () => Promise<void>;
  fetchRevenueData: () => Promise<void>;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    productsGrowth: 0,
  },
  recentOrders: [],
  revenueData: [],
  isLoading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        privateClient.get("/orders").catch(() => ({ data: [] })),
        privateClient.get("/users").catch(() => ({ data: [] })),
        privateClient.get("/products").catch(() => ({ data: [] })),
      ]);

      const orders = ordersRes.data?.data || ordersRes.data || [];
      const users = usersRes.data?.data || usersRes.data || [];
      const products = productsRes.data?.data || productsRes.data || [];

      const deliveredOrders = Array.isArray(orders)
        ? orders.filter((order: any) => order.status === "DELIVERED" || order.status === "PAID")
        : [];

      const totalRevenue = deliveredOrders.reduce(
        (sum: number, order: any) => sum + Number(order.grandTotal || order.totalPrice || 0),
        0
      );

      const totalCustomers = Array.isArray(users)
        ? users.filter((user: any) =>
            user.roles?.some(
              (role: any) =>
                role.name?.toUpperCase() === "CUSTOMER" ||
                role.role?.name?.toUpperCase() === "CUSTOMER"
            )
          ).length
        : 0;

      const stats: DashboardStats = {
        totalRevenue,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        totalCustomers,
        totalProducts: Array.isArray(products) ? products.length : 0,
        revenueGrowth: 12.5,
        ordersGrowth: 8.2,
        customersGrowth: 15.3,
        productsGrowth: 4.1,
      };

      set({ stats, isLoading: false });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      set({ isLoading: false });
    }
  },

  fetchRecentOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await privateClient.get("/orders");
      const orders = response.data?.data || response.data || [];

      if (!Array.isArray(orders)) {
        set({ recentOrders: [], isLoading: false });
        return;
      }

      const recentOrders: RecentOrder[] = orders
        .sort((a: any, b: any) =>
          compareDesc(
            new Date(a.createdAt || a.placedAt || Date.now()),
            new Date(b.createdAt || b.placedAt || Date.now())
          )
        )
        .slice(0, 5)
        .map((order: any) => ({
          id: order.id,
          code: order.code || `ORD-${order.id}`,
          customerName: order.user?.fullName || order.user?.username || "Khách hàng",
          customerEmail: order.user?.email || "N/A",
          products: order.totalItems || order.items?.length || 0,
          total: Number(order.subtotal || order.itemsPrice || 0),
          discountedTotal: Number(order.grandTotal || order.totalPrice || 0),
          status: order.status || "PENDING",
          createdAt: order.createdAt || order.placedAt || new Date().toISOString(),
        }));

      set({ recentOrders, isLoading: false });
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      set({ recentOrders: [], isLoading: false });
    }
  },

  fetchRevenueData: async () => {
    try {
      const response = await privateClient.get("/orders").catch(() => ({ data: [] }));
      const orders = response.data?.data || response.data || [];

      const deliveredOrders = Array.isArray(orders)
        ? orders.filter((order: any) => order.status === "DELIVERED" || order.status === "PAID")
        : [];

      const monthlyRevenue = new Map<string, number>();

      deliveredOrders.forEach((order: any) => {
        const orderDate = order.createdAt || order.placedAt;
        const total = Number(order.grandTotal || order.totalPrice || 0);
        if (orderDate && total) {
          const date = new Date(orderDate);
          const monthKey = format(date, "yyyy-MM-01");
          const current = monthlyRevenue.get(monthKey) || 0;
          monthlyRevenue.set(monthKey, current + total);
        }
      });

      const revenueData: RevenueData[] = [];
      const today = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = subMonths(today, i);
        const monthKey = format(date, "yyyy-MM-01");

        revenueData.push({
          date: monthKey,
          revenue: monthlyRevenue.get(monthKey) || 0,
        });
      }

      set({ revenueData });
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      set({ error: "Failed to fetch revenue data" });
    }
  },

  clearError: () => set({ error: null }),
}));
