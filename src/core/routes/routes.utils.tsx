import type { AppRouterState, AppRouterStore } from 'core/router';
import { addNode, addRoute, insertRightPanel, sanitizeAppRouterStore, setPanel, setRoute } from 'core/router';
import { ROUTER_STORE_EXAMPLE } from 'core/router/router.models';
import type { AppRouteLocation, InferAppRouteValuesFromRoute } from 'core/routes/routes.models';
import type { Location, NavigateOptions, To as NavigateTo } from 'react-router';
import { matchPath } from 'react-router';
import { generateRandomUUID } from 'shared/utils/app.utils';

//*****************************************************************************************
// Find Routes
//*****************************************************************************************

/**
 * @name findAppRouteFromValues
 * @description Finds a route definition from the routes array that matches the path in the given destination.
 * @param routes - Array of created route definitions
 * @param to - Typed destination containing the target path
 * @returns Matching route definition, or null when not found
 */
export const findAppRouteFromValues = function <const Route extends AppRoute>(
  routes: AppRoutes,
  to: InferAppRouteValuesFromRoute<Route>
): Route | null {
  return (routes.find(r => r.path === to?.path) ?? null) as Route | null;
};

/**
 * @name findRouteFromLocation
 * @description Finds a route definition from the routes array that matches the pathname extracted from the given href.
 * @param routes - Array of created route definitions
 * @param href - The href string to match against (pathname + optional search + hash)
 * @returns Matching route definition, or null when not found
 */
export const findAppRouteFromLocation = function <const Route extends AppRoute>(
  routes: AppRoutes,
  { href }: AppRouteLocation
): Route | null {
  if (!href) return null;
  const { pathname } = new URL(href, 'http://localhost');
  return (routes.find(r => matchPath({ path: r.path, end: true }, pathname)) ?? null) as Route | null;
};

//*****************************************************************************************
// Locations
//*****************************************************************************************

/**
 * @name buildRoutePathname
 * @description Resolves the pathname for a destination by stringifying typed path params through the route codec, or falling back to manual encoding when no codec is available.
 * @param route - Matched route definition, if found
 * @param to - Typed destination containing path and optional params
 * @returns Resolved pathname string
 */
export const getLocationPathFromAppRouteValues = function <const Route extends AppRoute>(
  route: Route,
  values: InferAppRouteValuesFromRoute<Route>
): Location['pathname'] {
  if (values?.path == null) return '';

  if (route?.params && values?.params) {
    return route.params.stringify(values.params as never);
  }

  if (values?.params) {
    return Object.entries(values.params).reduce(
      (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(String(value))),
      values.path
    );
  }

  return values?.path;
};

/**
 * @name buildRouteSearch
 * @description Serializes provided search params via the route search engine delta method.
 * Produces the query string content without a leading `?`.
 * @param route - Matched route definition, if found
 * @param to - Typed destination containing optional search values
 * @returns Query string content, or empty string when no search delta is available
 */
export const getLocationSearchFromAppRouteValues = function <const Route extends AppRoute>(
  route: Route,
  values: InferAppRouteValuesFromRoute<Route>
): Location['search'] {
  const delta = !route?.search || values?.search == null ? undefined : route.search.delta(values.search as never);
  if (!delta) return '';
  return delta.toLocationSearch();
};

/**
 * @name buildRouteHash
 * @description Resolves and normalizes hash content for a destination.
 * Ensures the returned value excludes a leading `#` when non-empty.
 * @param route - Matched route definition, if found
 * @param to - Typed destination containing optional hash value
 * @returns Normalized hash string without `#`, or empty string when hash is absent
 */
export const getLocationHashFromAppRouteValues = function <const Route extends AppRoute>(
  route: Route,
  values: InferAppRouteValuesFromRoute<Route>
): Location['hash'] {
  if (values?.hash == null) return '';

  const resolvedHash = !route?.hash ? String(values.hash) || '' : String(route.hash(values.hash as never)) || '';
  return resolvedHash.startsWith('#') ? resolvedHash.slice(1) : resolvedHash;
};

