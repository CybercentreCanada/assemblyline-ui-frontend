import { createAppStore } from 'features/store/createAppStore';

//*****************************************************************************************
// App Interface Store
//*****************************************************************************************

export const {
  StoreProvider: AppInterfaceStoreProvider,
  useStore: useAppInterfaceStore,
  useSetStore: useAppSetInterfaceStore,
  useStoreApi: useAppInterfaceStoreApi
} = createAppStore<AppInterfaceStore>(null);

AppInterfaceStoreProvider.displayName = 'AppInterfaceStoreProvider';
