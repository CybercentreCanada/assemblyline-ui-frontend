import { deepmerge } from '@mui/utils';
import { APP_CONFIG_LOCAL_STORAGE_KEY, DEFAULT_APP_CONFIG } from 'app/app.configs';
import { createAppStore } from 'features/store/createAppStore';
import React, { PropsWithChildren, useCallback } from 'react';
import { type AppConfig } from './config.models';
import { loadSettingsFromLocalStorage } from './config.utils';

//*****************************************************************************************
// App Config Store Provider
//*****************************************************************************************
export const {
  StoreProvider: AppConfigStoreProvider,
  useStore: useAppConfig,
  useSetStore: useAppSetConfig
} = createAppStore<AppConfig>(DEFAULT_APP_CONFIG);

AppConfigStoreProvider.displayName = 'AppConfigStoreProvider';

//*****************************************************************************************
// App Config Provider
//*****************************************************************************************
export const AppConfigProvider = React.memo(({ children }: PropsWithChildren) => {
  const loadConfig = useCallback((store: AppConfig) => {
    try {
      const settings = loadSettingsFromLocalStorage(APP_CONFIG_LOCAL_STORAGE_KEY);
      return deepmerge(settings, store);
    } catch (err) {
      console.warn(err);
      return store;
    }
  }, []);

  return <AppConfigStoreProvider data={loadConfig}>{children}</AppConfigStoreProvider>;
});

AppConfigProvider.displayName = 'AppConfigProvider';
