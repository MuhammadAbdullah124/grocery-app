export const APP_NAME = 'FreshCart';

export const APP_DESCRIPTION =
  'Scan, bag, and go. Skip the checkout line with self-checkout scanning.';

export const CURRENCY_SYMBOL = 'Rs.';

export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
  useMockApi: process.env.EXPO_PUBLIC_USE_MOCK_API !== 'false',
  mockLatencyMs: Number(process.env.EXPO_PUBLIC_MOCK_LATENCY_MS ?? 400),
} as const;

export const DEFAULT_STORE_ID = 'store-1';
