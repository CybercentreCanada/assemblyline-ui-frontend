import { getAppPreferenceStateFromApi, useAppPreferenceStoreApi } from 'core/preference';
import type {
  AppLocationState,
  AppNavigationStore,
  InferNavigationInputFromPath,
  InferNavigationIntentFromPath
} from 'core/router';
import {
  addBlockedRoute,
  addRoute,
  applyDefaultNavigationStore,
  applyNavigationDispatch,
  areRouterStoreEqual,
  clearBlockedRoutes,
  clearNavigationStore,
  cloneLocationStore,
  DEFAULT_NAVIGATE_OPTIONS,
  findNextPanelKey,
  findNextRouteKey,
  getAppNavigationStateFromApi,
  getAppRouterStateFromApi,
  getHashFragmentsFromRouter,
  getLocationStateFromRouter,
  getNavigationMapFromInput,
  getNavigationStoreFromRouter,
  getRouteFromKey,
  getRouteFromPanelKey,
  hasBlockedRoutes,
  hasRoutes,
  reconcileRouterFromNavigation,
  removeBlockedRoute,
  removePanel,
  sanitizePanels,
  sanitizeRouterStore,
  sanitizeRoutes,
  setPartialNavigationStore,
  updatePanel,
  updateRoute,
  upsertPanel,
  upsertRoute,
  useAppNavigationStoreApi,
  useAppRouterStoreApi,
  useAppSetNavigationStore,
  useAppSetRouterStore
} from 'core/router';
import type { AppRouteLocation } from 'core/routes';
import {
  applyRouteLocationSearchToSnapshot,
  findAppRouteValuesFromKey,
  findRouteSnapshotFromKey,
  findRouteSpecFromLocation,
  getAppRoutesRuntimeStateFromApi,
  getExternalHrefFromLocation,
  getExternalHrefFromSnapshot,
  getRouteIdFromLocation,
  getRouteLocationFromSnapshot,
  getRouteLocationFromValues,
  sanitizeRouteLocation,
  useAppRouteKey,
  useAppRoutesRuntimeStoreApi
} from 'core/routes';
import type { DependencyList } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Location, NavigateOptions } from 'react-router';
import { useLocation, useNavigate } from 'react-router';
import { generateRandomUUID } from 'shared/utils/app.utils';

//*****************************************************************************************
// useAppBlocker
//*****************************************************************************************

export function useAppBlocker(shouldBlock: boolean | (() => boolean), dependencies: DependencyList = null) {
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
    dependencies ? [routeKey, setNavigationStore, ...dependencies] : [routeKey, setNavigationStore, shouldBlock]
  );
}

//*****************************************************************************************
// useAppExternalHref
//*****************************************************************************************

