import { useAppFeatureFlagStore } from 'core/feature-flag';
import type { FeatureFlagType } from 'core/feature-flag/feature-flag.models';
import { useAppSetFeatureFlagStore } from 'core/feature-flag/feature-flag.providers';
import { useCallback } from 'react';

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
 * @returns function to update a feature flag
 */
export const useUpdateFeatureFlag = () => {
  const setFeatureFlags = useAppSetFeatureFlagStore();

  return useCallback(
    (flag: FeatureFlagType, enabled: boolean) => {
      setFeatureFlags(store => ({ flags: store.flags.map(f => (f.flag === flag ? { ...f, enabled } : f)) }));
    },
    [setFeatureFlags]
  );
};

/**
 * Hook that returns a function to toggle a feature flag.
 *
 * @returns function to toggle a feature flag
 */
export const useToggleFeatureFlag = () => {
  const setFeatureFlags = useAppSetFeatureFlagStore();

  return useCallback(
    (flag: FeatureFlagType) => {
      setFeatureFlags(store => ({
        flags: store.flags.map(f => (f.flag === flag ? { ...f, enabled: !f.enabled } : f))
      }));
    },
    [setFeatureFlags]
  );
};
