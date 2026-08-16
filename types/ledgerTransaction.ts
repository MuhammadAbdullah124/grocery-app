/**
 * The universal Khata "You Gave / You Got" model. you_gave = value the shop
 * gave the contact (always +amount to their balance — a credit sale to a
 * customer, or paying a supplier back, both correctly increase it). you_got =
 * value the shop received from the contact (always -amount — a customer's
 * repayment, or buying on credit from a supplier, both correctly decrease it).
 */
export type LedgerEntryType = 'you_gave' | 'you_got';

export type LedgerCategory = 'sale' | 'purchase' | 'payment' | 'other';

export interface LedgerTransaction {
  id: string;
  contactId: string;
  entryType: LedgerEntryType;
  amount: number;
  category: LedgerCategory;
  note: string | null;
  /** Set when this entry was auto-created by a credit sale — locked from edit/delete. */
  orderId: string | null;
  /** Set when this entry was auto-created by a credit purchase — locked from edit/delete. */
  purchaseId: string | null;
  occurredAt: string;
  createdAt: string;
}

export interface LedgerTransactionInput {
  contactId: string;
  entryType: LedgerEntryType;
  amount: number;
  category?: LedgerCategory;
  note?: string;
}
