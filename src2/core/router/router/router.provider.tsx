import { createStoreContext } from 'features/store/createStoreContext';
import React, { useCallback } from 'react';
import type { Location } from 'react-router';
import { useLocation } from 'react-router';
import { RouterState, RouterStore } from './router.models';
import { locationToStore } from './router.utils';

//*****************************************************************************************
// RouterProvider
//*****************************************************************************************

const createDefaultAppRouterStore = (): RouterStore => ({
  maxPanels: 3,
  maxNodes: 3,
  panels: [],
  nodes: {},
  routes: {}
});

export const { StoreProvider: AppRouterStoreProvider, useStore: useAppRouterStore } =
  createStoreContext<RouterStore>(createDefaultAppRouterStore());

export type AppRouterProviderProps = {
  children: React.ReactNode;
};

export const AppRouterProvider = React.memo(({ children }: AppRouterProviderProps) => {
  const location: Location<RouterState> = useLocation();
  const reset = useCallback((store: RouterStore) => locationToStore(store, location), [location]);
  return <AppRouterStoreProvider data={reset}>{children}</AppRouterStoreProvider>;
});

AppRouterStoreProvider.displayName = 'AppRouterStoreProvider';
