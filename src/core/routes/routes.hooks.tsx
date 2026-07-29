import type { Theme } from '@mui/material';
import { useTheme } from '@mui/material';
import { debounce } from '@tanstack/react-pacer';
import { useAppPreferenceStore } from 'core/preference';
import {
  findNextPanelKeyFromPageKey,
  findPanelKeyFromPageKey,
  findPrevPanelKeyFromPageKey,
  getPanel,
  useAppRouterStore
} from 'core/router';
import type {
  AppPageKeyStore,
  InferAppLocationFromPath,
  InferAppRouteFromPath,
  InferAppRouteParamFromPath
} from 'core/routes';
import {
  evaluateMediaQuery,
  findAppRouteFromKey,
  getDefaultRouteParam,
  getRouteParamFromKey,
  parseMediaQuery,
  useAppLocationParamStore,
  useAppPageKeyStore
} from 'core/routes';
import type { InferSearchParamSnapshotFromEngine } from 'features/search-params';
import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * @name useAppPageKey
 * @description Returns the current route key from the route-key store.
 * @returns Current route key, or null when no route context is available
 */
export function useAppPageKey(): AppPageKeyStore['pageKey'] {
  const context = useAppPageKeyStore(s => s.pageKey, true);
  if (context == null) return null;
  return context;
}

/**
 * @name useAppLocation
 * @description Returns a typed route location param for the selected panel target, or a selected value from it.
 * Supports cross-panel lookup targets (`from`, `here`, `to`, `at`) similar to navigation targets.
 * @param target - Which panel context to read location from
 * @param panelKey - Required for `at` target; ignored for other targets
 * @param selector - Optional selector applied to the current route param
 * @returns Current location param or selected param value
 */
export const useAppLocation = function <const Origin extends AppRoute['path']>(
  target: 'from' | 'here' | 'to' | 'at' = 'here',
  panelKey: number = null
) {
  const pageKey = useAppPageKey();
  const preferences = useAppPreferenceStore(s => (target === 'from' || target === 'to' ? s : null));

  const targetRouteKey = useAppRouterStore(s => {
    if (!pageKey) return null;

    let nextPanelKey: number = null;

    switch (target) {
      case 'from':
        if (!preferences) return null;
        nextPanelKey = findPrevPanelKeyFromPageKey(s, pageKey, preferences);
        break;

      case 'here':
        nextPanelKey = findPanelKeyFromPageKey(s, pageKey);
        break;

      case 'to':
        if (!preferences) return null;
        nextPanelKey = findNextPanelKeyFromPageKey(s, pageKey, preferences);
        break;

      case 'at':
        nextPanelKey = panelKey;
        break;
    }

    return getPanel(s, nextPanelKey)?.pageKey ?? null;
  });

  const param = useAppLocationParamStore(s =>
    !targetRouteKey ? getDefaultRouteParam<Origin>() : getRouteParamFromKey<Origin>(s, targetRouteKey)
  );

  return function <Selected = InferAppLocationFromPath<Origin>>(
    selector: (location: InferAppLocationFromPath<Origin>) => Selected = param => param as Selected
  ): Selected {
    return selector(param);
  };
};

/**
 * @name useAppPathParams
 * @description Returns the parsed path params for the current route context.
 * @returns Current route path params, or null when unavailable
 */
export function useAppPathParams<const Origin extends AppRoute['path']>(): InferAppRouteParamFromPath<Origin>['path'] {
  const pageKey = useAppPageKey();
  return useAppLocationParamStore(s => getRouteParamFromKey<Origin>(s, pageKey)?.path);
}

/**
 * @name useAppSearchParams
 * @description Returns the parsed search params for the current route context.
 * @returns Current route search params, or null when unavailable
 */
export function useAppSearchParams<
  const Origin extends AppRoute['path']
>(): InferAppRouteParamFromPath<Origin>['search'] {
  const pageKey = useAppPageKey();
  return useAppLocationParamStore(s => getRouteParamFromKey<Origin>(s, pageKey)?.search);
}

/**
 * @name useAppSearchSnapshot
 * @description Returns a search snapshot resolved from the current route search values.
 * Uses the matched route search engine to reconstruct snapshot values from `param.search`.
 * @returns Current route search snapshot, or undefined when unavailable
 */
export function useAppSearchSnapshot<const Origin extends AppRoute['path']>(): InferSearchParamSnapshotFromEngine<
  InferAppRouteFromPath<Origin>['search']
> {
  const pageKey = useAppPageKey();

  const searchParam = useAppLocationParamStore(s =>
    !pageKey ? null : getRouteParamFromKey<Origin>(s, pageKey)?.search
  );
  const searchEngine = useAppLocationParamStore(s =>
    !pageKey ? null : findAppRouteFromKey<Origin>(s, pageKey)?.search
  );

  return useMemo(() => {
    if (!searchEngine) return null as never;
    else return searchEngine.full(searchParam as never) as never;
  }, [searchEngine, searchParam]);
}

/**
 * @name useAppHashParams
 * @description Returns the parsed hash value for the current route context.
 * @returns Current route hash value, or undefined when unavailable
 */
export function useAppHashParams<const Origin extends AppRoute['path']>():
  | InferAppLocationFromPath<Origin>['hash']
  | undefined {
  const pageKey = useAppPageKey();
  return useAppLocationParamStore(s => getRouteParamFromKey<Origin>(s, pageKey)?.hash);
}

/**
 * @name useAppMediaQuery
 * @description Media query hook scoped to the AppRouteLayoutProvider's width instead of the browser window.
 * Uses theme.breakpoints and ResizeObserver to evaluate queries against the container's width.
 * Optimized with query parsing memoization and debounced resize evaluation using TanStack Pacer.
 * @param query - Media query string (e.g., "(min-width:600px)") or function that receives theme (e.g., theme => theme.breakpoints.up('sm'))
 * @returns Boolean indicating if the media query currently matches the container's width
 */
export function useAppMediaQuery(query: string | ((theme: Theme) => string)): boolean {
  const theme = useTheme();
  const pageKey = useAppPageKey();
  const [matches, setMatches] = useState<boolean>(false);

  const queryStr = typeof query === 'function' ? query(theme) : query;

  const conditions = useMemo(() => parseMediaQuery(queryStr), [queryStr]);

  const debouncedSetMatches = useMemo(
    () => debounce((nextMatches: boolean) => setMatches(nextMatches), { wait: 100 }),
    []
  );

  const evaluateAndUpdate = useCallback(
    (scrollContainer: HTMLElement) => {
      const width = scrollContainer.clientWidth;
      const nextMatches = evaluateMediaQuery(conditions, width);
      debouncedSetMatches(nextMatches);
    },
    [conditions, debouncedSetMatches]
  );

  useEffect(() => {
    if (!pageKey) {
      setMatches(false);
      return;
    }

    const scrollContainer = document.getElementById(`page-layout-${pageKey}`);
    if (!scrollContainer) {
      setMatches(false);
      return;
    }

    evaluateAndUpdate(scrollContainer);

    const resizeObserver = new ResizeObserver(() => {
      evaluateAndUpdate(scrollContainer);
    });
    resizeObserver.observe(scrollContainer);

    return () => {
      resizeObserver.disconnect();
      (debouncedSetMatches as { cancel?: () => void })?.cancel?.();
    };
  }, [queryStr, pageKey, evaluateAndUpdate, debouncedSetMatches]);

  return matches;
}
