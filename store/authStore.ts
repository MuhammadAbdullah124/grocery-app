import { create } from 'zustand';
import type { AuthCredentials, RegisterPayload, User } from '@/types';
import { ApiRequestError } from '@/types';
import { authApi } from '@/services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  error: string | null;
  login: (credentials: AuthCredentials) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

function messageFor(error: unknown): string {
  return error instanceof ApiRequestError ? error.message : 'Something went wrong. Please try again.';
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  hasHydrated: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const session = await authApi.login(credentials);
      set({ user: session.user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({ isLoading: false, error: messageFor(error) });
      return false;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const session = await authApi.register(payload);
      set({ user: session.user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({ isLoading: false, error: messageFor(error) });
      return false;
    }
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    try {
      const session = await authApi.getSession();
      if (session) {
        set({ user: session.user, isAuthenticated: true });
      }
    } finally {
      set({ hasHydrated: true });
    }
  },

  clearError: () => set({ error: null }),
}));
