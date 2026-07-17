import type { AppNavigationStore, AppRouterStore } from 'core/router';
import {
  getDefaultNavigationStore,
  getDefaultRouterStore,
  useAppBlockNavigation,
  useAppBlockUnloadEvent,
  useAppSyncNavigationStoreFromLocation,
  useAppSyncRouterStoreFromNavigation
} from 'core/router';
import { createAppStore } from 'features/store/createAppStore';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import { BrowserRouter } from 'react-router';
import type { StoreApi } from 'zustand';

//*****************************************************************************************
// App Router Provider
//*****************************************************************************************
export const {
  StoreProvider: AppRouterStoreProvider,
  useStore: useAppRouterStore,
  useSetStore: useAppSetRouterStore,
  useStoreApi: useAppRouterStoreApi
} = createAppStore<AppRouterStore>(getDefaultRouterStore());

export const getAppRouterStateFromApi = (api: StoreApi<AppRouterStore>): AppRouterStore => {
  return api?.getState() || getDefaultRouterStore();
};

AppRouterStoreProvider.displayName = 'AppRouterStoreProvider';

export const AppRouterProvider = memo(({ children }: PropsWithChildren) => (
  <BrowserRouter basename="/">{children}</BrowserRouter>
));

AppRouterProvider.displayName = 'AppRouterProvider';

//*****************************************************************************************
// App Navigation Provider
//*****************************************************************************************

export const {
  StoreProvider: AppNavigationStoreProvider,
  useStore: useAppNavigationStore,
  useSetStore: useAppSetNavigationStore,
  useStoreApi: useAppNavigationStoreApi
} = createAppStore<AppNavigationStore>(getDefaultNavigationStore());

export const getAppNavigationStateFromApi = (api: StoreApi<AppNavigationStore>): AppNavigationStore => {
  return api?.getState() || getDefaultNavigationStore();
};

AppNavigationStoreProvider.displayName = 'AppNavigationStoreProvider';

export const AppNavigationSync = memo(() => {
  useAppSyncNavigationStoreFromLocation();
  useAppSyncRouterStoreFromNavigation();
  return null;
});

export const AppNavigationBlocker = memo(({ children }: PropsWithChildren) => {
  useAppBlockNavigation();
  useAppBlockUnloadEvent();

  return <>{children}</>;
});

export const AppNavigationProvider = memo(({ children }: PropsWithChildren) => (
  <AppNavigationBlocker>
    <AppNavigationSync />
    {children}
  </AppNavigationBlocker>
));

AppNavigationProvider.displayName = 'AppNavigationProvider';
