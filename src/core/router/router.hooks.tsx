import { getAppPreferenceStateFromApi, useAppPreferenceStoreApi } from 'core/preference';
import type {
  AppLocationState,
  AppNavigateOptions,
  AppNavigationStore,
  InferAppNavigationIntentMapFromPath,
  InferAppNavigationOperationMapFromPath
} from 'core/router';
import {
  addBlockedRoute,
  addRoute,
  applyDefaultNavigationStore,
  applyNavigationDispatch,
  clearBlockedRoutes,
  clearNavigationStore,
  cloneLocationStore,
  DEFAULT_APP_NAVIGATE_OPTIONS,
  findNextPanelKey,
  findPanelKey,
  findPrevPanelKey,
  getAppNavigationStateFromApi,
  getAppRouterStateFromApi,
  getHashFragmentsFromRouter,
  getLocationStateFromRouter,
  getNavigationIntentFromInput,
  getNavigationStoreFromRouter,
  getOperationIntentFromNavigation,
  getPanel,
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
import type { AppLocationParam } from 'core/routes';
import {
  findAppRouteValuesFromKey,
  findRouteSpecFromLocation,
  getAppLocationParamStateFromApi,
  getExternalHrefFromLocation,
  getLocationParamFromValues,
  getRouteIdFromLocation,
  sanitizeLocationParam,
  useAppLocationParamStoreApi,
  useAppRouteKey
} from 'core/routes';
import type { DependencyList } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Location, NavigateOptions } from 'react-router';
import { useLocation, useNavigate } from 'react-router';
import { generateRandomUUID } from 'shared/utils/app.utils';

//*****************************************************************************************
// useAppExternalHref
//*****************************************************************************************

