import { APP_ROUTES } from 'app/core.routes';
import { useAppPreferenceStore } from 'core/preference';
import type { AppLinkTo, AppLinkToOptions, AppRouterNavigation } from 'core/router';
import {
  applyNavigationBlocker,
  applyPanelNavigation,
  clearPanelNavigationRequest,
  DEFAULT_APP_ROUTER_NAVIGATION,
  DEFAULT_APP_ROUTER_ROUTE,
  DEFAULT_NAVIGATE_OPTIONS,
  findNextPanelKey,
  findPanelKey,
  getNextRouteFromKey,
  getRouteFromKey,
  getRouteFromPanelKey,
  removePanel,
  resetPanelNavigationOptions,
  sanitizeAppRouterStore,
  setPanelNavigationOptions,
  setPanelNavigationRequest,
  upsertPanel,
  useAppRouterStore,
  useAppSetRouterStore
} from 'core/router';
import type { AppRouteLocation, InferAppRouteSearchValuesFromPath, InferAppRouteValuesFromRoute } from 'core/routes';
import {
  findAppRouteFromLocation,
  findAppRouteFromValues,
  getAppLinkFromLocation,
  getAppLinkTo,
  getAppRouteValuesFromLocation,
  getExternalHrefFromNavigation,
  getLocationFromAppRouteValues,
  getNavigationFromOpenRoute,
  getNavigationFromReplaceRoute,
  getNavigationFromReplaceSearchObject,
  getNavigationFromReplaceURLSearchParams,
  getPreviousLocationFromRouter,
  useAppRouteKey
} from 'core/routes';
import type { SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { BlockerFunction, Location, NavigateOptions, NavigationType } from 'react-router';
import { useBlocker } from 'react-router';
import { generateRandomUUID } from 'shared/utils/app.utils';

//*****************************************************************************************
// useAppBlocker
//*****************************************************************************************

export function useAppBlocker(shouldBlock: boolean, message: string = null) {
  const routeKey = useAppRouteKey();
  const setRouterStore = useAppSetRouterStore();

  useEffect(
    () => setRouterStore(store => applyNavigationBlocker(store, routeKey, shouldBlock, message)),
    [message, routeKey, setRouterStore, shouldBlock]
  );
}

//*****************************************************************************************
// useAppExternalHref
//*****************************************************************************************

export function useAppExternalHref<const Path extends AppRoute['path']>(
  to: AppLinkTo<Path>,
  options: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
  // dependencies: unknown[] = null
): AppRouteLocation['href'] {
  const routeKey = useAppRouteKey();
  const navigationStyle = useAppPreferenceStore(s => s?.router?.navigation);

  const [toKey, toValue] = useMemo(() => getAppLinkTo(to), [to]);
  const prevLocation = useAppRouterStore(getPreviousLocationFromRouter(toKey, toValue, routeKey, navigationStyle));

  return useMemo<AppRouteLocation['href']>(() => {
    if (!toKey) return null;

    let nextNavigation: AppRouterNavigation = null;
    switch (toKey) {
      case 'openRoute':
        nextNavigation = getNavigationFromOpenRoute(toValue, prevLocation, options);
        break;
      case 'replaceRoute':
        nextNavigation = getNavigationFromReplaceRoute(toValue, prevLocation, options);
        break;
      case 'replaceSearchObject':
        nextNavigation = getNavigationFromReplaceSearchObject(toValue, prevLocation, options);
        break;
      case 'replaceURLSearchParams':
        nextNavigation = getNavigationFromReplaceURLSearchParams(toValue, prevLocation, options);
        break;
    }

    return getExternalHrefFromNavigation(nextNavigation);
  }, [options, prevLocation, toKey, toValue]);
}

//*****************************************************************************************
// useAppNavigate
//*****************************************************************************************

export function useAppNavigate<const Path extends AppRoute['path']>() {
  const routeKey = useAppRouteKey();
  const setRouterStore = useAppSetRouterStore();
  const navigationStyle = useAppPreferenceStore(s => s?.router?.navigation);

  const openRoute = useCallback(
    (to: AppLinkTo<Path>['openRoute'], options: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS) =>
      setRouterStore(store => {
        const prevPanelKey = findNextPanelKey(store, routeKey, navigationStyle);
        const prevLocation = getRouteFromPanelKey(store, prevPanelKey);
        const nextNavigation = getNavigationFromOpenRoute(to, prevLocation, options);
        const [store2, nextPanelKey] = upsertPanel(store, prevPanelKey, null);
        store2.panels[nextPanelKey].navigation = nextNavigation;
        return store2;
      }),
    [navigationStyle, routeKey, setRouterStore]
  );

  const replaceRoute = useCallback(
    (to: AppLinkTo<Path>['replaceRoute'], options: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS) =>
      setRouterStore(store => {
        const panelKey = findPanelKey(store, { routeKey });
        const prevLocation = getRouteFromPanelKey(store, panelKey);
        const nextNavigation = getNavigationFromReplaceRoute(to, prevLocation, options);
        store.panels[panelKey].navigation = nextNavigation;
        return store;
      }),
    [routeKey, setRouterStore]
  );

  const replaceSearchObject = useCallback(
    (to: AppLinkTo<Path>['replaceSearchObject'], options: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS) =>
      setRouterStore(store => {
        const panelKey = findPanelKey(store, { routeKey });
        const prevLocation = getRouteFromPanelKey(store, panelKey);
        const nextNavigation = getNavigationFromReplaceSearchObject(to, prevLocation, options);
        store.panels[panelKey].navigation = nextNavigation;

        console.log(store);

        return store;
      }),
    [routeKey, setRouterStore]
  );

  const replaceURLSearchParams = useCallback(
    (to: AppLinkTo<Path>['replaceURLSearchParams'], options: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS) =>
      setRouterStore(store => {
        const panelKey = findPanelKey(store, { routeKey });
        const prevLocation = getRouteFromPanelKey(store, panelKey);
        const nextNavigation = getNavigationFromReplaceURLSearchParams(to, prevLocation, options);
        store.panels[panelKey].navigation = nextNavigation;

        console.log(store);

        return store;
      }),
    [routeKey, setRouterStore]
  );

  // TODO
  const closePanel = useCallback(
    (panel: number) =>
      setRouterStore(store => {
        let nextStore = removePanel(store, panel);
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
// useAppNavigate2
//*****************************************************************************************

export function useAppNavigate2<const Path extends AppRoute['path']>() {
  const routeKey = useAppRouteKey();
  const setRouterStore = useAppSetRouterStore();
  const navigationStyle = useAppPreferenceStore(s => s?.router?.navigation);

  const openRoute = useCallback(
    (to: SetStateAction<InferAppRouteValuesFromRoute<AppRoute>>, options: AppNavigationOptions = null) =>
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

        store = setPanelNavigationRequest(store, nextPanelKey, {
          ...DEFAULT_APP_ROUTER_NAVIGATION,
          ...(options ?? {}),
          state: nextLocation.state,
          to: nextLocation.href,
          type: 'open'
        });
        store.id = generateRandomUUID();
        return store;
      }),
    [navigationStyle, routeKey, setRouterStore]
  );

  const replaceRoute = useCallback(
    (to: SetStateAction<InferAppRouteValuesFromRoute<AppRoute>>, options: AppNavigationOptions = null) =>
      setRouterStore(store => {
        const previousLocation = getRouteFromKey(store, routeKey);
        const previousAppRoute = findAppRouteFromLocation(APP_ROUTES, previousLocation);
        const previousAppRouteValues = getAppRouteValuesFromLocation(previousAppRoute, previousLocation);
        const nextAppRouteValues = typeof to === 'function' ? to(previousAppRouteValues) : to;
        const nextAppRoute = findAppRouteFromValues(APP_ROUTES, nextAppRouteValues);
        const nextLocation = getLocationFromAppRouteValues(nextAppRoute, nextAppRouteValues);

        store = setPanelNavigationRequest(store, findPanelKey(store, { routeKey }), {
          ...DEFAULT_APP_ROUTER_NAVIGATION,
          ...(options ?? {}),
          state: nextLocation.state,
          to: nextLocation.href,
          type: 'update'
        });
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

        store = setPanelNavigationRequest(store, findPanelKey(store, { routeKey }), {
          ...DEFAULT_APP_ROUTER_NAVIGATION,
          state: nextLocation.state,
          to: nextLocation.href,
          type: 'update'
        });
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

        store = setPanelNavigationRequest(store, findPanelKey(store, { routeKey }), {
          ...DEFAULT_APP_ROUTER_NAVIGATION,
          state: nextLocation.state,
          to: nextLocation.href,
          type: 'update'
        });
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

type AppNavigationOptions = Omit<AppRouterNavigation, 'to' | 'type'>;

//*****************************************************************************************
// useAppLinkTo
//*****************************************************************************************

export function useAppLinkTo<const Path extends AppRoute['path']>(to: AppLinkTo<Path>) {
  return useMemo(() => getAppLinkTo(to), [to]);
}

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
// useAppNavigate3
//*****************************************************************************************
export function useAppNavigate3<const Path extends AppRoute['path']>() {
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
// useAppNavigate2
//*****************************************************************************************
export function useAppNavigate2<const Path extends AppRoute['path']>() {
  const routeKey = useAppRouteKey();
  const setRouterStore = useAppSetRouterStore();
  const navigationStyle = useAppPreferenceStore(s => s?.router?.navigation);

  const openRoute = useCallback(
    (to: SetStateAction<InferAppRouteValuesFromRoute<AppRoute>>, options: AppNavigationOptions = null) =>
      setRouterStore(store => {
        const nextPanelKey = findNextPanelKey(store, routeKey, navigationStyle);
        const panelOptions =
          nextPanelKey >= 0 && nextPanelKey < store.panels.length
            ? store.panels[nextPanelKey].navigationRequest.options
            : null;
        const nextOptions: AppNavigationOptions = { replace: false, ...(panelOptions ?? {}), ...(options ?? {}) };

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

        const blockerMessage =
          nextPanelKey >= 0 && nextPanelKey < store.panels.length
            ? store.panels[nextPanelKey].navigationBlocker.message
            : null;

        if (shouldPanelBlockNavigation(store, nextPanelKey)) {
          store = setPanelNavigationRequest(store, nextPanelKey, {
            blockerMessage,
            href: nextLocation.href,
            id: generateRandomUUID(),
            isBlocked: true,
            options: nextOptions,
            state: nextLocation.state
          });
          store.id = generateRandomUUID();
          return store;
        }

        store = clearPanelNavigationRequest(store, nextPanelKey);

        if (nextOptions.replace && nextPanelKey >= 0 && nextPanelKey < store.panels.length) {
          const replaceRouteKey = store.panels[nextPanelKey].routeKey;

          if (replaceRouteKey && replaceRouteKey in store.routes) {
            store = updateRoute(store, replaceRouteKey, { ...nextLocation, age: -1 });
            store = sanitizeAppRouterStore(store);
            store.id = generateRandomUUID();
            return store;
          }
        }

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
    (to: SetStateAction<InferAppRouteValuesFromRoute<AppRoute>>, options: AppNavigationOptions = null) =>
      setRouterStore(store => {
        const currentPanelKey = findPanelKey(store, { routeKey });
        const panelOptions =
          currentPanelKey >= 0 && currentPanelKey < store.panels.length
            ? store.panels[currentPanelKey].navigationRequest.options
            : null;
        const nextOptions: AppNavigationOptions = { replace: true, ...(panelOptions ?? {}), ...(options ?? {}) };
        const previousLocation = getRouteFromKey(store, routeKey);
        const previousAppRoute = findAppRouteFromLocation(APP_ROUTES, previousLocation);
        const previousAppRouteValues = getAppRouteValuesFromLocation(previousAppRoute, previousLocation);
        const nextValues = typeof to === 'function' ? to(previousAppRouteValues) : to;
        const nextRoute = findAppRouteFromValues(APP_ROUTES, nextValues);
        const nextLocation = getLocationFromAppRouteValues(nextRoute, nextValues);

        const blockerMessage =
          currentPanelKey >= 0 && currentPanelKey < store.panels.length
            ? store.panels[currentPanelKey].navigationBlocker.message
            : null;

        if (shouldPanelBlockNavigation(store, currentPanelKey)) {
          store = setPanelNavigationRequest(store, currentPanelKey, {
            blockerMessage,
            href: nextLocation.href,
            id: generateRandomUUID(),
            isBlocked: true,
            options: nextOptions,
            state: nextLocation.state
          });
          store.id = generateRandomUUID();
          return store;
        }

        store = clearPanelNavigationRequest(store, currentPanelKey);
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

//*****************************************************************************************
// useAppBlocker
//*****************************************************************************************

/**
 */
export function useAppBlocker(shouldBlock: boolean, message: string = null) {
  const routeKey = useAppRouteKey();
  const setRouterStore = useAppSetRouterStore();

  useEffect(() => {
    setRouterStore(store => {
      const panelKey = findPanelKey(store, { routeKey });
      store.panels[panelKey].blocker.isBlocked = shouldBlock;
      store.panels[panelKey].blocker.message = message;
      return store;
    });
  }, [message, routeKey, setRouterStore, shouldBlock]);
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

export function useAppBlocker2(blocker: AppBlocker, when = true) {
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

//*****************************************************************************************
// useNavigationOptions
//*****************************************************************************************

/**
 * Set navigation options (replace mode) for subsequent navigation.
 *
 * @param options - Navigation options to apply
 * @param enabled - Whether to apply these options (default: true)
 *
 * @example
 * // Enable replace mode
 * useNavigationOptions({ replace: true });
 */
export function useNavigationOptions(options: AppNavigationOptions, enabled = true) {
  const routeKey = useAppRouteKey();
  const setRouterStore = useAppSetRouterStore();

  useEffect(() => {
    if (!enabled) return;

    setRouterStore(store => {
      const panelKey = findPanelKey(store, { routeKey });
      return setPanelNavigationOptions(store, panelKey, options);
    });

    return () => {
      setRouterStore(store => {
        const panelKey = findPanelKey(store, { routeKey });
        return resetPanelNavigationOptions(store, panelKey);
      });
    };
  }, [enabled, options, routeKey, setRouterStore]);
}

//*****************************************************************************************
// usePendingNavigation
//*****************************************************************************************

/**
 * Hook to handle pending navigation (when blocked by a guard).
 * Returns the pending navigation and functions to confirm or cancel it.
 *
 * @returns Object with pending navigation info and confirmation/cancellation functions
 *
 * @example
 * const { pending, confirm, cancel } = usePendingNavigation();
 *
 * if (pending) {
 *   return (
 *     <Dialog>
 *       <p>Unsaved changes detected. Leave anyway?</p>
 *       <button onClick={confirm}>Yes, leave</button>
 *       <button onClick={cancel}>No, stay</button>
 *     </Dialog>
 *   );
 * }
 */
export function usePendingNavigation() {
  const routeKey = useAppRouteKey();
  const setRouterStore = useAppSetRouterStore();
  const pending = useAppRouterStore(store => {
    const panelKey = findPanelKey(store, { routeKey });
    if (panelKey < 0 || panelKey >= store.panels.length) return null;

    const request = store.panels[panelKey].navigation;
    if (!request?.to) return null;

    return request;
  });

  const confirm = useCallback(() => {
    setRouterStore(store => {
      const panelKey = findPanelKey(store, { routeKey });

      if (panelKey < 0 || panelKey >= store.panels.length) return store;

      return applyPanelNavigation(store, panelKey);
    });
  }, [routeKey, setRouterStore]);

  const cancel = useCallback(() => {
    setRouterStore(store => {
      const panelKey = findPanelKey(store, { routeKey });
      return clearPanelNavigationRequest(store, panelKey);
    });
  }, [routeKey, setRouterStore]);

  return {
    pending,
    confirm,
    cancel
  };
}
