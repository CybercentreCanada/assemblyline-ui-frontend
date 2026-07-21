import { getAppPreferenceStateFromApi, useAppPreferenceStoreApi } from 'core/preference';
import type {
  AppLocationState,
  AppNavigateOptions,
  AppNavigationStore,
  AppRouterRoute,
  InferAppNavigationOperationMapFromPath,
  InferAppNavigationPropsFromPath
} from 'core/router';
import {
  addBlockedRoute,
  addRoute,
  applyDefaultNavigationStore,
  applyNavigationDispatch,
  clearBlockedRoutes,
  findNextPanelKeyFromRouteKey,
  findPanelKeyFromRouteKey,
  findPrevPanelKeyFromRouteKey,
  findRouteKeyFromPanelKey,
  getAppNavigationStateFromApi,
  getAppRouterStateFromApi,
  getDefaultNavigateOptions,
  getDefaultRouterRoute,
  getHashFragmentsFromRouter,
  getLocationStateFromRouter,
  getNavigationStoreFromRouter,
  getNextTitleFromRoute,
  getRouteFromPanelKey,
  hasBlockedRoutes,
  reconcileRouterFromNavigation,
  removeBlockedRoute,
  removePanel,
  resolveNavigationIntent,
  sanitizeRouterStore,
  setRouteScrollPositions,
  shouldUpdateRoute,
  updateRoute,
  upsertPanel,
  upsertRoute,
  useAppNavigationStoreApi,
  useAppRouterStoreApi,
  useAppSetNavigationStore,
  useAppSetRouterStore
} from 'core/router';
import type { InferAppRouteSpecFromPath } from 'core/routes';
import {
  findRouteSpecFromKey,
  findRouteSpecFromRoute,
  getAppLocationParamStateFromApi,
  getExternalHrefFromRoute,
  getRouteFromInput,
  getRouteFromParam,
  getRouteParamFromKey,
  sanitizeRoute,
  useAppLocationParamStoreApi,
  useAppRouteKey
} from 'core/routes';
import type { InferSearchParamSnapshotFromEngine } from 'features/search-params';
import type { DependencyList } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Location, NavigateOptions } from 'react-router';
import { useLocation, useNavigate } from 'react-router';
import { generateRandomUUID } from 'shared/utils/app.utils';

//*****************************************************************************************
// useAppExternalHref
//*****************************************************************************************

/**
 * @name useAppExternalHref
 * @description Computes a shareable `/v1#…` href by dry-running a nav callback against
 *              the current router state without triggering navigation.
 * @returns External href string, or null when nav is absent, a delete, or a noop.
 */
