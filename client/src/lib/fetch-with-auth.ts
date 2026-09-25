'use server';

import { getAccessToken } from '@/modules/auth/api/get-access-token';

interface FetchWithAuthConfig extends RequestInit {
  revalidatePaths?: string[];
}

export async function fetchWithAuth(
  url: string,
  config: FetchWithAuthConfig = {},
) {
  const { revalidatePaths, headers, ...rest } = config;
  const accessToken = await getAccessToken();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
  const fullUrl = url.startsWith('http')
    ? url
    : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;

  // ponytail: Gửi đúng chuẩn Authorization Bearer token của NestJS
  const response = await fetch(fullUrl, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }

  return response;
}
