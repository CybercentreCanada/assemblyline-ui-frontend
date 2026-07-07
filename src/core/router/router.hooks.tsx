import { getAppPreferenceStateFromApi, useAppPreferenceStoreApi } from 'core/preference';
import type { InferNavigationInputFromPath, InferNavigationIntentFromPath } from 'core/router';
import {
  addBlockedRoute,
  addRoute,
  areRouterStoreEqual,
  cloneRouterStore,
  DEFAULT_NAVIGATE_OPTIONS,
  findNextPanelKey,
  findNextRouteKey,
  getAppRouterStateFromApi,
  getNavigationMapFromInput,
  removeBlockedRoute,
  removePanel,
  sanitizePanels,
  sanitizeRoutes,
  setPartialNavigationStore,
  updateRoute,
  upsertPanel,
  useAppRouterStoreApi,
  useAppSetNavigationStore,
  useAppSetRouterStore
} from 'core/router';
import type { AppRouteLocation } from 'core/routes';
import {
  findRouteDefinitionFromKey,
  findRouteSnapshotFromKey,
  getAppLocationStateFromApi,
  getAppRouteValuesFromKey,
  getExternalHrefFromLocation,
  getRouteLocationFromSnapshot,
  getRouteLocationFromValues,
  useAppLocationStoreApi,
  useAppRouteKey
} from 'core/routes';
import type { DependencyList } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import type { NavigateOptions } from 'react-router';
import { generateRandomUUID } from 'shared/utils/app.utils';

//*****************************************************************************************
// useAppBlocker
//*****************************************************************************************

