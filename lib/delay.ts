import { config } from '@/constants/config';

export function delay(ms: number = config.mockLatencyMs): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
