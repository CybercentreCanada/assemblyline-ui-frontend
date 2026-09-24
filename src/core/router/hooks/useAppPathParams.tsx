import type { InferAppRouteParamFromPath } from 'core/router';
import { getRouteParamFromKey, useAppLocationParamStore, useAppPageKey } from 'core/router';

/**
 * @name useAppPathParams
 * @description Returns the parsed path params for the current route context.
 * @returns Current route path params, or null when unavailable
 */
export function useAppPathParams<const Origin extends AppRoute['path']>(): InferAppRouteParamFromPath<Origin>['path'] {
  const pageKey = useAppPageKey();
  return useAppLocationParamStore(s => getRouteParamFromKey<Origin>(s, pageKey)?.path);
}
