import { APP_ROUTES } from 'app/core.routes';
import type { AppLinkTo, AppLinkToOptions, AppLinkToTuple, AppRouterNavigation, AppRouterStore } from 'core/router';
import {
  addRoute,
  clearNavigation,
  DEFAULT_APP_ROUTER_ROUTE,
  DEFAULT_NAVIGATE_OPTIONS,
  getNextRouteFromKey,
  getRouteFromKey,
  getRouteFromPanelKey,
  insertRightPanel,
  removePanel,
  removeRoute,
  ROUTER_STORE_EXAMPLE,
  sanitizeAppRouterStore,
  setNavigation,
  setPanel,
  setRoute,
  updatePanel,
  updateRoute
} from 'core/router';
import type { AppRouteLocation, InferAppRouteSearchValuesFromPath, InferAppRouteValuesFromRoute } from 'core/routes';
import type { Location, NavigateFunction, NavigateOptions } from 'react-router';
import { matchPath } from 'react-router';
import { deepCompare, generateRandomUUID } from 'shared/utils/app.utils';

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
 * @param values - Typed destination containing path and optional params
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
 * @param values - Typed destination containing optional search values
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
 * @param values - Typed destination containing optional hash value
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
 * @param values - Typed destination containing optional search values
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
 * @param route - Matched route definition, if found
 * @param values - Typed destination containing path, optional params, search, and hash
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

export const deepLocationCompare = function (
  routes: AppRoutes,
  locationA: AppRouteLocation,
  locationB: AppRouteLocation
): 'same-path' | true | false {
  if (!locationA.href || !locationB.href) return locationA.href === locationB.href;

  const routeA = findAppRouteFromLocation(routes, locationA);
  const routeB = findAppRouteFromLocation(routes, locationB);

  if (routeA?.path === routeB?.path) {
    const appValuesA = getAppRouteValuesFromLocation(routeA, locationA);
    const appValuesB = getAppRouteValuesFromLocation(routeA, locationB);

    if (deepCompare(appValuesA, appValuesB)) return true;

    return 'same-path';
  }

  return false;
};

//*****************************************************************************************
// Parser
//*****************************************************************************************

export const getLocationHrefFromStore = (store: AppRouterStore): string => {
  void store;
  return null;
};

export const getLocationStateFromStore = (store: AppRouterStore): AppRouterState => {
  // Strip transient runtime state before serializing into location history.
  // isBlocked/blockerMessage are set by mounted components and reset when they re-mount.
  // navigation/pendingNavigation are resolved before this snapshot is written.
  const routes: AppRouterStore['routes'] = Object.fromEntries(
    Object.entries(store.routes).map(([key, { isBlocked, blockerMessage, ...route }]) => {
      void isBlocked;
      void blockerMessage;
      return [key, route];
    })
  );
  const panels: AppRouterStore['panels'] = store.panels.map(({ navigation, pendingNavigation, ...panel }) => {
    void navigation;
    void pendingNavigation;
    return { ...panel, navigation: null, pendingNavigation: null };
  });
  return { id: store.id, panels, routes };
};

export const getStoreFromLocationHref = (store: AppRouterStore, location: AppRouteLocation): AppRouterStore => {
  void store;
  void location;
  return null;
};

export const getStoreFromLocationState = (store: AppRouterStore, location: AppRouteLocation): AppRouterStore => {
  void store;
  void location;
  return null;
};

//*****************************************************************************************
// Location Encoding
//*****************************************************************************************

/**
 * @name getHashFragmentFromLocation
 * @description Encodes a single route href into the hash-parameter grammar.
 * Format: `${pathname}${search}${#encoded-hash}`.
 * Internal hash values are URI-encoded to distinguish them from panel-splitting `#` separators.
 * @param location - Route location containing href and optional state
 * @returns Encoded panel fragment, or null when href is empty
 */
export const getHashFragmentFromLocation = ({ href }: AppRouteLocation): string | null => {
  if (!href) return null;

  try {
    const url = new URL(href, 'http://localhost');
    const pathname = url.pathname;
    const hash = url.hash ? url.hash.slice(1) : '';
    const search = url.search;

    return `${pathname}${search}${hash ? `#${encodeURIComponent(hash)}` : ''}`;
  } catch {
    return null;
  }
};

