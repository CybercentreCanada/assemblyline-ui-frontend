import { getAppPreferenceStateFromApi, useAppPreferenceStoreApi } from 'core/preference';
import type { AppLocationState, AppNavigationStore, AppRouterStore } from 'core/router';
import {
  clearBlockedRoutes,
  clearNavigationStore,
  DEFAULT_APP_NAVIGATION_STORE,
  DEFAULT_APP_ROUTER_STORE,
  getHashFragmentsFromRouter,
  getLocationStateFromRouter,
  getNavigationFromLocation,
  hasBlockedRoutes,
  hasRoutes,
  reconcileRouterFromNavigation,
  sanitizeRouterStore
} from 'core/router';
import { getAppLocationStateFromApi, useAppLocationStoreApi } from 'core/routes';
import { createAppStore } from 'features/store/createAppStore';
import type { PropsWithChildren } from 'react';
import { memo, useCallback, useEffect, useRef } from 'react';
import type { Location } from 'react-router';
import { BrowserRouter, useLocation, useNavigate } from 'react-router';
import type { StoreApi } from 'zustand';

//*****************************************************************************************
// App Router Provider
//*****************************************************************************************
export const {
  StoreProvider: AppRouterStoreProvider,
  useStore: useAppRouterStore,
  useSetStore: useAppSetRouterStore,
  useStoreApi: useAppRouterStoreApi
} = createAppStore<AppRouterStore>(DEFAULT_APP_ROUTER_STORE);

export const getAppRouterStateFromApi = (api: StoreApi<AppRouterStore>): AppRouterStore => {
  return api?.getState() || DEFAULT_APP_ROUTER_STORE;
};

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

export const getAppNavigationStateFromApi = (api: StoreApi<AppNavigationStore>): AppNavigationStore => {
  return api?.getState() || DEFAULT_APP_NAVIGATION_STORE;
};

AppNavigationStoreProvider.displayName = 'AppNavigationStoreProvider';

export const AppNavigationSync = memo(() => {
  const location = useLocation() as Location<AppLocationState>;
  const navigate = useNavigate();
  const locationStoreApi = useAppLocationStoreApi();
  const navigationStoreApi = useAppNavigationStoreApi();
  const preferenceStoreApi = useAppPreferenceStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const setNavigationStore = useAppSetNavigationStore();
  const setRouterStore = useAppSetRouterStore();

  // Sync Location -> App Navigation Store
  useEffect(() => {
    const navigationState = getAppNavigationStateFromApi(navigationStoreApi);
    const routerState = getAppRouterStateFromApi(routerStoreApi);
    const locationState = getAppLocationStateFromApi(locationStoreApi);
    const patch = getNavigationFromLocation(navigationState, routerState, locationState, location);
    if (patch && setNavigationStore) setNavigationStore(patch);
  }, [location, locationStoreApi, navigationStoreApi, routerStoreApi, setNavigationStore]);

  const commitNavigationToRouter = useCallback(() => {
    const navigationState = getAppNavigationStateFromApi(navigationStoreApi);
    const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
    let routerState = getAppRouterStateFromApi(routerStoreApi);
    if (!hasRoutes(navigationState) || hasBlockedRoutes(routerState)) return;

    routerState = reconcileRouterFromNavigation(routerState, navigationState, preferenceState);
    routerState = sanitizeRouterStore(routerState, preferenceState);
    const hashFragments = getHashFragmentsFromRouter(routerState);

    document.title = !hashFragments?.[0] ? 'Assemblyline 4' : `ALV4 | ${hashFragments?.[0]}`;

    void navigate(!hashFragments?.length ? '/v1' : `/v1#${hashFragments.join('#')}`, {
      state: getLocationStateFromRouter(routerState),
      replace: navigationState?.replace || false
    });

    // routerState = syncStoreToLocation(navigationState, routerState, preferenceState, navigate);
    setRouterStore(routerState);
    setNavigationStore(clearNavigationStore);
  }, [navigate, navigationStoreApi, preferenceStoreApi, routerStoreApi, setNavigationStore, setRouterStore]);

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
  const setRouterStore = useAppSetRouterStore();
  const lastPromptedNavigationIdRef = useRef<string | null>(null);

  const onNavigationChange = useCallback(
    (store: AppNavigationStore) => {
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      const hasBlockers = hasBlockedRoutes(routerState);
      if (!hasBlockers) {
        lastPromptedNavigationIdRef.current = null;
        return;
      }

      const hasNavigationRequest = store.id !== routerState.id;

      if (!hasNavigationRequest) return;
      if (lastPromptedNavigationIdRef.current === store.id) return;
      lastPromptedNavigationIdRef.current = store.id;

      const shouldLeave = window.confirm('You have unsaved changes. Leave this page and discard them?');
      if (!shouldLeave) return;

      setRouterStore(clearBlockedRoutes);
    },
    [routerStoreApi, setRouterStore]
  );

  // Browser-level warning for refresh, close tab, hard unload
  useEffect(() => {
    if (!navigationStoreApi) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      const hasBlockers = hasBlockedRoutes(routerState);
      if (!hasBlockers) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [navigationStoreApi, routerStoreApi]);

  // In-app navigation warning when a navigation request exists but blockers are active
  useEffect(() => {
    if (!navigationStoreApi) return;

    const unsubscribe = navigationStoreApi.subscribe(onNavigationChange);
    onNavigationChange(navigationStoreApi.getState());

    return unsubscribe;
  }, [navigationStoreApi, onNavigationChange]);

  return <>{children}</>;
});

export const AppNavigationProvider = memo(({ children }: PropsWithChildren) => (
  <AppNavigationBlocker>
    <AppNavigationSync />
    {children}
  </AppNavigationBlocker>
));

AppNavigationProvider.displayName = 'AppNavigationProvider';
