import type { AppRouteKeyStore, InferAppRouteParamFromPath, InferAppRouteValuesFromPath } from 'core/routes';
import { findRouteParamFromKey, useAppLocationParamStore, useAppRouteKeyStore } from 'core/routes';

/**
 * @name useAppRouteKey
 * @description Returns the current route key from the route-key store.
 * @returns Current route key, or null when no route context is available
 */
export function useAppRouteKey(): AppRouteKeyStore['routeKey'] {
  const context = useAppRouteKeyStore(s => s.routeKey, true);
  if (context == null) return null;
  return context;
}

/**
 * @name useAppLocation
 * @description Returns the current typed route location param, or a selected value from it.
 * @param selector - Optional selector applied to the current route param
 * @returns Current location param or selected param value
 */
export const useAppLocation = function <const Origin extends AppRoute['route']>() {
  const routeKey = useAppRouteKey();
  const param = useAppLocationParamStore(s => findRouteParamFromKey<Origin>(s, routeKey));

  return function <Selected = InferAppRouteParamFromPath<Origin>>(
    selector?: (location: InferAppRouteParamFromPath<Origin>) => Selected
  ): Selected | InferAppRouteParamFromPath<Origin> | null {
    if (param == null) return null;
    return selector ? selector(param) : param;
  };
};

/**
 * @name useAppPathParams
 * @description Returns the parsed path params for the current route context.
 * @returns Current route path params, or null when unavailable
 */
export function useAppPathParams<
  const Origin extends AppRoute['route']
>(): InferAppRouteValuesFromPath<Origin>['path'] {
  const routeKey = useAppRouteKey();
  return useAppLocationParamStore(s => findRouteParamFromKey<Origin>(s, routeKey)?.path);
}

/**
 * @name useAppSearchParams
 * @description Returns the parsed search params for the current route context.
 * @returns Current route search params, or null when unavailable
 */
export function useAppSearchParams<
  const Origin extends AppRoute['route']
>(): InferAppRouteValuesFromPath<Origin>['search'] {
  const routeKey = useAppRouteKey();
  return useAppLocationParamStore(s => findRouteParamFromKey<Origin>(s, routeKey)?.search);
}

/**
 * @name useAppHashParams
 * @description Returns the parsed hash value for the current route context.
 * @returns Current route hash value, or null when unavailable
 */
export function useAppHashParams<
  const Origin extends AppRoute['route']
>(): InferAppRouteValuesFromPath<Origin>['hash'] {
  const routeKey = useAppRouteKey();
  return useAppLocationParamStore(s => findRouteParamFromKey<Origin>(s, routeKey)?.hash);
}
