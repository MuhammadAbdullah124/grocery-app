import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_STORE_ID } from '@/constants/config';

interface SettingsState {
  storeId: string;
  notificationsEnabled: boolean;
  darkModeEnabled: boolean;
  setStoreId: (id: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDarkModeEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      storeId: DEFAULT_STORE_ID,
      notificationsEnabled: true,
      darkModeEnabled: false,
      setStoreId: (id) => set({ storeId: id }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setDarkModeEnabled: (enabled) => set({ darkModeEnabled: enabled }),
    }),
    {
      name: 'freshcart-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
