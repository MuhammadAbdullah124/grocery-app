import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiRequestError } from '@/types';
import type { Purchase, PurchaseInput, PurchaseItem } from '@/types';
import { generateId, generateOrderNumber } from '@/utils/id';
import * as productStore from './productStore';
import * as ledgerTransactionStore from './ledgerTransactionStore';
import * as contactStore from './contactStore';

const PURCHASES_KEY = 'freshcart:purchases';

async function readPurchases(): Promise<Purchase[]> {
  const raw = await AsyncStorage.getItem(PURCHASES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Purchase[];
  } catch {
    return [];
  }
}

async function writePurchases(purchases: Purchase[]): Promise<void> {
  await AsyncStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
}

/** Attaches the contact record so list/detail screens can show the supplier's name, mirroring the real API's eager-loaded `contact` relation. */
async function withContact(purchase: Purchase): Promise<Purchase> {
  try {
    return { ...purchase, contact: await contactStore.getContact(purchase.contactId) };
  } catch {
    return purchase;
  }
}

export async function getPurchases(contactId?: string): Promise<Purchase[]> {
  const purchases = await readPurchases();
  const filtered = contactId ? purchases.filter((p) => p.contactId === contactId) : purchases;
  const sorted = [...filtered].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return Promise.all(sorted.map(withContact));
}

export async function getPurchase(id: string): Promise<Purchase> {
  const purchases = await readPurchases();
  const purchase = purchases.find((p) => p.id === id);
  if (!purchase) throw new ApiRequestError('Purchase not found', 'NOT_FOUND');
  return withContact(purchase);
}

/**
 * Mirrors PurchaseController::store: for each line item with a productId,
 * restocks that product (decision: purchases auto-restock inventory), then
 * — only for payment method 'credit' — creates the linked 'you_got'/'purchase'
 * ledger entry so the supplier's balance reflects what's now owed.
 */
export async function createPurchase(input: PurchaseInput): Promise<Purchase> {
  const products = await productStore.getAllProducts();

  const items: PurchaseItem[] = [];
  for (const line of input.items) {
    const product = line.productId ? (products.find((p) => p.id === line.productId) ?? null) : null;

    if (product) {
      await productStore.incrementStock(product.id, line.quantity);
    }

    items.push({
      productId: product?.id ?? null,
      barcode: product?.barcode ?? null,
      name: product?.name ?? line.name,
      brand: product?.brand ?? null,
      image: product?.image ?? null,
      unit: product?.unit ?? line.unit,
      costPrice: line.costPrice,
      quantity: line.quantity,
      subtotal: line.costPrice * line.quantity,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  const purchase: Purchase = {
    id: generateId('purchase'),
    purchaseNumber: generateOrderNumber().replace('ORDER-', 'PURCHASE-'),
    contactId: input.contactId,
    items,
    subtotal,
    total: subtotal,
    paymentMethod: input.paymentMethod,
    status: 'completed',
    notes: input.notes?.trim() || null,
    createdAt: new Date().toISOString(),
  };

  const purchases = await readPurchases();
  await writePurchases([...purchases, purchase]);

  if (input.paymentMethod === 'credit') {
    await ledgerTransactionStore.createLinkedLedgerTransaction({
      contactId: input.contactId,
      entryType: 'you_got',
      category: 'purchase',
      amount: purchase.total,
      purchaseId: purchase.id,
    });
  }

  return purchase;
}
