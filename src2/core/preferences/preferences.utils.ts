import type { z } from 'zod';

//*****************************************************************************************
// Persistence Utilities
//*****************************************************************************************

/**
 * @name deepDiff
 * @description Computes a deep diff between current and defaults, returning only changed values.
 * @param current - Current state to diff
 * @param defaults - Default values to compare against
 * @returns Object containing only keys/values that differ from defaults
 */
const deepDiff = (current: Record<string, any>, defaults: Record<string, any>): Record<string, any> => {
  const diff: Record<string, any> = {};

  for (const key of Object.keys(current)) {
    const currentVal = current[key];
    const defaultVal = defaults[key];

    if (currentVal != null && typeof currentVal === 'object' && !Array.isArray(currentVal) && defaultVal != null) {
      const nested = deepDiff(currentVal, defaultVal);
      if (Object.keys(nested).length > 0) diff[key] = nested;
    } else if (currentVal !== defaultVal) {
      diff[key] = currentVal;
    }
  }

  return diff;
};

/**
 * @name savePreferencesToLocalStorage
 * @description Persists only the differences between current preferences and schema defaults.
 * @param schema - Zod schema used to derive defaults
 * @param preferences - Current preferences state
 * @param key - localStorage key
 * @returns void
 */
export const savePreferencesToLocalStorage = (
  schema: z.ZodObject<any>,
  preferences: AppPreferences,
  key: string
): void => {
  const defaults = schema.parse({});
  const diff = deepDiff(preferences, defaults);

  if (Object.keys(diff).length === 0) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(diff));
};

/**
 * @name loadPreferencesFromLocalStorage
 * @description Reads stored preference diff from localStorage and validates with safeParse. Returns only the stored overrides or empty object on failure.
 * @param schema - Zod schema to validate stored data against
 * @param key - localStorage key
 * @returns Partial preferences containing only stored overrides
 */
export const loadPreferencesFromLocalStorage = (schema: z.ZodObject<any>, key: string): Partial<AppPreferences> => {
  try {
    const raw = localStorage.getItem(key);
    const stored = JSON.parse(raw);
    const result = schema.parse({ ...stored });
    return result;
  } catch {
    return schema.parse({});
  }
};
