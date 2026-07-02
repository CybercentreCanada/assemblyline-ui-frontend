import type {
  InferHashParamValueFromPath,
  InferPathParamValueFromPath,
  InferSearchParamValueFromPath
} from 'core/routes/routes.models';
import type { AppRouteKeyStore } from 'core/routes/routes.providers';
import { useAppLocationStore, useAppRouteKeyStore } from 'core/routes/routes.providers';

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
 * @name useAppPathParams
 * @description Returns the parsed path params for the current route context.
 * @returns Current route path params, or null when unavailable
 */
export function useAppPathParams<
  const Path extends AppRoute['path'] = AppRoute['path']
>(): InferPathParamValueFromPath<Path> {
  const routeKey = useAppRouteKey();
  const context = useAppLocationStore(s =>
    routeKey ? (s?.[routeKey]?.params as InferPathParamValueFromPath<Path> | null) : null
  );
  if (context == null) return null;
  return context;
}

/**
 * @name useAppSearchParams
 * @description Returns the parsed search params snapshot for the current route context.
 * @returns Current route search params, or null when unavailable
 */
export function useAppSearchParams<
  const Path extends AppRoute['path'] = AppRoute['path']
>(): InferSearchParamValueFromPath<Path> {
  const routeKey = useAppRouteKey();
  const context = useAppLocationStore(s =>
    routeKey ? (s?.[routeKey]?.search as InferSearchParamValueFromPath<Path>) : null
  );
  if (context == null) return null;
  return context;
}

/**
 * @name useAppHashParams
 * @description Returns the parsed hash value for the current route context.
 * @returns Current route hash value, or null when unavailable
 */
export function useAppHashParams<
  const Path extends AppRoute['path'] = AppRoute['path']
>(): InferHashParamValueFromPath<Path> {
  const routeKey = useAppRouteKey();
  const context = useAppLocationStore(s =>
    routeKey ? (s?.[routeKey]?.hash as InferHashParamValueFromPath<Path>) : null
  );
  if (context == null) return null;
  return context;
}