export function useAppExternalHref<const Path extends AppRoute['route']>(
  navigate: InferAppNavigationIntentMapFromPath<Path>,
  navOptions: AppNavigateOptions,
  navDeps: DependencyList
): AppLocationParam['href'] {
  const routeKey = useAppRouteKey();
  const locationParamStoreApi = useAppLocationParamStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const preferenceStoreApi = useAppPreferenceStoreApi();

  return useMemo<AppLocationParam['href']>(
    () => {
      if (navOptions?.href) return navOptions.href;

      const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      let { key: navigateKey, values: navigateValues, panelKey } = getNavigationIntentFromInput(navigate);

      if (!navigateKey) return null;

      const { operation, dispatch } = getOperationIntentFromNavigation(navigateValues);

      if (!operation || operation === 'delete') return null;

      switch (navigateKey) {
        case 'from': {
          panelKey = findPrevPanelKey(routerState, routeKey, preferenceState);
          const prevRouteKey = getPanel(routerState, panelKey).routeKey;
          const prevLocationParams = findAppRouteValuesFromKey<Path>(locationState, prevRouteKey);
          const nextLocationParams = applyNavigationDispatch(dispatch, prevLocationParams);
          const nextRoute = getLocationParamFromValues<Path>(locationState, nextLocationParams);
          return getExternalHrefFromLocation(locationState, nextRoute);
        }
        case 'here': {
          panelKey = findPanelKey(routerState, { routeKey });
          const prevRouteKey = getPanel(routerState, panelKey).routeKey;
          const prevLocationParams = findAppRouteValuesFromKey<Path>(locationState, prevRouteKey);
          const nextLocationParams = applyNavigationDispatch(dispatch, prevLocationParams);
          const nextRoute = getLocationParamFromValues<Path>(locationState, nextLocationParams);
          return getExternalHrefFromLocation(locationState, nextRoute);
        }
        case 'to': {
          panelKey = findNextPanelKey(routerState, routeKey, preferenceState);
          const prevRouteKey = getPanel(routerState, panelKey).routeKey;
          const prevLocationParams = findAppRouteValuesFromKey<Path>(locationState, prevRouteKey);
          const nextLocationParams = applyNavigationDispatch(dispatch, prevLocationParams);
          const nextRoute = getLocationParamFromValues<Path>(locationState, nextLocationParams);
          return getExternalHrefFromLocation(locationState, nextRoute);
        }
        case 'at': {
          const prevRouteKey = getPanel(routerState, panelKey).routeKey;
          const prevLocationParams = findAppRouteValuesFromKey<Path>(locationState, prevRouteKey);
          const nextLocationParams = applyNavigationDispatch(dispatch, prevLocationParams);
          const nextRoute = getLocationParamFromValues<Path>(locationState, nextLocationParams);
          return getExternalHrefFromLocation(locationState, nextRoute);
        }
        default: {
          return null;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [routeKey, ...(navDeps ?? [navigate])]
  );
}

//*****************************************************************************************
// useAppNavigate
//*****************************************************************************************

export function useAppNavigate<const Origin extends AppRoute['route']>() {
  const routeKey = useAppRouteKey();
  const locationParamStoreApi = useAppLocationParamStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const preferenceStoreApi = useAppPreferenceStoreApi();
  const setNavigationStore = useAppSetNavigationStore();

  const create = useCallback(
    function <const Destination extends AppRoute['route'] = Origin>(
      destinationPanelKey: number,
      dispatch: InferAppNavigationOperationMapFromPath<Destination>['create'],
      options: AppNavigateOptions
    ) {
      const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const prevRouteKey = getPanel(routerState, destinationPanelKey).routeKey;
      const prevRoute = getRouteFromKey(routerState, prevRouteKey);
      const prevId = getRouteIdFromLocation(prevRoute);
      const prevLocationParams = findAppRouteValuesFromKey<Destination>(locationState, prevRouteKey);
      const nextLocationParams = applyNavigationDispatch(dispatch, prevLocationParams);
      const nextRoute = getLocationParamFromValues<Destination>(locationState, nextLocationParams);
      const nextId = getRouteIdFromLocation(nextRoute);

      if (!nextRoute?.href || prevId === nextId) return;

      setNavigationStore(store => {
        let nextRouter = cloneLocationStore(routerState);
        const [nextStore, nextRouteKey] = addRoute(nextRouter, nextRoute);
        [nextRouter] = upsertPanel(nextStore, destinationPanelKey, { routeKey: nextRouteKey }, preferenceState);
        // nextRouter = sanitizePanels(nextRouter, preferenceState);
        // nextRouter = sanitizeRoutes(nextRouter);
        store = setPartialNavigationStore(store, { ...nextRouter, id: generateRandomUUID(), options });
        return store;
      });
    },
    [locationParamStoreApi, preferenceStoreApi, routerStoreApi, setNavigationStore]
  );

  const update = useCallback(
    function <const Destination extends AppRoute['route'] = Origin>(
      destinationPanelKey: number,
      dispatch: InferAppNavigationOperationMapFromPath<Destination>['update'],
      options: AppNavigateOptions
    ) {
      const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const prevRouteKey = getPanel(routerState, destinationPanelKey).routeKey;
      const prevRoute = getRouteFromKey(routerState, prevRouteKey);
      const prevId = getRouteIdFromLocation(prevRoute);
      const prevLocationParams = findAppRouteValuesFromKey<Destination>(locationState, prevRouteKey);
      const nextLocationParams = applyNavigationDispatch(dispatch, prevLocationParams);
      const nextRoute = getLocationParamFromValues<Destination>(locationState, nextLocationParams);
      const nextId = getRouteIdFromLocation(nextRoute);

      if (!nextRoute?.href || prevId === nextId) return;

      setNavigationStore(store => {
        let nextRouter = cloneLocationStore(routerState);
        nextRouter = updateRoute(nextRouter, routeKey, nextRoute);
        // nextRouter = sanitizePanels(nextRouter, preferenceState);
        // nextRouter = sanitizeRoutes(nextRouter);
        store = setPartialNavigationStore(store, { ...nextRouter, id: generateRandomUUID(), options });
        return store;
      });
    },
    [locationParamStoreApi, preferenceStoreApi, routeKey, routerStoreApi, setNavigationStore]
  );

  const del = useCallback(
    function <const Destination extends AppRoute['route'] = Origin>(
      destinationPanelKey: number,
      dispatch: InferAppNavigationOperationMapFromPath<Destination>['delete'],
      options: AppNavigateOptions
    ) {
      const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const prevRouteKey = getPanel(routerState, destinationPanelKey).routeKey;
      const prevLocationParams = findAppRouteValuesFromKey<Destination>(locationState, prevRouteKey);
      const shouldClose = applyNavigationDispatch(dispatch, prevLocationParams);

      if (!shouldClose) return;

      setNavigationStore(store => {
        let nextRouter = cloneLocationStore(routerState);
        nextRouter = removePanel(nextRouter, destinationPanelKey);
        // nextRouter = sanitizePanels(nextRouter, preferenceState);
        // nextRouter = sanitizeRoutes(nextRouter);
        store = setPartialNavigationStore(store, { ...nextRouter, id: generateRandomUUID(), options });
        return store;
      });
    },
    [locationParamStoreApi, preferenceStoreApi, routerStoreApi, setNavigationStore]
  );

  const operate = useCallback(
    function <const Destination extends AppRoute['route']>(
      destinationPanelKey: number,
      intent: InferAppNavigationOperationMapFromPath<Destination>,
      options: AppNavigateOptions
    ) {
      const { operation, dispatch } = getOperationIntentFromNavigation(intent);

      if (!operation) return;

      switch (operation) {
        case 'create':
          create<Destination>(destinationPanelKey, dispatch, options);
          break;
        case 'update':
          update<Destination>(destinationPanelKey, dispatch, options);
          break;
        case 'delete':
          del<Destination>(destinationPanelKey, dispatch, options);
          break;
      }
    },
    [create, update, del]
  );

  const buildOperations = useCallback(
    function <const Destination extends AppRoute['route'] = Origin>(
      destinationPanelKey: number,
      options: NavigateOptions
    ) {
      return {
        create: (dispatch: InferAppNavigationOperationMapFromPath<Destination>['create']) =>
          create<Destination>(destinationPanelKey, dispatch, options),
        update: (dispatch: InferAppNavigationOperationMapFromPath<Destination>['update']) =>
          update<Destination>(destinationPanelKey, dispatch, options),
        delete: (dispatch: InferAppNavigationOperationMapFromPath<Destination>['delete']) =>
          del<Destination>(destinationPanelKey, dispatch, options),
        operate: (intent: InferAppNavigationOperationMapFromPath<Destination>) =>
          operate<Destination>(destinationPanelKey, intent, options)
      };
    },
    [create, del, update, operate]
  );

  const from = useCallback(
    function <const Destination extends AppRoute['route'] = Origin>(
      options: AppNavigateOptions = DEFAULT_APP_NAVIGATE_OPTIONS
    ) {
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);

      const destinationPanelKey = findPrevPanelKey(routerState, routeKey, preferenceState);
      return buildOperations<Destination>(destinationPanelKey, options);
    },
    [buildOperations, preferenceStoreApi, routeKey, routerStoreApi]
  );

  const here = useCallback(
    function <const Destination extends AppRoute['route'] = Origin>(
      options: AppNavigateOptions = DEFAULT_APP_NAVIGATE_OPTIONS
    ) {
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const originPanelKey = findPanelKey(routerState, { routeKey });
      return buildOperations<Destination>(originPanelKey, options);
    },
    [buildOperations, routeKey, routerStoreApi]
  );

  const to = useCallback(
    function <const Destination extends AppRoute['route'] = Origin>(
      options: AppNavigateOptions = DEFAULT_APP_NAVIGATE_OPTIONS
    ) {
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);

      const destinationPanelKey = findNextPanelKey(routerState, routeKey, preferenceState);
      return buildOperations<Destination>(destinationPanelKey, options);
    },
    [buildOperations, preferenceStoreApi, routeKey, routerStoreApi]
  );

  const at = useCallback(
    function <const Destination extends AppRoute['route'] = Origin>(
      panelKey: number,
      options: AppNavigateOptions = DEFAULT_APP_NAVIGATE_OPTIONS
    ) {
      return buildOperations<Destination>(panelKey, options);
    },
    [buildOperations]
  );

  const run = useCallback(
    function <const Destination extends AppRoute['route'] = Origin>(
      navigate: InferAppNavigationIntentMapFromPath<Destination>,
      options: AppNavigateOptions = DEFAULT_APP_NAVIGATE_OPTIONS
    ) {
      const { key: navigateKey, values: navigateValues, panelKey } = getNavigationIntentFromInput(navigate);

      if (!navigateKey) return null;

      switch (navigateKey) {
        case 'from': {
          from<Origin>(options).operate<Destination>(navigateValues);
          break;
        }
        case 'here': {
          here<Origin>(options).operate<Destination>(navigateValues);
          break;
        }
        case 'to': {
          to<Origin>(options).operate<Destination>(navigateValues);
          break;
        }
        case 'at': {
          at<Origin>(panelKey, options).operate<Destination>(navigateValues);
          break;
        }
      }
    },
    [at, from, here, to]
  );

  return { from, here, to, at, run };
}

//*****************************************************************************************
// useAppSyncNavigationStoreFromLocation
//*****************************************************************************************

export function useAppSyncNavigationStoreFromLocation() {
  const location = useLocation() as Location<AppLocationState>;
  const preferenceStoreApi = useAppPreferenceStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const locationParamStoreApi = useAppLocationParamStoreApi();
  const setNavigationStore = useAppSetNavigationStore();

  const getNavigationFromLocationState = useCallback(
    () =>
      setNavigationStore(store => {
        const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
        const routerState = getAppRouterStateFromApi(routerStoreApi);
        const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);

        let nextStore = getNavigationStoreFromRouter(store, routerState);

        for (const [routeKey, route] of Object.entries(location.state?.routes || {})) {
          const nextRoute = sanitizeLocationParam(locationState, route);
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

        nextStore.options.replace = true;
        nextStore.id = location.state?.id || generateRandomUUID();

        nextStore = sanitizePanels(nextStore, preferenceState) as never;
        nextStore = sanitizeRoutes(nextStore as never);
        nextStore = applyDefaultNavigationStore(nextStore, preferenceState);

        return nextStore;
      }),
    [location, preferenceStoreApi, routerStoreApi, locationParamStoreApi, setNavigationStore]
  );

  const getNavigationFromLocationHash = useCallback(
    () =>
      setNavigationStore(store => {
        const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
        const routerState = getAppRouterStateFromApi(routerStoreApi);
        const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);

        let nextStore = getNavigationStoreFromRouter(store, routerState);

        const hashFragment = location.hash ? location.hash.slice(1) : '';

        let panelKey: number = -1;

        for (const [i, fragment] of hashFragment.split('#/').entries()) {
          const nextLocation = sanitizeLocationParam(locationState, { href: i === 0 ? fragment : `/${fragment}` });
          if (!nextLocation?.href) continue;

          panelKey++;

          const prevLocation = getRouteFromPanelKey(routerState, panelKey);
          const prevSpec = findRouteSpecFromLocation(locationState, prevLocation);
          const nextSpec = findRouteSpecFromLocation(locationState, nextLocation);

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

        nextStore.options.replace = false;
        nextStore.id = generateRandomUUID();

        nextStore = sanitizePanels(nextStore, preferenceState) as never;
        nextStore = sanitizeRoutes(nextStore as never);
        nextStore = applyDefaultNavigationStore(nextStore, preferenceState);

        return nextStore;
      }),
    [location, preferenceStoreApi, routerStoreApi, locationParamStoreApi, setNavigationStore]
  );

  const getNavigationFromLegacyLocation = useCallback(
    () =>
      setNavigationStore(store => {
        const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
        const routerState = getAppRouterStateFromApi(routerStoreApi);
        const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);

        let nextStore = getNavigationStoreFromRouter(store, routerState);

        const pathname = location.pathname === '/' ? '/submit' : location.pathname;
        const legacyLocation = sanitizeLocationParam(locationState, {
          href: `${pathname}${location.search || ''}${location.hash || ''}`,
          state: location.state ?? null
        });

        if (!legacyLocation?.href) return nextStore;

        const nextSpec = findRouteSpecFromLocation(locationState, legacyLocation);
        const prevLocation = getRouteFromPanelKey(nextStore, 0);
        const prevSpec = findRouteSpecFromLocation(locationState, prevLocation);

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

        nextStore.options.replace = true;
        nextStore.id = generateRandomUUID();

        nextStore = sanitizePanels(nextStore, preferenceState) as never;
        nextStore = sanitizeRoutes(nextStore as never);
        nextStore = applyDefaultNavigationStore(nextStore, preferenceState);

        return nextStore;
      }),
    [location, preferenceStoreApi, routerStoreApi, locationParamStoreApi, setNavigationStore]
  );

  useEffect(() => {
    const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);

    if (!Object.entries(locationState.specs || {}).length) return;

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
    locationParamStoreApi
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
  const locationParamStoreApi = useAppLocationParamStoreApi();
  const setNavigationStore = useAppSetNavigationStore();
  const setRouterStore = useAppSetRouterStore();

  const updateRouterStoreFromNavigation = useCallback(
    (navigation: AppNavigationStore) => {
      if (!hasRoutes(navigation) || hasBlockedRoutes(navigation)) return;

      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);

      const firstRoute = getRouteFromPanelKey(navigation, 0);
      const firstRouteSpec = findRouteSpecFromLocation(locationState, firstRoute);
      document.title = !firstRouteSpec?.path ? 'Assemblyline 4' : `ALV4 | ${firstRouteSpec.path}`;

      const fragments = getHashFragmentsFromRouter(navigation);

      void navigate(!fragments?.length ? '/v1' : `/v1#${fragments.join('#')}`, {
        state: getLocationStateFromRouter(navigation),
        replace: navigation?.options?.replace || false
      });

      setRouterStore(router => {
        router = reconcileRouterFromNavigation(router, navigation, preferenceState);
        return sanitizeRouterStore(router, preferenceState);
      });
      setNavigationStore(clearNavigationStore);
    },
    [navigate, preferenceStoreApi, locationParamStoreApi, setNavigationStore, setRouterStore]
  );

  useEffect(() => {
    updateRouterStoreFromNavigation(getAppNavigationStateFromApi(navigationStoreApi));
    return navigationStoreApi?.subscribe(updateRouterStoreFromNavigation);
  }, [navigationStoreApi, updateRouterStoreFromNavigation]);

  return null;
}

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
    [routeKey, setNavigationStore, ...(dependencies ?? [shouldBlock])]
  );
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
