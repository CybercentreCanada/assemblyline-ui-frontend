import { createAppStore } from 'features/store/createAppStore';
import type { PropsWithChildren } from 'react';
import { memo, useCallback, useEffect, useRef } from 'react';
import { z } from 'zod';
import { loadPreferencesFromLocalStorage, savePreferencesToLocalStorage } from './preferences.utils';

//*****************************************************************************************
// App Preferences Store Provider
//*****************************************************************************************
export const {
  StoreProvider: AppPreferencesStoreProvider,
  useStore: useAppPreferences,
  useSetStore: useAppSetPreferences
} = createAppStore<AppPreferences>({});

AppPreferencesStoreProvider.displayName = 'AppPreferencesStoreProvider';

//*****************************************************************************************
// App Preferences Persistence
//*****************************************************************************************

type AppPreferencesPersistenceProps = {
  /** Zod schema to validate before saving. */
  schema: z.ZodObject<any>;
  /** localStorage key for persistence. */
  storageKey: string;
};

const AppPreferencesPersistence = memo(({ schema, storageKey }: AppPreferencesPersistenceProps) => {
  const preferences = useAppPreferences(s => s);

  const initializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    savePreferencesToLocalStorage(schema, preferences, storageKey);
  }, [preferences, schema, storageKey]);

  return null;
});

AppPreferencesPersistence.displayName = 'AppPreferencesPersistence';

//*****************************************************************************************
// App Preferences Provider
//*****************************************************************************************

export type AppPreferencesProviderProps = {
  /** Provider children. */
  children: PropsWithChildren['children'];
  /** Zod schema used to validate on load/save. */
  schema: z.ZodObject<any>;
  /** localStorage key for persistence. */
  storageKey: string;
};

export const AppPreferencesProvider = memo(({ children, schema, storageKey }: AppPreferencesProviderProps) => {
  const hydrate = useCallback(
    (store: AppPreferences) => ({ ...store, ...loadPreferencesFromLocalStorage(schema, storageKey) }),
    [schema, storageKey]
  );

  return (
    <AppPreferencesStoreProvider data={hydrate}>
      <AppPreferencesPersistence schema={schema} storageKey={storageKey} />
      {children}
    </AppPreferencesStoreProvider>
  );
});

AppPreferencesProvider.displayName = 'AppPreferencesProvider';