export function useAppBlocker(shouldBlock: boolean | (() => boolean), dependencies: DependencyList = null) {
  const routeKey = useAppRouteKey();
  const setRouterStore = useAppSetRouterStore();

  useEffect(
    () =>
      setRouterStore(store => {
        if (!routeKey) return store;
        const isBlocked = typeof shouldBlock === 'function' ? shouldBlock() : shouldBlock;
        return isBlocked ? addBlockedRoute(store, routeKey) : removeBlockedRoute(store, routeKey);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies ? [routeKey, setRouterStore, ...dependencies] : [routeKey, setRouterStore, shouldBlock]
  );
}

//*****************************************************************************************
// useAppExternalHref
//*****************************************************************************************

export function useAppExternalHref<const Path extends AppRoute['path']>(
  to: InferNavigationInputFromPath<Path>
): AppRouteLocation['href'] {
  const routeKey = useAppRouteKey();
  const locationStoreApi = useAppLocationStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const preferenceStoreApi = useAppPreferenceStoreApi();

  return useMemo<AppRouteLocation['href']>(
    () => {
      const { key, dispatch } = getNavigationMapFromInput<Path>(to);
      if (!key) return null;

      const locationState = getAppLocationStateFromApi(locationStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      switch (key) {
        case 'openRoute': {
          const nextRouteKey = findNextRouteKey(routerState, routeKey, preferenceState);
          const prevAppRouteValues = getAppRouteValuesFromKey<Path>(locationState, nextRouteKey);
          const nextAppRouteValues = typeof dispatch === 'function' ? dispatch(prevAppRouteValues) : dispatch;
          const nextLocation = getRouteLocationFromValues<Path>(locationState, nextAppRouteValues);
          return getExternalHrefFromLocation(locationState, nextLocation);
        }
        case 'replaceRoute': {
          const prevAppRouteValues = getAppRouteValuesFromKey<Path>(locationState, routeKey);
          const nextAppRouteValues = typeof dispatch === 'function' ? dispatch(prevAppRouteValues) : dispatch;
          const nextLocation = getRouteLocationFromValues<Path>(locationState, nextAppRouteValues);
          return getExternalHrefFromLocation(locationState, nextLocation);
        }
        case 'replaceSearchObject': {
          const snapshot = findRouteSnapshotFromKey<Path>(locationState, routeKey);
          const nextSearchObject = typeof dispatch === 'function' ? dispatch(snapshot.search.toObject()) : dispatch;
          const definition = findRouteDefinitionFromKey(locationState, routeKey);
          const search = definition.search.delta(nextSearchObject);
          const nextLocation = getRouteLocationFromSnapshot<Path>(locationState, { ...snapshot, search });
          return getExternalHrefFromLocation(locationState, nextLocation);
        }
        case 'replaceURLSearchParams': {
          const snapshot = findRouteSnapshotFromKey<Path>(locationState, routeKey);
          const nextSearchParams = typeof dispatch === 'function' ? dispatch(snapshot.search.toParams()) : dispatch;
          const definition = findRouteDefinitionFromKey(locationState, routeKey);
          const search = definition.search.delta(nextSearchParams);
          const nextLocation = getRouteLocationFromSnapshot<Path>(locationState, { ...snapshot, search });
          return getExternalHrefFromLocation(locationState, nextLocation);
        }
        default:
          return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [routeKey, ...(getNavigationMapFromInput(to).dependencies ?? [to])]
  );
}

//*****************************************************************************************
// useAppNavigate
//*****************************************************************************************

export function useAppNavigate<const SourcePath extends AppRoute['path']>() {
  const routeKey = useAppRouteKey();
  const locationStoreApi = useAppLocationStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const preferenceStoreApi = useAppPreferenceStoreApi();
  const setNavigationStore = useAppSetNavigationStore();

  const openRoute = useCallback(
    function <const TargetPath extends AppRoute['path']>(
      to: InferNavigationIntentFromPath<TargetPath>['openRoute'],
      { replace = false }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
    ) {
      const locationState = getAppLocationStateFromApi(locationStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const prevRouteKey = findNextRouteKey(routerState, routeKey, preferenceState);
      const prevAppRouteValues = getAppRouteValuesFromKey<TargetPath>(locationState, prevRouteKey);
      const nextAppRouteValues = typeof to === 'function' ? to(prevAppRouteValues) : to;
      const nextLocation = getRouteLocationFromValues<TargetPath>(locationState, nextAppRouteValues);

      if (!nextLocation?.href) return;

      setNavigationStore(store => {
        let nextRouter = cloneRouterStore(routerState);
        const panelKey = findNextPanelKey(nextRouter, routeKey, preferenceState);
        const [nextStore, nextRouteKey] = addRoute(nextRouter, nextLocation);
        [nextRouter] = upsertPanel(nextStore, panelKey, { routeKey: nextRouteKey }, preferenceState);
        nextRouter = sanitizePanels(nextRouter, preferenceState);
        nextRouter = sanitizeRoutes(nextRouter);
        if (areRouterStoreEqual(routerState, nextRouter)) return store;
        store = setPartialNavigationStore(store, { ...nextRouter, id: generateRandomUUID(), replace });
        return store;
      });
    },
    [locationStoreApi, preferenceStoreApi, routeKey, routerStoreApi, setNavigationStore]
  );

  const replaceRoute = useCallback(
    function (
      to: InferNavigationIntentFromPath<SourcePath>['replaceRoute'],
      { replace = false }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
    ) {
      const locationState = getAppLocationStateFromApi(locationStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const prevAppRouteValues = getAppRouteValuesFromKey<SourcePath>(locationState, routeKey);
      const nextAppRouteValues = typeof to === 'function' ? to(prevAppRouteValues) : to;
      const nextLocation = getRouteLocationFromValues<SourcePath>(locationState, nextAppRouteValues);

      if (!nextLocation?.href) return;

      setNavigationStore(store => {
        let nextRouter = cloneRouterStore(routerState);
        nextRouter = updateRoute(nextRouter, routeKey, nextLocation);
        nextRouter = sanitizePanels(nextRouter, preferenceState);
        nextRouter = sanitizeRoutes(nextRouter);
        if (areRouterStoreEqual(routerState, nextRouter)) return store;
        store = setPartialNavigationStore(store, { ...nextRouter, id: generateRandomUUID(), replace });
        return store;
      });
    },
    [locationStoreApi, preferenceStoreApi, routeKey, routerStoreApi, setNavigationStore]
  );

  const replaceSearchObject = useCallback(
    function (
      to: InferNavigationIntentFromPath<SourcePath>['replaceSearchObject'],
      { replace = false }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
    ) {
      const locationState = getAppLocationStateFromApi(locationStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const routeDefinition = findRouteDefinitionFromKey(locationState, routeKey);
      const snapshot = findRouteSnapshotFromKey(locationState, routeKey);
      const nextSearchObject = typeof to === 'function' ? to(snapshot.search.toObject()) : to;
      const search = routeDefinition.search.delta(nextSearchObject);
      const nextLocation = getRouteLocationFromSnapshot<SourcePath>(locationState, { ...snapshot, search });

      if (!nextLocation?.href) return;

      setNavigationStore(store => {
        let nextRouter = cloneRouterStore(routerState);
        nextRouter = updateRoute(nextRouter, routeKey, nextLocation);
        nextRouter = sanitizePanels(nextRouter, preferenceState);
        nextRouter = sanitizeRoutes(nextRouter);
        if (areRouterStoreEqual(routerState, nextRouter)) return store;
        store = setPartialNavigationStore(store, { ...nextRouter, id: generateRandomUUID(), replace });
        return store;
      });
    },
    [locationStoreApi, preferenceStoreApi, routeKey, routerStoreApi, setNavigationStore]
  );

  const replaceURLSearchParams = useCallback(
    function (
      to: InferNavigationIntentFromPath<SourcePath>['replaceURLSearchParams'],
      { replace = false }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
    ) {
      const locationState = getAppLocationStateFromApi(locationStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const routeDefinition = findRouteDefinitionFromKey(locationState, routeKey);
      const snapshot = findRouteSnapshotFromKey(locationState, routeKey);
      const nextSearchParams = typeof to === 'function' ? to(snapshot.search.toParams()) : to;
      const search = routeDefinition.search.delta(nextSearchParams);
      const nextLocation = getRouteLocationFromSnapshot<SourcePath>(locationState, { ...snapshot, search });

      if (!nextLocation?.href) return;

      setNavigationStore(store => {
        let nextRouter = cloneRouterStore(routerState);
        nextRouter = updateRoute(nextRouter, routeKey, nextLocation);
        nextRouter = sanitizePanels(nextRouter, preferenceState);
        nextRouter = sanitizeRoutes(nextRouter);
        if (areRouterStoreEqual(routerState, nextRouter)) return store;
        store = setPartialNavigationStore(store, { ...nextRouter, id: generateRandomUUID(), replace });
        return store;
      });
    },
    [locationStoreApi, preferenceStoreApi, routeKey, routerStoreApi, setNavigationStore]
  );

  const closePanel = useCallback(
    function (
      panelKey: InferNavigationIntentFromPath<SourcePath>['closePanel'],
      { replace = false }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
    ) {
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      setNavigationStore(store => {
        let nextRouter = cloneRouterStore(routerState);
        nextRouter = removePanel(nextRouter, panelKey);
        nextRouter = sanitizePanels(nextRouter, preferenceState);
        nextRouter = sanitizeRoutes(nextRouter);
        if (areRouterStoreEqual(routerState, nextRouter)) return store;
        store = setPartialNavigationStore(store, { ...nextRouter, id: generateRandomUUID(), replace });
        return store;
      });
    },
    [preferenceStoreApi, routerStoreApi, setNavigationStore]
  );

  const run = useCallback(
    function <const TargetPath extends AppRoute['path']>(to: InferNavigationInputFromPath<TargetPath>) {
      const { key, dispatch, options } = getNavigationMapFromInput<TargetPath>(to);

      switch (key) {
        case 'openRoute':
          openRoute<TargetPath>(dispatch, options);
          break;
        case 'replaceRoute':
          replaceRoute(dispatch, options);
          break;
        case 'replaceSearchObject':
          replaceSearchObject(dispatch, options);
          break;
        case 'replaceURLSearchParams':
          replaceURLSearchParams(dispatch, options);
          break;
        case 'closePanel':
          closePanel(dispatch, options);
          break;
      }
    },
    [closePanel, openRoute, replaceRoute, replaceSearchObject, replaceURLSearchParams]
  );

  return { openRoute, replaceRoute, replaceSearchObject, replaceURLSearchParams, closePanel, run };
}
