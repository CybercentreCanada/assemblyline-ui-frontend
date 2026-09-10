import { getAppPreferenceStateFromApi, useAppPreferenceStoreApi } from 'core/preference';
import type { AppNavigateOptions, InferAppNavigationOperationMapFromPath } from 'core/router';
import {
  addPage,
  applyNavigationDispatch,
  findAppRouteFromKey,
  findNextPanelKeyFromPageKey,
  findPageKeyFromPanelKey,
  findPanelKeyFromPageKey,
  findPrevPanelKeyFromPageKey,
  getAppLocationParamStateFromApi,
  getAppRouterStateFromApi,
  getDefaultNavigateOptions,
  getNavigationStoreFromRouter,
  getPageFromInput,
  getPageFromPanelKey,
  getPageFromParam,
  getRouteParamFromKey,
  removePanel,
  resolveNotFoundPage,
  sanitizeRouterStore,
  setPageScrollPositions,
  shouldUpdatePage,
  updatePage,
  upsertPanel,
  useAppLocationParamStoreApi,
  useAppPageKey,
  useAppRouterStoreApi,
  useAppSetNavigationStore
} from 'core/router';
import { useCallback } from 'react';
import type { NavigateOptions } from 'react-router';
import { generateRandomUUID } from 'shared/utils/app.utils';

