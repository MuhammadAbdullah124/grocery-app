import { config } from '@/constants/config';
import { ApiRequestError } from '@/types';
import type { CartItem, Order, OrderItem, PaymentMethod } from '@/types';
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
    status: 'pending',
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

export async function getOrders(): Promise<Order[]> {
  if (config.useMockApi) return mockOrderStore.getOrders();
  return apiClient.get<Order[]>('/orders');
}

export async function getOrder(id: string): Promise<Order> {
  if (config.useMockApi) {
    const order = await mockOrderStore.getOrder(id);
    if (!order) throw new ApiRequestError('Order not found', 'NOT_FOUND');
    return order;
  }
  return apiClient.get<Order>(`/orders/${id}`);
}

/**
 * Simulates the store staff scanning the exit QR code. A real backend would
 * make this decision; here the mock layer randomly approves most exits and
 * occasionally rejects one so all three exit-verification states are reachable.
 */
export async function verifyOrderExit(id: string): Promise<Order> {
  if (config.useMockApi) {
    const outcome = Math.random() < 0.9 ? 'verified' : 'rejected';
    const order = await mockOrderStore.updateOrderStatus(id, outcome);
    if (!order) throw new ApiRequestError('Order not found', 'NOT_FOUND');
    return order;
  }
  return apiClient.post<Order>(`/orders/${id}/verify`);
}