/**
 * @name getAppLinkFromLocation
 * @description Wraps a route location into the multi-panel hash URL format `/v1#<encoded-panel>`.
 * Preserves the incoming location state as-is.
 * @param location - Route location with href and state
 * @returns Panel-wrapped location with v1 pathname and hash encoding, or null when href is empty
 */
export const getAppLinkFromLocation = ({ href, state }: AppRouteLocation): AppRouteLocation | null => {
  if (!href) return null;
  const fragment = getHashFragmentFromLocation({ href, state });
  if (!fragment) return null;
  return { href: `/v1#${fragment}`, state };
};

/**
 * @name syncStoreToLocation
 * @description Applies staged panel navigations to the store.
 * For each panel with a pending navigation:
 * - If the active route has `isBlocked: true`, the navigation is held in `pendingNavigation`
 *   instead of being applied. The `AppRouterPanel` component reads this to render its own
 *   inline confirmation dialog — scoped to the panel's visual bounds, not full-screen.
 * - Otherwise, the navigation is applied immediately and `navigate()` is called once with
 *   the updated `/v1#...` hash and the full store snapshot as location state.
 * @param store - Current router store state
 * @param navigate - React Router navigate function used to push/replace URL updates
 * @returns Updated store after applying one or more navigations, or null when no change occurred
 */
export const syncStoreToLocation = (store: AppRouterStore, navigate: NavigateFunction = () => null): AppRouterStore => {
  let changes: boolean = false;

  for (let panelKey = store.panels.length - 1; panelKey >= 0; panelKey--) {
    const navigation = store.panels[panelKey].navigation;
    if (!navigation) continue;

    const activeRouteKey = store.panels[panelKey].routeKey;
    const isBlocked = activeRouteKey ? (store.routes[activeRouteKey]?.isBlocked ?? false) : false;

    if (isBlocked) {
      // Hold navigation — the panel renders its own inline dialog from pendingNavigation.
      store.panels[panelKey].pendingNavigation = navigation;
      store.panels[panelKey].navigation = null;
      changes = true;
      continue;
    }

    changes = true;
    const replace = navigation.replace;

    if (!navigation.href) {
      store = removePanel(store, panelKey);
    } else if (navigation.routeKey && navigation.routeKey in store.routes) {
      store = updateRoute(store, navigation.routeKey, { href: navigation.href, state: navigation.state });
      store = updatePanel(store, panelKey, { routeKey: navigation.routeKey });
      store = clearNavigation(store, panelKey);
    } else {
      const [nextStore, routeKey] = addRoute(store, { href: navigation.href, state: navigation.state });
      store = updatePanel(nextStore, panelKey, { routeKey });
      store = clearNavigation(store, panelKey);
    }

    const hashFragment = store.panels
      .map(panel => {
        const route = store.routes[panel.routeKey];
        return route?.href ? getHashFragmentFromLocation(route) : null;
      })
      .filter((f): f is string => f !== null)
      .join('#');

    store = sanitizeAppRouterStore(store);
    store.id = generateRandomUUID();

    void navigate(hashFragment ? `/v1#${hashFragment}` : '/v1', {
      state: getLocationStateFromStore(store),
      replace
    });
  }

  return changes ? store : null;
};

//*****************************************************************************************
// Location Decoding
//*****************************************************************************************

/**
 * @name getLocationFromHashFragment
 * @description Decodes one panel fragment from the hash grammar back into an href.
 * Splits the fragment into pathname, optional encoded hash, and optional search string.
 * Returns a null href when encoded hash decoding throws.
 * @param fragment - Encoded panel fragment
 * @returns Reconstructed AppRouteLocation
 */
