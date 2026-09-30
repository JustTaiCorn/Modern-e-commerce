import axios from 'axios';

// ponytail: Tự động dùng fallback http://localhost:3000/v1 nếu chưa cấu hình biến môi trường
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ponytail: Tự động gắn Authorization Bearer token từ cookie/storage nếu có
apiClient.interceptors.request.use((config) => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(^|;)\s*access_token\s*=\s*([^;]+)/);
    const token = match ? match[2] : localStorage.getItem('access_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ponytail: Tự động bóc tách response.data.data từ TransformInterceptor của NestJS
apiClient.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      'statusCode' in response.data
    ) {
      return {
        ...response,
        data: response.data.data,
      };
    }
    return response;
  },
  (error) => Promise.reject(error),
);