export function useAppExternalHref<const Path extends AppRoute['path']>(
  to: InferNavigationInputFromPath<Path>
): AppRouteLocation['href'] {
  const routeKey = useAppRouteKey();
  const routesRuntimeStoreApi = useAppRoutesRuntimeStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const preferenceStoreApi = useAppPreferenceStoreApi();

  return useMemo<AppRouteLocation['href']>(
    () => {
      const { key, dispatch } = getNavigationMapFromInput(to);
      if (!key) return null;

      const runtimeState = getAppRoutesRuntimeStateFromApi(routesRuntimeStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      switch (key) {
        case 'openRoute': {
          const nextRouteKey = findNextRouteKey(routerState, routeKey, preferenceState);
          const prevAppRouteValues = findAppRouteValuesFromKey<Path>(runtimeState, nextRouteKey);
          const nextAppRouteValues = applyNavigationDispatch(dispatch, prevAppRouteValues);
          const nextLocation = getRouteLocationFromValues<Path>(runtimeState, nextAppRouteValues);
          return getExternalHrefFromLocation(runtimeState, nextLocation);
        }
        case 'replaceRoute': {
          const prevAppRouteValues = findAppRouteValuesFromKey<Path>(runtimeState, routeKey);
          const nextAppRouteValues = applyNavigationDispatch(dispatch, prevAppRouteValues);
          const nextLocation = getRouteLocationFromValues<Path>(runtimeState, nextAppRouteValues);
          return getExternalHrefFromLocation(runtimeState, nextLocation);
        }
        case 'replaceSearchObject': {
          let snapshot = findRouteSnapshotFromKey<Path>(runtimeState, routeKey);
          const nextSearchObject = applyNavigationDispatch(dispatch as never, snapshot.search.toObject());
          snapshot = applyRouteLocationSearchToSnapshot<Path>(runtimeState, snapshot, nextSearchObject as never);
          return getExternalHrefFromSnapshot(runtimeState, snapshot);
        }
        case 'replaceURLSearchParams': {
          let snapshot = findRouteSnapshotFromKey<Path>(runtimeState, routeKey);
          const nextSearchParams = applyNavigationDispatch(dispatch, snapshot.search.toParams());
          snapshot = applyRouteLocationSearchToSnapshot<Path>(runtimeState, snapshot, nextSearchParams);
          return getExternalHrefFromSnapshot(runtimeState, snapshot);
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
  const routesRuntimeStoreApi = useAppRoutesRuntimeStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const preferenceStoreApi = useAppPreferenceStoreApi();
  const setNavigationStore = useAppSetNavigationStore();

  const openRoute = useCallback(
    function <const TargetPath extends AppRoute['path']>(
      to: InferNavigationIntentFromPath<TargetPath>['openRoute'],
      { replace = false }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
    ) {
      const runtimeState = getAppRoutesRuntimeStateFromApi(routesRuntimeStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const nextRouteKey = findNextRouteKey(routerState, routeKey, preferenceState);
      const prevId = getRouteIdFromLocation(getRouteFromKey(routerState, nextRouteKey));
      const prevAppRouteValues = findAppRouteValuesFromKey<TargetPath>(runtimeState, nextRouteKey);
      const nextAppRouteValues = applyNavigationDispatch(to, prevAppRouteValues);
      const nextLocation = getRouteLocationFromValues<TargetPath>(runtimeState, nextAppRouteValues);
      const nextId = getRouteIdFromLocation(nextLocation);

      if (!nextLocation?.href || prevId === nextId) return;

      setNavigationStore(store => {
        let nextRouter = cloneLocationStore(routerState);
        const panelKey = findNextPanelKey(nextRouter, routeKey, preferenceState);
        const [nextStore, nextRouteKey] = addRoute(nextRouter, nextLocation);
        [nextRouter] = upsertPanel(nextStore, panelKey, { routeKey: nextRouteKey }, preferenceState);
        nextRouter = sanitizePanels(nextRouter, preferenceState);
        nextRouter = sanitizeRoutes(nextRouter);
        store = setPartialNavigationStore(store, { ...nextRouter, id: generateRandomUUID(), replace });
        return store;
      });
    },
    [preferenceStoreApi, routeKey, routesRuntimeStoreApi, routerStoreApi, setNavigationStore]
  );

  const replaceRoute = useCallback(
    function (
      to: InferNavigationIntentFromPath<SourcePath>['replaceRoute'],
      { replace = false }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
    ) {
      const runtimeState = getAppRoutesRuntimeStateFromApi(routesRuntimeStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const prevId = getRouteIdFromLocation(getRouteFromKey(routerState, routeKey));
      const prevAppRouteValues = findAppRouteValuesFromKey<SourcePath>(runtimeState, routeKey);
      const nextAppRouteValues = applyNavigationDispatch(to, prevAppRouteValues);
      const nextLocation = getRouteLocationFromValues<SourcePath>(runtimeState, nextAppRouteValues);
      const nextId = getRouteIdFromLocation(nextLocation);

      if (!nextLocation?.href || prevId === nextId) return;

      setNavigationStore(store => {
        let nextRouter = cloneLocationStore(routerState);
        nextRouter = updateRoute(nextRouter, routeKey, nextLocation);
        nextRouter = sanitizePanels(nextRouter, preferenceState);
        nextRouter = sanitizeRoutes(nextRouter);
        store = setPartialNavigationStore(store, { ...nextRouter, id: generateRandomUUID(), replace });
        return store;
      });
    },
    [preferenceStoreApi, routeKey, routesRuntimeStoreApi, routerStoreApi, setNavigationStore]
  );

  const replaceSearchObject = useCallback(
    function (
      to: InferNavigationIntentFromPath<SourcePath>['replaceSearchObject'],
      { replace = false }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
    ) {
      const runtimeState = getAppRoutesRuntimeStateFromApi(routesRuntimeStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const prevId = getRouteIdFromLocation(getRouteFromKey(routerState, routeKey));
      let snapshot = findRouteSnapshotFromKey<SourcePath>(runtimeState, routeKey);
      const nextSearchObject = applyNavigationDispatch(to as never, snapshot.search.toObject());
      snapshot = applyRouteLocationSearchToSnapshot<SourcePath>(runtimeState, snapshot, nextSearchObject as never);
      const nextLocation = getRouteLocationFromSnapshot(runtimeState, snapshot);
      const nextId = getRouteIdFromLocation(nextLocation);

      if (!nextLocation?.href || prevId === nextId) return;

      setNavigationStore(store => {
        let nextRouter = cloneLocationStore(routerState);
        nextRouter = updateRoute(nextRouter, routeKey, nextLocation);
        nextRouter = sanitizePanels(nextRouter, preferenceState);
        nextRouter = sanitizeRoutes(nextRouter);
        store = setPartialNavigationStore(store, { ...nextRouter, id: generateRandomUUID(), replace });
        return store;
      });
    },
    [preferenceStoreApi, routeKey, routesRuntimeStoreApi, routerStoreApi, setNavigationStore]
  );

  const replaceURLSearchParams = useCallback(
    function (
      to: InferNavigationIntentFromPath<SourcePath>['replaceURLSearchParams'],
      { replace = false }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
    ) {
      const runtimeState = getAppRoutesRuntimeStateFromApi(routesRuntimeStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const prevId = getRouteIdFromLocation(getRouteFromKey(routerState, routeKey));
      let snapshot = findRouteSnapshotFromKey<SourcePath>(runtimeState, routeKey);
      const prevSearchParams = applyNavigationDispatch(to as never, snapshot.search.toParams());
      snapshot = applyRouteLocationSearchToSnapshot<SourcePath>(runtimeState, snapshot, prevSearchParams);
      const nextLocation = getRouteLocationFromSnapshot(runtimeState, snapshot);
      const nextId = getRouteIdFromLocation(nextLocation);

      if (!nextLocation?.href || prevId === nextId) return;

      setNavigationStore(store => {
        let nextRouter = cloneLocationStore(routerState);
        nextRouter = updateRoute(nextRouter, routeKey, nextLocation);
        nextRouter = sanitizePanels(nextRouter, preferenceState);
        nextRouter = sanitizeRoutes(nextRouter);
        store = setPartialNavigationStore(store, { ...nextRouter, id: generateRandomUUID(), replace });
        return store;
      });
    },
    [preferenceStoreApi, routeKey, routesRuntimeStoreApi, routerStoreApi, setNavigationStore]
  );

  const closePanel = useCallback(
    function (
      panelKey: InferNavigationIntentFromPath<SourcePath>['closePanel'],
      { replace = false }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
    ) {
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      setNavigationStore(store => {
        let nextRouter = cloneLocationStore(routerState);
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

//*****************************************************************************************
// useAppSyncNavigationStoreFromLocation
//*****************************************************************************************

export function useAppSyncNavigationStoreFromLocation() {
  const location = useLocation() as Location<AppLocationState>;
  const preferenceStoreApi = useAppPreferenceStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const routesRuntimeStoreApi = useAppRoutesRuntimeStoreApi();
  const setNavigationStore = useAppSetNavigationStore();

  const getNavigationFromLocationState = useCallback(
    () =>
      setNavigationStore(store => {
        const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
        const routerState = getAppRouterStateFromApi(routerStoreApi);
        const runtimeState = getAppRoutesRuntimeStateFromApi(routesRuntimeStoreApi);

        let nextStore = getNavigationStoreFromRouter(store, routerState);

        for (const [routeKey, route] of Object.entries(location.state?.routes || {})) {
          const nextRoute = sanitizeRouteLocation(runtimeState, route);
          [nextStore] = upsertRoute(nextStore, routeKey, nextRoute);
        }

        for (const [nextPanelKey, nextPanel] of (location.state?.panels || []).entries()) {
          [nextStore] = upsertPanel(nextStore, nextPanelKey, nextPanel, preferenceState);
        }

        for (
          let panelKey = (nextStore?.panels?.length || 0) - 1;
          panelKey >= (location.state?.panels?.length || 0);
          panelKey--
        ) {
          nextStore = removePanel(nextStore, panelKey);
        }

        nextStore.replace = true;
        nextStore.id = location.state?.id || generateRandomUUID();

        nextStore = sanitizePanels(nextStore, preferenceState) as never;
        nextStore = sanitizeRoutes(nextStore as never);
        nextStore = applyDefaultNavigationStore(nextStore, preferenceState);

        return nextStore;
      }),
    [location, preferenceStoreApi, routerStoreApi, routesRuntimeStoreApi, setNavigationStore]
  );

  const getNavigationFromLocationHash = useCallback(
    () =>
      setNavigationStore(store => {
        const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
        const routerState = getAppRouterStateFromApi(routerStoreApi);
        const runtimeState = getAppRoutesRuntimeStateFromApi(routesRuntimeStoreApi);

        let nextStore = getNavigationStoreFromRouter(store, routerState);

        const hashFragment = location.hash ? location.hash.slice(1) : '';

        let panelKey: number = -1;

        for (const [i, fragment] of hashFragment.split('#/').entries()) {
          const nextLocation = sanitizeRouteLocation(runtimeState, { href: i === 0 ? fragment : `/${fragment}` });
          if (!nextLocation?.href) continue;

          panelKey++;

          const prevLocation = getRouteFromPanelKey(routerState, panelKey);
          const prevSpec = findRouteSpecFromLocation(runtimeState, prevLocation);
          const nextSpec = findRouteSpecFromLocation(runtimeState, nextLocation);

          if (!!nextSpec?.path && nextSpec?.path === prevSpec?.path) {
            nextStore = updateRoute(nextStore, nextStore.panels[panelKey].routeKey, nextLocation);
          } else {
            const [nextStore1, nextRouteKey] = addRoute(nextStore, nextLocation);
            [nextStore] = upsertPanel(nextStore1, panelKey, { routeKey: nextRouteKey }, preferenceState);
          }
        }

        for (let i = nextStore.panels.length - 1; i > panelKey; i--) {
          nextStore = removePanel(nextStore, i);
        }

        nextStore.replace = false;
        nextStore.id = generateRandomUUID();

        nextStore = sanitizePanels(nextStore, preferenceState) as never;
        nextStore = sanitizeRoutes(nextStore as never);
        nextStore = applyDefaultNavigationStore(nextStore, preferenceState);

        return nextStore;
      }),
    [location, preferenceStoreApi, routerStoreApi, routesRuntimeStoreApi, setNavigationStore]
  );

  const getNavigationFromLegacyLocation = useCallback(
    () =>
      setNavigationStore(store => {
        const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
        const routerState = getAppRouterStateFromApi(routerStoreApi);
        const runtimeState = getAppRoutesRuntimeStateFromApi(routesRuntimeStoreApi);

        let nextStore = getNavigationStoreFromRouter(store, routerState);

        const pathname = location.pathname === '/' ? '/submit' : location.pathname;
        const legacyLocation = sanitizeRouteLocation(runtimeState, {
          href: `${pathname}${location.search || ''}${location.hash || ''}`,
          state: location.state ?? null
        });

        if (!legacyLocation?.href) return nextStore;

        const nextSpec = findRouteSpecFromLocation(runtimeState, legacyLocation);
        const prevLocation = getRouteFromPanelKey(nextStore, 0);
        const prevSpec = findRouteSpecFromLocation(runtimeState, prevLocation);

        if (!!nextSpec?.path && nextSpec?.path === prevSpec?.path && !!nextStore?.panels?.[0]?.routeKey) {
          nextStore = updateRoute(nextStore, nextStore.panels[0].routeKey, legacyLocation);
        } else {
          const [nextStore1, nextRouteKey] = addRoute(nextStore, legacyLocation);
          if ((nextStore1?.panels?.length || 0) > 0) {
            nextStore = updatePanel(nextStore1, 0, { routeKey: nextRouteKey });
          } else {
            [nextStore] = upsertPanel(nextStore1, 0, { routeKey: nextRouteKey }, preferenceState);
          }
        }

        for (let panelKey = nextStore.panels.length - 1; panelKey > 0; panelKey--) {
          nextStore = removePanel(nextStore, panelKey);
        }

        nextStore.replace = true;
        nextStore.id = generateRandomUUID();

        nextStore = sanitizePanels(nextStore, preferenceState) as never;
        nextStore = sanitizeRoutes(nextStore as never);
        nextStore = applyDefaultNavigationStore(nextStore, preferenceState);

        return nextStore;
      }),
    [location, preferenceStoreApi, routerStoreApi, routesRuntimeStoreApi, setNavigationStore]
  );

  useEffect(() => {
    const runtimeState = getAppRoutesRuntimeStateFromApi(routesRuntimeStoreApi);
    if (!Object.entries(runtimeState.specs || {}).length) return;

    const routerState = getAppRouterStateFromApi(routerStoreApi);
    if (location?.state?.id && location.state.id === routerState.id) return;

    try {
      if (!!location.state) return getNavigationFromLocationState();
      else if (location?.pathname === '/v1') return getNavigationFromLocationHash();
      else return getNavigationFromLegacyLocation();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('error parsing the location', e);
    }
  }, [
    getNavigationFromLegacyLocation,
    getNavigationFromLocationHash,
    getNavigationFromLocationState,
    location,
    routerStoreApi,
    routesRuntimeStoreApi
  ]);

  return null;
}

//*****************************************************************************************
// useAppSyncLocationToNavigationStore
//*****************************************************************************************
export function useAppSyncRouterStoreFromNavigation() {
  const navigate = useNavigate();
  const navigationStoreApi = useAppNavigationStoreApi();
  const preferenceStoreApi = useAppPreferenceStoreApi();
  const routesRuntimeStoreApi = useAppRoutesRuntimeStoreApi();
  const setNavigationStore = useAppSetNavigationStore();
  const setRouterStore = useAppSetRouterStore();

  const updateRouterStoreFromNavigation = useCallback(
    (navigation: AppNavigationStore) => {
      if (!hasRoutes(navigation) || hasBlockedRoutes(navigation)) return;

      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const runtimeState = getAppRoutesRuntimeStateFromApi(routesRuntimeStoreApi);

      const firstRoute = getRouteFromPanelKey(navigation, 0);
      const firstRouteSpec = findRouteSpecFromLocation(runtimeState, firstRoute);
      document.title = !firstRouteSpec?.path ? 'Assemblyline 4' : `ALV4 | ${firstRouteSpec.path}`;

      const fragments = getHashFragmentsFromRouter(navigation);

      void navigate(!fragments?.length ? '/v1' : `/v1#${fragments.join('#')}`, {
        state: getLocationStateFromRouter(navigation),
        replace: navigation?.replace || false
      });

      setRouterStore(router => {
        router = reconcileRouterFromNavigation(router, navigation, preferenceState);
        return sanitizeRouterStore(router, preferenceState);
      });
      setNavigationStore(clearNavigationStore);
    },
    [navigate, preferenceStoreApi, routesRuntimeStoreApi, setNavigationStore, setRouterStore]
  );

  useEffect(() => {
    updateRouterStoreFromNavigation(getAppNavigationStateFromApi(navigationStoreApi));
    return navigationStoreApi?.subscribe(updateRouterStoreFromNavigation);
  }, [navigationStoreApi, updateRouterStoreFromNavigation]);

  return null;
}

//*****************************************************************************************
// useAppBlockUnloadEvent
//*****************************************************************************************
export function useAppBlockUnloadEvent() {
  const navigationStoreApi = useAppNavigationStoreApi();

  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      const navigationState = getAppNavigationStateFromApi(navigationStoreApi);
      if (!hasBlockedRoutes(navigationState)) return;
      event.preventDefault();
      event.returnValue = '';
    },
    [navigationStoreApi]
  );

  useEffect(() => {
    if (!navigationStoreApi) return;
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [handleBeforeUnload, navigationStoreApi]);

  return null;
}

//*****************************************************************************************
// useAppBlockNavigation
//*****************************************************************************************
export function useAppBlockNavigation() {
  const navigationStoreApi = useAppNavigationStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const setNavigationStore = useAppSetNavigationStore();

  const lastPromptedNavigationIdRef = useRef<string | null>(null);

  const onNavigationChange = useCallback(
    (store: AppNavigationStore) => {
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      const hasBlockers = hasBlockedRoutes(store);
      if (!hasBlockers) {
        lastPromptedNavigationIdRef.current = null;
        return;
      }

      const hasNavigationRequest = store.id !== routerState.id;
      if (!hasNavigationRequest) {
        lastPromptedNavigationIdRef.current = null;
        return;
      }
      if (lastPromptedNavigationIdRef.current === store.id) return;
      lastPromptedNavigationIdRef.current = store.id;

      // TODO: add translation for this
      const shouldLeave = window.confirm('You have unsaved changes. Leave this page and discard them?');
      if (!shouldLeave) return;

      setNavigationStore(clearBlockedRoutes);
      lastPromptedNavigationIdRef.current = null;
    },
    [routerStoreApi, setNavigationStore]
  );

  // In-app navigation warning when a navigation request exists but blockers are active
  useEffect(() => {
    if (!navigationStoreApi) return;

    const unsubscribe = navigationStoreApi.subscribe(onNavigationChange);
    onNavigationChange(navigationStoreApi.getState());

    return unsubscribe;
  }, [navigationStoreApi, onNavigationChange]);

  return null;
}
