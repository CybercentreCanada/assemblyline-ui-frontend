import { useCallback } from 'react';
import { type RoutePanel } from '../providers/PanelProvider';
import { useRouteID } from '../providers/RouteIdProvider';
import { useRouterActions } from '../providers/RouterProvider';
import { AppRoutes } from '../store/routes';

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
  const { routeId } = useRouteID();
  const { navigateTo } = useRouterActions();

  return useCallback(
    // (to: NavigateTo, options?: NavigateOptions) => {
    (to: string, options?: NavigateOptions) => {
      const explicitPanel = options && 'panel' in options ? options.panel : undefined;
      navigateTo(to, { fromPanel: routeId ? 'panel-1' : 'panel-0', panel: explicitPanel });

      // const explicitPanel = options && 'panel' in options ? options.panel : undefined;
      // const path = Object.entries((to.params ?? {}) as Record<string, string | number | boolean>).reduce(
      //   (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(String(value))),
      //   to.path
      // );
      // const params = new URLSearchParams();
      // Object.entries((to.search ?? {}) as Record<string, unknown>).forEach(([key, value]) => {
      //   if (value === undefined || value === null) return;
      //   params.set(key, String(value));
      // });
      // const search = params.toString();
      // const hash = to.hash ? `#${to.hash}` : '';
      // const href = `${path}${search ? `?${search}` : ''}${hash}`;
      // navigateTo(href, { fromPanel: panel, panel: explicitPanel });
    },
    [navigateTo, routeId]
  );
};
