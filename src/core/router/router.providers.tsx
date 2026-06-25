import type { AppRouterNavigation, AppRouterStore } from 'core/router';
import { DEFAULT_APP_ROUTER_STORE } from 'core/router';
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
  const location = useLocation() as Location<AppRouterNavigation>;
  const navigate = useNavigate();
  const routerStoreApi = useAppRouterStoreApi();
  const setRouterStore = useAppSetRouterStore();

  // Sync Location -> App Router Store
  useEffect(() => {
    if (setRouterStore) setRouterStore(store => syncLocationToStore(store, location));
  }, [location, setRouterStore]);

  // Sync App Router Store -> Location
  useEffect(() => {
    if (!routerStoreApi) return;
    const unsubscribe = routerStoreApi.subscribe((store: AppRouterStore) => {
      const nextStore = syncStoreToLocation(store, navigate);
      if (nextStore) setRouterStore(nextStore);
    });
    return unsubscribe;
  }, [navigate, routerStoreApi, setRouterStore]);

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
