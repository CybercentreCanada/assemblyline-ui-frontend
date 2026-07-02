import { APP_ROUTES } from 'app/core.routes';
import { useAppPreferenceStore } from 'core/preference';
import {
  addBlockedRoute,
  addRoute,
  cloneAppRouterStore,
  DEFAULT_NAVIGATE_OPTIONS,
  findNextPanelKey,
  findNextRouteKey,
  removeBlockedRoute,
  removePanel,
  sanitizePanels,
  sanitizeRoutes,
  setNavigationFromRouter,
  updateRoute,
  upsertPanel,
  useAppRouterStoreApi,
  useAppSetNavigationStore
} from 'core/router';
import type { AppRouteLocation, InferNavigationMapFromPath, InferNavigationValueFromPath } from 'core/routes';
import {
  findAppRouteFromValues,
  findSnapshotFromRouteKey,
  getExternalHrefFromNavigation,
  getLocationFromAppRouteValues,
  getLocationFromSnapshot,
  getNavigationEntriesFromPath,
  useAppLocationStoreApi,
  useAppRouteKey
} from 'core/routes';
import { getAppLocationStateFromApi, getAppRouteValuesFromSnapshot } from 'core/routes/routes.utils';
import { useCallback, useEffect, useMemo } from 'react';
import type { NavigateOptions } from 'react-router';
import { getAppRouterStateFromApi } from './router.utils';

//*****************************************************************************************
// useAppBlocker
//*****************************************************************************************

