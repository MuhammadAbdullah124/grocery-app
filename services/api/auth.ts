import { config } from '@/constants/config';
import type { AuthCredentials, ProfileUpdatePayload, RegisterPayload, User } from '@/types';
import { apiClient } from './client';
import { setAuthToken, clearAuthToken, getAuthToken } from '@/lib/secureStore';
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
  } else {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Token may already be invalid/expired server-side — clear it locally regardless.
    }
  }
  await clearAuthToken();
}

export async function updateProfile(payload: ProfileUpdatePayload): Promise<User> {
  if (config.useMockApi) {
    return mockAuthStore.updateProfile(payload);
  }
  return apiClient.put<User>('/profile', payload);
}

export async function getSession(): Promise<AuthSession | null> {
  if (config.useMockApi) return mockAuthStore.getSession();

  const token = await getAuthToken();
  if (!token) return null;

  try {
    const user = await apiClient.get<User>('/auth/me');
    return { token, user };
  } catch {
    // The stored token is missing, expired, or revoked server-side.
    await clearAuthToken();
    return null;
  }
}
