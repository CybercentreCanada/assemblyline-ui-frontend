import { APP_ROUTES } from 'app/app.routes';
import { useAppPreferenceStore } from 'core/preference';
import {
  addRoute,
  DEFAULT_APP_ROUTER_ROUTE,
  findPanelKey,
  getNextRouteFromKey,
  getRouteFromKey,
  insertRightPanel,
  removePanel,
  sanitizeAppRouterStore,
  updatePanel,
  updateRoute,
  useAppRouterStore,
  useAppSetRouterStore
} from 'core/router';
import type {
  AppLinkTo,
  AppLinkToOptions,
  AppRouteLocation,
  InferAppRouteSearchValuesFromPath,
  InferAppRouteValuesFromRoute
} from 'core/routes';
import {
  findAppRouteFromLocation,
  getAppRouteValuesFromLocation,
  getLocationFromAppRouteValues,
  useAppRouteKey
} from 'core/routes';
import { findAppRouteFromValues, getAppLinkFromLocation } from 'core/routes/routes.utils';
import type { SetStateAction } from 'react';
import { useCallback, useMemo } from 'react';
import type { Location } from 'react-router';
import { generateRandomUUID } from 'shared/utils/app.utils';

//*****************************************************************************************
// useAppTo
//*****************************************************************************************
export function useAppTo<const Path extends AppRoute['path']>(to: AppLinkTo<Path>): AppRouteLocation {
  const routeKey = useAppRouteKey();
  const navigationStyle = useAppPreferenceStore(s => s?.router?.navigation);

  const [toKey, toValue] = useMemo(() => {
    const entries = Object.entries(to as AppLinkToOptions<Path>);
    return !entries.length ? [null, null] : entries[0];
  }, [to]);

  const previousLocation = useAppRouterStore(store => {
    if (typeof toValue !== 'function') return DEFAULT_APP_ROUTER_ROUTE;
    else if (toKey === 'openRoute') return getNextRouteFromKey(store, routeKey, navigationStyle);
    else return getRouteFromKey(store, routeKey);
  });

  return useMemo<AppRouteLocation>(() => {
    if (!toKey || !previousLocation?.href) return { href: null, state: null };

    const route = findAppRouteFromLocation(APP_ROUTES, previousLocation);

    switch (toKey) {
      case 'openRoute': {
        const previousRouteValues = getAppRouteValuesFromLocation(route, previousLocation);
        const nextRouteValues = typeof toValue === 'function' ? toValue(previousRouteValues) : toValue;
        const location = getLocationFromAppRouteValues(route, nextRouteValues);
        return getAppLinkFromLocation(location);
      }

      case 'replaceRoute': {
        const previousRouteValues = getAppRouteValuesFromLocation(route, previousLocation);
        const nextRouteValues = typeof toValue === 'function' ? toValue(previousRouteValues) : toValue;
        const location = getLocationFromAppRouteValues(route, nextRouteValues);
        return getAppLinkFromLocation(location);
      }

      case 'replaceSearchObject': {
        const previousRouteValues = getAppRouteValuesFromLocation(route, previousLocation);
        const previousSearchObject = (previousRouteValues?.search ?? {}) as InferAppRouteSearchValuesFromPath<Path>;
        const nextSearchObject =
          typeof toValue === 'function'
            ? (toValue as (prev: InferAppRouteSearchValuesFromPath<Path>) => InferAppRouteSearchValuesFromPath<Path>)(
                previousSearchObject
              )
            : (toValue as InferAppRouteSearchValuesFromPath<Path>);

        const nextRouteValues = {
          ...(previousRouteValues as InferAppRouteValuesFromRoute<AppRoute>),
          search: nextSearchObject
        };
        const location = getLocationFromAppRouteValues(
          route,
          nextRouteValues as InferAppRouteValuesFromRoute<AppRoute>
        );
        return getAppLinkFromLocation(location);
      }

      case 'replaceURLSearchParams': {
        const url = new URL(previousLocation.href, 'http://localhost');
        const prevSearch = new URLSearchParams(url.search);
        const nextSearch: URLSearchParams =
          typeof toValue === 'function'
            ? (toValue as (prev: URLSearchParams) => URLSearchParams)(prevSearch)
            : (toValue as URLSearchParams);

        const searchStr = nextSearch.toString();
        const tempLocation: Location = {
          pathname: url.pathname,
          search: searchStr ? `?${searchStr}` : '',
          hash: url.hash,
          state: previousLocation.state,
          key: 'default'
        };
        const normalizedSearch = route?.search ? route.search.fromLocation(tempLocation).toObject() : null;
        const previousRouteValues = getAppRouteValuesFromLocation(route, previousLocation);
        const nextRouteValues = {
          ...(previousRouteValues as InferAppRouteValuesFromRoute<AppRoute>),
          search: normalizedSearch
        };
        const location = getLocationFromAppRouteValues(
          route,
          nextRouteValues as InferAppRouteValuesFromRoute<AppRoute>
        );
        return getAppLinkFromLocation(location);
      }

      default:
        return { href: null, state: null };
    }
  }, [previousLocation, toKey, toValue]);
}

