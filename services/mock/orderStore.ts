import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Order, OrderDateRange, OrderItem, ProfitLoss, ProfitLossTotals, SalesSummary } from '@/types';
import * as ledgerTransactionStore from './ledgerTransactionStore';
import * as contactStore from './contactStore';
import * as productStore from './productStore';

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

/** Attaches the contact record for credit sales, mirroring the real API's eager-loaded `contact` relation. */
async function withContact(order: Order): Promise<Order> {
  if (!order.contactId) return order;
  try {
    return { ...order, contact: await contactStore.getContact(order.contactId) };
  } catch {
    return order;
  }
}

export async function getOrders(range?: OrderDateRange): Promise<Order[]> {
  const orders = await readOrders();
  const filtered = orders.filter((order) => {
    const dateKey = toDateKey(order.createdAt);
    if (range?.from && dateKey < range.from) return false;
    if (range?.to && dateKey > range.to) return false;
    return true;
  });
  const sorted = filtered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return Promise.all(sorted.map(withContact));
}

export async function getOrder(id: string): Promise<Order | null> {
  const orders = await readOrders();
  const order = orders.find((o) => o.id === id);
  return order ? withContact(order) : null;
}

export async function saveOrder(order: Order): Promise<Order> {
  const orders = await readOrders();
  orders.push(order);
  await writeOrders(orders);

  // Mirrors OrderController::store's credit-sale ledger creation, so mock
  // mode behaves the same as the real backend.
  if (order.paymentMethod === 'credit' && order.contactId) {
    await ledgerTransactionStore.createLinkedLedgerTransaction({
      contactId: order.contactId,
      entryType: 'you_gave',
      category: 'sale',
      amount: order.total,
      orderId: order.id,
    });
  }

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

/**
 * Mock-mode mirror of OrderController::profitLoss. Since order items in mock
 * storage don't carry a cost snapshot, cost is looked up from each product's
 * *current* purchasePrice at query time (the real backend captures it at
 * sale time instead — see order_items.cost_price).
 */
export async function getProfitLoss(): Promise<ProfitLoss> {
  const [orders, products] = await Promise.all([readOrders(), productStore.getAllProducts()]);
  const productCost = new Map(products.map((p) => [p.id, p.purchasePrice ?? null]));

  let hasIncompleteCostData = false;
  const lineCost = (item: OrderItem): number => {
    const cost = productCost.get(item.productId);
    if (cost == null) {
      hasIncompleteCostData = true;
      return 0;
    }
    return cost * item.quantity;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const totalsSince = (since: Date): ProfitLossTotals => {
    const cutoff = since.getTime();
    const matching = orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff);
    const revenue = matching.reduce((sum, o) => sum + o.total, 0);
    const cost = matching.reduce((sum, o) => sum + o.items.reduce((s, item) => s + lineCost(item), 0), 0);
    return {
      revenue,
      cost,
      profit: revenue - cost,
      marginPercent: revenue > 0 ? Math.round(((revenue - cost) / revenue) * 1000) / 10 : 0,
    };
  };

  const productTotals = new Map<string, { name: string; quantitySold: number; revenue: number; cost: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const existing = productTotals.get(item.productId) ?? { name: item.name, quantitySold: 0, revenue: 0, cost: 0 };
      existing.quantitySold += item.quantity;
      existing.revenue += item.subtotal;
      existing.cost += lineCost(item);
      productTotals.set(item.productId, existing);
    }
  }

  const topProducts = Array.from(productTotals.entries())
    .map(([productId, t]) => ({
      productId,
      name: t.name,
      quantitySold: t.quantitySold,
      revenue: t.revenue,
      cost: t.cost,
      profit: t.revenue - t.cost,
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 10);

  return {
    today: totalsSince(today),
    week: totalsSince(weekStart),
    month: totalsSince(monthStart),
    topProducts,
    hasIncompleteCostData,
  };
}
