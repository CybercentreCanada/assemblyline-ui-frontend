import { deepmerge } from '@mui/utils';
import { APP_CONFIG_LOCAL_STORAGE_KEY } from 'app/app.configs';
import { useCallback, useMemo, useState } from 'react';
import { useAppSetConfig, useAppConfig } from './config.providers';
import { loadSettingsFromLocalStorage, saveSettingsFromLocalStorage } from './config.utils';

export const useSaveAppConfig = () => {
  const store = useAppConfig(s => s);

  return useCallback(() => {
    try {
      saveSettingsFromLocalStorage(APP_CONFIG_LOCAL_STORAGE_KEY, store);
    } catch (err) {
      console.error('Failed to save to localStorage', err);
    }
  }, [store]);
};

export const useLoadAppConfig = () => {
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

export const useSaveSettings = () => {
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

export const useLoadSettings = () => {
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
