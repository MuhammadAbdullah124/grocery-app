import { config } from '@/constants/config';
import type { Unit } from '@/types';
import { apiClient } from './client';
import * as mockUnitStore from '@/services/mock/unitStore';

export async function getUnits(): Promise<Unit[]> {
  if (config.useMockApi) return mockUnitStore.getUnits();
  return apiClient.get<Unit[]>('/units');
}

export async function createUnit(name: string): Promise<Unit> {
  if (config.useMockApi) return mockUnitStore.createUnit(name);
  return apiClient.post<Unit>('/units', { name });
}

export async function deleteUnit(id: string): Promise<void> {
  if (config.useMockApi) return mockUnitStore.deleteUnit(id);
  await apiClient.delete<void>(`/units/${id}`);
}
