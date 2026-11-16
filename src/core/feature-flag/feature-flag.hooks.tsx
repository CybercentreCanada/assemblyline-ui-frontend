import type { FeatureFlag, FeatureFlagType } from 'core/feature-flag/feature-flag.models';
import { useAppFeatureFlagStore, useAppSetFeatureFlagStore } from 'core/feature-flag/feature-flag.providers';
import { useCallback } from 'react';

/**
 * Returns the feature flags from the store.
 *
 * @returns Current feature flags.
 */
export const useFeatureFlags = (): FeatureFlag[] => useAppFeatureFlagStore(store => store.flags);

/**
 * Hook that checks if the specified feature flag is enabled.
 *
 * @param flag FeatureFlagType
 * @returns boolean
 */
export const useIsFeatureEnabled = (flag: FeatureFlagType): boolean => {
  return useAppFeatureFlagStore(store => {
    const found = store.flags.find(f => f.flag === flag);
    return found ? found.enabled : false;
  });
};

/**
 * Hook that returns a function to update a feature flag.
 *
 * If the feature flag is not present in the store, it will be added with the specified enabled state.
 *
 * @returns function to update a feature flag
 */
export const useUpdateFeatureFlag = () => {
  const setFeatureFlags = useAppSetFeatureFlagStore();

  return useCallback(
    (flag: FeatureFlagType, enabled: boolean) =>
      setFeatureFlags(store => {
        const found = store.flags.findIndex(f => f.flag === flag);
        if (found === -1) {
          // Flag not found, push it to the store
          return { flags: [...store.flags, { flag, enabled }] };
        }

        // Flag found, update existing
        return {
          flags: store.flags.map((entry, index) => (index === found ? { ...entry, enabled } : entry))
        };
      }),
    [setFeatureFlags]
  );
};

/**
 * Hook that returns a function to toggle a feature flag.
 *
 * If the feature flag is not present in the store, it will be added with an enabled state of true.
 *
 * @returns function to toggle a feature flag
 */
export const useToggleFeatureFlag = () => {
  const setFeatureFlags = useAppSetFeatureFlagStore();

  return useCallback(
    (flag: FeatureFlagType) =>
      setFeatureFlags(store => {
        const found = store.flags.findIndex(f => f.flag === flag);
        if (found === -1) {
          // Flag not found, push new enabled flag to store
          return { flags: [...store.flags, { flag, enabled: true }] };
        }

        // Flag found, toggle existing
        return {
          flags: store.flags.map((entry, index) => (index === found ? { ...entry, enabled: !entry.enabled } : entry))
        };
      }),
    [setFeatureFlags]
  );
};
