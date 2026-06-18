import { APP_ROUTES } from 'app/core.routes';
import { useAppPreferenceStore } from 'core/preference';
import {
  addRoute,
  DEFAULT_APP_ROUTER_ROUTE,
  findNextPanelKey,
  getNextRouteFromKey,
  getRouteFromKey,
  getRouteFromPanelKey,
  removePanel,
  sanitizeAppRouterStore,
  updateRoute,
  upsertPanel,
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
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { BlockerFunction, Location, NavigationType } from 'react-router';
import { useBlocker } from 'react-router';
import { generateRandomUUID } from 'shared/utils/app.utils';

//*****************************************************************************************
// useAppTo
//*****************************************************************************************
export function useAppTo<const Path extends AppRoute['path']>(to: AppLinkTo<Path>): AppRouteLocation {
  const routeKey = useAppRouteKey();
  const navigationStyle = useAppPreferenceStore(s => s?.router?.navigation);

  const [toKey, toValue] = useMemo(() => {
    const entries = Object.entries(to as AppLinkToOptions<Path>);
    return (!entries.length ? [null, null] : entries[0]) as
      | [null, null]
      | ['openRoute' | 'replaceRoute', SetStateAction<InferAppRouteValuesFromRoute<AppRoute>>]
      | ['replaceSearchObject', SetStateAction<InferAppRouteSearchValuesFromPath<Path>>]
      | ['replaceURLSearchParams', SetStateAction<URLSearchParams>];
  }, [to]);

  const previousLocation = useAppRouterStore(store => {
    if (typeof toValue !== 'function') return DEFAULT_APP_ROUTER_ROUTE;
    else if (toKey === 'openRoute') return getNextRouteFromKey(store, routeKey, navigationStyle);
    else return getRouteFromKey(store, routeKey);
  });

  return useMemo<AppRouteLocation>(() => {
    if (!toKey) return { href: null, state: null };

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
        const nextSearchObject = typeof toValue === 'function' ? toValue(previousSearchObject) : toValue;

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
        const nextSearch: URLSearchParams = typeof toValue === 'function' ? toValue(prevSearch) : toValue;

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
    (to: SetStateAction<InferAppRouteValuesFromRoute<AppRoute>>, options: NavigationOptions = null) =>
      setRouterStore(store => {
        const nextPanelKey = findNextPanelKey(store, routeKey, navigationStyle);
        let nextLocation: AppRouteLocation = null;
        if (typeof to !== 'function') {
          const route = findAppRouteFromValues(APP_ROUTES, to);
          nextLocation = getLocationFromAppRouteValues(route, to);
        } else {
          const previousLocation = getRouteFromPanelKey(store, nextPanelKey);
          const route = findAppRouteFromLocation(APP_ROUTES, previousLocation);
          const previousRouteValues = getAppRouteValuesFromLocation(route, previousLocation);
          const nextRouteValues = to(previousRouteValues);
          nextLocation = getLocationFromAppRouteValues(route, nextRouteValues);
        }

        if (!nextLocation.href) return store;

        const [store1, nextRouteKey] = addRoute(store, nextLocation);
        let [store2] = upsertPanel(store1, nextPanelKey, {
          routeKey: nextRouteKey,
          temporaryRouteKey: nextRouteKey
        });

        store2 = sanitizeAppRouterStore(store2);
        store2.id = generateRandomUUID();
        return store2;
      }),
    [navigationStyle, routeKey, setRouterStore]
  );

  const replaceRoute = useCallback(
    (to: SetStateAction<InferAppRouteValuesFromRoute<AppRoute>>, options: NavigationOptions = null) =>
      setRouterStore(store => {
        const previousLocation = getRouteFromKey(store, routeKey);
        const previousAppRoute = findAppRouteFromLocation(APP_ROUTES, previousLocation);
        const previousAppRouteValues = getAppRouteValuesFromLocation(previousAppRoute, previousLocation);
        const nextAppRouteValues = typeof to === 'function' ? to(previousAppRouteValues) : to;
        const nextAppRoute = findAppRouteFromValues(APP_ROUTES, nextAppRouteValues);
        const nextLocation = getLocationFromAppRouteValues(nextAppRoute, nextAppRouteValues);
        store = updateRoute(store, routeKey, { ...nextLocation, age: -1 });
        store = sanitizeAppRouterStore(store);
        store.id = generateRandomUUID();
        return store;
      }),
    [routeKey, setRouterStore]
  );

  const replaceSearchObject = useCallback(
    (to: SetStateAction<InferAppRouteSearchValuesFromPath<Path>>, options: NavigationOptions = null) =>
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
    (to: SetStateAction<URLSearchParams>, options: NavigationOptions = null) =>
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

//*****************************************************************************************
// useAppBlocker
//*****************************************************************************************

export type AppBlockerTransition = {
  currentLocation: Location;
  nextLocation: Location;
  historyAction: NavigationType;
  retry: () => void;
  reset: () => void;
};

export type AppBlocker = (tx: AppBlockerTransition) => void;

export function useAppBlocker(blocker: AppBlocker, when = true) {
  const txArgsRef = useRef<Pick<AppBlockerTransition, 'currentLocation' | 'nextLocation' | 'historyAction'> | null>(
    null
  );
  const handledLocationKeyRef = useRef<string | null>(null);

  const shouldBlock = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation, historyAction }) => {
      txArgsRef.current = { currentLocation, nextLocation, historyAction };
      return !!when;
    },
    [when]
  );

  const rrBlocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (rrBlocker.state !== 'blocked') {
      handledLocationKeyRef.current = null;
      return;
    }

    const nextLocation = rrBlocker.location;
    if (!nextLocation) return;

    const locationKey = nextLocation.key || `${nextLocation.pathname}${nextLocation.search}${nextLocation.hash}`;
    if (handledLocationKeyRef.current === locationKey) return;
    handledLocationKeyRef.current = locationKey;

    const txArgs = txArgsRef.current;
    if (!txArgs) return;

    blocker({
      currentLocation: txArgs.currentLocation,
      nextLocation,
      historyAction: txArgs.historyAction,
      retry: () => rrBlocker.proceed?.(),
      reset: () => rrBlocker.reset?.()
    });
  }, [blocker, rrBlocker]);

  useEffect(() => {
    if (!when && rrBlocker.state === 'blocked') {
      rrBlocker.reset?.();
    }
  }, [rrBlocker, when]);

  return rrBlocker;
}
