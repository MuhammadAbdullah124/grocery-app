import { create } from 'zustand';
import type { Contact } from '@/types';

interface ContactPickerState {
  selectedContact: Contact | null;
  setSelectedContact: (contact: Contact | null) => void;
}

/**
 * Ephemeral bridge used to hand a picked contact back from the standalone
 * `/contact-picker` screen to whichever screen pushed it (checkout,
 * new-purchase). Expo Router has no built-in "return a value" navigation
 * primitive, so a tiny shared store is the simplest reliable way to pass the
 * result back — same pattern as store/scannedProductStore.ts.
 */
export const useContactPickerStore = create<ContactPickerState>((set) => ({
  selectedContact: null,
  setSelectedContact: (selectedContact) => set({ selectedContact }),
}));