/**
 * @name buildRouteState
 * @description Builds route state from the same search delta used to create the query string.
 * This keeps URL search and navigation state in sync.
 * @param route - Matched route definition, if found
 * @param to - Typed destination containing optional search values
 * @returns Route state object, or undefined when no state delta is available
 */
export const getLocationStateFromAppRouteValues = function <const Route extends AppRoute>(
  route: Route,
  values: InferAppRouteValuesFromRoute<Route>
): AppRouteLocation['state'] {
  const delta = !route?.search || values?.search == null ? undefined : route.search.delta(values.search as never);
  if (!delta) return undefined;
  return delta.toLocationState();
};

/**
 * @name buildRouteLocation
 * @description Builds the final route location payload for navigation from a typed destination.
 * Computes pathname, search, hash, and state in a single pass — the search delta is resolved once.
 * @param routes - Array of created route definitions
 * @param to - Typed destination containing path, optional params, search, and hash
 * @returns Route location with `href` and `state`
 */
export const getLocationFromAppRouteValues = function <const Route extends AppRoute>(
  route: Route,
  values: InferAppRouteValuesFromRoute<Route>
): AppRouteLocation {
  if (!values?.path) return { href: null, state: null };

  const pathname = getLocationPathFromAppRouteValues(route, values);
  const search = getLocationSearchFromAppRouteValues(route, values);
  const hash = getLocationHashFromAppRouteValues(route, values);
  const state = getLocationStateFromAppRouteValues(route, values);

  return { href: `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`, state };
};

//*****************************************************************************************
// App Route Values
//*****************************************************************************************

/**
 * @name parseRouteParams
 * @description Parses typed path params from an href using the matched route's param codec.
 * @param route - Matched route definition containing the param codec
 * @param href - The href string to extract params from
 * @returns Parsed params object, or null when route has no param codec
 */
export const getPathParamsFromLocation = function <const Route extends AppRoute>(
  route: Route,
  { href }: AppRouteLocation
) {
  if (!route?.params || !href) return null;

  const { pathname } = new URL(href, 'http://localhost');
  const location: Location = { pathname, search: '', hash: '', state: null, key: 'default' };
  return route.params.parse(location);
};

/**
 * @name parseRouteSearch
 * @description Parses typed search params from an href using the matched route's search engine.
 * @param route - Matched route definition containing the search engine
 * @param href - The href string to extract search params from
 * @param state - Optional location state (used for state-sourced search params)
 * @returns SearchParamSnapshot, or null when route has no search engine
 */
export const getSearchParamsFromLocation = function <const Route extends AppRoute>(
  route: Route,
  { href, state }: AppRouteLocation
) {
  if (!route?.search || !href) return null;

  const url = new URL(href, 'http://localhost');
  const location: Location = { pathname: url.pathname, search: url.search, hash: url.hash, state, key: 'default' };
  return route.search.fromLocation(location);
};

/**
 * @name parseRouteHash
 * @description Extracts the hash value from an href string, stripping the leading `#`.
 * @param href - The href string to extract hash from
 * @returns Hash string without leading `#`, or null when no hash is present
 */
export const getHashFromLocation = function <const Route extends AppRoute>(route: Route, { href }: AppRouteLocation) {
  void route;
  if (!href) return null;
  const { hash } = new URL(href, 'http://localhost');
  return hash ? hash.slice(1) : null;
};

/**
 * @name getAppRouteValuesFromLocation
 * @description Parses an AppRouteLocation into typed route values by extracting path params, search params, and hash.
 * @param route - The matched route definition
 * @param location - The route location containing href and optional state
 * @returns Typed route values with path, params, search, and hash
 */
export const getAppRouteValuesFromLocation = function <const Route extends AppRoute>(
  route: Route,
  { href, state }: AppRouteLocation
): InferAppRouteValuesFromRoute<Route> {
  if (!route || !href) return null;

  const params = getPathParamsFromLocation(route, { href, state });
  const search = getSearchParamsFromLocation(route, { href, state });
  const hash = getHashFromLocation(route, { href, state });

  return {
    path: route.path,
    params,
    search: search?.toObject?.() ?? null,
    hash
  } as InferAppRouteValuesFromRoute<Route>;
};

