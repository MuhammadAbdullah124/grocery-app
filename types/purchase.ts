import type { Contact } from './contact';

export type PurchasePaymentMethod = 'cash' | 'card' | 'credit';

export type PurchaseStatus = 'completed';

export interface PurchaseItem {
  /** Null for an ad-hoc line item not yet in the product catalog. */
  productId: string | null;
  barcode: string | null;
  name: string;
  brand: string | null;
  image: string | null;
  unit: string;
  costPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  contactId: string;
  contact?: Contact;
  items: PurchaseItem[];
  subtotal: number;
  total: number;
  paymentMethod: PurchasePaymentMethod;
  status: PurchaseStatus;
  notes: string | null;
  createdAt: string;
}

export interface PurchaseItemInput {
  productId?: string;
  name: string;
  unit: string;
  costPrice: number;
  quantity: number;
}

export interface PurchaseInput {
  contactId: string;
  paymentMethod: PurchasePaymentMethod;
  notes?: string;
  items: PurchaseItemInput[];
}
