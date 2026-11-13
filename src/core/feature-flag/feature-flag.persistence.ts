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
    if (raw === null) return defaultState;

    const savedState = FEATURE_FLAG_STORE_SCHEMA.parse(JSON.parse(raw));
    const savedFlags = new Map(savedState.flags.map(entry => [entry.flag, entry]));

    // Merge local storage result with default state (don't update 'enabled' value)
    return { flags: defaultState.flags.map(entry => savedFlags.get(entry.flag) ?? entry) };
  } catch {
    // Feature Flags could not be parsed from localStorage; use defaults
    return defaultState;
  }
};

export const saveFeatureFlags = (storageKey: string, featureFlags: FeatureFlagStore) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(featureFlags));
  } catch {
    // Failed to save Feature Flags to localStorage; no-op
  }
};