//*****************************************************************************************
// Location
//*****************************************************************************************

/**
 * @name getAppLinkFromLocation
 * @description Wraps a route location into the panel URL format `/?p=<href>`.
 * @param location - Route location with href and state
 * @returns Panel-wrapped location, or null when href is empty
 */
export const getAppLinkFromLocation = (location: AppRouteLocation): AppRouteLocation | null => {
  if (!location.href) return null;
  const sp = new URLSearchParams();
  sp.append('p', location.href);
  return { href: `/?${sp.toString()}`, state: location.state };
};

/**
 * @name parseLocationSearch
 * @description Builds routes/panels/nodes from `p` query params in location.search.
 * @param store - Current router store
 * @param location - React Router location
 * @returns Updated router store
 */
export const parseLocationSearch = (store: AppRouterStore, location: Location<AppRouterState>): AppRouterStore => {
  const searchParams = new URLSearchParams(location.search ?? '');
  const hrefValues = searchParams.getAll('p');

  for (const value of hrefValues) {
    if (!value) continue;

    try {
      const decoded = decodeURIComponent(value);
      const url = new URL(decoded, window.location.origin);
      const href = `${url.pathname}${url.search}${url.hash}`;
      let newRouteKey: string | null = null;

      [store, newRouteKey] = addRoute(store, { href });
      [store] = addNode(store, { routeKey: newRouteKey });
      [store] = insertRightPanel(store, null, { routeKey: newRouteKey, tabbedRouteKeys: [newRouteKey] });
    } catch {
      /* intentionally ignored — invalid href values are skipped */
    }
  }

  store = sanitizeAppRouterStore(store);
  store.id = generateRandomUUID();
  return store;
};

/**
 * @name parseLocationState
 * @description Merges location.state routes and panels into the store using upsert helpers.
 * @param store - Current router store
 * @param location - React Router location
 * @returns Updated router store
 */
export const parseLocationState = (store: AppRouterStore, location: Location<AppRouterState>): AppRouterStore => {
  for (const [rawRouteKey, route] of Object.entries(location?.state?.routes || {})) {
    const routeKey = rawRouteKey;
    store = setRoute(store, routeKey, route);
  }

  const panels = location?.state?.panels || [];
  for (let panelKey = 0; panelKey < panels.length; panelKey++) {
    store = setPanel(store, panelKey, panels[panelKey]);
  }
  if (store.panels.length > panels.length) {
    store.panels.splice(panels.length);
  }

  store = sanitizeAppRouterStore(store);
  store.id = location.state?.id ?? generateRandomUUID();
  return store;
};

/**
 * @name syncLocationToStore
 * @description Computes the next router store from the current location. Returns null when the store already matches.
 * @param store - Current router store state
 * @param location - Current React Router location
 * @returns The next store state, or null if no update is needed
 */
export const syncLocationToStore = (store: AppRouterStore, location: Location<AppRouterState>): AppRouterStore => {
  if (location.state?.id && location.state.id === store.id) return store;

  try {
    if (!!location.state) return parseLocationState(store, location);
    else if (!!location.search) return parseLocationSearch(store, location);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('error parsing the location', e);
  }

  return { ...ROUTER_STORE_EXAMPLE, maxPanels: store.maxPanels, maxNodes: store.maxNodes };
};

/**
 * @name syncStoreToLocation
 * @description Computes the navigation target from the store and compares it against the current location. Returns null when no navigation is needed.
 * @param store - Current router store state
 * @param location - Current React Router location
 * @returns Navigation payload ({ to, options }), or null if the location already matches
 */
export const syncStoreToLocation = (
  store: AppRouterStore,
  location: Location<AppRouterState>
): { to: NavigateTo; options: NavigateOptions } => {
  if (location.state?.id && location.state.id === store.id) return null;

  const searchParams = new URLSearchParams();

  store.panels.forEach(panel => {
    searchParams.append('p', store.routes[panel.routeKey].href);
  });

  return {
    // to: { search: `/?${searchParams.toString()}` },
    to: `/?${searchParams.toString()}`,
    options: { state: { id: store.id, panels: store.panels, routes: store.routes } }
  };
};
