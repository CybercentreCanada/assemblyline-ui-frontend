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
export const useAppLocation = function <const Path extends AppRoute['route']>() {
  const routeKey = useAppRouteKey();
  const param = useAppLocationParamStore(s => findRouteParamFromKey<Path>(s, routeKey));

  return function <Selected = InferAppRouteParamFromPath<Path>>(
    selector?: (location: InferAppRouteParamFromPath<Path>) => Selected
  ): Selected | InferAppRouteParamFromPath<Path> | null {
    if (param == null) return null;
    return selector ? selector(param) : param;
  };
};

/**
 * @name useAppPathParams
 * @description Returns the parsed path params for the current route context.
 * @returns Current route path params, or null when unavailable
 */
export function useAppPathParams<const Path extends AppRoute['route']>(): InferAppRouteValuesFromPath<Path>['path'] {
  const routeKey = useAppRouteKey();
  return useAppLocationParamStore(s => findRouteParamFromKey<Path>(s, routeKey)?.path);
}

/**
 * @name useAppSearchParams
 * @description Returns the parsed search params for the current route context.
 * @returns Current route search params, or null when unavailable
 */
export function useAppSearchParams<
  const Path extends AppRoute['route']
>(): InferAppRouteValuesFromPath<Path>['search'] {
  const routeKey = useAppRouteKey();
  return useAppLocationParamStore(s => findRouteParamFromKey<Path>(s, routeKey)?.search);
}

/**
 * @name useAppHashParams
 * @description Returns the parsed hash value for the current route context.
 * @returns Current route hash value, or null when unavailable
 */
export function useAppHashParams<const Path extends AppRoute['route']>(): InferAppRouteValuesFromPath<Path>['hash'] {
  const routeKey = useAppRouteKey();
  return useAppLocationParamStore(s => findRouteParamFromKey<Path>(s, routeKey)?.hash);
}
