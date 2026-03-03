import { useCallback } from 'react';
import { useNavigate as useRouterNavigate } from 'react-router';
import { AppRoutes } from '../components/Routes';
import { DEFAULT_ROUTER_ROUTE } from '../models/router.defaults';
import { RouterRoute } from '../models/router.models';
import { useRouteID } from '../providers/RouteIdProvider';
import { useRouterStore } from '../providers/RouterProvider';
import { addRoute, findPanelKey, insertRightRoute, sanitizeRouter, storeToNavigate } from '../utils/router.utils';

type NavigateOptions = { variant: 'open' } | { variant: 'replace' } | { variant: 'to'; panel: number };
type AppRoute = AppRoutes[number];

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type RouteInput<Route extends AppRoute> = Expand<
  { path: Route['path'] } & (Route['params'] extends undefined ? { params?: never } : { params: Route['params'] }) &
    (Route['search'] extends undefined ? { search?: never } : { search?: Partial<Route['search']> }) &
    (Route['hash'] extends undefined ? { hash?: never } : { hash?: Route['hash'] })
>;

export type NavigateTo = AppRoute extends infer Route ? (Route extends AppRoute ? RouteInput<Route> : never) : never;

export const useNavigate = () => {
  const routerNavigate = useRouterNavigate();
  const { routeKey } = useRouteID();
  const [store] = useRouterStore(s => s);

  let navigationStyle: 'push' | 'loop' = 'push';

  return useCallback(
    (href: string, options?: NavigateOptions) => {
      let nextStore = store;
      const panelKey = findPanelKey(nextStore, routeKey, 'active') + 1;
      if (panelKey === null) return null;

      const nextRoute: RouterRoute = { ...DEFAULT_ROUTER_ROUTE, href };
      if (navigationStyle === 'push') {
        if (panelKey >= nextStore.panels.length) nextStore = insertRightRoute(nextStore, nextRoute);
        else nextStore = addRoute(nextStore, nextRoute, panelKey);
      } else if (navigationStyle === 'loop') {
      }

      nextStore = sanitizeRouter(nextStore);
      const nextLocation = storeToNavigate(nextStore);
      if (nextLocation) routerNavigate(nextLocation.to, nextLocation.options);
    },
    [routeKey]
  );
};