export function useAppNavigate<const Origin extends AppRoute['path']>() {
  const pageKey = useAppPageKey();
  const locationParamStoreApi = useAppLocationParamStoreApi();
  const routerStoreApi = useAppRouterStoreApi();
  const preferenceStoreApi = useAppPreferenceStoreApi();
  const setNavigationStore = useAppSetNavigationStore();

  const create = useCallback(
    function <const Destination extends AppRoute['path']>(
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
        store = setPageScrollPositions(store);
        const [nextStore, nextPageKey] = addPage(store, nextPage);
        [store] = upsertPanel(nextStore, destinationPanelKey, { pageKey: nextPageKey }, preferenceState);
        store = updatePage(store, pageKey, { age: 0 });
        store = sanitizeRouterStore(store, preferenceState);
        store.id = generateRandomUUID();
        store.options = options;
        return store;
      });
    },
    [locationParamStoreApi, pageKey, preferenceStoreApi, routerStoreApi, setNavigationStore]
  );

  const update = useCallback(
    function <const Destination extends AppRoute['path']>(
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
        store = setPageScrollPositions(store);
        store = updatePage(store, prevPageKey, nextPage);
        store = updatePage(store, pageKey, { age: 0 });
        store = sanitizeRouterStore(store, preferenceState);
        store.id = generateRandomUUID();
        store.options = options;
        return store;
      });
    },
    [locationParamStoreApi, pageKey, preferenceStoreApi, routerStoreApi, setNavigationStore]
  );

  const search = useCallback(
    function <const Destination extends AppRoute['path']>(
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
        store = setPageScrollPositions(store);
        store = updatePage(store, prevPageKey, { ...nextPage, age: 0 });
        store = updatePage(store, pageKey, { age: 0 });
        store = sanitizeRouterStore(store, preferenceState);
        store.id = generateRandomUUID();
        store.options = options;
        return store;
      });
    },
    [locationParamStoreApi, pageKey, preferenceStoreApi, routerStoreApi, setNavigationStore]
  );

  const only = useCallback(
    function <const Destination extends AppRoute['path']>(
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
        store = setPageScrollPositions(store);
        const [nextStore, nextPageKey] = addPage(store, nextPage);
        [store] = upsertPanel(nextStore, 0, { pageKey: nextPageKey }, preferenceState);

        for (let panelKey = store.panels.length - 1; panelKey > 0; panelKey--) {
          store = removePanel(store, panelKey);
        }

        store = updatePage(store, pageKey, { age: 0 });
        store = sanitizeRouterStore(store, preferenceState);
        store.id = generateRandomUUID();
        store.options = options;
        return store;
      });
    },
    [locationParamStoreApi, pageKey, preferenceStoreApi, routerStoreApi, setNavigationStore]
  );

  const closePanel = useCallback(
    function <const Destination extends AppRoute['path']>(
      destinationPanelKey: number,
      dispatch: InferAppNavigationOperationMapFromPath<Destination>['closePanel'],
      options: AppNavigateOptions
    ) {
      const locationState = getAppLocationParamStateFromApi(locationParamStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const prevPageKey = findPageKeyFromPanelKey(routerState, destinationPanelKey);
      const prevPageParam = getRouteParamFromKey<Origin>(locationState, prevPageKey);
      const nextPageParam = applyNavigationDispatch(dispatch, prevPageParam as never) as never;
      const nextPageInput = getPageFromInput<Destination>(locationState, nextPageParam);
      const context = { operation: 'closePanel', originPageKey: prevPageKey, targetPanelKey: destinationPanelKey };
      const nextPage = resolveNotFoundPage(nextPageInput, nextPageParam, context);

      if (!shouldUpdatePage(routerState, prevPageKey, nextPage)) return;

      setNavigationStore(store => {
        store = getNavigationStoreFromRouter(store, routerState);
        store = setPageScrollPositions(store);
        store = removePanel(store, destinationPanelKey);

        const firstPanel = store.panels[0];
        const firstPage = firstPanel?.pageKey ? store.pages[firstPanel.pageKey] : null;
        if (store.panels.length === 0 || !firstPage?.href) {
          const [nextStore, nextPageKey] = addPage(store, nextPage);
          [store] = upsertPanel(nextStore, 0, { pageKey: nextPageKey }, preferenceState);
        }

        store = updatePage(store, pageKey, { age: 0 });
        store = sanitizeRouterStore(store, preferenceState);
        store.id = generateRandomUUID();
        store.options = options;
        return store;
      });
    },
    [locationParamStoreApi, pageKey, preferenceStoreApi, routerStoreApi, setNavigationStore]
  );

  const buildOperations = useCallback(
    function <const Destination extends AppRoute['path']>(destinationPanelKey: number, options: NavigateOptions) {
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
    function <const Destination extends AppRoute['path']>(options: AppNavigateOptions = getDefaultNavigateOptions()) {
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);

      const destinationPanelKey = findPrevPanelKeyFromPageKey(routerState, pageKey, preferenceState);
      return buildOperations<Destination>(destinationPanelKey, options);
    },
    [buildOperations, preferenceStoreApi, pageKey, routerStoreApi]
  );

  const here = useCallback(
    function <const Destination extends AppRoute['path'] = Origin>(
      options: AppNavigateOptions = getDefaultNavigateOptions()
    ) {
      const routerState = getAppRouterStateFromApi(routerStoreApi);

      const originPanelKey = findPanelKeyFromPageKey(routerState, pageKey);
      return buildOperations<Destination>(originPanelKey, options);
    },
    [buildOperations, pageKey, routerStoreApi]
  );

  const to = useCallback(
    function <const Destination extends AppRoute['path']>(options: AppNavigateOptions = getDefaultNavigateOptions()) {
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      const preferenceState = getAppPreferenceStateFromApi(preferenceStoreApi);

      const destinationPanelKey = findNextPanelKeyFromPageKey(routerState, pageKey, preferenceState);
      return buildOperations<Destination>(destinationPanelKey, options);
    },
    [buildOperations, preferenceStoreApi, pageKey, routerStoreApi]
  );

  const at = useCallback(
    function <const Destination extends AppRoute['path']>(
      panelKey: number = 0,
      options: AppNavigateOptions = getDefaultNavigateOptions()
    ) {
      return buildOperations<Destination>(panelKey, options);
    },
    [buildOperations]
  );

  return { from, here, to, at };
}
