import type { AppRouterStore } from 'core/router';
import { useAppRouterStoreApi } from 'core/router';
import type { AppRoutesRuntimeStore } from 'core/routes';
import { setRouteSpecsFromAppRoutes, syncRouteSnapshotsFromRouter } from 'core/routes';
import { createAppStore } from 'features/store/createAppStore';
import type { ReactNode } from 'react';
import { memo, useCallback, useEffect } from 'react';
import type { StoreApi } from 'zustand';

//*****************************************************************************************
// App Routes Runtime Provider
//*****************************************************************************************

export const DEFAULT_APP_ROUTES_RUNTIME_STORE: AppRoutesRuntimeStore = {
  specs: null,
  snapshots: {}
};

export const {
  StoreProvider: AppRoutesRuntimeStoreProvider,
  useStore: useAppRoutesRuntimeStore,
  useSetStore: useAppSetRoutesRuntimeStore,
  useStoreApi: useAppRoutesRuntimeStoreApi
} = createAppStore<AppRoutesRuntimeStore>(DEFAULT_APP_ROUTES_RUNTIME_STORE);

AppRoutesRuntimeStoreProvider.displayName = 'AppRoutesRuntimeStoreProvider';

export const getAppRoutesRuntimeStateFromApi = (api: StoreApi<AppRoutesRuntimeStore>): AppRoutesRuntimeStore => {
  return api?.getState() || DEFAULT_APP_ROUTES_RUNTIME_STORE;
};

export type AppRoutesRuntimeProviderProps = {
  /** All of the app's created routes */
  appRoutes: AppRoutes;
  /** Provider children. */
  children: ReactNode;
};

const AppRoutesRuntimeSync = memo(({ appRoutes }: Omit<AppRoutesRuntimeProviderProps, 'children'>) => {
  const setRouteRuntimeStore = useAppSetRoutesRuntimeStore();
  const routerStoreApi = useAppRouterStoreApi();

  const commitRouterToLocation = useCallback(
    (router: AppRouterStore) => setRouteRuntimeStore(s => syncRouteSnapshotsFromRouter(s, router)),
    [setRouteRuntimeStore]
  );

  useEffect(() => {
    setRouteRuntimeStore(s => setRouteSpecsFromAppRoutes(s, appRoutes));
  }, [appRoutes, setRouteRuntimeStore]);

  useEffect(() => {
    if (!routerStoreApi) return;
    commitRouterToLocation(routerStoreApi.getState());
    return routerStoreApi.subscribe(router => commitRouterToLocation(router));
  }, [commitRouterToLocation, routerStoreApi]);

  return null;
});

AppRoutesRuntimeSync.displayName = 'AppRoutesRuntimeSync';

export const AppRoutesRuntimeProvider = memo(({ children, appRoutes }: AppRoutesRuntimeProviderProps) => (
  <>
    <AppRoutesRuntimeSync appRoutes={appRoutes} />
    {children}
  </>
));

AppRoutesRuntimeProvider.displayName = 'AppRoutesRuntimeProvider';

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
