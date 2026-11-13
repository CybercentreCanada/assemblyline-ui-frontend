import type { FeatureFlagStore } from 'core/feature-flag';

export const FEATURE_FLAGS_STORAGE_KEY = 'assemblyline.featureFlags';

// Assemblyline feature flags defined here

// EX:
// export const FOO_FLAG: FeatureFlagType = 'foo';
// export const FOO_FLAG_DEF: FeatureFlagDefinition = {
//   flag: FOO_FLAG,
//   descriptionKey: 'feature_flags.definition.foo',
//   state: 'alpha'
// };

export const ALL_FEATURE_FLAG_DEFINITIONS = [
  // Add flags to this list
  // FOO_FLAG_DEF,
];

export const DEFAULT_FEATURE_FLAG_STATE: FeatureFlagStore = {
  flags: ALL_FEATURE_FLAG_DEFINITIONS.map(def => ({ flag: def.flag, enabled: false }))
};
