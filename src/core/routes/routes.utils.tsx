import type {
  AppRoute,
  AppRouteLocation,
  CreatedAppRoute,
  CreatedAppRouteParamsMap,
  CreatedAppRoutes
} from 'core/routes/routes.models';
import type { Path } from 'react-router';

/**
 * @name findAppRoute
 * @description Finds a route definition from the routes array that matches the path in the given destination.
 * @param routes - Array of created route definitions
 * @param to - Typed destination containing the target path
 * @returns Matching route definition, or undefined when not found
 */
export const findAppRoute = <Route extends AppRoute>(
  routes: CreatedAppRoutes,
  to: CreatedAppRouteParamsMap<Route>
): CreatedAppRoute | undefined => {
  return routes.find(r => r.path === to?.path);
};

/**
 * @name buildRoutePathname
 * @description Resolves the pathname for a destination by stringifying typed path params through the route codec, or falling back to manual encoding when no codec is available.
 * @param route - Matched route definition, if found
 * @param to - Typed destination containing path and optional params
 * @returns Resolved pathname string
 */
export const buildRoutePathname = <Route extends AppRoute>(
  route: CreatedAppRoute | undefined,
  to: CreatedAppRouteParamsMap<Route>
): Path['pathname'] => {
  if (to?.path == null) return '';

  if (route?.params && to?.params) {
    return route.params.stringify(to.params as never);
  }

  if (to?.params) {
    return Object.entries(to.params).reduce(
      (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(String(value))),
      to.path
    );
  }

  return to?.path;
};

/**
 * @name buildRouteSearch
 * @description Serializes provided search params via the route search engine delta method.
 * Produces the query string content without a leading `?`.
 * @param route - Matched route definition, if found
 * @param to - Typed destination containing optional search values
 * @returns Query string content, or empty string when no search delta is available
 */
export const buildRouteSearch = <Route extends AppRoute>(
  route: CreatedAppRoute | undefined,
  to: CreatedAppRouteParamsMap<Route>
): Path['search'] => {
  const delta = !route?.search || to?.search == null ? undefined : route.search.delta(to.search as never);
  if (!delta) return '';
  return delta.toLocationSearch();
};

/**
 * @name buildRouteHash
 * @description Resolves and normalizes hash content for a destination.
 * Ensures the returned value includes a leading `#` when non-empty.
 * @param route - Matched route definition, if found
 * @param to - Typed destination containing optional hash value
 * @returns Normalized hash string, or empty string when hash is absent
 */
export const buildRouteHash = <Route extends AppRoute>(
  route: CreatedAppRoute | undefined,
  to: CreatedAppRouteParamsMap<Route>
): Path['hash'] => {
  if (to?.hash == null) return '';

  if (!route?.hash) return String(to.hash) || '';
  else return String(route.hash(to.hash as never)) || '';
};

/**
 * @name buildRouteState
 * @description Builds route state from the same search delta used to create the query string.
 * This keeps URL search and navigation state in sync.
 * @param route - Matched route definition, if found
 * @param to - Typed destination containing optional search values
 * @returns Route state object, or `undefined` when no state delta is available
 */
export const buildRouteState = <Route extends AppRoute>(
  route: CreatedAppRoute | undefined,
  to: CreatedAppRouteParamsMap<Route>
): AppRouteLocation['state'] => {
  const delta = !route?.search || to?.search == null ? undefined : route.search.delta(to.search as never);
  if (!delta) return undefined;
  return delta.toLocationState();
};

/**
 * @name buildRouteLocation
 * @description Builds the final route location payload for navigation from a typed destination.
 * Composes pathname, query, hash, and optional state in one pass.
 * @param to - Typed destination containing path, optional params, search, and hash
 * @param routes - Array of created route definitions
 * @returns Route location with `href` and `state`
 */
export const buildRouteLocation = <Route extends AppRoute>(
  routes: CreatedAppRoutes,
  to: CreatedAppRouteParamsMap<Route>
): AppRouteLocation => {
  if (!to?.path) return { href: '', state: undefined };

  const route = findAppRoute(routes, to);
  const pathname = buildRoutePathname(route, to);
  const search = buildRouteSearch(route, to);
  const hash = buildRouteHash(route, to);
  const state = buildRouteState(route, to);

  const searchSegment = search ? `?${search}` : '';
  const hashSegment = hash ? `#${hash}` : '';

  return {
    href: `${pathname}${searchSegment}${hashSegment}`,
    state
  };
};
