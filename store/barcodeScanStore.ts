import { create } from 'zustand';

interface BarcodeScanState {
  scannedBarcode: string | null;
  setScannedBarcode: (barcode: string | null) => void;
}

/**
 * Ephemeral bridge used to hand a scanned barcode back from the standalone
 * camera capture screen to whichever form pushed it (e.g. Add/Edit Product).
 * Expo Router has no built-in "return a value" navigation primitive, so a
 * tiny shared store is the simplest reliable way to pass the result back.
 */
export const useBarcodeScanStore = create<BarcodeScanState>((set) => ({
  scannedBarcode: null,
  setScannedBarcode: (barcode) => set({ scannedBarcode: barcode }),
}));
