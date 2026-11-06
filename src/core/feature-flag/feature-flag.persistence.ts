import type { FeatureFlagStore } from 'core/feature-flag/feature-flag.models';
import { z } from 'zod';

/*
 * Utility functions for loading and saving feature flags to localStorage.
 */

// Has the same structure as FeatureFlagStore
const FEATURE_FLAG_STORE_SCHEMA = z.object({ flags: z.array(z.object({ flag: z.string(), enabled: z.boolean() })) });

export const loadFeatureFlags = (storageKey: string, defaultState: FeatureFlagStore): FeatureFlagStore => {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw === null ? defaultState : FEATURE_FLAG_STORE_SCHEMA.parse(JSON.parse(raw));
  } catch (err) {
    // Feature Flags could not be parsed from localStorage; use defaults
    return defaultState;
  }
};

export const saveFeatureFlags = (storageKey: string, featureFlags: FeatureFlagStore) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(featureFlags));
  } catch (err) {
    // Failed to save Feature Flags to localStorage; no-op
  }
};
