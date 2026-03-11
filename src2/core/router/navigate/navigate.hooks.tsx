import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { AppRoute } from '../route/route.components';
import { useAppRouteKey } from '../route/route.providers';
import { useAppRouterStore } from '../router/router.providers';
import {
  addRoute,
  findPanelKey,
  insertRightPanel,
  sanitizeAppRouterStore,
  storeToNavigate,
  updatePanel
} from '../router/router.utils';

//*****************************************************************************************
// useNavigate
//*****************************************************************************************
type NavigateOptions = { variant: 'open' } | { variant: 'replace' } | { variant: 'to'; panel: number };

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type RouteInput<Route extends AppRoute> = Expand<
  { path: Route['path'] } & (Route['params'] extends undefined ? { params?: never } : { params: Route['params'] }) &
    (Route['search'] extends undefined ? { search?: never } : { search?: Partial<Route['search']> }) &
    (Route['hash'] extends undefined ? { hash?: never } : { hash?: Route['hash'] })
>;

export type NavigateTo = AppRoute extends infer Route ? (Route extends AppRoute ? RouteInput<Route> : never) : never;

export const useAppNavigate = () => {
  const routerNavigate = useNavigate();
  const routeKey = useAppRouteKey();
  const store = useAppRouterStore(s => s);

  let navigationStyle: 'push' | 'loop' = 'push';

  return useCallback(
    (href: string, options?: NavigateOptions) => {
      let nextStore = store;
      let nextRouteKey = null;

      const currentPanelKey = findPanelKey(store, { routeKey });
      const panelKey = currentPanelKey >= 0 ? currentPanelKey + 1 : 0;
      [nextStore, nextRouteKey] = addRoute(store, { href });

      if (navigationStyle === 'push') {
        if (panelKey >= nextStore.panels.length)
          [nextStore] = insertRightPanel(nextStore, panelKey, {
            routeKey: nextRouteKey,
            temporaryRouteKey: nextRouteKey
          });
        else nextStore = updatePanel(nextStore, panelKey, { routeKey: nextRouteKey, temporaryRouteKey: nextRouteKey });
      } else if (navigationStyle === 'loop') {
      }

      nextStore = sanitizeAppRouterStore(nextStore);
      const nextLocation = storeToNavigate(nextStore);
      if (nextLocation) routerNavigate(nextLocation.to, nextLocation.options);
    },
    [navigationStyle, routeKey, routerNavigate, store]
  );
};
