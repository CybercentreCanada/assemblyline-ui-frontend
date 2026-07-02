import type { AppRouterStore } from 'core/router';
import { useAppRouterStoreApi } from 'core/router';
import type { AppLocationStore } from 'core/routes';
import { findAppRouteFromLocation, getSnapshotFromLocation } from 'core/routes';
import { createAppStore } from 'features/store/createAppStore';
import type { ReactNode } from 'react';
import { memo, useEffect } from 'react';

//*****************************************************************************************
// App Location Provider
//*****************************************************************************************

export const DEFAULT_APP_LOCATION_STORE: AppLocationStore = {};

export const {
  StoreProvider: AppLocationStoreProvider,
  useStore: useAppLocationStore,
  useSetStore: useAppSetLocationStore,
  useStoreApi: useAppLocationStoreApi
} = createAppStore<AppLocationStore>(DEFAULT_APP_LOCATION_STORE);

AppLocationStoreProvider.displayName = 'AppLocationStoreProvider';

export type AppLocationProviderProps = {
  /** Provider children. */
  children: ReactNode;

  appRoutes: AppRoutes;
};

const AppLocationSync = memo(({ appRoutes }: Omit<AppLocationProviderProps, 'children'>) => {
  const setLocationStore = useAppSetLocationStore();
  const routerStoreApi = useAppRouterStoreApi();

  useEffect(() => {
    if (!routerStoreApi) return;

    const commitRouterToLocation = (router: AppRouterStore) =>
      setLocationStore(location => {
        const routerRouteKeys = new Set(Object.keys(router.routes));

        for (const existingRouteKey of Object.keys(location)) {
          if (routerRouteKeys.has(existingRouteKey)) continue;
          delete location[existingRouteKey];
        }

        for (const [routeKey, route] of Object.entries(router.routes)) {
          const id = `${route.href}${JSON.stringify(route.state)}`;
          const previousSnapshot = location?.[routeKey] || null;
          if (!previousSnapshot || previousSnapshot?.id === id) continue;
          const appRoute = findAppRouteFromLocation(appRoutes, route);
          location[routeKey] = getSnapshotFromLocation(appRoute, route);
          location[routeKey].id = id;
          location[routeKey].appRoute = appRoute;
        }

        return location;
      });

    const unsubscribe = routerStoreApi.subscribe(commitRouterToLocation);
    commitRouterToLocation(routerStoreApi.getState());

    return unsubscribe;
  }, [appRoutes, routerStoreApi, setLocationStore]);

  return null;
});

AppLocationSync.displayName = 'AppLocationSync';

export const AppLocationProvider = memo(({ children, appRoutes }: AppLocationProviderProps) => (
  <>
    <AppLocationSync appRoutes={appRoutes} />
    {children}
  </>
));

AppLocationProvider.displayName = 'AppLocationProvider';

//*****************************************************************************************
// App Route Key Provider
//*****************************************************************************************

export type AppRouteKeyStore = {
  /** Route key for this route context, or null when no route context is available. */
  routeKey: keyof AppRouterStore['routes'] | null;
};

export const { StoreProvider: AppRouteKeyStoreProvider, useStore: useAppRouteKeyStore } =
  createAppStore<AppRouteKeyStore>({ routeKey: null });

AppRouteKeyStoreProvider.displayName = 'AppRouteKeyStoreProvider';

export type AppRouteKeyStoreProviderProps = {
  /** Provider children. */
  children: ReactNode;
  /** Route key to provide. */
  routeKey: keyof AppRouterStore['routes'];
};

export const AppRouteKeyProvider = memo(({ children, routeKey }: AppRouteKeyStoreProviderProps) => (
  <AppRouteKeyStoreProvider data={{ routeKey }}>{children}</AppRouteKeyStoreProvider>
));

AppRouteKeyProvider.displayName = 'AppRouteKeyProvider';
