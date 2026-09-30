import { ShippingDetails, PaymentResult } from './shipping';
import { User } from '.';

export interface OrderItem {
  id?: number;
  name: string;
  qty: number;
  image?: string;
  price: number;
  productId?: string | number;
  variantId?: number;
}

export interface Order {
  id: number;
  _id?: string | number; // ponytail: alias
  invoiceNumber?: string;
  status?: string;
  user: User;
  orderItems: OrderItem[];
  shippingAddress?: any;
  shippingDetails?: ShippingDetails;
  paymentMethod: string;
  paymentResult?: PaymentResult;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered?: boolean;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}
