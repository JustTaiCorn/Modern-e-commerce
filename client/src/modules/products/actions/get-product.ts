'use server';

import { fetchWithAuth } from '@/lib/fetch-with-auth';
import type { Product } from '@apps/shared/types';

export async function getProduct(id: string | number): Promise<Product | null> {
  try {
    const response = await fetchWithAuth(`/products/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    const json = await response.json();
    // ponytail: bóc tách wrapper data của NestJS nếu có
    const payload =
      json && typeof json === 'object' && 'data' in json ? json.data : json;

    return payload as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}
