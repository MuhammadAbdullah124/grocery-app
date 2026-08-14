import { useMutation } from '@tanstack/react-query';
import { productsApi } from '@/services/api';

export function useBarcodeLookup() {
  return useMutation({
    mutationFn: (barcode: string) => productsApi.getProductByBarcode(barcode),
  });
}
