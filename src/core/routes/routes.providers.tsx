import type { AppRouterStore } from 'core/router';
import { useAppRouterStoreApi } from 'core/router';
import type { AppLocationParamStore } from 'core/routes';
import { setAppRouteFromAppRoutes, syncRouteParamsFromRouter } from 'core/routes';
import { createAppStore } from 'features/store/createAppStore';
import type { ReactNode } from 'react';
import { memo, useCallback, useEffect } from 'react';

//*****************************************************************************************
// App Location Param Provider
//*****************************************************************************************

export const getDefaultLocationParamStore = function (): AppLocationParamStore {
  return { routes: {} as never, locations: {} };
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
    setLocationParamStore(s => setAppRouteFromAppRoutes(s, appRoutes));
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

export type AppPageKeyStore = {
  /** Route key for this route context, or null when no route context is available. */
  pageKey: keyof AppRouterStore['pages'] | null;
};

export const { StoreProvider: AppPageKeyStoreProvider, useStore: useAppPageKeyStore } = createAppStore<AppPageKeyStore>(
  { pageKey: null }
);

AppPageKeyStoreProvider.displayName = 'AppPageKeyStoreProvider';

export type AppPageKeyStoreProviderProps = {
  /** Provider children. */
  children: ReactNode;
  /** Route key to provide. */
  pageKey: keyof AppRouterStore['pages'];
};

export const AppPageKeyProvider = memo(({ children, pageKey }: AppPageKeyStoreProviderProps) => (
  <AppPageKeyStoreProvider data={{ pageKey }}>{children}</AppPageKeyStoreProvider>
));

AppPageKeyProvider.displayName = 'AppPageKeyProvider';
