import useALContext from 'core/config/useALContext';
import { loadFeatureFlags, saveFeatureFlags } from 'core/feature-flags/feature-flag.persistence';
import { EMPTY_FEATURE_FLAG_STATE, FeatureFlag, FeatureFlagStore } from 'core/feature-flags/feature-flags.models';
import { createAppStore } from 'features/store';
import type { PropsWithChildren } from 'react';
import { memo, useEffect } from 'react';
import { isUserFeatureFlagAdmin } from './feature-flag.guard';

// TODO CREATE DEV PAGAE/ROUTE

export const {
  StoreProvider: AppFeatureFlagStoreProvider,
  useStore: useAppFeatureFlagStore,
  useSetStore: useAppSetFeatureFlagStore,
  useStoreApi: useAppFeatureFlagStoreApi
} = createAppStore<FeatureFlagStore>(EMPTY_FEATURE_FLAG_STATE);

AppFeatureFlagStoreProvider.displayName = 'AppFeatureFlagStoreProvider';

export type AppFeatureFlagProviderProps = PropsWithChildren<{
  storageKey: string;
  defaultState: FeatureFlag[];
}>;

export const AppFeatureFlagProvider = memo(({ children, storageKey, defaultState }: AppFeatureFlagProviderProps) => {
  const featureFlagStoreApi = useAppFeatureFlagStoreApi();
  const setFeatureFlagStore = useAppSetFeatureFlagStore();
  const { user } = useALContext();

  useEffect(() => {
    if (!isUserFeatureFlagAdmin(user)) return;

    setFeatureFlagStore({ flags: loadFeatureFlags(storageKey, defaultState) });
  }, [setFeatureFlagStore, storageKey, user]);

  useEffect(() => {
    if (!isUserFeatureFlagAdmin(user)) return;

    featureFlagStoreApi.subscribe(store => {
      if (!store) return;

      saveFeatureFlags(storageKey, store.flags);
    });
  }, [featureFlagStoreApi, storageKey, user]);

  return <>{children}</>;
});

AppFeatureFlagProvider.displayName = 'AppFeatureFlagProvider';
