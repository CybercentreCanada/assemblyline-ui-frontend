import { useAppPreferenceStore } from 'core/preference';
import type { InferAppRouteFromPath } from 'core/router';
import {
  findAppRouteFromKey,
  findNextPanelKeyFromPageKey,
  findPanelKeyFromPageKey,
  findPrevPanelKeyFromPageKey,
  getDefaultAppRoute,
  getPanel,
  useAppLocationParamStore,
  useAppPageKey,
  useAppRouterStore
} from 'core/router';

/**
 * @name useAppRoute
 * @description Returns a typed AppRoute definition for the selected panel target, or a selected value from it.
 * Supports cross-panel lookup targets (`from`, `here`, `to`, `at`) similar to navigation targets.
 * @param target - Which panel context to read the route from
 * @param panelKey - Required for `at` target; ignored for other targets
 * @returns Selector function that resolves the current AppRoute, or a selected value from it
 */
export const useAppRoute = function <const Origin extends AppRoute['path']>(
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

  const route = useAppLocationParamStore(s =>
    !targetRouteKey ? getDefaultAppRoute<Origin>() : findAppRouteFromKey<Origin>(s, targetRouteKey)
  );

  return function <Selected = InferAppRouteFromPath<Origin>>(
    selector: (route: InferAppRouteFromPath<Origin>) => Selected = route => route as Selected
  ): Selected {
    return selector(route);
  };
};
