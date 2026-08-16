import { config } from '@/constants/config';
import type { Purchase, PurchaseInput } from '@/types';
import { apiClient } from './client';
import * as mockPurchaseStore from '@/services/mock/purchaseStore';

export async function getPurchases(contactId?: string): Promise<Purchase[]> {
  if (config.useMockApi) return mockPurchaseStore.getPurchases(contactId);
  return apiClient.get<Purchase[]>('/purchases', { contactId });
}

export async function getPurchase(id: string): Promise<Purchase> {
  if (config.useMockApi) return mockPurchaseStore.getPurchase(id);
  return apiClient.get<Purchase>(`/purchases/${id}`);
}

export async function createPurchase(input: PurchaseInput): Promise<Purchase> {
  if (config.useMockApi) return mockPurchaseStore.createPurchase(input);
  return apiClient.post<Purchase>('/purchases', input);
}