export const useAppExternalHref = function <const Origin extends AppRoute['route']>(
  nav: InferAppNavigationPropsFromPath<Origin>['nav'],
  navDeps: DependencyList
): AppRouterRoute['href'] {
  const routeKey = useAppRouteKey();
  const locationParamStoreApi = useAppLocationParamStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const preferenceStoreApi = useAppPreferenceStoreApi();

  return useMemo<AppRouterRoute['href']>(
    () => {
      const { target, panelKey, operation, options, dispatch } = resolveNavigationIntent<Origin>(nav);

      if (options?.href) return options.href;
      if (!target || !operation) return null;
      if (operation === 'closePanel' || !dispatch) return null;

      const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const resolveHref = (resolvedPanelKey: number): AppRouterRoute['href'] => {
        const prevRouteKey = findRouteKeyFromPanelKey(routerState, resolvedPanelKey);
        const prevRoute = routerState.routes?.[prevRouteKey];
        const prevRouteParams = getRouteParamFromKey<Origin>(locationState, prevRouteKey);
        if (!prevRoute || !prevRouteParams) return null;

        if (operation === 'search') {
          const prevRouteSpec = findRouteSpecFromKey<Origin>(locationState, prevRouteKey);
          const prevSnapshot = prevRouteSpec.search.fromRoute(
            prevRoute.href,
            prevRoute.state,
            prevRoute.transient
          ) as InferSearchParamSnapshotFromEngine<InferAppRouteSpecFromPath<Origin>['search']>;

          const nextSnapshot = applyNavigationDispatch(
            dispatch as InferAppNavigationOperationMapFromPath<Origin>['search'],
            prevSnapshot
          );

          const nextRouteParam = {
            ...prevRouteParams,
            search: nextSnapshot.toObject()
          };

          const nextRoute = getRouteFromParam(locationState, nextRouteParam as never);
          return getExternalHrefFromRoute(locationState, nextRoute);
        }

        const nextRouteInput = applyNavigationDispatch(
          dispatch as
            | InferAppNavigationOperationMapFromPath<Origin>['create']
            | InferAppNavigationOperationMapFromPath<Origin>['update']
            | InferAppNavigationOperationMapFromPath<Origin>['only'],
          prevRouteParams as never
        ) as never;

        const nextRoute =
          operation === 'only'
            ? getRouteFromParam(locationState, nextRouteInput)
            : getRouteFromInput(locationState, nextRouteInput);

        return getExternalHrefFromRoute(locationState, nextRoute);
      };

      switch (target) {
        case 'from':
          return resolveHref(findPrevPanelKeyFromRouteKey(routerState, routeKey, preferenceState));
        case 'here':
          return resolveHref(findPanelKeyFromRouteKey(routerState, routeKey));
        case 'to':
          return resolveHref(findNextPanelKeyFromRouteKey(routerState, routeKey, preferenceState));
        case 'at':
          return panelKey == null ? null : resolveHref(panelKey);
        default:
          return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [routeKey, ...(navDeps ?? [nav])]
  );
};

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

      const prevRouteKey = findRouteKeyFromPanelKey(routerState, destinationPanelKey);
      const prevRouteParam = getRouteParamFromKey<Origin>(locationState, prevRouteKey);
      const nextRouteParam = applyNavigationDispatch(dispatch, prevRouteParam as never) as never;
      const nextRoute = getRouteFromInput<Destination>(locationState, nextRouteParam);

      if (!shouldUpdateRoute(routerState, prevRouteKey, nextRoute)) return;

      setNavigationStore(store => {
        store = getNavigationStoreFromRouter(store, routerState);
        const [nextStore, nextRouteKey] = addRoute(store, nextRoute);
        [store] = upsertPanel(nextStore, destinationPanelKey, { routeKey: nextRouteKey }, preferenceState);
        store = sanitizeRouterStore(store, preferenceState);
        store = setRouteScrollPositions(store);
        store.id = generateRandomUUID();
        store.options = options;
        store.options.nextTitle = getNextTitleFromRoute(nextRoute);
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

      const prevRouteKey = findRouteKeyFromPanelKey(routerState, destinationPanelKey);
      const prevRouteParam = getRouteParamFromKey<Origin>(locationState, prevRouteKey);
      const nextRouteParam = applyNavigationDispatch(dispatch, prevRouteParam as never) as never;
      const nextRoute = getRouteFromInput<Destination>(locationState, nextRouteParam);

      if (!shouldUpdateRoute(routerState, prevRouteKey, nextRoute)) return;

      setNavigationStore(store => {
        store = getNavigationStoreFromRouter(store, routerState);
        store = updateRoute(store, prevRouteKey, nextRoute);
        store = sanitizeRouterStore(store, preferenceState);
        store = setRouteScrollPositions(store);
        store.id = generateRandomUUID();
        store.options = options;
        store.options.nextTitle = getNextTitleFromRoute(nextRoute);
        return store;
      });
    },
    [locationParamStoreApi, preferenceStoreApi, routerStoreApi, setNavigationStore]
  );

  const search = useCallback(
    function <const Destination extends AppRoute['route'] = Origin>(
      destinationPanelKey: number,
      dispatch: InferAppNavigationOperationMapFromPath<Destination>['search'],
      options: AppNavigateOptions
    ) {
      const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const prevRouteKey = findRouteKeyFromPanelKey(routerState, destinationPanelKey);
      const prevRoute = getRouteFromPanelKey(routerState, destinationPanelKey);
      const prevRouteParam = getRouteParamFromKey<Origin>(locationState, prevRouteKey);
      const prevRouteSpec = findRouteSpecFromKey<Origin>(locationState, prevRouteKey);

      const prevSearchSnapshot = prevRouteSpec.search.fromRoute(prevRoute.href, prevRoute.state, prevRoute.transient);
      const nextSearchSnapshot = applyNavigationDispatch(dispatch, prevSearchSnapshot);

      const nextRouteParam = { ...prevRouteParam, search: nextSearchSnapshot.toObject() };
      const nextRoute = getRouteFromParam<Destination>(locationState, nextRouteParam as never);

      if (!shouldUpdateRoute(routerState, prevRouteKey, nextRoute)) return;

      setNavigationStore(store => {
        store = getNavigationStoreFromRouter(store, routerState);
        store = updateRoute(store, prevRouteKey, nextRoute);
        store = sanitizeRouterStore(store, preferenceState);
        store = setRouteScrollPositions(store);
        store.id = generateRandomUUID();
        store.options = options;
        store.options.nextTitle = getNextTitleFromRoute(nextRoute);
        return store;
      });
    },
    [locationParamStoreApi, preferenceStoreApi, routerStoreApi, setNavigationStore]
  );

  const only = useCallback(
    function <const Destination extends AppRoute['route'] = Origin>(
      destinationPanelKey: number,
      dispatch: InferAppNavigationOperationMapFromPath<Destination>['only'],
      options: AppNavigateOptions
    ) {
      const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const prevRouteKey = findRouteKeyFromPanelKey(routerState, destinationPanelKey);
      const prevRouteParam = getRouteParamFromKey<Origin>(locationState, prevRouteKey);
      const nextRouteParam = applyNavigationDispatch(dispatch, prevRouteParam as never) as never;
      const nextRoute = getRouteFromParam<Destination>(locationState, nextRouteParam);

      setNavigationStore(store => {
        store = getNavigationStoreFromRouter(store, routerState);
        const [nextStore, nextRouteKey] = addRoute(store, nextRoute);
        [store] = upsertPanel(nextStore, 0, { routeKey: nextRouteKey }, preferenceState);

        for (let panelKey = store.panels.length - 1; panelKey > 0; panelKey--) {
          store = removePanel(store, panelKey);
        }

        store = sanitizeRouterStore(store, preferenceState);
        store = setRouteScrollPositions(store);
        store.id = generateRandomUUID();
        store.options = options;
        store.options.nextTitle = getNextTitleFromRoute(nextRoute);
        return store;
      });
    },
    [locationParamStoreApi, preferenceStoreApi, routerStoreApi, setNavigationStore]
  );

  const closePanel = useCallback(
    function <const Destination extends AppRoute['route'] = Origin>(
      destinationPanelKey: number,
      dispatch: InferAppNavigationOperationMapFromPath<Destination>['closePanel'] = true,
      options: AppNavigateOptions
    ) {
      const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const prevRouteKey = findRouteKeyFromPanelKey(routerState, destinationPanelKey);
      const prevRouteParam = getRouteParamFromKey<Origin>(locationState, prevRouteKey);
      const shouldClose = typeof dispatch === 'function' ? dispatch(prevRouteParam as never) : dispatch;

      if (!shouldClose) return;

      setNavigationStore(store => {
        store = getNavigationStoreFromRouter(store, routerState);
        store = removePanel(store, destinationPanelKey);
        store = sanitizeRouterStore(store, preferenceState);
        store = setRouteScrollPositions(store);
        store.id = generateRandomUUID();
        store.options = options;
        store.options.nextTitle = getNextTitleFromRoute(null);
        return store;
      });
    },
    [locationParamStoreApi, preferenceStoreApi, routerStoreApi, setNavigationStore]
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
        only: (dispatch: InferAppNavigationOperationMapFromPath<Destination>['only']) =>
          only<Destination>(destinationPanelKey, dispatch, options),
        search: (dispatch: InferAppNavigationOperationMapFromPath<Destination>['search']) =>
          search<Destination>(destinationPanelKey, dispatch, options),
        closePanel: (dispatch: InferAppNavigationOperationMapFromPath<Destination>['closePanel']) =>
          closePanel<Destination>(destinationPanelKey, dispatch, options)
      };
    },
    [closePanel, create, only, search, update]
  );

  const from = useCallback(
    function <const Destination extends AppRoute['route'] = Origin>(
      options: AppNavigateOptions = getDefaultNavigateOptions()
    ) {
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);

      const destinationPanelKey = findPrevPanelKeyFromRouteKey(routerState, routeKey, preferenceState);
      return buildOperations<Destination>(destinationPanelKey, options);
    },
    [buildOperations, preferenceStoreApi, routeKey, routerStoreApi]
  );

  const here = useCallback(
    function <const Destination extends AppRoute['route'] = Origin>(
      options: AppNavigateOptions = getDefaultNavigateOptions()
    ) {
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const originPanelKey = findPanelKeyFromRouteKey(routerState, routeKey);
      return buildOperations<Destination>(originPanelKey, options);
    },
    [buildOperations, routeKey, routerStoreApi]
  );

  const to = useCallback(
    function <const Destination extends AppRoute['route'] = Origin>(
      options: AppNavigateOptions = getDefaultNavigateOptions()
    ) {
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);

      const destinationPanelKey = findNextPanelKeyFromRouteKey(routerState, routeKey, preferenceState);
      return buildOperations<Destination>(destinationPanelKey, options);
    },
    [buildOperations, preferenceStoreApi, routeKey, routerStoreApi]
  );

  const at = useCallback(
    function <const Destination extends AppRoute['route'] = Origin>(
      panelKey: number = 0,
      options: AppNavigateOptions = getDefaultNavigateOptions()
    ) {
      return buildOperations<Destination>(panelKey, options);
    },
    [buildOperations]
  );

  return { from, here, to, at };
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

        store = getNavigationStoreFromRouter(store, routerState);

        for (const [routeKey, route] of Object.entries(location.state?.routes || {})) {
          const nextRoute = sanitizeRoute(locationState, getDefaultRouterRoute(route));
          [store] = upsertRoute(store, routeKey, nextRoute);
        }

        for (const [nextPanelKey, nextPanel] of (location.state?.panels || []).entries()) {
          [store] = upsertPanel(store, nextPanelKey, nextPanel, preferenceState);
        }

        for (
          let panelKey = (store?.panels?.length || 0) - 1;
          panelKey >= (location.state?.panels?.length || 0);
          panelKey--
        ) {
          store = removePanel(store, panelKey);
        }

        store.options.replace = true;
        store.id = location.state?.id || generateRandomUUID();

        store = sanitizeRouterStore(store, preferenceState);
        store = applyDefaultNavigationStore(store, preferenceState);

        return store;
      }),
    [location, preferenceStoreApi, routerStoreApi, locationParamStoreApi, setNavigationStore]
  );

  const getNavigationFromLocationHash = useCallback(
    () =>
      setNavigationStore(store => {
        const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
        const routerState = getAppRouterStateFromApi(routerStoreApi);
        const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);

        store = getNavigationStoreFromRouter(store, routerState);

        const hashFragment = location.hash ? location.hash.slice(1) : '/submit';

        let panelKey: number = -1;

        for (const [i, fragment] of hashFragment.split('#/').entries()) {
          const href = i === 0 ? fragment : `/${fragment}`;
          const nextRoute = sanitizeRoute(locationState, getDefaultRouterRoute({ href }));
          if (!nextRoute?.href) continue;

          panelKey++;

          const prevRoute = getRouteFromPanelKey(routerState, panelKey);
          const prevSpec = findRouteSpecFromRoute(locationState, prevRoute);
          const nextSpec = findRouteSpecFromRoute(locationState, nextRoute);

          if (!!nextSpec?.path && nextSpec?.path === prevSpec?.path) {
            store = updateRoute(store, store.panels[panelKey].routeKey, nextRoute);
          } else {
            const [store1, nextRouteKey] = addRoute(store, nextRoute);
            [store] = upsertPanel(store1, panelKey, { routeKey: nextRouteKey }, preferenceState);
          }
        }

        for (let i = store.panels.length - 1; i > panelKey; i--) {
          store = removePanel(store, i);
        }

        store.options.replace = false;
        store.id = generateRandomUUID();

        store = sanitizeRouterStore(store, preferenceState);
        store = applyDefaultNavigationStore(store, preferenceState);

        return store;
      }),
    [location, preferenceStoreApi, routerStoreApi, locationParamStoreApi, setNavigationStore]
  );

  const getNavigationFromLegacyLocation = useCallback(
    () =>
      setNavigationStore(store => {
        const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
        const routerState = getAppRouterStateFromApi(routerStoreApi);
        const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);

        store = getNavigationStoreFromRouter(store, routerState);

        const pathname = location.pathname === '/' ? '/submit' : location.pathname;
        const href = `${pathname}${location.search || ''}${location.hash || ''}`;
        const legacyRoute = sanitizeRoute(locationState, getDefaultRouterRoute({ href, state: location.state }));

        if (!legacyRoute?.href) return store;

        const nextSpec = findRouteSpecFromRoute(locationState, legacyRoute);
        const prevLocation = getRouteFromPanelKey(store, 0);
        const prevSpec = findRouteSpecFromRoute(locationState, prevLocation);

        if (!!nextSpec?.path && nextSpec?.path === prevSpec?.path && !!store?.panels?.[0]?.routeKey) {
          store = updateRoute(store, store.panels[0].routeKey, legacyRoute);
        } else {
          const [store1, nextRouteKey] = addRoute(store, legacyRoute);
          [store] = upsertPanel(store1, 0, { routeKey: nextRouteKey }, preferenceState);
        }

        for (let panelKey = store.panels.length - 1; panelKey > 0; panelKey--) {
          store = removePanel(store, panelKey);
        }

        store.options.replace = true;
        store.id = generateRandomUUID();

        store = sanitizeRouterStore(store, preferenceState);
        store = applyDefaultNavigationStore(store, preferenceState);

        return store;
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
  const routerStoreApi = useAppRouterStoreApi();
  const navigationStoreApi = useAppNavigationStoreApi();
  const setRouterStore = useAppSetRouterStore();

  const updateRouterStoreFromNavigation = useCallback(
    (navigation: AppNavigationStore) => {
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      if (navigation.id === routerState.id || hasBlockedRoutes(navigation)) return;

      const nextTitle = navigation?.options?.nextTitle?.trim();
      document.title = nextTitle ? `ALV4 | ${nextTitle}` : 'Assemblyline 4';

      const fragments = getHashFragmentsFromRouter(navigation);

      void navigate(!fragments?.length ? '/v1' : `/v1#${fragments.join('#')}`, {
        state: getLocationStateFromRouter(navigation),
        replace: navigation?.options?.replace || false
      });
      setRouterStore(router => reconcileRouterFromNavigation(router, navigation));
    },
    [navigate, routerStoreApi, setRouterStore]
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
