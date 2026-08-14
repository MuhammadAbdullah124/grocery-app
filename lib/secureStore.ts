import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'freshcart_auth_token';

/**
 * expo-secure-store has no web implementation (its web module is an empty
 * object), so calling it on web throws. Fall back to localStorage there —
 * acceptable since web is a secondary/dev target, not the secure native target.
 */
export async function getAuthToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
  }
  return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

export async function setAuthToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

export async function clearAuthToken(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(AUTH_TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}
