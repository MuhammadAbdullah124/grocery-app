import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Order, OrderDateRange, SalesSummary } from '@/types';

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

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export async function getOrders(range?: OrderDateRange): Promise<Order[]> {
  const orders = await readOrders();
  const filtered = orders.filter((order) => {
    const dateKey = toDateKey(order.createdAt);
    if (range?.from && dateKey < range.from) return false;
    if (range?.to && dateKey > range.to) return false;
    return true;
  });
  return filtered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
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

/** Mirrors the backend's OrderController::summary so mock mode behaves the same. */
export async function getSalesSummary(): Promise<SalesSummary> {
  const orders = await readOrders();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalsSince = (since: Date) => {
    const cutoff = since.getTime();
    const matching = orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff);
    return {
      revenue: matching.reduce((sum, o) => sum + o.total, 0),
      orders: matching.length,
    };
  };

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const series = Array.from({ length: 14 }, (_, i) => {
    const day = new Date(today);
    day.setDate(day.getDate() - (13 - i));
    const dateKey = toDateKey(day.toISOString());
    const revenue = orders
      .filter((o) => toDateKey(o.createdAt) === dateKey)
      .reduce((sum, o) => sum + o.total, 0);
    return { date: dateKey, revenue };
  });

  return {
    today: totalsSince(today),
    week: totalsSince(weekStart),
    month: totalsSince(monthStart),
    series,
  };
}
