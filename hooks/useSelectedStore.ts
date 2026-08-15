import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useStores } from './useStores';
import type { Store } from '@/types';

interface UseSelectedStoreResult {
  store: Store | undefined;
  stores: Store[] | undefined;
  isLoading: boolean;
}

/**
 * Resolves the store the current sale should be attributed to. The locally
 * persisted storeId may not match any store the data source actually has
 * (e.g. it was set against mock data, or the store was removed) — in that
 * case this falls back to the first available store and persists the
 * correction so every screen stays in sync.
 */
export function useSelectedStore(): UseSelectedStoreResult {
  const storesQuery = useStores();
  const storeId = useSettingsStore((state) => state.storeId);
  const setStoreId = useSettingsStore((state) => state.setStoreId);

  const stores = storesQuery.data;
  const store = stores?.find((s) => s.id === storeId) ?? stores?.[0];

  useEffect(() => {
    if (store && store.id !== storeId) {
      setStoreId(store.id);
    }
  }, [store, storeId, setStoreId]);

  return { store, stores, isLoading: storesQuery.isLoading };
}
