import type { InferAppRouteParamFromPath } from 'core/router';
import { getRouteParamFromKey, useAppLocationParamStore, useAppPageKey } from 'core/router';

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
