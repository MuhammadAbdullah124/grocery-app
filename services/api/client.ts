import { config } from '@/constants/config';
import { ApiRequestError } from '@/types';
import { getAuthToken } from '@/lib/secureStore';

type QueryParams = Record<string, string | number | boolean | undefined>;

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: QueryParams;
  body?: unknown;
}

const REQUEST_TIMEOUT_MS = 15000;

async function request<T>(path: string, options: RequestOptions): Promise<T> {
  if (!config.apiBaseUrl) {
    throw new ApiRequestError(
      'No API base URL configured. Set EXPO_PUBLIC_API_BASE_URL to connect a backend.',
      'NO_BASE_URL',
    );
  }

  const url = new URL(path.replace(/^\//, ''), `${config.apiBaseUrl.replace(/\/?$/, '/')}`);
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }

  const token = await getAuthToken();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: options.method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'The server took too long to respond. Check your connection and try again.'
        : 'Unable to reach the server. Check your connection.';
    throw new ApiRequestError(message, 'NETWORK_ERROR');
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string };
      if (typeof body.message === 'string') message = body.message;
    } catch {
      // Response body was not JSON; fall back to the generic message.
    }
    throw new ApiRequestError(
      message,
      response.status === 404 ? 'NOT_FOUND' : response.status === 401 ? 'UNAUTHORIZED' : 'REQUEST_FAILED',
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, params?: QueryParams) => request<T>(path, { method: 'GET', params }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
