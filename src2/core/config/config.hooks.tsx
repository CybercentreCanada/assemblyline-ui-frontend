import { APP_CONFIG_LOCAL_STORAGE_KEY } from 'app/app.configs';
import { useCallback } from 'react';
import { useAppConfigStore } from './config.providers';
import { saveSettingsFromLocalStorage } from './config.utils';

//*****************************************************************************************
// useAppConfigUpdate
//*****************************************************************************************
export const useAppConfigUpdate = () => {
  const store = useAppConfigStore(s => s);

  return useCallback(() => {
    try {
      saveSettingsFromLocalStorage(APP_CONFIG_LOCAL_STORAGE_KEY, store);
    } catch (err) {
      console.error('Failed to save to localStorage', err);
    }
  }, [store]);
};
