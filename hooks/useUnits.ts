import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unitsApi } from '@/services/api';

export function useUnits() {
  return useQuery({
    queryKey: ['units'],
    queryFn: unitsApi.getUnits,
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => unitsApi.createUnit(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['units'] }),
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unitsApi.deleteUnit(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['units'] }),
  });
}
