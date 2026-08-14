import { config } from '@/constants/config';
import type { AuthCredentials, RegisterPayload, User } from '@/types';
import { apiClient } from './client';
import { setAuthToken, clearAuthToken } from '@/lib/secureStore';
import * as mockAuthStore from '@/services/mock/authStore';

export interface AuthSession {
  token: string;
  user: User;
}

export async function login(credentials: AuthCredentials): Promise<AuthSession> {
  if (config.useMockApi) {
    const session = await mockAuthStore.login(credentials);
    await setAuthToken(session.token);
    return session;
  }
  const session = await apiClient.post<AuthSession>('/auth/login', credentials);
  await setAuthToken(session.token);
  return session;
}

export async function register(payload: RegisterPayload): Promise<AuthSession> {
  if (config.useMockApi) {
    const session = await mockAuthStore.register(payload);
    await setAuthToken(session.token);
    return session;
  }
  const session = await apiClient.post<AuthSession>('/auth/register', payload);
  await setAuthToken(session.token);
  return session;
}

export async function logout(): Promise<void> {
  if (config.useMockApi) {
    await mockAuthStore.logout();
  }
  await clearAuthToken();
}

export async function getSession(): Promise<AuthSession | null> {
  if (config.useMockApi) return mockAuthStore.getSession();
  return apiClient.get<AuthSession | null>('/auth/me');
}
