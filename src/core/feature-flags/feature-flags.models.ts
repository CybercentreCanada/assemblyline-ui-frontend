export type FeatureFlagType = string;

export type FeatureFlagDefinition = {
  flag: FeatureFlagType;
  descriptionKey: string;
  state: 'alpha' | 'beta';
};

export type FeatureFlag = {
  flag: FeatureFlagType;
  enabled: boolean;
};

export type FeatureFlagStore = {
  flags: FeatureFlag[];
};

export const EMPTY_FEATURE_FLAG_STATE = { flags: [] };
