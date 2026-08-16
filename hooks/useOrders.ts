import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/services/api';
import type { CreateOrderInput } from '@/services/api/orders';
import type { OrderDateRange } from '@/types';

export function useOrders(range?: OrderDateRange) {
  return useQuery({
    queryKey: ['orders', range?.from ?? null, range?.to ?? null],
    queryFn: () => ordersApi.getOrders(range),
  });
}

export function useSalesSummary() {
  return useQuery({
    queryKey: ['orders', 'summary'],
    queryFn: ordersApi.getSalesSummary,
  });
}

export function useProfitLoss() {
  return useQuery({
    queryKey: ['orders', 'profit-loss'],
    queryFn: ordersApi.getProfitLoss,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrder(id as string),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => ordersApi.createOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
