import { useAppPreferenceStore } from 'core/preference';
import type { InferAppLocationFromPath } from 'core/router';
import {
  findNextPanelKeyFromPageKey,
  findPanelKeyFromPageKey,
  findPrevPanelKeyFromPageKey,
  getDefaultRouteParam,
  getPanel,
  getRouteParamFromKey,
  useAppLocationParamStore,
  useAppPageKey,
  useAppRouterStore
} from 'core/router';

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
    if (!pageKey && target !== 'at') return null;

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
