import { APP_ROUTES } from 'app/app.routes';
import { useAppConfig } from 'core/config';
import { AppRoute, AppRouteLocation, CreatedAppRouteParamsMap, useAppRouteKey } from 'core/routes';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAppRouterSetStore, useAppRouterStore } from './router.providers';
import {
  addRoute,
  findPanelKey,
  insertRightPanel,
  sanitizeAppRouterStore,
  storeToNavigate,
  updatePanel
} from './router.utils';

const EMPTY_ROUTE_LOCATION: AppRouteLocation = { href: undefined, state: undefined };

function buildAppRouteLocation<const Route extends AppRoute>(to: CreatedAppRouteParamsMap<Route>): AppRouteLocation {
  const { path = undefined, params = undefined, search = undefined, hash = undefined } = to ?? {};

  if (!path) return EMPTY_ROUTE_LOCATION;

  const matchedRoute = APP_ROUTES.find(route => route.path === path);
  if (!matchedRoute) return EMPTY_ROUTE_LOCATION;

  const resolvedPathname =
    matchedRoute.params && params ? (matchedRoute.params.stringify(params as never) as string) : path;

  const searchDelta = matchedRoute.search && search ? matchedRoute.search.delta(search as never) : undefined;
  const searchString = searchDelta?.toLocationSearch();
  const state = searchDelta?.toLocationState();

  const resolvedHash = matchedRoute.hash && hash ? String(matchedRoute.hash(hash as never)) : undefined;

  const querySegment = searchString ? `?${searchString}` : '';
  const hashSegment = resolvedHash ? `#${resolvedHash}` : '';

  return { href: `${resolvedPathname}${querySegment}${hashSegment}`, state };
}

//*****************************************************************************************
// useAppRouteLocation
//*****************************************************************************************
export function useAppRouteLocation<const Route extends AppRoute>(
  to: CreatedAppRouteParamsMap<Route>
): AppRouteLocation {
  return useMemo(() => buildAppRouteLocation(to), [to]);
}

// //*****************************************************************************************
// // useAppHref
// //*****************************************************************************************
// export function useAppRouteLocation<const Route extends AppRoute>(
//   to: CreatedAppRouteParamsMap<Route>
// ): AppRouteLocation {
//   return useMemo(() => {
//     if (!to) return null;

//     const currentRoute = APP_ROUTES.find(r => r.path === to?.path);

//     const pathname =
//       !currentRoute?.params || !to?.params ? to.path : (currentRoute.params.stringify(to.params as never) as string);

//     const search =
//       !to?.search || !currentRoute?.search ? undefined : currentRoute.search.delta(to.search as never).toString();

//     const hash = !to?.hash || !currentRoute?.hash ? undefined : String(currentRoute.hash(to.hash as never));

//     return `${pathname}${!search ? '' : `?${search}`}${!hash ? '' : `#${hash}`}`;
//   }, [to]);
// }

// //*****************************************************************************************
// // useAppTo
// //*****************************************************************************************
// export function useAppTo<const Route extends AppRoute>(to: CreatedAppRouteParamsMap<Route>): LinkProps['to'] {
//   const href = useAppHref(to);

//   return useMemo(() => {
//     if (!href) return null;

//     const searchParams = new URLSearchParams();
//     searchParams.append('p', href);
//     return `/${searchParams.toString()}`;
//   }, [href]);
// }

//*****************************************************************************************
// useAppRouterNavigate
//*****************************************************************************************
export function useAppNavigate<const Route extends AppRoute>(): (to: CreatedAppRouteParamsMap<Route>) => void {
  const routerNavigate = useNavigate();
  const routeKey = useAppRouteKey();
  const store = useAppRouterStore(s => s);
  const setStore = useAppRouterSetStore();
  const navigationStyle = useAppConfig(s => s?.router?.navigation);

  return useCallback(
    to => {
      const { variant = 'open', panel = null } = to ?? ({} as never);
      const { href, state } = buildAppRouteLocation(to);
      if (!href) return;

      let nextStore = store;
      let nextRouteKey = null;

      const currentRouteKey = routeKey?.[0] ?? null;
      if (!currentRouteKey) return;

      const currentPanelKey = findPanelKey(store, { routeKey: currentRouteKey });
      let panelKey = currentPanelKey >= 0 ? currentPanelKey + 1 : 0;

      if (variant === 'replace') {
        panelKey = currentPanelKey >= 0 ? currentPanelKey : 0;
      } else if (variant === 'to' && typeof panel === 'number') {
        panelKey = Math.max(0, Math.trunc(panel));
      }

      [nextStore, nextRouteKey] = addRoute(store, { href, state });

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
      setStore(nextStore);
      const nextLocation = storeToNavigate(nextStore);
      if (nextLocation) routerNavigate(nextLocation.to, nextLocation.options);
    },
    [navigationStyle, routeKey, routerNavigate, store]
  );
}
