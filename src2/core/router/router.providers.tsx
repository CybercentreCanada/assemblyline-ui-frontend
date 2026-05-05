import { useAppPreferenceStore } from 'core/preference';
import { createAppStore } from 'features/store/createAppStore';
import type { PropsWithChildren } from 'react';
import { memo, useEffect } from 'react';
import type { Location } from 'react-router';
import { BrowserRouter, useLocation } from 'react-router';
import type { AppRouterState, AppRouterStore } from './router.models';
import { DEFAULT_APP_ROUTER_STORE } from './router.models';
import { locationToStore } from './router.utils';

//*****************************************************************************************
// App Router Store Provider
//*****************************************************************************************
export const {
  StoreProvider: AppRouterStoreProvider,
  useStore: useAppRouterStore,
  useSetStore: useAppSetRouterStore
} = createAppStore<AppRouterStore>(DEFAULT_APP_ROUTER_STORE);

AppRouterStoreProvider.displayName = 'AppRouterStoreProvider';

//*****************************************************************************************
// App Router Store Sync
//*****************************************************************************************
export const AppRouterProvider = memo(({ children }: PropsWithChildren) => {
  const location: Location<AppRouterState> = useLocation() as Location<AppRouterState>;

  const maxPanels = useAppPreferenceStore(s => s.router.maxPanels);
  const maxNodes = useAppPreferenceStore(s => s.router.maxNodes);

  const setRouter = useAppSetRouterStore();

  useEffect(() => {
    setRouter(s => {
      const store = locationToStore(s, location);
      return { ...store, maxNodes: 2, maxPanels: 2 };
    });
  }, []);

  return children;
});

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
