import { createAppStore } from 'features/store/createAppStore';

//*****************************************************************************************
// App Config Store
//*****************************************************************************************
export const {
  StoreProvider: AppConfigStoreProvider,
  useStore: useAppConfig,
  useSetStore: useAppSetConfig
} = createAppStore<AppConfig>({});

AppConfigStoreProvider.displayName = 'AppConfigStoreProvider';
