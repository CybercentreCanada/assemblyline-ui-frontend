import { createStoreContext } from 'core/store/createStoreContext';
import React from 'react';
import { RouterStore } from '../router/router.models';

export type RouteKeyStore = {
  routeKey: keyof RouterStore['routes'];
};

const createDefaultRouteKeyStore = (): RouteKeyStore => ({
  routeKey: null
});

const { StoreProvider: RouteKeyStoreProvider, useStore: useRouteKeyStore } =
  createStoreContext<RouteKeyStore>(createDefaultRouteKeyStore());

export type RouteKeyStoreProviderProps = {
  children: React.ReactNode;
  routeKey: keyof RouterStore['routes'];
};

export const RouteKeyProvider = React.memo(({ children, routeKey }: RouteKeyStoreProviderProps) => (
  <RouteKeyStoreProvider data={{ routeKey }}>{children}</RouteKeyStoreProvider>
));

RouteKeyProvider.displayName = 'RouteKeyProvider';

export const useRouteKey = () => {
  const context = useRouteKeyStore(s => s.routeKey);
  if (!context) return null;
  return context[0];
};
