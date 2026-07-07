import type { AppRouterStore } from 'core/router';
import { useAppRouterStoreApi } from 'core/router';
import type { AppLocationStore } from 'core/routes';
import { setRouteDefinitionsFromAppRoutes, syncRouteSnapshotsFromRouter } from 'core/routes';
import { createAppStore } from 'features/store/createAppStore';
import type { ReactNode } from 'react';
import { memo, useCallback, useEffect } from 'react';
import type { StoreApi } from 'zustand';

//*****************************************************************************************
// App Location Provider
//*****************************************************************************************

export const DEFAULT_APP_LOCATION_STORE: AppLocationStore = {
  definitions: null,
  snapshots: {}
};

export const {
  StoreProvider: AppLocationStoreProvider,
  useStore: useAppLocationStore,
  useSetStore: useAppSetLocationStore,
  useStoreApi: useAppLocationStoreApi
} = createAppStore<AppLocationStore>(DEFAULT_APP_LOCATION_STORE);

AppLocationStoreProvider.displayName = 'AppLocationStoreProvider';

export const getAppLocationStateFromApi = (api: StoreApi<AppLocationStore>): AppLocationStore => {
  return api?.getState() || DEFAULT_APP_LOCATION_STORE;
};

export type AppLocationProviderProps = {
  /** All of the app's created routes */
  appRoutes: AppRoutes;
  /** Provider children. */
  children: ReactNode;
};

const AppLocationSync = memo(({ appRoutes }: Omit<AppLocationProviderProps, 'children'>) => {
  const setLocationStore = useAppSetLocationStore();
  const routerStoreApi = useAppRouterStoreApi();

  const commitRouterToLocation = useCallback(
    (router: AppRouterStore) => setLocationStore(s => syncRouteSnapshotsFromRouter(s, router)),
    [setLocationStore]
  );

  useEffect(() => {
    setLocationStore(s => setRouteDefinitionsFromAppRoutes(s, appRoutes));
  }, [appRoutes, setLocationStore]);

  useEffect(() => {
    if (!routerStoreApi) return;
    commitRouterToLocation(routerStoreApi.getState());
    return routerStoreApi.subscribe(router => commitRouterToLocation(router));
  }, [commitRouterToLocation, routerStoreApi]);

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
