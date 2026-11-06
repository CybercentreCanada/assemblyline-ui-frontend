import type { FeatureFlagDefinition, FeatureFlagStore, FeatureFlagType } from 'core/feature-flag';

export const FEATURE_FLAGS_STORAGE_KEY = 'assemblyline.featureFlags';

// Assemblyline feature flags defined here

// This flag is for XYZ
export const FOO_FLAG: FeatureFlagType = 'foo';
export const FOO_FLAG_DEF: FeatureFlagDefinition = {
  flag: FOO_FLAG,
  descriptionKey: 'featureFlags.foo',
  state: 'alpha'
};

// This flag enables ABC
export const BAR_FLAG: FeatureFlagType = 'bar';
export const BAR_FLAG_DEF: FeatureFlagDefinition = {
  flag: BAR_FLAG,
  descriptionKey: 'featureFlags.bar',
  state: 'alpha'
};

export const DEFAULT_FEATURE_FLAG_STATE: FeatureFlagStore = {
  flags: [
    { flag: FOO_FLAG, enabled: false },
    { flag: BAR_FLAG, enabled: false }
  ]
};
