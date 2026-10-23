import type { FeatureFlag } from 'core/feature-flags/feature-flags.models';
import { z } from 'zod';

const FEATURE_FLAGS_SCHEMA = z.array(z.object({ flag: z.string(), enabled: z.boolean() }));

export const loadFeatureFlags = (storageKey: string, defaultState: FeatureFlag[] = []): FeatureFlag[] => {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw === null ? defaultState : FEATURE_FLAGS_SCHEMA.parse(JSON.parse(raw));
  } catch (err) {
    console.debug('Feature flags could not be parsed from localStorage', err);
    return defaultState;
  }
};

export const saveFeatureFlags = (storageKey: string, featureFlags: FeatureFlag[]) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(featureFlags));
  } catch (err) {
    console.debug('Failed to save preferences to localStorage', err);
  }
};
