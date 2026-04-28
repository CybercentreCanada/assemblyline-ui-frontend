import type { LinkProps, Path } from 'react-router';
import { CreatedAppRoute, CreatedAppRouteParamsMap, CreatedAppRoutes } from './routes.models';

/**
 * @name findAppRoute
 * @description Finds a route definition from the routes array that matches the path in the given destination.
 * @param routes - Array of created route definitions
 * @param to - Typed destination containing the target path
 * @returns Matching route definition, or undefined when not found
 */
export const findAppRoute = (routes: CreatedAppRoutes, to: CreatedAppRouteParamsMap): CreatedAppRoute | undefined => {
  return routes.find(r => r.path === to?.path);
};

/**
 * @name buildRoutePathname
 * @description Resolves the pathname for a destination by stringifying typed path params through the route codec, or falling back to manual encoding when no codec is available.
 * @param routes - Array of created route definitions
 * @param to - Typed destination containing path and optional params
 * @returns Resolved pathname string
 */
export const buildRoutePathname = (routes: CreatedAppRoutes, to: CreatedAppRouteParamsMap): Path['pathname'] => {
  const route = findAppRoute(routes, to);

  if (route?.params && to?.params) {
    return route.params.stringify(to.params as never) as string;
  }

  if (to?.params) {
    return Object.entries(to.params).reduce(
      (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(String(value))),
      to.path
    );
  }

  return to.path;
};

/**
 * @name buildRouteSearch
 * @description Serializes only the provided search params into a URL search string using the route's search engine delta method, omitting params that were not supplied. Returns an empty string when search is absent or the route has no search engine.
 * @param routes - Array of created route definitions
 * @param to - Typed destination containing optional search values
 * @returns URL search string including leading `?`, or empty string
 */
export const buildRouteSearch = (routes: CreatedAppRoutes, to: CreatedAppRouteParamsMap): Path['search'] => {
  const route = findAppRoute(routes, to);
  if (to?.search == null || !route?.search) return '';
  return `?${route.search.delta(to.search as never).toString()}`;
};

/**
 * @name buildRouteHash
 * @description Normalizes the hash from a typed destination by ensuring it starts with `#`. Returns an empty string when hash is absent.
 * @param routes - Array of created route definitions
 * @param to - Typed destination containing optional hash value
 * @returns Normalized hash string including leading `#`, or empty string
 */
export const buildRouteHash = (routes: CreatedAppRoutes, to: CreatedAppRouteParamsMap): Path['hash'] => {
  if (!to?.hash) return '';
  return to.hash.startsWith('#') ? to.hash : `#${to.hash}`;
};

/**
 * @name buildRouteHref
 * @description Builds a complete href string for a typed route destination by composing the resolved pathname, search, and hash.
 * @param to - Typed destination containing path, optional params, search, and hash
 * @param routes - Array of created route definitions
 * @returns Full href string suitable for use as a `LinkProps['to']` value
 */
export const buildRouteHref = (
  routes: CreatedAppRoutes,
  to: CreatedAppRouteParamsMap
): Extract<LinkProps['to'], string> => {
  const pathname = buildRoutePathname(routes, to);
  const search = buildRouteSearch(routes, to);
  const hash = buildRouteHash(routes, to);
  return `${pathname}${search}${hash}`;
};