export const getLocationFromHashFragment = (fragment: string): AppRouteLocation | null => {
  if (!fragment) return { href: null, state: null };

  const hashIndex = fragment.indexOf('#');
  if (hashIndex === -1) return { href: fragment, state: null };

  const pathname = fragment.slice(0, hashIndex);
  const hashAndSearch = fragment.slice(hashIndex + 1);
  const searchIndex = hashAndSearch.indexOf('?');

  const hash = searchIndex === -1 ? hashAndSearch : hashAndSearch.slice(0, searchIndex);
  const search = searchIndex === -1 ? '' : hashAndSearch.slice(searchIndex);

  try {
    return {
      href: `${pathname}${search}${hash ? `#${decodeURIComponent(hash)}` : ''}`,
      state: null
    };
  } catch {
    return { href: null, state: null };
  }
};

/**
 * @name parseLocationState
 * @description Reconciles `location.state` into store routes and panels directly.
 * Removes routes missing from state, upserts provided routes/panels, trims extra panels,
 * and updates the store id from `location.state.id` (or generates one if missing).
 * Returns the original store reference when there is no effective diff.
 * @param store - Current router store
 * @param location - React Router location
 * @returns Updated router store
 */
export const parseLocationState = (store: AppRouterStore, location: Location<AppRouterState>): AppRouterStore => {
  return store;

  const nextState = location?.state;
  const nextRoutes = nextState?.routes || {};
  const nextPanels = nextState?.panels || [];
  const nextId = nextState?.id ?? null;

  if (store.id === nextId && deepCompare(store.routes, nextRoutes) && deepCompare(store.panels, nextPanels)) {
    return store;
  }

  let didChange = false;

  for (const routeKey of Object.keys(store.routes)) {
    if (routeKey in nextRoutes) continue;
    store = removeRoute(store, routeKey);
    didChange = true;
  }

  for (const [routeKey, route] of Object.entries(nextRoutes)) {
    if (deepCompare(store.routes[routeKey], route)) continue;
    store = setRoute(store, routeKey, route);
    didChange = true;
  }

  for (let panelKey = 0; panelKey < nextPanels.length; panelKey++) {
    if (panelKey >= store.panels.length) {
      store = setPanel(store, panelKey, nextPanels[panelKey]);
      didChange = true;
      continue;
    }

    if (deepCompare(store.panels[panelKey], nextPanels[panelKey])) continue;
    store = setPanel(store, panelKey, nextPanels[panelKey]);
    didChange = true;
  }

  if (store.panels.length > nextPanels.length) {
    store.panels.splice(nextPanels.length);
    didChange = true;
  }

  if (!didChange) return store;

  store = sanitizeAppRouterStore(store);
  store.id = nextId ?? generateRandomUUID();
  return store;
};

/**
 * @name parseLocationHash
 * @description Reconciles the router store against the multi-panel hash grammar by decoding
 * each fragment into an AppRouteLocation and staging panel navigation requests.
 * Requests are staged as create/update for parsed panels and delete for trailing panels.
 * @param store - Current router store
 * @param location - React Router location
 * @returns Updated router store
 */
export const parseLocationHash = (store: AppRouterStore, location: Location<AppRouterState>): AppRouterStore => {
  const hashFragment = location.hash ? location.hash.slice(1) : '';

  if (!hashFragment) return store;

  const panelFragments = hashFragment
    .split('#/')
    .filter(Boolean)
    .map((fragment, i) => (i === 0 ? fragment : `/${fragment}`));

  const locations = panelFragments
    .map(fragment => {
      const location = getLocationFromHashFragment(fragment);
      if (!location?.href) return null;
      const appRoute = findAppRouteFromLocation(APP_ROUTES, location);
      if (!appRoute) return location;
      const appRouteValues = getAppRouteValuesFromLocation(appRoute, location);
      return getLocationFromAppRouteValues(appRoute, appRouteValues);
    })
    .filter((h): h is AppRouteLocation => !!h?.href);

  if (!locations?.length) return store;

  let didChange = false;

  for (let i = 0; i < locations.length; i++) {
    if (i >= store.panels.length) {
      [store] = insertRightPanel(store, i, { routeKey: null });
      store = setNavigation(store, i, { ...locations[i], routeKey: null });
      didChange = true;
    } else {
      const currentRoute = getRouteFromPanelKey(store, i);
      const compare = deepLocationCompare(APP_ROUTES, locations[i], currentRoute);
      const currentRouteKey = store.panels[i].routeKey;

      if (compare === 'same-path') {
        store = setNavigation(store, i, { ...locations[i], routeKey: currentRouteKey });
        didChange = true;
      } else if (!compare) {
        store = setNavigation(store, i, { ...locations[i], routeKey: null });
        didChange = true;
      } else {
        continue;
      }
    }
  }

  for (let i = locations.length; i < store.panels.length; i++) {
    if (store.panels[i].navigation?.href === null) continue;
    store = setNavigation(store, i, { href: null, routeKey: store.panels[i].routeKey, state: null });
    didChange = true;
  }

  if (!didChange) return store;

  store.id = generateRandomUUID();
  return store;
};

