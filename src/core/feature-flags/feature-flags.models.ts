export type FeatureFlagType = string;

export type FeatureFlag = {
  flag: FeatureFlagType;
  enabled: boolean;
};

export type FeatureFlagStore = {
  flags: FeatureFlag[];
};
