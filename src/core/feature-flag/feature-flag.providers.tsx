import useALContext from 'core/config/useALContext';
import { EMPTY_FEATURE_FLAG_STATE, type FeatureFlagStore } from 'core/feature-flag';
import { isUserFeatureFlagAdmin } from 'core/feature-flag/feature-flag.guard';
import { loadFeatureFlags, saveFeatureFlags } from 'core/feature-flag/feature-flag.persistence';
import { createAppStore } from 'features/store';
import type { PropsWithChildren } from 'react';
import { memo, useEffect } from 'react';

// TODO CREATE DEV PAGAE/ROUTE
// TODO CREATE UNIT TESTS
// Add vision and milestones to Epic ticket

export const {
  StoreProvider: AppFeatureFlagStoreProvider,
  useStore: useAppFeatureFlagStore,
  useSetStore: useAppSetFeatureFlagStore,
  useStoreApi: useAppFeatureFlagStoreApi
} = createAppStore(EMPTY_FEATURE_FLAG_STATE);

AppFeatureFlagStoreProvider.displayName = 'AppFeatureFlagStoreProvider';

export type AppFeatureFlagProviderProps = PropsWithChildren<{
  storageKey: string;
  defaultState: FeatureFlagStore;
}>;

export const AppFeatureFlagProvider = memo(({ children, storageKey, defaultState }: AppFeatureFlagProviderProps) => {
  const featureFlagStoreApi = useAppFeatureFlagStoreApi();
  const setFeatureFlagStore = useAppSetFeatureFlagStore();
  const { user } = useALContext();

  // Load feature flags from localStorage if the user is an admin
  // If user is not an admin, no-op
  useEffect(() => {
    if (!isUserFeatureFlagAdmin(user)) return;

    setFeatureFlagStore(loadFeatureFlags(storageKey, defaultState));
  }, [setFeatureFlagStore, storageKey, user]);

  // Subscribe to feature flag store changes and save to localStorage
  // only if the user is an admin
  useEffect(() => {
    if (!isUserFeatureFlagAdmin(user)) return;

    featureFlagStoreApi.subscribe(store => {
      if (!store) return;

      saveFeatureFlags(storageKey, store);
    });
  }, [featureFlagStoreApi, storageKey, user]);

  // Don't wait for feature flags to be loaded before rendering children
  return <>{children}</>;
});

AppFeatureFlagProvider.displayName = 'AppFeatureFlagProvider';
