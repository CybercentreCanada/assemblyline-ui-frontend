import { AppConfig, AppSettings, AppSettingsSchema } from './config.models';

export const saveSettingsFromLocalStorage = (key: string, store: AppConfig) => {
  const parsed = AppSettingsSchema.parse(store);
  if (parsed == null) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(parsed));
  // else localStorage.setItem(key, LZString.compressToUTF16(JSON.stringify(parsed)));
};

export const loadSettingsFromLocalStorage = (key: string): AppSettings => {
  const compressed = localStorage.getItem(key);
  if (!compressed) return {} as AppSettings;
  // const json = LZString.decompressFromUTF16(compressed);
  const json = compressed;
  if (!json) return {} as AppSettings;
  const parsed = JSON.parse(json);
  const settings = AppSettingsSchema.parse(parsed);
  if (settings == null) return {} as AppSettings;
  return settings;
};
