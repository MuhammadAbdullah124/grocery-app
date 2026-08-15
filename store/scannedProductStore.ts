import { create } from 'zustand';
import type { ScannedProductFields } from '@/utils/scannedCodeParser';

interface ScannedProductState {
  scannedProduct: ScannedProductFields | null;
  setScannedProduct: (fields: ScannedProductFields | null) => void;
}

/**
 * Ephemeral bridge used to hand scanned product data back from the standalone
 * camera capture screen to whichever form pushed it (e.g. Add/Edit Product).
 * Expo Router has no built-in "return a value" navigation primitive, so a
 * tiny shared store is the simplest reliable way to pass the result back.
 */
export const useScannedProductStore = create<ScannedProductState>((set) => ({
  scannedProduct: null,
  setScannedProduct: (fields) => set({ scannedProduct: fields }),
}));
