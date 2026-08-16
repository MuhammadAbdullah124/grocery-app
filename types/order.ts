import type { CartItem } from './cart';
import type { Contact } from './contact';

export type PaymentMethod = 'cash' | 'card' | 'credit';

export type OrderStatus = 'completed';

export interface OrderItem extends CartItem {
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  /** Set when paymentMethod is 'credit' — the customer this sale is owed by. */
  contactId: string | null;
  contact?: Contact;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived: number | null;
  changeDue: number | null;
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
