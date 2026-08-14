import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_STORE_ID } from '@/constants/config';

export type AppLanguage = 'en' | 'ur';

interface SettingsState {
  storeId: string;
  notificationsEnabled: boolean;
  darkModeEnabled: boolean;
  language: AppLanguage;
  setStoreId: (id: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDarkModeEnabled: (enabled: boolean) => void;
  setLanguage: (language: AppLanguage) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      storeId: DEFAULT_STORE_ID,
      notificationsEnabled: true,
      darkModeEnabled: false,
      language: 'en',
      setStoreId: (id) => set({ storeId: id }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setDarkModeEnabled: (enabled) => set({ darkModeEnabled: enabled }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'freshcart-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
