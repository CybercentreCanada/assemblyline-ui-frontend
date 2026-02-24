import { useCallback } from 'react';
import { type RoutePanel } from '../providers/PanelProvider';
import { useRouteID } from '../providers/RouteIdProvider';
import { useRouterActions, useRouterStore } from '../providers/RouterProvider';
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
  const [, setStore] = useRouterStore(s => s);

  return useCallback(
    // (to: NavigateTo, options?: NavigateOptions) => {
    (to: string, options?: NavigateOptions) => {
      setStore(s => {
        console.log(routeId);

        const routeIndex = s.routes.findIndex(r => r.id === routeId);
        const nodeIndex = s.nodes.findIndex(n => n.routeKey === routeId);
        const panelIndex = s.panels.findIndex(p => p.nodeKey === s.nodes?.[nodeIndex]?.id);
        const nextPanelIndex = (panelIndex + 1) % s.panels.length;
        const nextPanel = s.panels?.[nextPanelIndex];
        const nextNodeIndex = s.nodes?.findIndex(n => n.id === nextPanel.nodeKey);
        const nextRouteKey = crypto.randomUUID();
        s.nodes[nextNodeIndex] = { ...s.nodes?.[nextNodeIndex], routeKey: nextRouteKey };
        return { ...s, nodes: s.nodes, routes: [...s.routes, { id: nextRouteKey, pathname: to }] };
      });

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
    [navigateTo, setStore]
  );
};
