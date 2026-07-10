import type { AppRouterStore } from 'core/router';
import { useAppRouterStoreApi } from 'core/router';
import type { AppRouteLocationsStore } from 'core/routes';
import { setRouteSpecsFromAppRoutes, syncRouteSnapshotsFromRouter } from 'core/routes';
import { createAppStore } from 'features/store/createAppStore';
import type { ReactNode } from 'react';
import { memo, useCallback, useEffect } from 'react';
import type { StoreApi } from 'zustand';

//*****************************************************************************************
// App Route Locations Provider
//*****************************************************************************************

export const DEFAULT_APP_ROUTE_LOCATIONS_STORE: AppRouteLocationsStore = {
  specs: null,
  locations: {}
};

export const {
  StoreProvider: AppRouteLocationsStoreProvider,
  useStore: useAppRouteLocationsStore,
  useSetStore: useAppSetRouteLocationsStore,
  useStoreApi: useAppRouteLocationsStoreApi
} = createAppStore<AppRouteLocationsStore>(DEFAULT_APP_ROUTE_LOCATIONS_STORE);

AppRouteLocationsStoreProvider.displayName = 'AppRouteLocationsStoreProvider';

export const getAppRouteLocationsStateFromApi = (api: StoreApi<AppRouteLocationsStore>): AppRouteLocationsStore => {
  return api?.getState() || DEFAULT_APP_ROUTE_LOCATIONS_STORE;
};

export type AppRouteLocationsProviderProps = {
  /** All of the app's created routes */
  appRoutes: AppRoutes;
  /** Provider children. */
  children: ReactNode;
};

const AppRouteLocationsSync = memo(({ appRoutes }: Omit<AppRouteLocationsProviderProps, 'children'>) => {
  const setRouteLocationsStore = useAppSetRouteLocationsStore();
  const routerStoreApi = useAppRouterStoreApi();

  const commitRouterToLocation = useCallback(
    (router: AppRouterStore) => setRouteLocationsStore(s => syncRouteSnapshotsFromRouter(s, router)),
    [setRouteLocationsStore]
  );

  useEffect(() => {
    setRouteLocationsStore(s => setRouteSpecsFromAppRoutes(s, appRoutes));
  }, [appRoutes, setRouteLocationsStore]);

  useEffect(() => {
    if (!routerStoreApi) return;
    commitRouterToLocation(routerStoreApi.getState());
    return routerStoreApi.subscribe(router => commitRouterToLocation(router));
  }, [commitRouterToLocation, routerStoreApi]);

  return null;
});

AppRouteLocationsSync.displayName = 'AppRouteLocationsSync';

export const AppRouteLocationsProvider = memo(({ children, appRoutes }: AppRouteLocationsProviderProps) => (
  <>
    <AppRouteLocationsSync appRoutes={appRoutes} />
    {children}
  </>
));

AppRouteLocationsProvider.displayName = 'AppRouteLocationsProvider';

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
