import type { AppLinkTo } from 'core/router';
import {
  addBlockedRoute,
  DEFAULT_NAVIGATE_OPTIONS,
  removeBlockedRoute,
  setNavigation,
  useAppSetRouterStore
} from 'core/router';
import type { AppRouteLocation } from 'core/routes';
import {
  getAppLinkTo,
  getExternalHrefFromNavigation,
  getLocationFromAppRouteValues,
  getNavigationFromOpenRoute,
  getNavigationFromReplaceRoute,
  getNavigationFromReplaceSearchObject,
  getNavigationFromReplaceURLSearchParams,
  useAppRouteValuesStore
} from 'core/routes';
import { useCallback, useEffect, useMemo } from 'react';
import type { NavigateOptions } from 'react-router';

//*****************************************************************************************
// useAppBlocker
//*****************************************************************************************

export function useAppBlocker(shouldBlock: boolean | (() => boolean), dependencies: unknown[] = null) {
  const routeKey = useAppRouteValuesStore(s => s.routeKey, true);
  const setRouterStore = useAppSetRouterStore();

  useEffect(
    () =>
      setRouterStore(store => {
        if (!routeKey) return store;
        const isBlocked = typeof shouldBlock === 'function' ? shouldBlock() : shouldBlock;
        return isBlocked ? addBlockedRoute(store, routeKey) : removeBlockedRoute(store, routeKey);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies || [routeKey, setRouterStore, shouldBlock]
  );
}

//*****************************************************************************************
// useAppExternalHref
//*****************************************************************************************

export function useAppExternalHref<const Path extends AppRoute['path']>(
  to: AppLinkTo<Path>,
  dependencies: unknown[] = null
): AppRouteLocation['href'] {
  const [toKey, toValue] = useMemo(() => getAppLinkTo(to), [to]);
  const currentAppRoute = useAppRouteValuesStore(s => s.currentAppRoute, true);
  const currentValues = useAppRouteValuesStore(s => s.currentValues, true);
  const nextAppRoute = useAppRouteValuesStore(s => s.nextAppRoute, true);
  const nextValues = useAppRouteValuesStore(s => s.nextValues, true);

  return useMemo<AppRouteLocation['href']>(
    () => {
      if (!toKey) return null;

      switch (toKey) {
        case 'openRoute': {
          const computedValues = typeof toValue === 'function' ? toValue(nextValues) : toValue;
          const computedLocation = getLocationFromAppRouteValues(nextAppRoute, computedValues);
          return getExternalHrefFromNavigation(computedLocation);
        }
        case 'replaceRoute': {
          const computedValues = typeof toValue === 'function' ? toValue(currentValues) : toValue;
          const computedLocation = getLocationFromAppRouteValues(currentAppRoute, computedValues);
          return getExternalHrefFromNavigation(computedLocation);
        }
        case 'replaceSearchObject': {
          const prevSearch = currentAppRoute?.search?.full?.(currentValues.search)?.toObject?.() || null;
          const searchDelta = typeof toValue === 'function' ? toValue(prevSearch) : toValue;
          const nextSearch = currentAppRoute?.search?.delta?.(searchDelta)?.toObject?.() || null;
          const computedLocation = getLocationFromAppRouteValues(currentAppRoute, {
            ...currentValues,
            search: nextSearch
          });
          return getExternalHrefFromNavigation(computedLocation);
        }
        case 'replaceURLSearchParams': {
          const prevParams = currentAppRoute?.search?.full?.(currentValues.search)?.toParams?.() || null;
          const searchDelta = typeof toValue === 'function' ? toValue(prevParams) : toValue;
          const nextSearch = currentAppRoute?.search?.delta?.(searchDelta)?.toObject?.() || null;
          const computedLocation = getLocationFromAppRouteValues(currentAppRoute, {
            ...currentValues,
            search: nextSearch
          });
          return getExternalHrefFromNavigation(computedLocation);
        }
        default:
          return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies || [currentAppRoute, currentValues, nextAppRoute, nextValues, toKey, toValue]
  );
}

//*****************************************************************************************
// useAppNavigate
//*****************************************************************************************

export function useAppNavigate<const Path extends AppRoute['path']>() {
  const routeKey = useAppRouteValuesStore(s => s.routeKey);
  const currentAppRoute = useAppRouteValuesStore(s => s.currentAppRoute, true);
  const currentValues = useAppRouteValuesStore(s => s.currentValues, true);
  const nextAppRoute = useAppRouteValuesStore(s => s.nextAppRoute, true);
  const nextValues = useAppRouteValuesStore(s => s.nextValues, true);
  const setRouterStore = useAppSetRouterStore();

  const openRoute = useCallback(
    (to: AppLinkTo<Path>['openRoute'], options: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS) =>
      setRouterStore(store => {
        const nextNavigation = getNavigationFromOpenRoute(to, nextAppRoute, nextValues, options);
        return setNavigation(store, nextNavigation);
      }),
    [nextAppRoute, nextValues, setRouterStore]
  );

  const replaceRoute = useCallback(
    (to: AppLinkTo<Path>['replaceRoute'], options: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS) =>
      setRouterStore(store => {
        const nextNavigation = getNavigationFromReplaceRoute(to, currentAppRoute, currentValues, routeKey, options);
        return setNavigation(store, nextNavigation);
      }),
    [currentAppRoute, currentValues, routeKey, setRouterStore]
  );

  const replaceSearchObject = useCallback(
    (to: AppLinkTo<Path>['replaceSearchObject'], options: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS) =>
      setRouterStore(store => {
        const nextNavigation = getNavigationFromReplaceSearchObject(
          to,
          currentAppRoute,
          currentValues,
          routeKey,
          options
        );
        return setNavigation(store, nextNavigation);
      }),
    [currentAppRoute, currentValues, routeKey, setRouterStore]
  );

  const replaceURLSearchParams = useCallback(
    (to: AppLinkTo<Path>['replaceURLSearchParams'], { replace = false }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS) =>
      setRouterStore(store => {
        store = initializeNavigation(store);

        const nextNavigation = getNavigationFromReplaceURLSearchParams(
          to,
          currentAppRoute,
          currentValues,
          routeKey,
          options
        );
        return setNavigation(store, nextNavigation);
      }),
    [currentAppRoute, currentValues, routeKey, setRouterStore]
  );

  const closePanel = useCallback(
    (panelKey: number, { replace = false }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS) =>
      setRouterStore(store => {
        store = initializeNavigation(store);
        store.navigation.panels.filter((_, i) => i !== panelKey);
        store.navigation.replace = replace;
        return store;
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
