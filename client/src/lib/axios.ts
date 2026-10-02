import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000/v1"
    : "/v1");

const privateClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: Thêm access token vào header
privateClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          const accessToken = state?.accessToken;

          if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
        } catch (error) {
          console.error("Error parsing auth storage:", error);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Xử lý 401 và refresh token
privateClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const path = window.location.pathname;
    const isAuthPage =
      path.startsWith("/user/login") ||
      path.startsWith("/user/signup") ||
      path.startsWith("/user/forgot-password") ||
      path.startsWith("/user/reset-password") ||
      path.startsWith("/login");

    const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh");

    if (isAuthPage || isRefreshEndpoint) {
      localStorage.removeItem("auth-storage");
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const response = await privateClient.post("/auth/refresh");

      const resData = response.data?.data || response.data;
      const newAccessToken = resData?.accesstoken || resData?.accessToken;

      if (!newAccessToken) {
        throw new Error("No token returned");
      }

      // 1. Cập nhật localStorage để persist đúng
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        if (parsed.state) {
          parsed.state.accessToken = newAccessToken;
          localStorage.setItem("auth-storage", JSON.stringify(parsed));
        }
      }

      // 2. Sync token mới vào Zustand store (tránh circular import bằng dynamic import)
      try {
        const { default: useAuthStore } = await import("@/stores/useAuthStore");
        useAuthStore.getState().setAccessToken(newAccessToken);

        // 3. Fetch lại user profile với token mới
        const meRes = await privateClient.get("/auth/me", {
          headers: { Authorization: `Bearer ${newAccessToken}` },
        });
        const rawUser = meRes.data?.data || meRes.data;
        if (rawUser) {
          useAuthStore.setState({ authUser: rawUser });
        }
      } catch (storeError) {
        console.warn("Could not sync auth store after refresh:", storeError);
      }

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }
      return privateClient(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("auth-storage");
      const redirectPath = path.startsWith("/admin") ? "/login" : "/user/login";
      window.location.replace(redirectPath);
      return Promise.reject(refreshError);
    }
  }
);

export default privateClient;
