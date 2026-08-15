import type { CartItem } from './cart';

export type PaymentMethod = 'cash' | 'card';

export type OrderStatus = 'completed';

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

export interface SalesSummaryTotals {
  revenue: number;
  orders: number;
}

export interface SalesSummarySeriesPoint {
  date: string;
  revenue: number;
}

export interface SalesSummary {
  today: SalesSummaryTotals;
  week: SalesSummaryTotals;
  month: SalesSummaryTotals;
  series: SalesSummarySeriesPoint[];
}

export interface OrderDateRange {
  from?: string;
  to?: string;
}
