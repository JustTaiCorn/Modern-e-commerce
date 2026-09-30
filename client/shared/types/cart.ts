// ponytail: Cấu trúc CartItem hỗ trợ variantId chuẩn theo backend và alias cho productId
export interface CartItem {
  id?: number;
  cartId?: number;
  variantId?: number;
  productId: string | number;
  name: string;
  image: string;
  price: number;
  countInStock: number;
  qty: number;
  sku?: string;
  variant?: any;
}
