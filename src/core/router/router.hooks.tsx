import { APP_ROUTES } from 'app/app.routes';
import { useAppPreferenceStore } from 'core/preference';
import { useAppRouterStore, useAppSetRouterStore } from 'core/router/router.providers';
import {
  addRoute,
  findPanelKey,
  insertRightPanel,
  sanitizeAppRouterStore,
  storeToNavigate,
  updatePanel,
  updateRoute
} from 'core/router/router.utils';
import type { AppRoute, AppRouteLocation, CreatedAppRouteParamsMap } from 'core/routes';
import { buildRouteLocation, useAppRouteKey } from 'core/routes';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';

//*****************************************************************************************
// useAppRouteLocation
//*****************************************************************************************
export function useAppRouteLocation<const Route extends AppRoute>(
  to: CreatedAppRouteParamsMap<Route>
): AppRouteLocation {
  return useMemo(() => buildRouteLocation(APP_ROUTES, to), [to]);
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
  const setStore = useAppSetRouterStore();
  const navigationStyle = useAppPreferenceStore(s => s?.router?.navigation);

  return useCallback(
    to => {
      const { variant = 'open', panel = null } = to ?? ({} as never);
      const { href, state } = buildRouteLocation(APP_ROUTES, to);

      if (!href) return;

      let nextStore = store;
      let nextRouteKey = null;

      const currentRouteKey = routeKey?.[0] ?? null;

      const currentPanelKey = findPanelKey(store, { routeKey: currentRouteKey });
      let panelKey = currentPanelKey >= 0 ? currentPanelKey + 1 : 0;

      if (variant === 'replace' && currentRouteKey) {
        nextStore = updateRoute(nextStore, currentRouteKey, { href, state });
      } else {
        if (variant === 'to' && typeof panel === 'number') {
          panelKey = Math.max(0, Math.trunc(panel));
        }

        [nextStore, nextRouteKey] = addRoute(store, { href, state });

        if (navigationStyle === 'push') {
          if (panelKey >= nextStore.panels.length)
            [nextStore] = insertRightPanel(nextStore, panelKey, {
              routeKey: nextRouteKey,
              temporaryRouteKey: nextRouteKey
            });
          else
            nextStore = updatePanel(nextStore, panelKey, { routeKey: nextRouteKey, temporaryRouteKey: nextRouteKey });
        } else if (navigationStyle === 'loop') {
          // Loop navigation keeps current panel assignment by design.
        }
      }

      nextStore = sanitizeAppRouterStore(nextStore);

      setStore(nextStore);
      const nextLocation = storeToNavigate(nextStore);
      if (nextLocation) routerNavigate(nextLocation.to, nextLocation.options);
    },
    [navigationStyle, routeKey, routerNavigate, store, setStore]
  );
}
