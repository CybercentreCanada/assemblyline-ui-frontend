import { loadFeatureFlags, saveFeatureFlags } from 'core/feature-flags/feature-flag.persistence';
import { FeatureFlag, FeatureFlagStore } from 'core/feature-flags/feature-flags.models';
import { createAppStore } from 'features/store';
import type { PropsWithChildren } from 'react';
import { memo, useEffect } from 'react';

export const {
  StoreProvider: AppFeatureFlagStoreProvider,
  useStore: useAppFeatureFlagStore,
  useSetStore: useAppSetFeatureFlagStore,
  useStoreApi: useAppFeatureFlagStoreApi
} = createAppStore<FeatureFlagStore>(null);

AppFeatureFlagStoreProvider.displayName = 'AppFeatureFlagStoreProvider';

export type AppFeatureFlagProviderProps = PropsWithChildren<{
  storageKey: string;
  defaultState: FeatureFlag[];
}>;

export const AppFeatureFlagProvider = memo(({ children, storageKey, defaultState }: AppFeatureFlagProviderProps) => {
  const featureFlagStoreApi = useAppFeatureFlagStoreApi();
  const setFeatureFlagStore = useAppSetFeatureFlagStore();

  useEffect(() => {
    return featureFlagStoreApi.subscribe(store => {
      if (!store) return;

      saveFeatureFlags(storageKey, store.flags);
    });
  }, [featureFlagStoreApi, storageKey]);

  useEffect(() => {
    setFeatureFlagStore({ flags: loadFeatureFlags(storageKey, defaultState) });
  }, [setFeatureFlagStore, storageKey]);

  return <>{children}</>;
});

AppFeatureFlagProvider.displayName = 'AppFeatureFlagProvider';
