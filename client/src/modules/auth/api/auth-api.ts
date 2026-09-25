import { apiClient } from '@/lib/api-client';
import type { User } from '@apps/shared/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export const authApi = {
  // ponytail: Login lấy accessToken, lưu cookie và tự động lấy user profile từ /auth/me
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<{ accessToken: string }>(
      '/auth/login',
      credentials,
    );
    const accessToken = response.data.accessToken;

    if (typeof document !== 'undefined') {
      document.cookie = `access_token=${accessToken}; path=/; SameSite=Lax`;
      localStorage.setItem('access_token', accessToken);
    }

    const userRes = await apiClient.get<User>('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = userRes.data;

    return {
      user: {
        ...user,
        name: user.username,
        isAdmin: user.roles?.includes('ADMIN') ?? false,
      },
      accessToken,
    };
  },

  register: async (data: {
    email: string;
    password: string;
    username?: string;
    name?: string;
  }): Promise<AuthResponse> => {
    const username = data.username || data.name || data.email.split('@')[0];
    await apiClient.post('/auth/register', {
      username,
      email: data.email,
      password: data.password,
    });
    return authApi.login({ email: data.email, password: data.password });
  },

  getProfile: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get<User>('/auth/me');
      const user = response.data;
      if (!user) return null;
      return {
        ...user,
        name: user.username,
        isAdmin: user.roles?.includes('ADMIN') ?? false,
      };
    } catch {
      return null;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      if (typeof document !== 'undefined') {
        document.cookie =
          'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        localStorage.removeItem('access_token');
      }
    }
  },
};
