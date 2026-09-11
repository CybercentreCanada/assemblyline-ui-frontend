import { getAppPreferenceStateFromApi, useAppPreferenceStoreApi } from 'core/preference';
import type { AppLocation } from 'core/router';
import {
  addPage,
  applyDefaultNavigationStore,
  findAppRouteFromPage,
  getAppLocationParamStateFromApi,
  getAppRouterStateFromApi,
  getDefaultRouterPage,
  getNavigationStoreFromRouter,
  getPageFromPanelKey,
  removePanel,
  resolveLegacyLocation,
  resolveNotFoundPage,
  sanitizePage,
  sanitizeRouterStore,
  updatePage,
  upsertPage,
  upsertPanel,
  useAppLocationParamStoreApi,
  useAppRouterStoreApi,
  useAppSetNavigationStore
} from 'core/router';
import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router';
import { generateRandomUUID } from 'shared/utils/app.utils';

/**
 * @name useSyncNavigationStoreFromLocation
 * @description Synchronizes navigation state from the current browser location.
 * @returns No value; subscribes the navigation store to location changes.
 */
export function useSyncNavigationStoreFromLocation() {
  const location = useLocation() as AppLocation;
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

        const hashFragment = location.hash ? location.hash.slice(1) : '';

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

        const mapping = resolveLegacyLocation(location.pathname, location.search || '', location.hash || '') as Record<
          number,
          string
        > | null;
        if (!mapping) return store;

        const panelEntries = Object.entries(mapping)
          .map(([key, href]) => [Number(key), href] as const)
          .sort((a, b) => a[0] - b[0]);
        const lastPanelKey = panelEntries[panelEntries.length - 1]?.[0] ?? -1;

        for (const [panelKey, href] of panelEntries) {
          const prevPage = getPageFromPanelKey(store, panelKey);
          if (prevPage?.href === href) continue;

          const nextPageInput = sanitizePage(locationState, getDefaultRouterPage({ href, state: location.state }));
          const context = { operation: 'sync-legacy-location', panelKey };
          const legacyRoute = resolveNotFoundPage(nextPageInput, { href, state: location.state }, context);
          if (!legacyRoute?.href) continue;

          const nextRoute = findAppRouteFromPage(locationState, legacyRoute);
          const prevRoute = findAppRouteFromPage(locationState, prevPage);

          if (!!nextRoute?.path && nextRoute?.path === prevRoute?.path && !!store?.panels?.[panelKey]?.pageKey) {
            store = updatePage(store, store.panels[panelKey].pageKey, legacyRoute);
          } else {
            const [store1, nextPageKey] = addPage(store, legacyRoute);
            [store] = upsertPanel(store1, panelKey, { pageKey: nextPageKey }, preferenceState);
          }
        }

        for (let panelKey = store.panels.length - 1; panelKey > lastPanelKey; panelKey--) {
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
