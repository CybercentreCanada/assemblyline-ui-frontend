import { createAppStore } from 'features/store/createAppStore';
import type { PropsWithChildren } from 'react';
import { memo, useEffect, useRef } from 'react';
import { z } from 'zod';
import { loadPreferenceFromLocalStorage, savePreferenceToLocalStorage } from './preference.utils';

//*****************************************************************************************
// App Preference Store
//*****************************************************************************************
export const {
  StoreProvider: AppPreferenceStoreProvider,
  useStore: useAppPreference,
  useSetStore: useAppSetPreference
} = createAppStore<AppPreference>({});

AppPreferenceStoreProvider.displayName = 'AppPreferenceStoreProvider';

//*****************************************************************************************
// App Preference
//*****************************************************************************************

export type AppPreferenceProps = {
  /** Provider children. */
  children: PropsWithChildren['children'];
  /** Zod schema to validate before saving. */
  schema: z.ZodObject<any>;
  /** localStorage key for persistence. */
  storageKey: string;
};

export const AppPreference = memo(({ children, schema, storageKey }: AppPreferenceProps) => {
  const preference = useAppPreference(s => s);
  const setPreference = useAppSetPreference();

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
