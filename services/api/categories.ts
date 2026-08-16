import { config } from '@/constants/config';
import type { Category } from '@/types';
import { apiClient } from './client';
import * as mockCategoryStore from '@/services/mock/categoryStore';

export async function getCategories(): Promise<Category[]> {
  if (config.useMockApi) return mockCategoryStore.getCategories();
  return apiClient.get<Category[]>('/categories');
}

export async function createCategory(name: string): Promise<Category> {
  if (config.useMockApi) return mockCategoryStore.createCategory(name);
  return apiClient.post<Category>('/categories', { name });
}

export async function deleteCategory(id: string): Promise<void> {
  if (config.useMockApi) return mockCategoryStore.deleteCategory(id);
  await apiClient.delete<void>(`/categories/${id}`);
}
