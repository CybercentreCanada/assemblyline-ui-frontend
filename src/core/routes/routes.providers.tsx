import type { AppRouterStore } from 'core/router';
import { useAppRouterStoreApi } from 'core/router';
import type { AppLocationParamStore } from 'core/routes';
import { setRouteSpecsFromAppRoutes, syncRouteParamsFromRouter } from 'core/routes';
import { createAppStore } from 'features/store/createAppStore';
import type { ReactNode } from 'react';
import { memo, useCallback, useEffect } from 'react';

//*****************************************************************************************
// App Location Param Provider
//*****************************************************************************************

export const getDefaultLocationParamStore = function (): AppLocationParamStore {
  return { specs: {} as never, params: {} };
};

export const {
  StoreProvider: AppLocationParamStoreProvider,
  useStore: useAppLocationParamStore,
  useSetStore: useAppSetLocationParamStore,
  useStoreApi: useAppLocationParamStoreApi
} = createAppStore<AppLocationParamStore>(getDefaultLocationParamStore());

AppLocationParamStoreProvider.displayName = 'AppLocationParamStoreProvider';

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
    (router: AppRouterStore) => setLocationParamStore(s => syncRouteParamsFromRouter(s, router)),
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

export const AppLocationParamProvider = memo(({ appRoutes, children }: AppLocationParamProviderProps) => (
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
