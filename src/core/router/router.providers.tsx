import type { AppNavigationStore, AppRouterStore } from 'core/router';
import { useAppSyncNavigationStoreFromLocation, useAppSyncRouterStoreFromNavigation } from 'core/router';
import { AppNavigationBlocker } from 'core/router/router.components';
import { createAppStore } from 'features/store/createAppStore';
import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import { BrowserRouter } from 'react-router';
import { generateRandomUUID } from 'shared/utils/app.utils';
import type { StoreApi } from 'zustand';

//*****************************************************************************************
// App Router Provider
//*****************************************************************************************

export const getDefaultRouterStore = function (store: Partial<AppRouterStore> = null): AppRouterStore {
  return { id: generateRandomUUID(), panels: [], nodes: {}, pages: {}, ...store };
};

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

export const getDefaultNavigationStore = (store: Partial<AppNavigationStore> = null): AppNavigationStore => {
  return {
    id: generateRandomUUID(),
    panels: [],
    nodes: {},
    pages: {},
    blockedPages: {},
    options: {
      hashScrollIntoView: false,
      href: '',
      ignoreBlocker: false,
      reloadDocument: false,
      replace: false,
      resetScroll: false,
      viewTransition: false,
      ...store?.options
    },
    ...store
  };
};

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

export const AppNavigationProvider = memo(({ children }: PropsWithChildren) => {
  useAppSyncNavigationStoreFromLocation();
  useAppSyncRouterStoreFromNavigation();

  return (
    <>
      <AppNavigationBlocker />
      {children}
    </>
  );
});

AppNavigationProvider.displayName = 'AppNavigationProvider';
