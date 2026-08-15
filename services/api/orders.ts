import { config } from '@/constants/config';
import { ApiRequestError } from '@/types';
import type { CartItem, Order, OrderDateRange, OrderItem, PaymentMethod, SalesSummary } from '@/types';
import { apiClient } from './client';
import * as mockOrderStore from '@/services/mock/orderStore';
import { generateId, generateOrderNumber } from '@/utils/id';

export interface CreateOrderInput {
  storeId: string;
  storeName: string;
  items: CartItem[];
  paymentMethod: PaymentMethod;
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

  return {
    id: generateId('order'),
    orderNumber: generateOrderNumber(),
    storeId: input.storeId,
    storeName: input.storeName,
    items,
    subtotal,
    discount,
    total: subtotal - discount,
    paymentMethod: input.paymentMethod,
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
