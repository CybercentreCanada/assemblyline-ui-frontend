import { createAppStore } from 'features/store/createAppStore';

//*****************************************************************************************
// App Drawer Store
//*****************************************************************************************

/** App drawer state. */
export type AppDrawerStore = {
  /** Whether the drawer is expanded to maximized width. */
  maximized: boolean;
};

export const DEFAULT_APP_DRAWER_STORE: AppDrawerStore = {
  maximized: false
};

export const {
  StoreProvider: AppDrawerStoreProvider,
  useStore: useAppDrawerStore,
  useSetStore: useAppSetDrawerStore
} = createAppStore<AppDrawerStore>(DEFAULT_APP_DRAWER_STORE);

AppDrawerStoreProvider.displayName = 'AppDrawerStoreProvider';
