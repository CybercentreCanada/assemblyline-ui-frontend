import { z } from 'zod';

export const APP_CONFIG_LOCAL_STORAGE_KEY = 'al.settings';

/** @deprecated Use APP_PREFERENCE_SCHEMA from app/core.preference instead */
const AppSettingsSchema = z.object({}).nullable().optional();

type AppSettings = z.infer<typeof AppSettingsSchema>;

//*****************************************************************************************
// LocalStorage Persistence
//*****************************************************************************************

/**
 * @name saveSettingsFromLocalStorage
 * @description Validates and persists the current config to localStorage.
 * @param key - localStorage key
 * @param store - Current config state to persist
 * @returns void
 */
export const saveSettingsFromLocalStorage = (key: string, store: unknown): void => {
  const parsed = AppSettingsSchema.parse(store);
  if (parsed == null) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(parsed));
};

/**
 * @name loadSettingsFromLocalStorage
 * @description Reads and validates stored config from localStorage.
 * @param key - localStorage key
 * @returns Validated settings or empty object on failure
 */
export const loadSettingsFromLocalStorage = (key: string): AppSettings => {
  const compressed = localStorage.getItem(key);
  if (!compressed) return {} as AppSettings;
  const json = compressed;
  if (!json) return {} as AppSettings;
  const parsed = JSON.parse(json) as unknown;
  const settings = AppSettingsSchema.parse(parsed);
  if (settings == null) return {} as AppSettings;
  return settings;
};
