import { useAppConfigStore } from 'core/config';
import { createAppStore } from 'features/store/createAppStore';
import React, { PropsWithChildren, useCallback } from 'react';
import type { Location } from 'react-router';
import { BrowserRouter, useLocation } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
import { DEFAULT_APP_ROUTER_STORE } from './router.defaults';
import { AppRouterState, AppRouterStore } from './router.models';
import { locationToStore } from './router.utils';

//*****************************************************************************************
// App Router Store Provider
//*****************************************************************************************
export const {
  StoreProvider: AppRouterStoreProvider,
  useStore: useAppRouterStore,
  useSetStore: useAppRouterSetStore
} = createAppStore<AppRouterStore>(DEFAULT_APP_ROUTER_STORE);

AppRouterStoreProvider.displayName = 'AppRouterStoreProvider';

//*****************************************************************************************
// App Router Store Sync
//*****************************************************************************************
export const AppRouterStoreSync = React.memo(({ children }: PropsWithChildren) => {
  const location: Location<AppRouterState> = useLocation();

  const { maxPanels, maxNodes } = useAppConfigStore(
    useShallow(s => ({
      maxNodes: s.router.maxNodes,
      maxPanels: s.router.maxPanels
    }))
  );

  const reset = useCallback(
    (store: AppRouterStore) => ({ ...locationToStore(store, location), maxNodes, maxPanels }),
    [location]
  );

  return <AppRouterStoreProvider data={reset}>{children}</AppRouterStoreProvider>;
});

AppRouterStoreSync.displayName = 'AppRouterStoreSync';

//*****************************************************************************************
// App Router Provider
//*****************************************************************************************

export const AppRouterProvider = React.memo(({ children }: PropsWithChildren) => (
  <BrowserRouter basename="/">
    <AppRouterStoreSync>{children}</AppRouterStoreSync>
  </BrowserRouter>
));

AppRouterProvider.displayName = 'AppRouterProvider';