/**
 * @name syncLocationToStore
 * @description Computes the next router store from the current location.
 * Sync precedence is `location.state` first, then hash parsing.
 * Returns the current store when no sync is needed, and falls back to the router example shape if parsing throws.
 * @param store - Current router store state
 * @param location - Current React Router location
 * @returns The next store state
 */
export const syncLocationToStore = (store: AppRouterStore, location: Location<AppRouterNavigation>): AppRouterStore => {
  if (location.state?.id && location.state.id === store.id) return store;
  if (!location.state && !location.hash) return store;

  try {
    if (!!location.state) return parseLocationState(store, location);
    if (!!location.hash) return parseLocationHash(store, location);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('error parsing the location', e);
  }

  return { ...ROUTER_STORE_EXAMPLE, maxPanels: store.maxPanels, maxNodes: store.maxNodes };
};

//*****************************************************************************************
// Navigation
//*****************************************************************************************

/**
 * @name getAppLinkTo
 * @description Breaks down an AppLinkTo object into its first key/value pair.
 * @returns Tuple of `[toKey, toValue]`, or `[null, null]` when `to` is empty
 */
export const getAppLinkTo = function <const Path extends AppRoute['path']>(to: AppLinkToOptions<Path>) {
  return (Object.entries(to)?.[0] || [null, null]) as AppLinkToTuple<Path>;
};

/**
 * @name getPreviousLocationFromRouter
 * @description Returns a selector that resolves the previous route context used by functional navigation inputs.
 * For non-functional updates, it returns the default empty route.
 */

export const getPreviousLocationFromRouter = function <
  const Path extends AppRoute['path'],
  const Key extends keyof AppLinkTo<Path>
>(
  toKey: Key,
  toValue: AppLinkTo<Path>[Key],
  routeKey: keyof AppRouterStore['routes'],
  navigationStyle: 'push' | 'loop'
) {
  return function (store: AppRouterStore): AppRouterStore['routes'][string] {
    if (!(toKey === 'replaceSearchObject' || toKey === 'replaceURLSearchParams' || typeof toValue === 'function'))
      return DEFAULT_APP_ROUTER_ROUTE;
    else if (toKey === 'openRoute') return getNextRouteFromKey(store, routeKey, navigationStyle);
    else return getRouteFromKey(store, routeKey);
  };
};

/**
 * @name getExternalHrefFromNavigation
 * @description Wraps a route location into the multi-panel hash URL format `/v1#<encoded-panel>`.
 * Preserves the incoming location state as-is.
 * @param location - Route location with href and state
 * @returns Panel-wrapped location with v1 pathname and hash encoding, or null when href is empty
 */
export const getExternalHrefFromNavigation = ({ href, state }: AppRouteLocation): AppRouteLocation['href'] => {
  if (!href) return null;
  const fragment = getHashFragmentFromLocation({ href, state });
  return !fragment ? null : `/v1#${fragment}`;
};

/**
 * @name getNavigationFromOpenRoute
 * @description Builds a `create` navigation payload for opening a route in a new panel slot.
 * Uses precomputed route definition and values to avoid recalculation.
 */
