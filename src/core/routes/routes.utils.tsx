import { APP_ROUTES } from 'app/core.routes';
import type {
  AppLinkTo,
  AppLinkToOptions,
  AppLinkToTuple,
  AppRouterNavigation,
  AppRouterState,
  AppRouterStore
} from 'core/router';
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
// Location Encoding
//*****************************************************************************************

/**
 * @name getHashFragmentFromLocation
 * @description Encodes a single route href into the hash-parameter grammar.
 * Format: `${pathname}${%23-encoded-hash}${search}` (order: pathname, hash, search).
 * Internal hash values are encoded as %23 to distinguish from the panel-splitting # character.
 * @param location - Route location containing href and optional state
 * @returns Encoded panel fragment, or null when href is empty
 */
export const getHashFragmentFromLocation = ({ href }: AppRouteLocation): string | null => {
  if (!href) return null;

  const url = new URL(href, 'http://localhost');
  const pathname = url.pathname;
  const hash = url.hash ? url.hash.slice(1) : '';
  const search = url.search;

  return `${pathname}${search}${hash ? `#${encodeURIComponent(hash)}` : ''}`;
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
 * @description Computes the navigation target from the store and compares it against the current location. Returns null when no navigation is needed.
 * Uses the multi-panel hash grammar: `/v1#${panel1}#${panel2}#${panel3}`.
 * Encodes each panel from its current route href and always includes current panels/routes in navigation state.
 * @param store - Current router store state
 * @param location - Current React Router location
 * @returns Navigation payload ({ to, options }), or null if the location already matches
 */
export const syncStoreToLocation = (store: AppRouterStore, navigate: NavigateFunction = () => null): AppRouterStore => {
  let changes: boolean = false;
  let panelKey: number = store.panels.length - 1;

  while (panelKey >= 0) {
    const navigation = store.panels[panelKey].navigation;
    const blocker = store.panels[panelKey].blocker;
    if (navigation && !blocker.isBlocked) {
      changes = true;
      const replace = navigation.replace;

      switch (store.panels[panelKey].navigation.type) {
        case 'create':
          const [s, routeKey] = addRoute(store, { href: navigation.href, state: navigation.state });
          store = updatePanel(s, panelKey, { routeKey });
          store = clearNavigation(store, panelKey);
          break;
        case 'update':
          const currentRouteKey = store.panels[panelKey].routeKey;
          if (currentRouteKey && currentRouteKey in store.routes) {
            store = updateRoute(store, currentRouteKey, { href: navigation.href, state: navigation.state });
          } else {
            const [s, routeKey] = addRoute(store, { href: navigation.href, state: navigation.state });
            store = updatePanel(s, panelKey, { routeKey });
          }
          store = clearNavigation(store, panelKey);
          break;
        case 'delete':
          store = removePanel(store, panelKey);
          break;
      }

      const hashFragment = store.panels
        .map(panel => {
          const route = store.routes[panel.routeKey];
          return route?.href ? getHashFragmentFromLocation(route) : null;
        })
        .filter((f): f is string => f !== null)
        .join('#');

      void navigate(hashFragment ? `/v1#${hashFragment}` : '/v1', {
        state: { id: store.id, panels: store.panels, routes: store.routes },
        replace: replace
      });
    }

    panelKey--;
  }

  if (!changes) return null;

  store = sanitizeAppRouterStore(store);
  store.id = generateRandomUUID();
  return store;
};

//*****************************************************************************************
// Location Decoding
//*****************************************************************************************

/**
 * @name getLocationFromHashFragment
 * @description Decodes a panel fragment into an AppRouteLocation by reconstructing an href,
 * matching it to an app route, parsing route values, and re-stringifying through route codecs.
 * Current implementation derives `%23` from the parsed pathname portion of `new URL(fragment, base)`.
 * @param fragment - Encoded panel fragment
 * @returns Normalized AppRouteLocation, or null on parse/route-match failure
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

  return {
    href: `${pathname}${search}${hash ? `#${decodeURIComponent(hash)}` : ''}`,
    state: null
  };
};

/**
 * @name parseLocationState
 * @description Stages router navigation requests from location.state without
 * mutating routes/panels directly.
 * Requests are staged as create/update for state panels and delete for trailing panels.
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
      const appRoute = findAppRouteFromLocation(APP_ROUTES, location);
      const appRouteValues = getAppRouteValuesFromLocation(appRoute, location);
      return getLocationFromAppRouteValues(appRoute, appRouteValues);
    })
    .filter((h): h is AppRouteLocation => !!h?.href);

  if (!locations?.length) return store;

  for (let i = 0; i < locations.length; i++) {
    if (i >= store.panels.length) {
      [store] = insertRightPanel(store, i, { routeKey: null });
      store = setNavigation(store, i, { ...locations[i], type: 'create' });
    } else {
      const currentRoute = getRouteFromPanelKey(store, i);
      const currentAppRoute = findAppRouteFromLocation(APP_ROUTES, currentRoute);
      const incomingAppRoute = findAppRouteFromLocation(APP_ROUTES, locations[i]);

      if (locations[i].href === currentRoute.href) {
        // skip
      } else if (currentAppRoute && incomingAppRoute && currentAppRoute.path === incomingAppRoute.path) {
        // Set the difference
        store = setNavigation(store, i, { ...locations[i], type: 'update' });
      } else {
        store = setNavigation(store, i, { ...locations[i], type: 'create' });
      }
    }
  }

  for (let i = locations.length; i < store.panels.length; i++) {
    store = setNavigation(store, i, { type: 'delete' });
  }

  store.id = generateRandomUUID();
  return store;
};

/**
 * @name syncLocationToStore
 * @description Computes the next router store from the current location. Returns null when the store already matches.
 * Current precedence is: hash grammar first, then location state.
 * @param store - Current router store state
 * @param location - Current React Router location
 * @returns The next store state, or null if no update is needed
 */
export const syncLocationToStore = (store: AppRouterStore, location: Location<AppRouterState>): AppRouterStore => {
  if (location.state?.id && location.state.id === store.id) return store;

  try {
    if (!!location.state) return parseLocationState(store, location);
    else if (!!location.hash) return parseLocationHash(store, location);
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
 * @description Breaks down the "to" object into its key and value for further processing
 * @returns Updated router store
 */
export const getAppLinkTo = function <const Path extends AppRoute['path']>(to: AppLinkToOptions<Path>) {
  return (Object.entries(to)?.[0] || [null, null]) as AppLinkToTuple<Path>;
};

/**
 * @name getOpenRouteExternalHref
 * @description Calculates the href prop to apply to an "a" tag so that the user can a single page on its own.
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
export const getExternalHrefFromNavigation = ({ href, state }: AppRouterNavigation): AppRouteLocation['href'] => {
  if (!href) return null;
  const fragment = getHashFragmentFromLocation({ href, state });
  return !fragment ? null : `/v1#${fragment}`;
};

/**
 * @name getNavigationFromOpenRoute
 * @description Calculates the href prop to apply to an "a" tag so that the user can a single page on its own.
 */
export const getNavigationFromOpenRoute = function <const Path extends AppRoute['path']>(
  toValue: AppLinkTo<Path>['openRoute'],
  prevLocation: AppRouterStore['routes'][string],
  { replace }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
): AppRouterNavigation {
  const prevRoute = findAppRouteFromLocation(APP_ROUTES, prevLocation);
  const prevValues = getAppRouteValuesFromLocation(prevRoute, prevLocation);
  const nextRoute = typeof toValue !== 'function' ? findAppRouteFromValues(APP_ROUTES, toValue) : prevRoute;
  const nextValues = typeof toValue === 'function' ? toValue(prevValues) : toValue;
  const nextLocation = getLocationFromAppRouteValues(nextRoute, nextValues);
  return { href: nextLocation.href, state: nextLocation.state || null, replace, type: 'create' };
};

/**
 * @name getNavigationFromReplaceRoute
 * @description Calculates the href prop to apply to an "a" tag so that the user can a single page on its own.
 */
export const getNavigationFromReplaceRoute = function <const Path extends AppRoute['path']>(
  toValue: AppLinkTo<Path>['replaceRoute'],
  prevLocation: AppRouterStore['routes'][string],
  { replace }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
): AppRouterNavigation {
  const prevRoute = findAppRouteFromLocation(APP_ROUTES, prevLocation);
  const prevValues = getAppRouteValuesFromLocation(prevRoute, prevLocation);
  const nextRoute = typeof toValue !== 'function' ? findAppRouteFromValues(APP_ROUTES, toValue) : prevRoute;
  const nextValues = typeof toValue === 'function' ? toValue(prevValues) : toValue;
  const nextLocation = getLocationFromAppRouteValues(nextRoute, nextValues);
  return { href: nextLocation.href, state: nextLocation.state || null, replace, type: 'update' };
};

/**
 * @name getReplaceRouteExternalHref
 * @description Calculates the href prop to apply to an "a" tag so that the user can a single page on its own.
 */
export const getNavigationFromReplaceSearchObject = function <const Path extends AppRoute['path']>(
  toValue: AppLinkTo<Path>['replaceSearchObject'],
  prevLocation: AppRouterStore['routes'][string],
  { replace }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
): AppRouterNavigation {
  const prevRoute = findAppRouteFromLocation(APP_ROUTES, prevLocation);
  const prevValues = getAppRouteValuesFromLocation(prevRoute, prevLocation);
  const prevSearchObject = prevValues.search as InferAppRouteSearchValuesFromPath<Path>;
  const prevSearch = (prevRoute?.search?.full?.(prevSearchObject)?.toObject?.() ||
    null) as InferAppRouteSearchValuesFromPath<Path>;
  const nextSearchObject = typeof toValue === 'function' ? toValue(prevSearch) : toValue;
  const nextSearch = prevRoute?.search?.delta?.(nextSearchObject)?.toObject?.() || null;
  const nextValues = { ...prevValues, search: nextSearch };
  const nextLocation = getLocationFromAppRouteValues(prevRoute, nextValues as InferAppRouteValuesFromRoute<AppRoute>);
  return { href: nextLocation.href, state: nextLocation.state || null, replace, type: 'update' };
};

/**
 * @name getReplaceRouteExternalHref
 * @description Calculates the href prop to apply to an "a" tag so that the user can a single page on its own.
 */
export const getNavigationFromReplaceURLSearchParams = function <const Path extends AppRoute['path']>(
  toValue: AppLinkTo<Path>['replaceURLSearchParams'],
  prevLocation: AppRouterStore['routes'][string],
  { replace }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
): AppRouterNavigation {
  const prevRoute = findAppRouteFromLocation(APP_ROUTES, prevLocation);
  const prevValues = getAppRouteValuesFromLocation(prevRoute, prevLocation);
  const prevSearchObject = prevValues.search as InferAppRouteSearchValuesFromPath<Path>;
  const prevSearch = prevRoute?.search?.full?.(prevSearchObject)?.toParams?.();
  const nextSearchParams = typeof toValue === 'function' ? toValue(prevSearch) : toValue;
  const nextSearch = prevRoute?.search?.delta?.(nextSearchParams)?.toObject?.() || null;
  const nextValues = { ...prevValues, search: nextSearch };
  const nextLocation = getLocationFromAppRouteValues(prevRoute, nextValues as InferAppRouteValuesFromRoute<AppRoute>);
  return { href: nextLocation.href, state: nextLocation.state || null, replace, type: 'update' };
};
