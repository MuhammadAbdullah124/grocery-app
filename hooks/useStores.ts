import { useQuery } from '@tanstack/react-query';
import { storesApi } from '@/services/api';

export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: storesApi.getStores,
  });
}

export function useStore(id: string | undefined) {
  return useQuery({
    queryKey: ['store', id],
    queryFn: () => storesApi.getStore(id as string),
    enabled: !!id,
  });
}
