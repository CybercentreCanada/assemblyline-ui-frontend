import { createStoreContext } from 'core/store/createStoreContext';
import React, { useCallback } from 'react';
import type { Location } from 'react-router';
import { useLocation, useNavigate } from 'react-router';
import { RouterState, RouterStore } from '../models/router.models';
import { parseLocationToRouterStore } from '../utils/router.utils';

// import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

// ********************************************************************************************
// Router Store
// ********************************************************************************************

const createDefaultRouterStore = (): RouterStore => ({
  maxPanels: 3,
  maxNodes: 3,
  panels: [],
  nodes: [],
  routes: {}
});

const { StoreProvider, useStore: useRouterStore } = createStoreContext<RouterStore>(createDefaultRouterStore());

export { useRouterStore };

export const RouterProvider = React.memo(({ children }: { children: React.ReactNode }) => {
  const location: Location<RouterState> = useLocation();
  const navigate = useNavigate();

  console.log(location.search, location.state);

  const reset = useCallback(
    (store: RouterStore) => {
      const nextStore = parseLocationToRouterStore(store, location);
      // navigate(parseRouterStoreToLocation(nextStore, location), { replace: true });
      return nextStore;
    },
    [location]
  );

  return <StoreProvider data={reset}>{children}</StoreProvider>;
});

RouterProvider.displayName = 'RouterProvider';