//*****************************************************************************************
// useAppNavigate
//*****************************************************************************************
export function useAppNavigate<const Path extends AppRoute['path']>() {
  const routeKey = useAppRouteKey();
  const setRouterStore = useAppSetRouterStore();
  const navigationStyle = useAppPreferenceStore(s => s?.router?.navigation);

  const openRoute = useCallback(
    (to: SetStateAction<InferAppRouteValuesFromRoute<AppRoute>>) =>
      setRouterStore(store => {
        debugger;
        let nextLocation: AppRouteLocation = null;
        const panelKey = findPanelKey(store, { routeKey });
        if (typeof to !== 'function') {
          const route = findAppRouteFromValues(APP_ROUTES, to);
          nextLocation = getLocationFromAppRouteValues(route, to);
        } else {
          const previousLocation = getNextRouteFromKey(store, routeKey, navigationStyle);
          const route = findAppRouteFromLocation(APP_ROUTES, previousLocation);
          const previousRouteValues = getAppRouteValuesFromLocation(route, previousLocation);
          const nextRouteValues = to(previousRouteValues);
          nextLocation = getLocationFromAppRouteValues(route, nextRouteValues);
        }

        if (!nextLocation.href) return store;

        let [initialStore, nextRouteKey] = addRoute(store, nextLocation);
        let [initialStore, nextPanelKey] = upsertPanel(store, panelKey, {
          routeKey: nextRouteKey,
          temporaryRouteKey: nextRouteKey
        });

        if (navigationStyle === 'push') {
          if (panelKey >= initialStore.panels.length)
            [initialStore] = insertRightPanel(initialStore, panelKey, {
              routeKey: nextRouteKey,
              temporaryRouteKey: nextRouteKey
            });
          else
            initialStore = updatePanel(initialStore, panelKey, {
              routeKey: nextRouteKey,
              temporaryRouteKey: nextRouteKey
            });
        } else if (navigationStyle === 'loop') {
          // Loop navigation keeps current panel assignment by design.
        }

        initialStore = sanitizeAppRouterStore(initialStore);
        initialStore.id = generateRandomUUID();
        return initialStore;
      }),
    [navigationStyle, routeKey, setRouterStore]
  );

  const replaceRoute = useCallback(
    (to: SetStateAction<InferAppRouteValuesFromRoute<AppRoute>>) =>
      setRouterStore(store => {
        const previousLocation = getRouteFromKey(store, routeKey);
        const route = findAppRouteFromLocation(APP_ROUTES, previousLocation);
        const previousRouteValues = getAppRouteValuesFromLocation(route, previousLocation);
        const nextRouteValues = typeof to === 'function' ? to(previousRouteValues) : to;
        const nextLocation = getLocationFromAppRouteValues(route, nextRouteValues);
        store = updateRoute(store, routeKey, { ...nextLocation, age: -1 });
        store = sanitizeAppRouterStore(store);
        store.id = generateRandomUUID();
        return store;
      }),
    [routeKey, setRouterStore]
  );

  const replaceSearchObject = useCallback(
    (to: SetStateAction<InferAppRouteSearchValuesFromPath<Path>>) =>
      setRouterStore(store => {
        const previousLocation = getRouteFromKey(store, routeKey);
        const route = findAppRouteFromLocation(APP_ROUTES, previousLocation);
        const previousRouteValues = getAppRouteValuesFromLocation(route, previousLocation);
        const previousSearchObject = (previousRouteValues?.search ?? {}) as InferAppRouteSearchValuesFromPath<Path>;
        const nextSearchObject = typeof to === 'function' ? to(previousSearchObject) : to;
        const nextRouteValues = {
          ...(previousRouteValues as InferAppRouteValuesFromRoute<AppRoute>),
          search: nextSearchObject
        };
        const nextLocation = getLocationFromAppRouteValues(
          route,
          nextRouteValues as InferAppRouteValuesFromRoute<AppRoute>
        );

        store = updateRoute(store, routeKey, { ...nextLocation, age: -1 });
        store = sanitizeAppRouterStore(store);
        store.id = generateRandomUUID();
        return store;
      }),
    [routeKey, setRouterStore]
  );

  const replaceURLSearchParams = useCallback(
    (to: SetStateAction<URLSearchParams>) =>
      setRouterStore(store => {
        const previousLocation = getRouteFromKey(store, routeKey);
        const route = findAppRouteFromLocation(APP_ROUTES, previousLocation);
        const previousRouteValues = getAppRouteValuesFromLocation(route, previousLocation);
        const url = new URL(previousLocation.href || '', 'http://localhost');
        const previousSearch = new URLSearchParams(url.search);
        const nextSearch = typeof to === 'function' ? to(previousSearch) : to;

        const searchStr = nextSearch.toString();
        const tempLocation: Location = {
          pathname: url.pathname,
          search: searchStr ? `?${searchStr}` : '',
          hash: url.hash,
          state: previousLocation.state,
          key: 'default'
        };
        const normalizedSearch = route?.search ? route.search.fromLocation(tempLocation).toObject() : null;

        const nextRouteValues = {
          ...(previousRouteValues as InferAppRouteValuesFromRoute<AppRoute>),
          search: normalizedSearch
        };
        const nextLocation = getLocationFromAppRouteValues(
          route,
          nextRouteValues as InferAppRouteValuesFromRoute<AppRoute>
        );

        store = updateRoute(store, routeKey, { ...nextLocation, age: -1 });
        store = sanitizeAppRouterStore(store);
        store.id = generateRandomUUID();
        return store;
      }),
    [routeKey, setRouterStore]
  );

  const closePanel = useCallback(
    (panel: number) =>
      setRouterStore(s => {
        let nextStore = removePanel(s, panel);
        nextStore = sanitizeAppRouterStore(nextStore);
        nextStore.id = generateRandomUUID();
        return nextStore;
      }),
    [setRouterStore]
  );

  return {
    openRoute,
    replaceRoute,
    replaceSearchObject,
    replaceURLSearchParams,
    closePanel
  };
}
