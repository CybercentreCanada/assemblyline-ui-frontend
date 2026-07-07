import type { AppRouteKeyStore, InferAppRouteSnapshotFromPath } from 'core/routes';
import { findRouteSnapshotFromKey, useAppLocationStore, useAppRouteKeyStore } from 'core/routes';

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
 * @description Returns the current typed route location snapshot, or a selected value from it.
 * @param selector - Optional selector applied to the current route snapshot
 * @returns Current location snapshot or selected snapshot value
 */
export const useAppLocation = function <const Path extends AppRoute['path']>() {
  const routeKey = useAppRouteKey();
  const snapshot = useAppLocationStore(s => findRouteSnapshotFromKey<Path>(s, routeKey));

  return function <Selected = InferAppRouteSnapshotFromPath<Path>>(
    selector?: (location: InferAppRouteSnapshotFromPath<Path>) => Selected
  ): Selected | InferAppRouteSnapshotFromPath<Path> | null {
    if (snapshot == null) return null;
    return selector ? selector(snapshot) : snapshot;
  };
};

/**
 * @name useAppPathParams
 * @description Returns the parsed path params for the current route context.
 * @returns Current route path params, or null when unavailable
 */
export function useAppPathParams<const Path extends AppRoute['path']>() {
  const routeKey = useAppRouteKey();
  return useAppLocationStore(s => findRouteSnapshotFromKey<Path>(s, routeKey)?.params);
}

/**
 * @name useAppSearchParams
 * @description Returns the parsed search params snapshot for the current route context.
 * @returns Current route search params, or null when unavailable
 */
export function useAppSearchParams<const Path extends AppRoute['path']>() {
  const routeKey = useAppRouteKey();
  return useAppLocationStore(s => findRouteSnapshotFromKey<Path>(s, routeKey)?.search);
}

/**
 * @name useAppHashParams
 * @description Returns the parsed hash value for the current route context.
 * @returns Current route hash value, or null when unavailable
 */
export function useAppHashParams<const Path extends AppRoute['path']>() {
  const routeKey = useAppRouteKey();
  return useAppLocationStore(s => findRouteSnapshotFromKey<Path>(s, routeKey)?.hash);
}
