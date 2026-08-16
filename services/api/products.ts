import { config } from '@/constants/config';
import type { Product, ProductInput } from '@/types';
import { apiClient } from './client';
import * as mockProductService from '@/services/mock/productService';

export async function getProducts(): Promise<Product[]> {
  if (config.useMockApi) return mockProductService.getProducts();
  return apiClient.get<Product[]>('/products');
}

export async function getProduct(id: string): Promise<Product> {
  if (config.useMockApi) return mockProductService.getProduct(id);
  return apiClient.get<Product>(`/products/${id}`);
}

export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  if (config.useMockApi) return mockProductService.getProductByBarcode(barcode);
  return apiClient.get<Product | null>(`/products/barcode/${barcode}`);
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (config.useMockApi) return mockProductService.searchProducts(query);
  return apiClient.get<Product[]>('/products/search', { q: query });
}

export async function getDeals(): Promise<Product[]> {
  if (config.useMockApi) return mockProductService.getDeals();
  return apiClient.get<Product[]>('/products/deals');
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  if (config.useMockApi) return mockProductService.getProductsByCategory(categoryId);
  return apiClient.get<Product[]>('/products', { categoryId });
}

export async function createProduct(input: ProductInput): Promise<Product> {
  if (config.useMockApi) return mockProductService.createProduct(input);
  return apiClient.post<Product>('/products', input);
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  if (config.useMockApi) return mockProductService.updateProduct(id, input);
  return apiClient.put<Product>(`/products/${id}`, input);
}

export async function deleteProduct(id: string): Promise<void> {
  if (config.useMockApi) return mockProductService.deleteProduct(id);
  await apiClient.delete<void>(`/products/${id}`);
}
