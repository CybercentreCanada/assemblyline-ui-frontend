import { getAppPreferenceStateFromApi, useAppPreferenceStoreApi } from 'core/preference';
import type {
  AppRouterPage,
  InferAppNavigationOperationMapFromPath,
  InferAppNavigationPropsFromPath
} from 'core/router';
import {
  applyNavigationDispatch,
  findAppRouteFromKey,
  findNextPanelKeyFromPageKey,
  findPageKeyFromPanelKey,
  findPanelKeyFromPageKey,
  findPrevPanelKeyFromPageKey,
  getAppLocationParamStateFromApi,
  getAppRouterStateFromApi,
  getExternalHrefFromPage,
  getPageFromInput,
  getPageFromParam,
  getRouteParamFromKey,
  resolveNavigationIntent,
  useAppLocationParamStoreApi,
  useAppPageKey,
  useAppRouterStoreApi
} from 'core/router';
import type { DependencyList } from 'react';
import { useMemo } from 'react';

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

        if (operation === 'search' && (!prevPage || !prevPageParams)) return null;
        if (operation !== 'search' && typeof dispatch === 'function' && !prevPageParams) return null;

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