export const getNavigationFromOpenRoute = function <const Path extends AppRoute['path']>(
  toValue: AppLinkTo<Path>['openRoute'],
  appRoute: AppRoute,
  values: InferAppRouteValuesFromRoute<AppRoute>,
  { replace }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
): AppRouterNavigation {
  const nextRoute = typeof toValue !== 'function' ? findAppRouteFromValues(APP_ROUTES, toValue) : appRoute;
  const nextValues = typeof toValue === 'function' ? toValue(values) : toValue;
  const nextLocation = getLocationFromAppRouteValues(nextRoute, nextValues);
  return { href: nextLocation.href, routeKey: null, state: nextLocation.state || null, replace };
};

/**
 * @name getNavigationFromReplaceRoute
 * @description Builds an `update` navigation payload that replaces the current route in place.
 * Uses precomputed route definition and values to avoid recalculation.
 */
export const getNavigationFromReplaceRoute = function <const Path extends AppRoute['path']>(
  toValue: AppLinkTo<Path>['replaceRoute'],
  appRoute: AppRoute,
  values: InferAppRouteValuesFromRoute<AppRoute>,
  routeKey: keyof AppRouterStore['routes'] = null,
  { replace }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
): AppRouterNavigation {
  const nextRoute = typeof toValue !== 'function' ? findAppRouteFromValues(APP_ROUTES, toValue) : appRoute;
  const nextValues = typeof toValue === 'function' ? toValue(values) : toValue;
  const nextLocation = getLocationFromAppRouteValues(nextRoute, nextValues);
  return { href: nextLocation.href, routeKey, state: nextLocation.state || null, replace };
};

/**
 * @name getNavigationFromReplaceSearchObject
 * @description Builds an `update` navigation payload by replacing search values with an object-based input.
 * Uses precomputed route definition and values to avoid recalculation.
 */
export const getNavigationFromReplaceSearchObject = function <const Path extends AppRoute['path']>(
  toValue: AppLinkTo<Path>['replaceSearchObject'],
  appRoute: AppRoute,
  values: InferAppRouteValuesFromRoute<AppRoute>,
  routeKey: keyof AppRouterStore['routes'] = null,
  { replace }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
): AppRouterNavigation {
  const prevSearchObject = values.search as InferAppRouteSearchValuesFromPath<Path>;
  const prevSearch = (appRoute?.search?.full?.(prevSearchObject)?.toObject?.() ||
    null) as InferAppRouteSearchValuesFromPath<Path>;
  const nextSearchObject = typeof toValue === 'function' ? toValue(prevSearch) : toValue;
  const nextSearch = appRoute?.search?.delta?.(nextSearchObject)?.toObject?.() || null;
  const nextValues = { ...values, search: nextSearch };
  const nextLocation = getLocationFromAppRouteValues(appRoute, nextValues as InferAppRouteValuesFromRoute<AppRoute>);
  return { href: nextLocation.href, routeKey, state: nextLocation.state || null, replace };
};

/**
 * @name getNavigationFromReplaceURLSearchParams
 * @description Builds an `update` navigation payload by replacing search values with URLSearchParams input.
 * Uses precomputed route definition and values to avoid recalculation.
 */
export const getNavigationFromReplaceURLSearchParams = function <const Path extends AppRoute['path']>(
  toValue: AppLinkTo<Path>['replaceURLSearchParams'],
  appRoute: AppRoute,
  values: InferAppRouteValuesFromRoute<AppRoute>,
  routeKey: keyof AppRouterStore['routes'] = null,
  { replace }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
): AppRouterNavigation {
  const prevSearchObject = values.search as InferAppRouteSearchValuesFromPath<Path>;
  const prevSearch = appRoute?.search?.full?.(prevSearchObject)?.toParams?.();
  const nextSearchParams = typeof toValue === 'function' ? toValue(prevSearch) : toValue;
  const nextSearch = appRoute?.search?.delta?.(nextSearchParams)?.toObject?.() || null;
  const nextValues = { ...values, search: nextSearch };
  const nextLocation = getLocationFromAppRouteValues(appRoute, nextValues as InferAppRouteValuesFromRoute<AppRoute>);
  return { href: nextLocation.href, routeKey, state: nextLocation.state || null, replace };
};
