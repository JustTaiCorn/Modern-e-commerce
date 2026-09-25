// ponytail: Type definitions chuẩn PostgreSQL Prisma Schema, có optional aliases hỗ trợ chuyển đổi mượt mà
export interface ProductVariant {
  id: number;
  productId?: number;
  sku: string;
  price: number;
  countInStock: number;
}

export interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
  sortOrder?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface Review {
  id?: number;
  name?: string;
  rating: number;
  comment: string;
  user?: any;
  createdAt?: string;
}

export interface Product {
  id: number;
  _id?: string | number; // ponytail: alias tương thích cũ
  name: string;
  slug?: string;
  images: any[]; // hỗ trợ ProductImage[] hoặc string[]
  description: string;
  brand?: any; // Brand object hoặc string
  brandLogo?: string;
  category?: any; // Category object hoặc string
  price?: number;
  countInStock?: number;
  rating?: number;
  numReviews?: number;
  reviews?: Review[];
  variants?: ProductVariant[];
  minPrice?: number;
  maxPrice?: number;
  totalStock?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedProducts {
  products: Product[];
  page: number;
  pages: number;
}

export interface User {
  id: number;
  _id?: string | number; // ponytail: alias
  username: string;
  name?: string; // ponytail: alias
  email: string;
  roles: string[];
  isAdmin?: boolean; // ponytail: alias tính toán
  isVerified?: boolean;
  profile_img?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}