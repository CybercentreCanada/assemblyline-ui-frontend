import { createAppStore } from 'features/store/createAppStore';
import type { StoreApi } from 'zustand';

//*****************************************************************************************
// App Config Store
//*****************************************************************************************
export const {
  StoreProvider: AppConfigStoreProvider,
  useStore: useAppConfigStore,
  useSetStore: useAppSetConfigStore,
  useStoreApi: useAppConfigStoreApi
} = createAppStore<AppConfigStore>(null);

export const getAppConfigStateFromApi = (api: StoreApi<AppConfigStore>): AppConfigStore => {
  return api?.getState() || {};
};

AppConfigStoreProvider.displayName = 'AppConfigStoreProvider';
