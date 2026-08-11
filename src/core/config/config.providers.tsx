import { createAppStore } from 'features/store/createAppStore';

//*****************************************************************************************
// App Config Store
//*****************************************************************************************
export const {
  StoreProvider: AppConfigStoreProvider,
  useStore: useAppConfig,
  useSetStore: useAppSetConfig,
  useStoreApi: useAppConfigStoreApi
} = createAppStore<AppConfigStore>(null);

AppConfigStoreProvider.displayName = 'AppConfigStoreProvider';
