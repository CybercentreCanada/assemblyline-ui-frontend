import type { FeatureFlagStore } from 'core/feature-flag';

export const FEATURE_FLAGS_STORAGE_KEY = 'assemblyline.featureFlags';

// Assemblyline feature flags defined here

// EX:
// export const FOO_FLAG: FeatureFlagType = 'foo';
// export const FOO_FLAG_DEF: FeatureFlagDefinition = {
//   flag: FOO_FLAG,
//   descriptionKey: 'featureFlags.foo',
//   state: 'alpha'
// };

export const DEFAULT_FEATURE_FLAG_STATE: FeatureFlagStore = {
  flags: [
    // Add flags to this list
  ]
};
