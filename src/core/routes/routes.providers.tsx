import type { AppRouterStore } from 'core/router';
import { useAppRouterStoreApi } from 'core/router';
import type { AppLocationParamStore } from 'core/routes';
import { setRouteSpecsFromAppRoutes, syncRouteSnapshotsFromRouter } from 'core/routes';
import { createAppStore } from 'features/store/createAppStore';
import type { ReactNode } from 'react';
import { memo, useCallback, useEffect } from 'react';
import type { StoreApi } from 'zustand';

//*****************************************************************************************
// App Route Locations Provider
//*****************************************************************************************

export const DEFAULT_APP_LOCATION_PARAM_STORE: AppLocationParamStore = {
  specs: null,
  locations: {}
};

export const {
  StoreProvider: AppLocationParamStoreProvider,
  useStore: useAppLocationParamStore,
  useSetStore: useAppSetLocationParamStore,
  useStoreApi: useAppLocationParamStoreApi
} = createAppStore<AppLocationParamStore>(DEFAULT_APP_LOCATION_PARAM_STORE);

AppLocationParamStoreProvider.displayName = 'AppLocationParamStoreProvider';

export const getAppLocationParamStateFromApi = (api: StoreApi<AppLocationParamStore>): AppLocationParamStore => {
  return api?.getState() || DEFAULT_APP_LOCATION_PARAM_STORE;
};

export type AppLocationParamProviderProps = {
  /** All of the app's created routes */
  appRoutes: AppRoutes;
  /** Provider children. */
  children: ReactNode;
};

const AppLocationParamSync = memo(({ appRoutes }: Omit<AppLocationParamProviderProps, 'children'>) => {
  const setLocationParamStore = useAppSetLocationParamStore();
  const routerStoreApi = useAppRouterStoreApi();

  const commitRouterToLocation = useCallback(
    (router: AppRouterStore) => setLocationParamStore(s => syncRouteSnapshotsFromRouter(s, router)),
    [setLocationParamStore]
  );

  useEffect(() => {
    setLocationParamStore(s => setRouteSpecsFromAppRoutes(s, appRoutes));
  }, [appRoutes, setLocationParamStore]);

  useEffect(() => {
    if (!routerStoreApi) return;
    commitRouterToLocation(routerStoreApi.getState());
    return routerStoreApi.subscribe(router => commitRouterToLocation(router));
  }, [commitRouterToLocation, routerStoreApi]);

  return null;
});

AppLocationParamSync.displayName = 'AppLocationParamSync';

export const AppLocationParamProvider = memo(({ children, appRoutes }: AppLocationParamProviderProps) => (
  <>
    <AppLocationParamSync appRoutes={appRoutes} />
    {children}
  </>
));

AppLocationParamProvider.displayName = 'AppLocationParamProvider';

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
