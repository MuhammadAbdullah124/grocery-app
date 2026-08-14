import { config } from '@/constants/config';
import { delay } from '@/lib/delay';
import type { Store } from '@/types';
import { apiClient } from './client';
import { MOCK_STORES } from '@/services/mock/stores.data';

export async function getStores(): Promise<Store[]> {
  if (config.useMockApi) {
    await delay();
    return MOCK_STORES;
  }
  return apiClient.get<Store[]>('/stores');
}

export async function getStore(id: string): Promise<Store | null> {
  if (config.useMockApi) {
    await delay();
    return MOCK_STORES.find((s) => s.id === id) ?? null;
  }
  return apiClient.get<Store | null>(`/stores/${id}`);
}
