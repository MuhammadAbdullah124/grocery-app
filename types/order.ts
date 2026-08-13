import type { CartItem } from './cart';

export type PaymentMethod = 'counter' | 'cash' | 'card';

export type OrderStatus = 'pending' | 'verified' | 'rejected' | 'completed';

export interface OrderItem extends CartItem {
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
}
