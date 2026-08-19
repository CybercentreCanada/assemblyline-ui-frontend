import { DEFAULT_APP_PREFERENCE_STORE } from 'app/core.preference';
import { loadPreferenceFromLocalStorage, savePreferenceToLocalStorage } from 'core/preference';
import { createAppStore } from 'features/store/createAppStore';
import type { PropsWithChildren } from 'react';
import { memo, useEffect } from 'react';
import type { z } from 'zod';
import type { StoreApi } from 'zustand';

//*****************************************************************************************
// App Preference Store
//*****************************************************************************************
export const {
  StoreProvider: AppPreferenceStoreProvider,
  useStore: useAppPreferenceStore,
  useSetStore: useAppSetPreferenceStore,
  useStoreApi: useAppPreferenceStoreApi
} = createAppStore<AppPreferenceStore>(null);

export const getAppPreferenceStateFromApi = (api: StoreApi<AppPreferenceStore>): AppPreferenceStore => {
  return api?.getState() || DEFAULT_APP_PREFERENCE_STORE;
};

AppPreferenceStoreProvider.displayName = 'AppPreferenceStoreProvider';

//*****************************************************************************************
// App Preference Provider
//*****************************************************************************************

export type AppPreferenceProviderProps = PropsWithChildren<{
  /** Zod schema to validate before saving. */
  schema: z.ZodObject<z.ZodRawShape>;
  /** localStorage key for persistence. */
  storageKey: string;
}>;

export const AppPreferenceProvider = memo(({ children, schema, storageKey }: AppPreferenceProviderProps) => {
  const preferences = useAppPreferenceStore(s => s);
  const preferenceStoreApi = useAppPreferenceStoreApi();
  const setPreferenceStore = useAppSetPreferenceStore();

  useEffect(() => {
    preferenceStoreApi.subscribe(store => {
      if (!store) return;
      savePreferenceToLocalStorage(schema, store, storageKey);
    });
  }, [preferenceStoreApi, schema, storageKey]);

  useEffect(() => {
    setPreferenceStore(store => loadPreferenceFromLocalStorage(schema, store, storageKey));
  }, [preferenceStoreApi, schema, storageKey, setPreferenceStore]);

  return !Object.entries(preferences || {}).length ? null : children;
});

AppPreferenceProvider.displayName = 'AppPreferenceProvider';
