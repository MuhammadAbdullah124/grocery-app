import { useMutation } from '@tanstack/react-query';
import { uploadsApi } from '@/services/api';
import type { UploadImageInput } from '@/services/api/uploads';

export function useUploadProductImage() {
  return useMutation({
    mutationFn: (input: UploadImageInput) => uploadsApi.uploadProductImage(input),
  });
}
