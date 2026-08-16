import { config } from '@/constants/config';
import { delay } from '@/lib/delay';
import { apiClient } from './client';

export interface UploadImageInput {
  uri: string;
  fileName?: string;
  mimeType?: string;
}

export async function uploadProductImage(input: UploadImageInput): Promise<string> {
  if (config.useMockApi) {
    // No backend to upload to in mock mode — the local file URI previews
    // and persists fine on-device for testing.
    await delay();
    return input.uri;
  }

  const formData = new FormData();
  // React Native's FormData accepts this { uri, name, type } shape in place
  // of a real Blob for file uploads — this is the standard RN pattern.
  formData.append('image', {
    uri: input.uri,
    name: input.fileName ?? 'photo.jpg',
    type: input.mimeType ?? 'image/jpeg',
  } as unknown as Blob);

  const response = await apiClient.upload<{ url: string }>('/uploads/product-image', formData);
  return response.url;
}
