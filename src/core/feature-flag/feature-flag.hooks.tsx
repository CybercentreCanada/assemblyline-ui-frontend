import { useAppFeatureFlagStore } from 'core/feature-flag';
import type { FeatureFlagType } from 'core/feature-flag/feature-flag.models';
import { useAppSetFeatureFlagStore } from 'core/feature-flag/feature-flag.providers';
import { useCallback } from 'react';

export const useIsFeatureEnabled = (flag: FeatureFlagType): boolean => {
  return useAppFeatureFlagStore(store => {
    const found = store.flags.find(f => f.flag === flag);
    return found ? found.enabled : false;
  });
};

export const useUpdateFeatureFlag = () => {
  const setFeatureFlags = useAppSetFeatureFlagStore();

  return useCallback(
    (flag: FeatureFlagType, enabled: boolean) => {
      setFeatureFlags(store => ({ flags: store.flags.map(f => (f.flag === flag ? { ...f, enabled } : f)) }));
    },
    [setFeatureFlags]
  );
};

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
