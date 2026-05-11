import { deepmerge } from '@mui/utils';
import { useAppConfig, useAppSetConfig } from 'core/config/config.providers';
import {
  APP_CONFIG_LOCAL_STORAGE_KEY,
  loadSettingsFromLocalStorage,
  saveSettingsFromLocalStorage
} from 'core/config/config.utils';
import { useCallback, useMemo, useState } from 'react';

/**
 * @name useSaveAppConfig
 * @description Returns a callback that persists the current app config to localStorage.
 * @returns Callback to save config
 */
export const useSaveAppConfig = (): (() => void) => {
  const store = useAppConfig(s => s);

  return useCallback(() => {
    try {
      saveSettingsFromLocalStorage(APP_CONFIG_LOCAL_STORAGE_KEY, store);
    } catch (err) {
      console.error('Failed to save to localStorage', err);
    }
  }, [store]);
};

/**
 * @name useLoadAppConfig
 * @description Returns a callback that loads and merges config from localStorage into the store.
 * @returns Callback to load config
 */
export const useLoadAppConfig = (): (() => void) => {
  const setStore = useAppSetConfig();

  return useCallback(() => {
    try {
      const settings = loadSettingsFromLocalStorage(APP_CONFIG_LOCAL_STORAGE_KEY);
      setStore(s => deepmerge(settings, s));
    } catch (err) {
      console.warn('Failed to load data from localStorage', err);
    }
  }, []);
};

/**
 * @name useSaveSettings
 * @description Returns a save callback and pending state for saving config to localStorage.
 * @returns Object with isPending flag and save callback
 */
export const useSaveSettings = (): { isPending: boolean; save: () => void } => {
  const store = useAppConfig(s => s);

  const [isPending, setIsPending] = useState<boolean>(false);

  const save = useCallback(() => {
    setIsPending(true);
    try {
      saveSettingsFromLocalStorage(APP_CONFIG_LOCAL_STORAGE_KEY, store);
    } catch (err) {
      console.error('Failed to save to localStorage', err);
    }
    setIsPending(false);
  }, [store]);

  return useMemo(() => ({ isPending, save }), [isPending, save]);
};

/**
 * @name useLoadSettings
 * @description Returns a load callback and pending state for loading config from localStorage.
 * @returns Object with isPending flag and load callback
 */
export const useLoadSettings = (): { isPending: boolean; load: () => void } => {
  const setStore = useAppSetConfig();

  const [isPending, setIsPending] = useState<boolean>(false);

  const load = useCallback(() => {
    setIsPending(true);
    try {
      const settings = loadSettingsFromLocalStorage(APP_CONFIG_LOCAL_STORAGE_KEY);
      setStore(s => deepmerge(settings, s));
    } catch (err) {
      console.warn('Failed to load data from localStorage', err);
    }

    setIsPending(false);
  }, []);

  return useMemo(() => ({ isPending, load }), [isPending, load]);
};
