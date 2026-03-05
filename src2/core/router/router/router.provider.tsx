import { createStoreContext } from 'core/store/createStoreContext';
import React, { useCallback } from 'react';
import type { Location } from 'react-router';
import { useLocation } from 'react-router';
import { RouterState, RouterStore } from './router.models';
import { locationToStore } from './router.utils';

const createDefaultRouterStore = (): RouterStore => ({
  maxPanels: 3,
  maxNodes: 3,
  panels: [],
  nodes: {},
  routes: {}
});

export const { StoreProvider: RouterStoreProvider, useStore: useRouterStore } =
  createStoreContext<RouterStore>(createDefaultRouterStore());

export type RouterProviderProps = {
  children: React.ReactNode;
};

export const RouterProvider = React.memo(({ children }: RouterProviderProps) => {
  const location: Location<RouterState> = useLocation();
  const reset = useCallback((store: RouterStore) => locationToStore(store, location), [location]);
  return <RouterStoreProvider data={reset}>{children}</RouterStoreProvider>;
});

RouterProvider.displayName = 'RouterProvider';
