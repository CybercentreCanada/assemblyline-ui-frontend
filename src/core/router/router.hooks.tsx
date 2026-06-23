import { useAppPreferenceStore } from 'core/preference';
import type { AppLinkTo, AppRouterNavigation } from 'core/router';
import {
  applyNavigationBlocker,
  DEFAULT_NAVIGATE_OPTIONS,
  findNextPanelKey,
  findPanelKey,
  getRouteFromPanelKey,
  setNavigation,
  upsertPanel,
  useAppRouterStore,
  useAppSetRouterStore
} from 'core/router';
import type { AppRouteLocation } from 'core/routes';
import {
  getAppLinkTo,
  getExternalHrefFromNavigation,
  getNavigationFromOpenRoute,
  getNavigationFromReplaceRoute,
  getNavigationFromReplaceSearchObject,
  getNavigationFromReplaceURLSearchParams,
  getPreviousLocationFromRouter,
  useAppRouteKey
} from 'core/routes';
import { useCallback, useEffect, useMemo } from 'react';
import { type NavigateOptions } from 'react-router';

//*****************************************************************************************
// useAppBlocker
//*****************************************************************************************

export function useAppBlocker(shouldBlock: boolean | (() => boolean), dependencies: unknown[] = null) {
  const routeKey = useAppRouteKey();
  const setRouterStore = useAppSetRouterStore();

  useEffect(
    () =>
      setRouterStore(store =>
        applyNavigationBlocker(store, routeKey, typeof shouldBlock === 'function' ? shouldBlock() : shouldBlock)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies || [routeKey, setRouterStore, shouldBlock]
  );
}

//*****************************************************************************************
// useAppExternalHref
//*****************************************************************************************

export function useAppExternalHref<const Path extends AppRoute['path']>(
  to: AppLinkTo<Path>,
  options: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS,
  dependencies: unknown[] = null
): AppRouteLocation['href'] {
  const routeKey = useAppRouteKey();
  const navigationStyle = useAppPreferenceStore(s => s?.router?.navigation);

  const [toKey, toValue] = useMemo(() => getAppLinkTo(to), [to]);
  const prevLocation = useAppRouterStore(getPreviousLocationFromRouter(toKey, toValue, routeKey, navigationStyle));

  return useMemo<AppRouteLocation['href']>(
    () => {
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies || [options, prevLocation, toKey, toValue]
  );
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
        let [store2, nextPanelKey] = upsertPanel(store, prevPanelKey, null);
        store2 = setNavigation(store2, nextPanelKey, nextNavigation);
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
        store = setNavigation(store, panelKey, nextNavigation);
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
        store = setNavigation(store, panelKey, nextNavigation);
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
        store = setNavigation(store, panelKey, nextNavigation);
        return store;
      }),
    [routeKey, setRouterStore]
  );

  const closePanel = useCallback(
    (panelKey: number, { replace }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS) =>
      setRouterStore(store => {
        store = setNavigation(store, panelKey, { type: 'delete', replace });
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
