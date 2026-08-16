import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiRequestError } from '@/types';
import type { LedgerCategory, LedgerEntryType, LedgerTransaction, LedgerTransactionInput } from '@/types';
import { generateId } from '@/utils/id';
import * as contactStore from './contactStore';

const LEDGER_KEY = 'freshcart:ledgerTransactions';

async function readTransactions(): Promise<LedgerTransaction[]> {
  const raw = await AsyncStorage.getItem(LEDGER_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LedgerTransaction[];
  } catch {
    return [];
  }
}

async function writeTransactions(transactions: LedgerTransaction[]): Promise<void> {
  await AsyncStorage.setItem(LEDGER_KEY, JSON.stringify(transactions));
}

function signedDelta(entryType: LedgerEntryType, amount: number): number {
  return entryType === 'you_gave' ? amount : -amount;
}

function assertUnlinked(transaction: LedgerTransaction, action: string): void {
  if (transaction.orderId !== null || transaction.purchaseId !== null) {
    throw new ApiRequestError(`This entry was created automatically and can't be ${action} here.`, 'LOCKED_ENTRY');
  }
}

export async function getLedgerTransactions(contactId?: string): Promise<LedgerTransaction[]> {
  const transactions = await readTransactions();
  const filtered = contactId ? transactions.filter((t) => t.contactId === contactId) : transactions;
  return [...filtered].sort((a, b) => {
    if (a.occurredAt !== b.occurredAt) return b.occurredAt.localeCompare(a.occurredAt);
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function createLedgerTransaction(input: LedgerTransactionInput): Promise<LedgerTransaction> {
  return createLinkedLedgerTransaction(input);
}

/**
 * Used both for manual entries (via createLedgerTransaction above) and by
 * orderStore/purchaseStore to create entries auto-linked to a credit
 * sale/purchase — the only legitimate way orderId/purchaseId get set.
 */
export async function createLinkedLedgerTransaction(
  input: LedgerTransactionInput & { orderId?: string; purchaseId?: string },
): Promise<LedgerTransaction> {
  const transactions = await readTransactions();
  const transaction: LedgerTransaction = {
    id: generateId('ledger'),
    contactId: input.contactId,
    entryType: input.entryType,
    amount: input.amount,
    category: input.category ?? 'other',
    note: input.note?.trim() || null,
    orderId: input.orderId ?? null,
    purchaseId: input.purchaseId ?? null,
    occurredAt: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  };
  await writeTransactions([...transactions, transaction]);
  await contactStore.adjustBalance(input.contactId, signedDelta(input.entryType, input.amount));
  return transaction;
}

export interface UpdateLedgerTransactionInput {
  entryType: LedgerEntryType;
  amount: number;
  category?: LedgerCategory;
  note?: string;
}

export async function updateLedgerTransaction(
  id: string,
  input: UpdateLedgerTransactionInput,
): Promise<LedgerTransaction> {
  const transactions = await readTransactions();
  const index = transactions.findIndex((t) => t.id === id);
  if (index === -1) throw new ApiRequestError('Entry not found', 'NOT_FOUND');

  const existing = transactions[index];
  assertUnlinked(existing, 'edited');

  const oldDelta = signedDelta(existing.entryType, existing.amount);
  const newDelta = signedDelta(input.entryType, input.amount);

  const updated: LedgerTransaction = {
    ...existing,
    entryType: input.entryType,
    amount: input.amount,
    category: input.category ?? existing.category,
    note: input.note?.trim() || null,
  };
  transactions[index] = updated;
  await writeTransactions(transactions);
  await contactStore.adjustBalance(existing.contactId, newDelta - oldDelta);
  return updated;
}

export async function deleteLedgerTransaction(id: string): Promise<void> {
  const transactions = await readTransactions();
  const transaction = transactions.find((t) => t.id === id);
  if (!transaction) return;
  assertUnlinked(transaction, 'deleted');

  await writeTransactions(transactions.filter((t) => t.id !== id));
  await contactStore.adjustBalance(transaction.contactId, -signedDelta(transaction.entryType, transaction.amount));
}