export function useAppBlocker(shouldBlock: boolean | (() => boolean), dependencies: readonly unknown[] = null) {
  const routeKey = useAppRouteKey();
  const setNavigationStore = useAppSetNavigationStore();

  useEffect(
    () =>
      setNavigationStore(store => {
        if (!routeKey) return store;
        const isBlocked = typeof shouldBlock === 'function' ? shouldBlock() : shouldBlock;
        return isBlocked ? addBlockedRoute(store, routeKey) : removeBlockedRoute(store, routeKey);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies || [routeKey, setNavigationStore, shouldBlock]
  );
}

//*****************************************************************************************
// useAppExternalHref
//*****************************************************************************************

export function useAppExternalHref<const Path extends AppRoute['path']>(
  to: InferNavigationValueFromPath<Path>,
  dependencies: readonly unknown[] = null
): AppRouteLocation['href'] {
  const routeKey = useAppRouteKey();
  const navigationStyle = useAppPreferenceStore(s => s.router.navigation);
  const locationStoreApi = useAppLocationStoreApi();
  const routerStoreApi = useAppRouterStoreApi();

  return useMemo<AppRouteLocation['href']>(
    () => {
      const [toKey, toValue] = getNavigationEntriesFromPath<Path>(to);
      if (!toKey) return null;

      const routerState = getAppRouterStateFromApi(routerStoreApi);
      const locationState = getAppLocationStateFromApi(locationStoreApi);

      switch (toKey) {
        case 'openRoute': {
          const nextRouteKey = findNextRouteKey(routerState, routeKey, navigationStyle);
          const snapshot = findSnapshotFromRouteKey<Path>(locationState, nextRouteKey);
          const prevAppRouteValues = getAppRouteValuesFromSnapshot<Path>(snapshot);
          const nextAppRouteValues = typeof toValue === 'function' ? toValue(prevAppRouteValues) : toValue;
          const nextAppRoute = findAppRouteFromValues<Path>(APP_ROUTES, nextAppRouteValues);
          const nextLocation = getLocationFromAppRouteValues<Path>(nextAppRoute, nextAppRouteValues);
          return getExternalHrefFromNavigation(nextLocation);
        }
        case 'replaceRoute': {
          const snapshot = findSnapshotFromRouteKey<Path>(locationState, routeKey);
          const prevAppRouteValues = getAppRouteValuesFromSnapshot<Path>(snapshot);
          const nextAppRouteValues = typeof toValue === 'function' ? toValue(prevAppRouteValues) : toValue;
          const nextAppRoute = findAppRouteFromValues<Path>(APP_ROUTES, nextAppRouteValues);
          const nextLocation = getLocationFromAppRouteValues<Path>(nextAppRoute, nextAppRouteValues);
          return getExternalHrefFromNavigation(nextLocation);
        }
        case 'replaceSearchObject': {
          const snapshot = findSnapshotFromRouteKey<Path>(locationState, routeKey);
          const prevAppRouteValues = getAppRouteValuesFromSnapshot<Path>(snapshot);
          const nextSearchObject = typeof toValue === 'function' ? toValue(prevAppRouteValues.search) : toValue;
          const nextLocation = getLocationFromAppRouteValues<Path>(snapshot?.appRoute, {
            ...prevAppRouteValues,
            search: nextSearchObject
          });
          return getExternalHrefFromNavigation(nextLocation);
        }
        case 'replaceURLSearchParams': {
          // TODO: its using the wrong "prevAppRouteValues.search" as an object and not as a param. It needs to be converted correctly.
          const snapshot = findSnapshotFromRouteKey<Path>(locationState, routeKey);
          const prevAppRouteValues = getAppRouteValuesFromSnapshot<Path>(snapshot);
          const nextSearchObject = typeof toValue === 'function' ? toValue(prevAppRouteValues.search) : toValue;
          const nextLocation = getLocationFromAppRouteValues<Path>(snapshot?.appRoute, {
            ...prevAppRouteValues,
            search: nextSearchObject
          });
          return getExternalHrefFromNavigation(nextLocation);

          // if (!currentAppRoute || !currentAppRouteValues) return null;
          // const prevParams =
          //   currentAppRoute?.search?.full?.(currentAppRouteValues.search as never)?.toParams?.() || null;
          // const searchDelta = typeof toValue === 'function' ? toValue(prevParams as never) : toValue;
          // const nextSearch = currentAppRoute?.search?.delta?.(searchDelta)?.toObject?.() || null;
          // const computedValues = {
          //   ...currentAppRouteValues,
          //   search: nextSearch
          // } as InferAppRouteValuesFromRoute<AppRoute>;
          // const computedLocation = getLocationFromAppRouteValues(currentAppRoute, computedValues);
          // return getExternalHrefFromNavigation(computedLocation);
        }
        default:
          return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies ? [routeKey, ...dependencies] : [routeKey, to]
  );
}

//*****************************************************************************************
// useAppNavigate
//*****************************************************************************************

export function useAppNavigate() {
  const navigationStyle = useAppPreferenceStore(s => s.router.navigation);
  const routeKey = useAppRouteKey();
  const locationStoreApi = useAppLocationStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const setNavigationStore = useAppSetNavigationStore();

  const openRoute = useCallback(
    function <const Path extends AppRoute['path']>(
      to: InferNavigationMapFromPath<Path>['openRoute'],
      { replace = false }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
    ) {
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      const locationState = getAppLocationStateFromApi(locationStoreApi);

      const prevRouteKey = findNextRouteKey(routerState, routeKey, navigationStyle);
      const snapshot = findSnapshotFromRouteKey<Path>(locationState, prevRouteKey);
      const prevAppRouteValues = getAppRouteValuesFromSnapshot<Path>(snapshot);
      const nextAppRouteValues = typeof to === 'function' ? to(prevAppRouteValues) : to;
      const nextLocation = getLocationFromAppRouteValues<Path>(snapshot.appRoute, nextAppRouteValues);

      if (!nextLocation?.href) return;

      setNavigationStore(store => {
        let state = cloneAppRouterStore(routerState);
        const panelKey = findNextPanelKey(state, routeKey, navigationStyle);
        const [nextStore, nextRouteKey] = addRoute(state, nextLocation);
        [state] = upsertPanel(nextStore, panelKey, { routeKey: nextRouteKey });
        state = sanitizePanels(state);
        state = sanitizeRoutes(state);
        store = setNavigationFromRouter(store, state);
        store.replace = replace;
        return store;
      });
    },
    [locationStoreApi, navigationStyle, routeKey, routerStoreApi, setNavigationStore]
  );

  const replaceRoute = useCallback(
    function <const Path extends AppRoute['path']>(
      to: InferNavigationMapFromPath<Path>['replaceRoute'],
      { replace = false }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
    ) {
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      const locationState = getAppLocationStateFromApi(locationStoreApi);

      const snapshot = findSnapshotFromRouteKey<Path>(locationState, routeKey);
      const prevAppRouteValues = getAppRouteValuesFromSnapshot<Path>(snapshot);
      const nextAppRouteValues = typeof to === 'function' ? to(prevAppRouteValues) : to;
      const nextLocation = getLocationFromAppRouteValues<Path>(snapshot.appRoute, nextAppRouteValues);

      if (!nextLocation?.href) return;

      setNavigationStore(store => {
        let state = cloneAppRouterStore(routerState);
        state = updateRoute(state, routeKey, nextLocation);
        state = sanitizePanels(state);
        state = sanitizeRoutes(state);
        store = setNavigationFromRouter(store, state);
        store.replace = replace;
        return store;
      });
    },
    [locationStoreApi, routeKey, routerStoreApi, setNavigationStore]
  );

  const replaceSearchObject = useCallback(
    function <const Path extends AppRoute['path']>(
      to: InferNavigationMapFromPath<Path>['replaceSearchObject'],
      { replace = false }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
    ) {
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      const locationState = getAppLocationStateFromApi(locationStoreApi);

      const snapshot = findSnapshotFromRouteKey<Path>(locationState, routeKey);
      const prevAppRouteValues = getAppRouteValuesFromSnapshot<Path>(snapshot);
      const nextSearchObject = typeof to === 'function' ? to(prevAppRouteValues.search) : to;
      const nextLocation = getLocationFromAppRouteValues<Path>(snapshot?.appRoute, {
        ...prevAppRouteValues,
        search: nextSearchObject
      });

      if (!nextLocation?.href) return;

      setNavigationStore(store => {
        let state = cloneAppRouterStore(routerState);
        state = updateRoute(state, routeKey, nextLocation);
        state = sanitizePanels(state);
        state = sanitizeRoutes(state);
        store = setNavigationFromRouter(store, state);
        store.replace = replace;
        return store;
      });
    },
    [locationStoreApi, routeKey, routerStoreApi, setNavigationStore]
  );

  const replaceURLSearchParams = useCallback(
    function <const Path extends AppRoute['path']>(
      to: InferNavigationMapFromPath<Path>['replaceURLSearchParams'],
      { replace = false }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
    ) {
      // TODO
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      const locationState = getAppLocationStateFromApi(locationStoreApi);

      const router = routerStoreApi.getState();
      const snapshot = findSnapshotFromRouteKey(locationStoreApi.getState(), routeKey);
      const targetValues = typeof to === 'function' ? to(snapshot.search.toParams()) : to;
      const search = snapshot.appRoute.search.full(targetValues);
      const location = getLocationFromSnapshot({ ...snapshot, search });

      if (!location) return;

      setNavigationStore(store => {
        let state = cloneAppRouterStore(router);
        state = updateRoute(state, routeKey, location);
        state = sanitizePanels(state);
        state = sanitizeRoutes(state);
        store = setNavigationFromRouter(store, state);
        store.replace = replace;
        return store;
      });
    },
    [locationStoreApi, routeKey, routerStoreApi, setNavigationStore]
  );

  const closePanel = useCallback(
    function <const Path extends AppRoute['path']>(
      panelKey: InferNavigationMapFromPath<Path>['closePanel'],
      { replace = false }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
    ) {
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      setNavigationStore(store => {
        let state = cloneAppRouterStore(routerState);
        state = removePanel(state, panelKey);
        state = sanitizePanels(state);
        state = sanitizeRoutes(state);
        store = setNavigationFromRouter(store, state);
        store.replace = replace;
        return store;
      });
    },
    [routerStoreApi, setNavigationStore]
  );

  return { openRoute, replaceRoute, replaceSearchObject, replaceURLSearchParams, closePanel };
}
