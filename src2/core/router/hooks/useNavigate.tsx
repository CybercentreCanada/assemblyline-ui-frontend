import { useCallback } from 'react';
import { useNavigate as useRouterNavigate } from 'react-router';
import { AppRoutes } from '../components/Routes';
import type { RoutePanel } from '../providers/PanelProvider';
import { useRouteID } from '../providers/RouteIdProvider';
import { useRouterStore } from '../providers/RouterProvider';
import { navigateOpenRoute } from '../utils/router.utils';

type NavigateOptions = { panel?: RoutePanel } | { variant?: 'open' | 'replace' };

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

  return useCallback(
    // (to: NavigateTo, options?: NavigateOptions) => {
    (type: 'open' | 'replace' | number, href: string, options?: NavigateOptions) => {
      // const nextLocation =
      //   type === 'open'
      //     ? navigateOpenRoute(store, href, routeKey)
      //     : type === 'replace'
      //       ? navigateReplaceRoute(store, href, routeKey)
      //       : typeof type === 'number'
      //         ? navigateGoToRoute(store, href, type, routeKey)
      //         : null;

      const nextLocation = navigateOpenRoute(store, href, routeKey);

      console.log(nextLocation);

      if (nextLocation) {
        routerNavigate(nextLocation.to, nextLocation.options);
      }
    },
    [routeKey]
  );
};
