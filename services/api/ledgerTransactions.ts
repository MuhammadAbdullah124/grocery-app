import { config } from '@/constants/config';
import type { LedgerTransaction, LedgerTransactionInput } from '@/types';
import { apiClient } from './client';
import * as mockLedgerTransactionStore from '@/services/mock/ledgerTransactionStore';

export async function getLedgerTransactions(contactId?: string): Promise<LedgerTransaction[]> {
  if (config.useMockApi) return mockLedgerTransactionStore.getLedgerTransactions(contactId);
  return apiClient.get<LedgerTransaction[]>('/ledger-transactions', { contactId });
}

export async function createLedgerTransaction(input: LedgerTransactionInput): Promise<LedgerTransaction> {
  if (config.useMockApi) return mockLedgerTransactionStore.createLedgerTransaction(input);
  return apiClient.post<LedgerTransaction>('/ledger-transactions', input);
}

export interface UpdateLedgerTransactionInput {
  entryType: LedgerTransactionInput['entryType'];
  amount: number;
  category?: LedgerTransactionInput['category'];
  note?: string;
}

export async function updateLedgerTransaction(
  id: string,
  input: UpdateLedgerTransactionInput,
): Promise<LedgerTransaction> {
  if (config.useMockApi) return mockLedgerTransactionStore.updateLedgerTransaction(id, input);
  return apiClient.put<LedgerTransaction>(`/ledger-transactions/${id}`, input);
}

export async function deleteLedgerTransaction(id: string): Promise<void> {
  if (config.useMockApi) return mockLedgerTransactionStore.deleteLedgerTransaction(id);
  await apiClient.delete<void>(`/ledger-transactions/${id}`);
}
