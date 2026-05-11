import { DEFAULT_APP_PREFERENCE } from 'app/core.preference';
import { createAppStore } from 'features/store/createAppStore';
import type { PropsWithChildren } from 'react';
import { memo, useEffect, useRef } from 'react';
import type { z } from 'zod';
import { loadPreferenceFromLocalStorage, savePreferenceToLocalStorage } from './preference.utils';

//*****************************************************************************************
// App Preference Store
//*****************************************************************************************
export const {
  StoreProvider: AppPreferenceStoreProvider,
  useStore: useAppPreferenceStore,
  useSetStore: useAppSetPreferenceStore
} = createAppStore<AppPreference>(DEFAULT_APP_PREFERENCE);

AppPreferenceStoreProvider.displayName = 'AppPreferenceStoreProvider';

//*****************************************************************************************
// App Preference
//*****************************************************************************************

export type AppPreferenceProps = {
  /** Provider children. */
  children: PropsWithChildren['children'];
  /** Zod schema to validate before saving. */
  schema: z.ZodObject<z.ZodRawShape>;
  /** localStorage key for persistence. */
  storageKey: string;
};

export const AppPreference = memo(({ children, schema, storageKey }: AppPreferenceProps) => {
  const preference = useAppPreferenceStore(s => s);
  const setPreference = useAppSetPreferenceStore();

  const initializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!initializedRef.current) return;
    savePreferenceToLocalStorage(schema, preference, storageKey);
  }, [preference, schema, storageKey]);

  useEffect(() => {
    setPreference(store => ({ ...store, ...loadPreferenceFromLocalStorage(schema, storageKey) }));
    initializedRef.current = true;
  }, [schema, storageKey, setPreference]);

  return !initializedRef.current ? null : children;
});

AppPreference.displayName = 'AppPreference';
