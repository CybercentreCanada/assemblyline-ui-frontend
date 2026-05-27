import type { AppRouterState, AppRouterStore } from 'core/router/router.models';
import { DEFAULT_APP_ROUTER_STORE } from 'core/router/router.models';
import { syncLocationToStore, syncStoreToLocation } from 'core/routes';
import { createAppStore } from 'features/store/createAppStore';
import type { PropsWithChildren } from 'react';
import { memo, useEffect } from 'react';
import type { Location } from 'react-router';
import { BrowserRouter, useLocation, useNavigate } from 'react-router';

//*****************************************************************************************
// App Router Store Provider
//*****************************************************************************************
export const {
  StoreProvider: AppRouterStoreProvider,
  useStore: useAppRouterStore,
  useSetStore: useAppSetRouterStore,
  useStoreApi: useAppRouterStoreApi
} = createAppStore<AppRouterStore>(DEFAULT_APP_ROUTER_STORE);

AppRouterStoreProvider.displayName = 'AppRouterStoreProvider';

//*****************************************************************************************
// App Router Sync
//*****************************************************************************************
export const AppRouterSync = memo(() => {
  const location = useLocation() as Location<AppRouterState>;
  const navigate = useNavigate();
  const routerStoreApi = useAppRouterStoreApi();
  const setRouterStore = useAppSetRouterStore();

  // Sync React Router -> App Router Store
  useEffect(() => {
    if (!setRouterStore) return;

    setRouterStore(store => syncLocationToStore(store, location));
  }, [location, setRouterStore]);

  // Sync App Router Store -> React Router
  useEffect(() => {
    if (!routerStoreApi) return;

    return routerStoreApi.subscribe((store: AppRouterStore) => {
      if (location.state?.id && location.state.id === store.id) return;

      const nextNavigation = syncStoreToLocation(store, location);
      if (nextNavigation) void navigate(nextNavigation.to, nextNavigation.options);
    });
  }, [location, navigate, routerStoreApi]);

  return null;
});

//*****************************************************************************************
// App Router Provider
//*****************************************************************************************
export const AppRouterProvider = memo(({ children }: PropsWithChildren) => (
  <>
    {children}
    <AppRouterSync />
  </>
));

AppRouterProvider.displayName = 'AppRouterProvider';

//*****************************************************************************************
// App Router Root Provider
//*****************************************************************************************
export const AppRouterRootProvider = memo(({ children }: PropsWithChildren) => (
  <BrowserRouter basename="/">
    <AppRouterStoreProvider>{children}</AppRouterStoreProvider>
  </BrowserRouter>
));

AppRouterRootProvider.displayName = 'AppRouterRootProvider';
