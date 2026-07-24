import { getAppPreferenceStateFromApi, useAppPreferenceStoreApi } from 'core/preference';
import type {
  AppLocationState,
  AppNavigateOptions,
  AppNavigationStore,
  AppRouterBlockedReason,
  AppRouterPage,
  InferAppNavigationOperationMapFromPath,
  InferAppNavigationPropsFromPath
} from 'core/router';
import {
  addPage,
  applyDefaultNavigationStore,
  applyNavigationDispatch,
  clearBlockedPages,
  findNextPanelKeyFromPageKey,
  findPageKeyFromPanelKey,
  findPanelKeyFromPageKey,
  findPrevPanelKeyFromPageKey,
  getAppNavigationStateFromApi,
  getAppRouterStateFromApi,
  getDefaultNavigateOptions,
  getDefaultRouterPage,
  getHashFragmentsFromRouter,
  getLocationStateFromRouter,
  getNavigationStoreFromRouter,
  getNextTitleFromPage,
  getPageFromPanelKey,
  hasBlockedPages,
  isPageVisible,
  reconcileRouterFromNavigation,
  removeBlockedPage,
  removePanel,
  resolveNavigationIntent,
  resolveNotFoundPage,
  sanitizeRouterStore,
  setBlockedPage,
  setPageScrollPositions,
  shouldUpdatePage,
  updatePage,
  upsertPage,
  upsertPanel,
  useAppNavigationStoreApi,
  useAppRouterStore,
  useAppRouterStoreApi,
  useAppSetNavigationStore,
  useAppSetRouterStore
} from 'core/router';
import {
  findAppRouteFromKey,
  findAppRouteFromPage,
  getAppLocationParamStateFromApi,
  getExternalHrefFromPage,
  getPageFromInput,
  getPageFromParam,
  getRouteParamFromKey,
  sanitizePage,
  useAppLocationParamStoreApi,
  useAppPageKey
} from 'core/routes';
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
export const useAppExternalHref = function <const Origin extends AppRoute['path']>(
  nav: InferAppNavigationPropsFromPath<Origin>['nav'],
  navDeps: DependencyList
): AppRouterPage['href'] {
  const pageKey = useAppPageKey();
  const locationParamStoreApi = useAppLocationParamStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const preferenceStoreApi = useAppPreferenceStoreApi();

  return useMemo<AppRouterPage['href']>(
    () => {
      const { target, panelKey, operation, options, dispatch } = resolveNavigationIntent<Origin>(nav);

      if (options?.href) return options.href;
      if (!target || !operation) return null;
      if (operation === 'closePanel' || !dispatch) return null;

      const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const resolveHref = (resolvedPanelKey: number): AppRouterPage['href'] => {
        const prevPageKey = findPageKeyFromPanelKey(routerState, resolvedPanelKey);
        const prevPage = routerState.pages?.[prevPageKey];
        const prevPageParams = getRouteParamFromKey<Origin>(locationState, prevPageKey);
        if (!prevPage || !prevPageParams) return null;

        if (operation === 'search') {
          const prevAppRoute = findAppRouteFromKey<Origin>(locationState, prevPageKey);
          const prevSnapshot = prevAppRoute.search.fromRoute(prevPage.href, prevPage.state, prevPage.transient);

          const nextSnapshot = applyNavigationDispatch(
            dispatch as typeof prevSnapshot | ((snapshot: typeof prevSnapshot) => typeof prevSnapshot),
            prevSnapshot
          );

          const nextPageParam = {
            ...prevPageParams,
            search: nextSnapshot.toObject()
          };

          const nextPage = getPageFromParam(locationState, nextPageParam as never);
          return getExternalHrefFromPage(locationState, nextPage);
        }

        const nextPageInput = applyNavigationDispatch(
          dispatch as
            | InferAppNavigationOperationMapFromPath<Origin>['create']
            | InferAppNavigationOperationMapFromPath<Origin>['update']
            | InferAppNavigationOperationMapFromPath<Origin>['only'],
          prevPageParams as never
        ) as never;

        const nextPage =
          operation === 'only'
            ? getPageFromParam(locationState, nextPageInput)
            : getPageFromInput(locationState, nextPageInput);

        return getExternalHrefFromPage(locationState, nextPage);
      };

      switch (target) {
        case 'from':
          return resolveHref(findPrevPanelKeyFromPageKey(routerState, pageKey, preferenceState));
        case 'here':
          return resolveHref(findPanelKeyFromPageKey(routerState, pageKey));
        case 'to':
          return resolveHref(findNextPanelKeyFromPageKey(routerState, pageKey, preferenceState));
        case 'at':
          return panelKey == null ? null : resolveHref(panelKey);
        default:
          return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageKey, ...(navDeps ?? [nav])]
  );
};

//*****************************************************************************************
// useAppNavigate
//*****************************************************************************************

export function useAppNavigate<const Origin extends AppRoute['path']>() {
  const pageKey = useAppPageKey();
  const locationParamStoreApi = useAppLocationParamStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const preferenceStoreApi = useAppPreferenceStoreApi();
  const setNavigationStore = useAppSetNavigationStore();

  const create = useCallback(
    function <const Destination extends AppRoute['path'] = Origin>(
      destinationPanelKey: number,
      dispatch: InferAppNavigationOperationMapFromPath<Destination>['create'],
      options: AppNavigateOptions
    ) {
      const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const prevPageKey = findPageKeyFromPanelKey(routerState, destinationPanelKey);
      const prevPageParam = getRouteParamFromKey<Origin>(locationState, prevPageKey);
      const nextPageParam = applyNavigationDispatch(dispatch, prevPageParam as never) as never;
      const nextPageInput = getPageFromInput<Destination>(locationState, nextPageParam);
      const context = { operation: 'create', originPageKey: prevPageKey, targetPanelKey: destinationPanelKey };
      const nextPage = resolveNotFoundPage(nextPageInput, nextPageParam, context);

      if (!shouldUpdatePage(routerState, prevPageKey, nextPage)) return;

      setNavigationStore(store => {
        store = getNavigationStoreFromRouter(store, routerState);
        const [nextStore, nextPageKey] = addPage(store, nextPage);
        [store] = upsertPanel(nextStore, destinationPanelKey, { pageKey: nextPageKey }, preferenceState);
        store = sanitizeRouterStore(store, preferenceState);
        store = setPageScrollPositions(store);
        store.id = generateRandomUUID();
        store.options = options;
        store.options.nextTitle = getNextTitleFromPage(nextPage);
        return store;
      });
    },
    [locationParamStoreApi, preferenceStoreApi, routerStoreApi, setNavigationStore]
  );

  const update = useCallback(
    function <const Destination extends AppRoute['path'] = Origin>(
      destinationPanelKey: number,
      dispatch: InferAppNavigationOperationMapFromPath<Destination>['update'],
      options: AppNavigateOptions
    ) {
      const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const prevPageKey = findPageKeyFromPanelKey(routerState, destinationPanelKey);
      const prevPageParam = getRouteParamFromKey<Origin>(locationState, prevPageKey);
      const nextPageParam = applyNavigationDispatch(dispatch, prevPageParam as never) as never;
      const nextPageInput = getPageFromInput<Destination>(locationState, nextPageParam);
      const context = { operation: 'update', originPageKey: prevPageKey, targetPanelKey: destinationPanelKey };
      const nextPage = resolveNotFoundPage(nextPageInput, nextPageParam, context);

      if (!shouldUpdatePage(routerState, prevPageKey, nextPage)) return;

      setNavigationStore(store => {
        store = getNavigationStoreFromRouter(store, routerState);
        store = updatePage(store, prevPageKey, nextPage);
        store = sanitizeRouterStore(store, preferenceState);
        store = setPageScrollPositions(store);
        store.id = generateRandomUUID();
        store.options = options;
        store.options.nextTitle = getNextTitleFromPage(nextPage);
        return store;
      });
    },
    [locationParamStoreApi, preferenceStoreApi, routerStoreApi, setNavigationStore]
  );

  const search = useCallback(
    function <const Destination extends AppRoute['path'] = Origin>(
      destinationPanelKey: number,
      dispatch: InferAppNavigationOperationMapFromPath<Destination>['search'],
      options: AppNavigateOptions
    ) {
      const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const prevPageKey = findPageKeyFromPanelKey(routerState, destinationPanelKey);
      const prevPage = getPageFromPanelKey(routerState, destinationPanelKey);
      const prevPageParam = getRouteParamFromKey<Origin>(locationState, prevPageKey);
      const prevAppRoute = findAppRouteFromKey<Origin>(locationState, prevPageKey);

      const prevSearchSnapshot = prevAppRoute.search.fromRoute(prevPage.href, prevPage.state, prevPage.transient);
      const nextSearchSnapshot = applyNavigationDispatch(dispatch, prevSearchSnapshot);

      const nextPageParam = { ...prevPageParam, search: nextSearchSnapshot.toObject() };
      const nextPageInput = getPageFromParam<Destination>(locationState, nextPageParam as never);
      const context = { operation: 'search', originPageKey: prevPageKey, targetPanelKey: destinationPanelKey };
      const nextPage = resolveNotFoundPage(nextPageInput, nextPageParam, context);

      if (!shouldUpdatePage(routerState, prevPageKey, nextPage)) return;

      setNavigationStore(store => {
        store = getNavigationStoreFromRouter(store, routerState);
        store = updatePage(store, prevPageKey, nextPage);
        store = sanitizeRouterStore(store, preferenceState);
        store = setPageScrollPositions(store);
        store.id = generateRandomUUID();
        store.options = options;
        store.options.nextTitle = getNextTitleFromPage(nextPage);
        return store;
      });
    },
    [locationParamStoreApi, preferenceStoreApi, routerStoreApi, setNavigationStore]
  );

  const only = useCallback(
    function <const Destination extends AppRoute['path'] = Origin>(
      destinationPanelKey: number,
      dispatch: InferAppNavigationOperationMapFromPath<Destination>['only'],
      options: AppNavigateOptions
    ) {
      const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const prevPageKey = findPageKeyFromPanelKey(routerState, destinationPanelKey);
      const prevPageParam = getRouteParamFromKey<Origin>(locationState, prevPageKey);
      const nextPageParam = applyNavigationDispatch(dispatch, prevPageParam as never) as never;
      const nextPageInput = getPageFromParam<Destination>(locationState, nextPageParam);
      const context = { operation: 'only', originPageKey: prevPageKey, targetPanelKey: destinationPanelKey };
      const nextPage = resolveNotFoundPage(nextPageInput, nextPageParam, context);

      setNavigationStore(store => {
        store = getNavigationStoreFromRouter(store, routerState);
        const [nextStore, nextPageKey] = addPage(store, nextPage);
        [store] = upsertPanel(nextStore, 0, { pageKey: nextPageKey }, preferenceState);

        for (let panelKey = store.panels.length - 1; panelKey > 0; panelKey--) {
          store = removePanel(store, panelKey);
        }

        store = sanitizeRouterStore(store, preferenceState);
        store = setPageScrollPositions(store);
        store.id = generateRandomUUID();
        store.options = options;
        store.options.nextTitle = getNextTitleFromPage(nextPage);
        return store;
      });
    },
    [locationParamStoreApi, preferenceStoreApi, routerStoreApi, setNavigationStore]
  );

  const closePanel = useCallback(
    function <const Destination extends AppRoute['path'] = Origin>(
      destinationPanelKey: number,
      dispatch: InferAppNavigationOperationMapFromPath<Destination>['closePanel'] = true,
      options: AppNavigateOptions
    ) {
      const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const prevPageKey = findPageKeyFromPanelKey(routerState, destinationPanelKey);
      const prevPageParam = getRouteParamFromKey<Origin>(locationState, prevPageKey);
      const shouldClose = typeof dispatch === 'function' ? dispatch(prevPageParam as never) : dispatch;

      if (!shouldClose) return;

      setNavigationStore(store => {
        store = getNavigationStoreFromRouter(store, routerState);
        store = removePanel(store, destinationPanelKey);
        store = sanitizeRouterStore(store, preferenceState);
        store = setPageScrollPositions(store);
        store.id = generateRandomUUID();
        store.options = options;
        store.options.nextTitle = getNextTitleFromPage(null);
        return store;
      });
    },
    [locationParamStoreApi, preferenceStoreApi, routerStoreApi, setNavigationStore]
  );

  const buildOperations = useCallback(
    function <const Destination extends AppRoute['path'] = Origin>(
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
    function <const Destination extends AppRoute['path'] = Origin>(
      options: AppNavigateOptions = getDefaultNavigateOptions()
    ) {
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);

      const destinationPanelKey = findPrevPanelKeyFromPageKey(routerState, pageKey, preferenceState);
      return buildOperations<Destination>(destinationPanelKey, options);
    },
    [buildOperations, preferenceStoreApi, pageKey, routerStoreApi]
  );

  const here = useCallback(
    function (options: AppNavigateOptions = getDefaultNavigateOptions()) {
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const originPanelKey = findPanelKeyFromPageKey(routerState, pageKey);
      return buildOperations<Origin>(originPanelKey, options);
    },
    [buildOperations, pageKey, routerStoreApi]
  );

  const to = useCallback(
    function <const Destination extends AppRoute['path'] = Origin>(
      options: AppNavigateOptions = getDefaultNavigateOptions()
    ) {
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);

      const destinationPanelKey = findNextPanelKeyFromPageKey(routerState, pageKey, preferenceState);
      return buildOperations<Destination>(destinationPanelKey, options);
    },
    [buildOperations, preferenceStoreApi, pageKey, routerStoreApi]
  );

  const at = useCallback(
    function <const Destination extends AppRoute['path'] = Origin>(
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

        for (const [pageKey, route] of Object.entries(location.state?.pages || {})) {
          const nextPageInput = sanitizePage(locationState, getDefaultRouterPage(route));
          const context = { operation: 'sync-location-state', pageKey };
          const nextPage = resolveNotFoundPage(nextPageInput, route, context);
          [store] = upsertPage(store, pageKey, nextPage);
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
          const nextPageInput = sanitizePage(locationState, getDefaultRouterPage({ href }));
          const context = { operation: 'sync-location-hash', panelKey: i };
          const nextPage = resolveNotFoundPage(nextPageInput, { href }, context);
          if (!nextPage?.href) continue;

          panelKey++;

          const prevPage = getPageFromPanelKey(routerState, panelKey);
          const prevRoute = findAppRouteFromPage(locationState, prevPage);
          const nextRoute = findAppRouteFromPage(locationState, nextPage);

          if (!!nextRoute?.path && nextRoute?.path === prevRoute?.path) {
            store = updatePage(store, store.panels[panelKey].pageKey, nextPage);
          } else {
            const [store1, nextPageKey] = addPage(store, nextPage);
            [store] = upsertPanel(store1, panelKey, { pageKey: nextPageKey }, preferenceState);
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
        const nextPageInput = sanitizePage(locationState, getDefaultRouterPage({ href, state: location.state }));
        const context = { operation: 'sync-legacy-location' };
        const legacyRoute = resolveNotFoundPage(nextPageInput, { href, state: location.state }, context);

        if (!legacyRoute?.href) return store;

        const nextRoute = findAppRouteFromPage(locationState, legacyRoute);
        const prevPage = getPageFromPanelKey(store, 0);
        const prevRoute = findAppRouteFromPage(locationState, prevPage);

        if (!!nextRoute?.path && nextRoute?.path === prevRoute?.path && !!store?.panels?.[0]?.pageKey) {
          store = updatePage(store, store.panels[0].pageKey, legacyRoute);
        } else {
          const [store1, nextPageKey] = addPage(store, legacyRoute);
          [store] = upsertPanel(store1, 0, { pageKey: nextPageKey }, preferenceState);
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

    if (!Object.entries(locationState.routes || {}).length) return;

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
      if (navigation.id === routerState.id || hasBlockedPages(navigation, routerState)) return;

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

export function useAppBlocker(
  shouldBlock: AppRouterBlockedReason | (() => AppRouterBlockedReason),
  dependencies: DependencyList = null
) {
  const pageKey = useAppPageKey();
  const setNavigationStore = useAppSetNavigationStore();
  const isVisible = useAppRouterStore(s => isPageVisible(s, pageKey));

  useEffect(
    () =>
      setNavigationStore(store => {
        if (!pageKey || !isVisible) return removeBlockedPage(store, pageKey);
        const reason = typeof shouldBlock === 'function' ? shouldBlock() : shouldBlock;
        return setBlockedPage(store, pageKey, reason);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isVisible, pageKey, setNavigationStore, ...(dependencies ?? [shouldBlock])]
  );
}

//*****************************************************************************************
// useAppBlockUnloadEvent
//*****************************************************************************************
export function useAppBlockUnloadEvent() {
  const navigationStoreApi = useAppNavigationStoreApi();
  const routerStoreApi = useAppRouterStoreApi();

  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      const navigationState = getAppNavigationStateFromApi(navigationStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      if (!hasBlockedPages(navigationState, routerState)) return;
      event.preventDefault();
      event.returnValue = '';
    },
    [navigationStoreApi, routerStoreApi]
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
      const hasBlockers = hasBlockedPages(store, routerState);
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

      setNavigationStore(clearBlockedPages);
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
