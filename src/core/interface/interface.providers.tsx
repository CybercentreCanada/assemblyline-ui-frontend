import { DEFAULT_APP_INTERFACE_STORE } from 'app/core.interface';
import { createAppStore } from 'features/store/createAppStore';
import type { StoreApi } from 'zustand';

//*****************************************************************************************
// App Interface Store
//*****************************************************************************************

export const {
  StoreProvider: AppInterfaceStoreProvider,
  useStore: useAppInterfaceStore,
  useSetStore: useAppSetInterfaceStore,
  useStoreApi: useAppInterfaceStoreApi
} = createAppStore<AppInterfaceStore>(null);

export const getAppInterfaceStateFromApi = (api: StoreApi<AppInterfaceStore>): AppInterfaceStore => {
  return api?.getState() || DEFAULT_APP_INTERFACE_STORE;
};

AppInterfaceStoreProvider.displayName = 'AppInterfaceStoreProvider';
