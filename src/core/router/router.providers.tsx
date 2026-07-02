import type { AppLocationState, AppNavigationStore, AppRouterStore } from 'core/router';
import {
  clearNavigation,
  DEFAULT_APP_NAVIGATION_STORE,
  DEFAULT_APP_ROUTER_STORE,
  hasBlockedRoutes,
  reconcileRouterFromNavigation
} from 'core/router';
import { syncLocationToStore, syncStoreToLocation } from 'core/routes';
import { createAppStore } from 'features/store/createAppStore';
import type { PropsWithChildren } from 'react';
import { memo, useCallback, useEffect, useRef } from 'react';
import type { Location } from 'react-router';
import { BrowserRouter, useLocation, useNavigate } from 'react-router';
import { getAppNavigationStateFromApi, getAppRouterStateFromApi, hasRoutes } from './router.utils';

//*****************************************************************************************
// App Router Provider
//*****************************************************************************************
export const {
  StoreProvider: AppRouterStoreProvider,
  useStore: useAppRouterStore,
  useSetStore: useAppSetRouterStore,
  useStoreApi: useAppRouterStoreApi
} = createAppStore<AppRouterStore>(DEFAULT_APP_ROUTER_STORE);

AppRouterStoreProvider.displayName = 'AppRouterStoreProvider';

export const AppRouterProvider = memo(({ children }: PropsWithChildren) => (
  <BrowserRouter basename="/">{children}</BrowserRouter>
));

AppRouterProvider.displayName = 'AppRouterProvider';

//*****************************************************************************************
// App Navigation Provider
//*****************************************************************************************

export const {
  StoreProvider: AppNavigationStoreProvider,
  useStore: useAppNavigationStore,
  useSetStore: useAppSetNavigationStore,
  useStoreApi: useAppNavigationStoreApi
} = createAppStore<AppNavigationStore>(DEFAULT_APP_NAVIGATION_STORE);

AppNavigationStoreProvider.displayName = 'AppNavigationStoreProvider';

export const AppNavigationSync = memo(() => {
  const location = useLocation() as Location<AppLocationState>;
  const navigate = useNavigate();
  const routerStoreApi = useAppRouterStoreApi();
  const navigationStoreApi = useAppNavigationStoreApi();
  const setRouterStore = useAppSetRouterStore();
  const setNavigationStore = useAppSetNavigationStore();

  const commitNavigationToRouter = useCallback(() => {
    const navigationState = getAppNavigationStateFromApi(navigationStoreApi);
    let routerState = getAppRouterStateFromApi(routerStoreApi);

    if (!hasRoutes(navigationState) || hasBlockedRoutes(navigationState)) return;

    routerState = reconcileRouterFromNavigation(routerState, navigationState);
    routerState = syncStoreToLocation(routerState, navigate);

    setRouterStore(routerState);
    setNavigationStore(clearNavigation);
  }, [navigate, navigationStoreApi, routerStoreApi, setNavigationStore, setRouterStore]);

  // Sync Location -> App Navigation Store
  useEffect(() => {
    const navigationState = getAppNavigationStateFromApi(navigationStoreApi);
    const routerState = getAppRouterStateFromApi(routerStoreApi);
    const patch = syncLocationToStore(navigationState, routerState, location);
    if (patch && setNavigationStore) setNavigationStore(patch);
  }, [location, navigationStoreApi, routerStoreApi, setNavigationStore]);

  // Sync App Navigation Store -> App Router Store
  useEffect(() => {
    commitNavigationToRouter();
    return navigationStoreApi?.subscribe(() => commitNavigationToRouter());
  }, [commitNavigationToRouter, navigationStoreApi]);

  return null;
});

export const AppNavigationBlocker = memo(({ children }: PropsWithChildren) => {
  const navigationStoreApi = useAppNavigationStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const setNavigationStore = useAppSetNavigationStore();
  const lastPromptedNavigationIdRef = useRef<string | null>(null);

  // Browser-level warning for refresh, close tab, hard unload
  useEffect(() => {
    if (!navigationStoreApi) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      const hasBlockers = hasBlockedRoutes(navigationStoreApi.getState());
      if (!hasBlockers) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [navigationStoreApi]);

  // In-app navigation warning when a navigation request exists but blockers are active
  useEffect(() => {
    if (!navigationStoreApi || !routerStoreApi || !setNavigationStore) return;

    const onNavigationChange = (store: AppNavigationStore) => {
      const hasBlockers = hasBlockedRoutes(store);
      if (!hasBlockers) {
        lastPromptedNavigationIdRef.current = null;
        return;
      }

      const routerStore = routerStoreApi.getState();
      const hasNavigationRequest = store.id !== routerStore.id;

      if (!hasNavigationRequest) return;
      if (lastPromptedNavigationIdRef.current === store.id) return;
      lastPromptedNavigationIdRef.current = store.id;

      const shouldLeave = window.confirm('You have unsaved changes. Leave this page and discard them?');
      if (!shouldLeave) return;

      setNavigationStore(s => {
        s.blockedRoutes = {};
        return s;
      });
    };

    const unsubscribe = navigationStoreApi.subscribe(onNavigationChange);
    onNavigationChange(navigationStoreApi.getState());

    return unsubscribe;
  }, [navigationStoreApi, routerStoreApi, setNavigationStore]);

  return <>{children}</>;
});

export const AppNavigationProvider = memo(({ children }: PropsWithChildren) => (
  <AppNavigationBlocker>
    <AppNavigationSync />
    {children}
  </AppNavigationBlocker>
));

AppNavigationProvider.displayName = 'AppNavigationProvider';
