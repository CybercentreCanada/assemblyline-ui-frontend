import _ from 'lodash';
import type { z } from 'zod';

/**
 * @name loadPreferenceFromLocalStorage
 * @description Reads stored preference diff from localStorage, deep-merges it over current store values, then validates with schema.
 * @param schema - Zod schema to validate stored data against
 * @param store - Current store values used as the merge base
 * @param key - localStorage key
 * @returns Preference state with the same shape as `store`, after merge and schema validation
 */
export const loadPreferenceFromLocalStorage = function <
  Schema extends z.ZodObject<z.ZodRawShape>,
  Store extends z.infer<Schema> = z.infer<Schema>
>(schema: Schema, store: Store, key: string): Store {
  const current = store !== null && typeof store === 'object' ? store : schema.parse({});

  try {
    const raw = localStorage.getItem(key);
    const stored = raw == null ? {} : (JSON.parse(raw) as unknown);
    const merged = _.mergeWith({}, current, stored ?? {}, (_current: unknown, source: unknown) =>
      Array.isArray(source) ? source : undefined
    );
    return schema.parse(merged) as Store;
  } catch {
    return schema.parse(current) as Store;
  }
};

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
 * @param store - Current preference state
 * @param key - localStorage key
 * @returns void
 */
export const savePreferenceToLocalStorage = function <
  Schema extends z.ZodObject<z.ZodRawShape>,
  Store extends z.infer<Schema> = z.infer<Schema>
>(schema: Schema, store: Store, key: string): void {
  const defaults = schema.parse({});
  const current = store !== null && typeof store === 'object' ? store : {};
  const diff = deepDiff(current as Record<string, unknown>, defaults);

  if (Object.keys(diff).length === 0) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(diff));
};
