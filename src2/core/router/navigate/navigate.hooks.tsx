import type { AppRoute } from 'app/app.routes';
import { APP_ROUTES } from 'app/app.routes';
import { useCallback, useMemo } from 'react';
import type { LinkProps } from 'react-router';
import { useNavigate } from 'react-router';
import { useAppRouteKey } from '../route/route.providers';
import { createAppRoute } from '../route/route.utils';
import { useAppRouterStore } from '../router/router.providers';
import {
  addRoute,
  findPanelKey,
  insertRightPanel,
  sanitizeAppRouterStore,
  storeToNavigate,
  updatePanel
} from '../router/router.utils';
import { AppNavigateToInput, AppRouteLink } from './navigate.models';

//*****************************************************************************************
// useNavigate
//*****************************************************************************************

export const useAppNavigateTo = (
  to: AppNavigateToInput,
  routes: readonly ReturnType<typeof createAppRoute>[]
): LinkProps['to'] => {
  const resolvedTo = useMemo(() => (typeof to === 'function' ? to() : to), [to]);

  return useMemo<LinkProps['to'] | undefined>(() => {
    if (resolvedTo == null) return undefined;
    if (typeof resolvedTo === 'string') return resolvedTo;
    if (typeof resolvedTo === 'object' && !('path' in resolvedTo)) return resolvedTo;

    const { path, params, search, hash } = resolvedTo;

    const route = routes.find(r => r.path === path);
    const resolvedPath =
      route?.params && params
        ? (route.params.stringify(params as never) as string)
        : params
          ? Object.entries(params).reduce(
              (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(String(value))),
              path
            )
          : path;

    const resolvedSearch = search == null || !route?.search ? '' : `?${route.search.full(search as never).toString()}`;
    const resolvedHash = hash ? (hash.startsWith('#') ? hash : `#${hash}`) : '';

    return `${resolvedPath}${resolvedSearch}${resolvedHash}`;
  }, [resolvedTo, routes]);
};

export const useAppLinkTo = ({
  path,
  params,
  search,
  hash
}: Pick<AppRouteLink, 'path' | 'params' | 'search' | 'hash'>) => {
  const to = useAppNavigateTo({ path, params, search, hash }, APP_ROUTES);
  return (to ?? path) as string;
};

export const useAppLinkOnClick = ({ path, params, search, hash, variant, panel, onClick }: AppRouteLink) => {
  const navigate = useAppNavigate();

  const to = useAppLinkTo({ path, params, search, hash });

  return useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      if (variant === 'to') {
        navigate(to, { variant: 'to', panel: panel ?? 0 });
      } else {
        navigate(to, { variant });
      }
    },
    [navigate, onClick, panel, to, variant]
  );
};

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

      const currentRouteKey = routeKey?.[0] ?? null;
      if (!currentRouteKey) return;

      const currentPanelKey = findPanelKey(store, { routeKey: currentRouteKey });
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
