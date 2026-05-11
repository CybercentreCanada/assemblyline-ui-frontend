import { DEFAULT_APP_INTERFACE_STORE } from 'app/core.interface';
import { createAppStore } from 'features/store/createAppStore';

//*****************************************************************************************
// App Interface Store
//*****************************************************************************************

export const {
  StoreProvider: AppInterfaceStoreProvider,
  useStore: useAppInterfaceStore,
  useSetStore: useAppSetInterfaceStore
} = createAppStore<AppInterface>(DEFAULT_APP_INTERFACE_STORE);

AppInterfaceStoreProvider.displayName = 'AppInterfaceStoreProvider';
