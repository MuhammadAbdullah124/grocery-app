import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/services/api';
import type { ProductCategory } from '@/types';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getProducts,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProduct(id as string),
    enabled: !!id,
  });
}

export function useDeals() {
  return useQuery({
    queryKey: ['products', 'deals'],
    queryFn: productsApi.getDeals,
  });
}

export function useProductsByCategory(category: ProductCategory | null) {
  return useQuery({
    queryKey: ['products', 'category', category],
    queryFn: () => productsApi.getProductsByCategory(category as ProductCategory),
    enabled: !!category,
  });
}

export function useSearchProducts(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ['products', 'search', trimmed],
    queryFn: () => productsApi.searchProducts(trimmed),
    enabled: trimmed.length > 0,
  });
}
