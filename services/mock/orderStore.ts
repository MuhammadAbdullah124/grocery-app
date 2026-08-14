import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Order, OrderStatus } from '@/types';

const ORDERS_KEY = 'freshcart:orders';

async function readOrders(): Promise<Order[]> {
  const raw = await AsyncStorage.getItem(ORDERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

async function writeOrders(orders: Order[]): Promise<void> {
  await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export async function getOrders(): Promise<Order[]> {
  const orders = await readOrders();
  return [...orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getOrder(id: string): Promise<Order | null> {
  const orders = await readOrders();
  return orders.find((o) => o.id === id) ?? null;
}

export async function saveOrder(order: Order): Promise<Order> {
  const orders = await readOrders();
  orders.push(order);
  await writeOrders(orders);
  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  const orders = await readOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  orders[index] = { ...orders[index], status };
  await writeOrders(orders);
  return orders[index];
}
