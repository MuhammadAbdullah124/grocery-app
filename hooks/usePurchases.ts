import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { purchasesApi } from '@/services/api';
import type { PurchaseInput } from '@/types';

export function usePurchases(contactId?: string) {
  return useQuery({
    queryKey: ['purchases', contactId ?? null],
    queryFn: () => purchasesApi.getPurchases(contactId),
  });
}

export function usePurchase(id: string | undefined) {
  return useQuery({
    queryKey: ['purchase', id],
    queryFn: () => purchasesApi.getPurchase(id as string),
    enabled: !!id,
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PurchaseInput) => purchasesApi.createPurchase(input),
    onSuccess: (purchase) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (purchase.paymentMethod === 'credit') {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        queryClient.invalidateQueries({ queryKey: ['contact', purchase.contactId] });
      }
    },
  });
}
