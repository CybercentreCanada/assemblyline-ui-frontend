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
const deepDiff = (current: Record<string, unknown>, defaults: Record<string, unknown>): Record<string, unknown> => {
  const diff: Record<string, unknown> = {};

  for (const key of Object.keys(current)) {
    const currentVal = current[key];
    const defaultVal = defaults[key];

    if (currentVal != null && typeof currentVal === 'object' && !Array.isArray(currentVal) && defaultVal != null) {
      const nested = deepDiff(currentVal as Record<string, unknown>, defaultVal as Record<string, unknown>);
      if (Object.keys(nested).length > 0) diff[key] = nested;
    } else if (currentVal !== defaultVal) {
      diff[key] = currentVal;
    }
  }

  return diff;
};

/**
 * @name savePreferenceToLocalStorage
 * @description Persists only the differences between current preference and schema defaults.
 * @param schema - Zod schema used to derive defaults
 * @param preference - Current preference state
 * @param key - localStorage key
 * @returns void
 */
export const savePreferenceToLocalStorage = (
  schema: z.ZodObject<z.ZodRawShape>,
  preference: AppPreference,
  key: string
): void => {
  const defaults = schema.parse({}) as Record<string, unknown>;
  const diff = deepDiff(preference as unknown as Record<string, unknown>, defaults);

  if (Object.keys(diff).length === 0) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(diff));
};

/**
 * @name loadPreferenceFromLocalStorage
 * @description Reads stored preference diff from localStorage and validates with safeParse. Returns only the stored overrides or empty object on failure.
 * @param schema - Zod schema to validate stored data against
 * @param key - localStorage key
 * @returns Partial preference containing only stored overrides
 */
export const loadPreferenceFromLocalStorage = (
  schema: z.ZodObject<z.ZodRawShape>,
  key: string
): Partial<AppPreference> => {
  try {
    const raw = localStorage.getItem(key);
    const stored = JSON.parse(raw) as unknown;
    const result = schema.parse({ ...(stored as Record<string, unknown>) });
    return result as Partial<AppPreference>;
  } catch {
    return schema.parse({}) as Partial<AppPreference>;
  }
};
