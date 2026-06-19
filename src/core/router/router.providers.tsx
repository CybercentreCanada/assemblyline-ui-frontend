import type { AppRouterState, AppRouterStore } from 'core/router';
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
  const location = useLocation() as Location<AppRouterState>;
  const navigate = useNavigate();
  const routerStoreApi = useAppRouterStoreApi();
  const setRouterStore = useAppSetRouterStore();
  // const appliedStoreIdRef = useRef<string | null>(null);

  // Sync Location -> App Router Store
  useEffect(() => {
    if (!setRouterStore) return;

    setRouterStore(store => syncLocationToStore(store, location));
  }, [location, setRouterStore]);

  // Sync App Router Store -> Location
  useEffect(() => {
    if (!routerStoreApi) return;

    return routerStoreApi.subscribe((store: AppRouterStore) => {
      for (const [i] of store.panels.entries()) {
        if (store.panels[i].navigation && !store.panels[i].blocker.isBlocked) {
          switch (store.panels[i].navigation.type) {
            case 'create':
              // setRouterStore(s =>s)
              break;
            case 'update':
              // setRouterStore(s =>s)
              break;
            case 'delete':
              // setRouterStore(s =>s)
              break;
          }
        }
      }

      if (!location.state?.id || location.state.id !== store.id) {
        const nextNavigation = syncStoreToLocation(store, location);
        if (nextNavigation) void navigate(nextNavigation.to, nextNavigation.options);
      }

      // if (appliedStoreIdRef.current && appliedStoreIdRef.current === store.id) {
      //   appliedStoreIdRef.current = null;
      //   return;
      // }

      // if (location.state?.id && location.state.id === store.id) return;

      // const panelKey = store.panels.findIndex(panel => !!panel.navigation?.to);

      // if (panelKey >= 0) {
      //   if (store.panels[panelKey].blocker?.isBlocked) return;

      //   const replace = !!store.panels[panelKey].navigation.replace;
      //   let nextStore: AppRouterStore | null = null;

      //   setRouterStore(currentStore => {
      //     nextStore = applyPanelNavigation(currentStore, panelKey);
      //     appliedStoreIdRef.current = nextStore.id;
      //     return nextStore;
      //   });

      //   if (!nextStore) return;

      //   const nextNavigation = syncStoreToLocation(nextStore, location);
      //   if (nextNavigation) void navigate(nextNavigation.to, { ...nextNavigation.options, replace });
      //   return;
      // }

      // const nextNavigation = syncStoreToLocation(store, location);

      // if (nextNavigation) void navigate(nextNavigation.to, nextNavigation.options);
    });
  }, [location, navigate, routerStoreApi, setRouterStore]);

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
