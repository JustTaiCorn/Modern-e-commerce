'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userQueryConfig } from '../user-config';

export function useUser() {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    ...userQueryConfig,
    placeholderData: () => queryClient.getQueryData(['user']),
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    // ponytail: Thêm isAdmin helper tiện lợi
    isAdmin: user?.roles?.includes('ADMIN') ?? false,
    error,
  };
}
