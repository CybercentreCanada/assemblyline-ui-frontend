import { useCallback } from 'react';
import { usePanel, type RoutePanel } from '../providers/PanelProvider';
import { useRouterContext } from '../providers/RouterProvider';
import { AppRoutes } from '../store/routes';

type NavigateOptions = { panel?: RoutePanel } | { variant?: 'replace' | 'next' };

type AppRoute = AppRoutes[number];

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

type RouteInput<Route extends AppRoute> = Expand<
  { path: Route['path'] } & (Route['params'] extends undefined ? { params?: never } : { params: Route['params'] }) &
    (Route['search'] extends undefined ? { search?: never } : { search?: Partial<Route['search']> }) &
    (Route['hash'] extends undefined ? { hash?: never } : { hash?: Route['hash'] })
>;

export type NavigateTo = AppRoute extends infer Route ? (Route extends AppRoute ? RouteInput<Route> : never) : never;

export const useNavigate = () => {
  const { panel } = usePanel();
  const { navigateTo } = useRouterContext();

  return useCallback(
    (to: NavigateTo, options?: NavigateOptions) => {
      // const currentPanel: RoutePanel = panel === 2 ? 'drawer' : 'main';
      // if (typeof to === 'string') {
      //   navigateTo(to, { panel: currentPanel });
      //   return;
      // }
      // const targetRoute = to.to ?? defaultRoute;
      // if (!targetRoute) {
      //   throw new Error('useNavigate requires a route target: pass a route to the hook or in the call.');
      // }
      // const href = targetRoute.to((to as { params: PathParams<Route['path']> }).params);
      // navigateTo(href, { panel: to.panel ?? currentPanel, replace: to.replace });
    },
    []
    // [defaultRoute, navigateTo, panel]
  );
};
