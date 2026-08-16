import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/services/api';
import type { ProductInput } from '@/types';

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

export function useProductsByCategory(categoryId: string | null) {
  return useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: () => productsApi.getProductsByCategory(categoryId as string),
    enabled: !!categoryId,
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

function useInvalidateProducts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['products'] });
}

export function useCreateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (input: ProductInput) => productsApi.createProduct(input),
    onSuccess: invalidate,
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) => productsApi.updateProduct(id, input),
    onSuccess: (product) => {
      queryClient.setQueryData(['product', product.id], product);
      invalidate();
    },
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: invalidate,
  });
}
