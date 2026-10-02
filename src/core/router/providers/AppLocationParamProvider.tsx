import type { AppLocationParamStore, AppRouterStore } from 'core/router';
import { setAppRouteFromAppRoutes, syncRouteParamsFromRouter, useAppRouterStoreApi } from 'core/router';
import { createAppStore } from 'features/store';
import type { PropsWithChildren } from 'react';
import { memo, useCallback, useEffect } from 'react';
import type { StoreApi } from 'zustand/vanilla';

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

export const getAppLocationParamStateFromApi = (api: StoreApi<AppLocationParamStore>): AppLocationParamStore => {
  return api?.getState() || getDefaultLocationParamStore();
};

export type AppLocationParamProviderProps = PropsWithChildren<{
  /** All of the app's created routes */
  routes: AppRoutes;
}>;

const AppLocationParamSync = memo(({ routes }: Omit<AppLocationParamProviderProps, 'children'>) => {
  const setLocationParamStore = useAppSetLocationParamStore();
  const routerStoreApi = useAppRouterStoreApi();

  const commitRouterToLocation = useCallback(
    (router: AppRouterStore) => setLocationParamStore(s => syncRouteParamsFromRouter(s, router)),
    [setLocationParamStore]
  );

  useEffect(() => {
    setLocationParamStore(s => setAppRouteFromAppRoutes(s, routes));
  }, [routes, setLocationParamStore]);

  useEffect(() => {
    if (!routerStoreApi) return;
    commitRouterToLocation(routerStoreApi.getState());
    return routerStoreApi.subscribe(router => commitRouterToLocation(router));
  }, [commitRouterToLocation, routerStoreApi]);

  return null;
});

AppLocationParamSync.displayName = 'AppLocationParamSync';

export const AppLocationParamProvider = memo(({ routes, children }: AppLocationParamProviderProps) => (
  <>
    <AppLocationParamSync routes={routes} />
    {children}
  </>
));

AppLocationParamProvider.displayName = 'AppLocationParamProvider';
