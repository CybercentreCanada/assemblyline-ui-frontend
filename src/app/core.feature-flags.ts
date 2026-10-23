import { FeatureFlag, FeatureFlagType } from 'core/feature-flags';

export const FEATURE_FLAGS_STORAGE_KEY = 'assemblyline.featureFlags';

// Assemblyline feature flags defined here
export const FOO_FLAG: FeatureFlagType = 'foo';
export const BAR_FLAG: FeatureFlagType = 'bar';

export const DEFAULT_FEATURE_FLAG_STATE: FeatureFlag[] = [
  { flag: FOO_FLAG, enabled: false },
  { flag: BAR_FLAG, enabled: false }
];
