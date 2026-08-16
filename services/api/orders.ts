import { config } from '@/constants/config';
import { ApiRequestError } from '@/types';
import type { CartItem, Order, OrderDateRange, OrderItem, PaymentMethod, ProfitLoss, SalesSummary } from '@/types';
import { apiClient } from './client';
import * as mockOrderStore from '@/services/mock/orderStore';
import { generateId, generateOrderNumber } from '@/utils/id';

export interface CreateOrderInput {
  storeId: string;
  storeName: string;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  /** Required when paymentMethod is 'cash' — must cover the total. */
  cashReceived?: number;
  /** Required when paymentMethod is 'credit' — who the sale is owed by. */
  contactId?: string;
}

/**
 * Totals are recalculated here from the item price data rather than trusted
 * from client state. A real Laravel backend must repeat this recalculation
 * server-side — the mobile app is never authoritative for order totals.
 */
function buildOrderFromItems(input: CreateOrderInput): Order {
  const items: OrderItem[] = input.items.map((item) => ({
    ...item,
    subtotal: (item.discountPrice ?? item.price) * item.quantity,
  }));
  const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = input.items.reduce(
    (sum, item) => sum + (item.discountPrice !== null ? (item.price - item.discountPrice) * item.quantity : 0),
    0,
  );
  const total = subtotal - discount;
  const isCash = input.paymentMethod === 'cash';
  const cashReceived = isCash ? Math.max(input.cashReceived ?? 0, total) : null;

  return {
    id: generateId('order'),
    orderNumber: generateOrderNumber(),
    storeId: input.storeId,
    storeName: input.storeName,
    contactId: input.paymentMethod === 'credit' ? (input.contactId ?? null) : null,
    items,
    subtotal,
    discount,
    total,
    paymentMethod: input.paymentMethod,
    cashReceived,
    changeDue: cashReceived !== null ? cashReceived - total : null,
    status: 'completed',
    createdAt: new Date().toISOString(),
  };
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (config.useMockApi) {
    const order = buildOrderFromItems(input);
    return mockOrderStore.saveOrder(order);
  }
  return apiClient.post<Order>('/orders', input);
}

export async function getOrders(range?: OrderDateRange): Promise<Order[]> {
  if (config.useMockApi) return mockOrderStore.getOrders(range);
  return apiClient.get<Order[]>('/orders', { from: range?.from, to: range?.to });
}

export async function getOrder(id: string): Promise<Order> {
  if (config.useMockApi) {
    const order = await mockOrderStore.getOrder(id);
    if (!order) throw new ApiRequestError('Order not found', 'NOT_FOUND');
    return order;
  }
  return apiClient.get<Order>(`/orders/${id}`);
}

export async function getSalesSummary(): Promise<SalesSummary> {
  if (config.useMockApi) return mockOrderStore.getSalesSummary();
  return apiClient.get<SalesSummary>('/orders/summary');
}

export async function getProfitLoss(): Promise<ProfitLoss> {
  if (config.useMockApi) return mockOrderStore.getProfitLoss();
  return apiClient.get<ProfitLoss>('/orders/profit-loss');
}
