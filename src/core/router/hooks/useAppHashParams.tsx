import type { InferAppLocationFromPath } from 'core/router';
import { getRouteParamFromKey, useAppLocationParamStore, useAppPageKey } from 'core/router';

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
