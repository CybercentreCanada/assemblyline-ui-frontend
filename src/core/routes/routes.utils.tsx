import { APP_ROUTES } from 'app/core.routes';
import type { AppLocationState, AppNavigationStore, AppRouterRoute, AppRouterState, AppRouterStore } from 'core/router';
import {
  addRoute,
  DEFAULT_APP_ROUTER_PANEL,
  DEFAULT_APP_ROUTER_ROUTE,
  DEFAULT_NAVIGATE_OPTIONS,
  getNextRouteFromKey,
  getRouteFromKey,
  getRouteFromPanelKey,
  initializeNavigation,
  removePanel,
  sanitizeAppRouterStore,
  setNavigationFromRouter,
  updatePanel,
  updateRoute,
  upsertPanel,
  upsertRoute
} from 'core/router';
import type {
  AppLocationStore,
  AppRouteLocation,
  InferAppRouteFromPath,
  InferAppRouteSearchValuesFromPath,
  InferAppRouteValuesFromPath,
  InferAppRouteValuesFromRoute,
  InferLocationSnapshotFromPath,
  InferNavigationMapFromPath,
  InferNavigationTupleFromPath,
  InferNavigationValueFromPath,
  InferSearchParamValueFromPath
} from 'core/routes';
import { DEFAULT_APP_LOCATION_SNAPSHOT } from 'core/routes';
import type { Location, NavigateFunction, NavigateOptions } from 'react-router';
import { matchPath } from 'react-router';
import { deepCompare, generateRandomUUID } from 'shared/utils/app.utils';
import { StoreApi } from 'zustand';
import { DEFAULT_APP_LOCATION_STORE } from './routes.providers';

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
export const findAppRouteFromValues = function <const Path extends AppRoute['path']>(
  routes: AppRoutes,
  to: InferAppRouteValuesFromPath<Path>
): InferAppRouteFromPath<Path> | null {
  return (routes.find(r => r.path === to?.path) ?? null) as InferAppRouteFromPath<Path> | null;
};

/**
 * @name findRouteFromLocation
 * @description Finds a route definition from the routes array that matches the pathname extracted from the given href.
 * @param routes - Array of created route definitions
 * @param href - The href string to match against (pathname + optional search + hash)
 * @returns Matching route definition, or null when not found
 */
export const findAppRouteFromLocation = function <const Path extends AppRoute['path']>(
  routes: AppRoutes,
  { href }: AppRouteLocation
): InferAppRouteFromPath<Path> | null {
  if (!href) return null;
  const { pathname } = new URL(href, 'http://localhost');
  return (routes.find(r => matchPath({ path: r.path, end: true }, pathname)) ??
    null) as InferAppRouteFromPath<Path> | null;
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
export const getLocationPathFromAppRouteValues = function <const Path extends AppRoute['path']>(
  route: InferAppRouteFromPath<Path>,
  values: InferAppRouteValuesFromPath<Path>
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
export const getLocationSearchFromAppRouteValues = function <const Path extends AppRoute['path']>(
  route: InferAppRouteFromPath<Path>,
  values: InferAppRouteValuesFromPath<Path>
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
export const getLocationHashFromAppRouteValues = function <const Path extends AppRoute['path']>(
  route: InferAppRouteFromPath<Path>,
  values: InferAppRouteValuesFromPath<Path>
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
export const getLocationStateFromAppRouteValues = function <const Path extends AppRoute['path']>(
  route: InferAppRouteFromPath<Path>,
  values: InferAppRouteValuesFromPath<Path>
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
export const getLocationFromAppRouteValues = function <const Path extends AppRoute['path']>(
  route: InferAppRouteFromPath<Path>,
  values: InferAppRouteValuesFromPath<Path>
): AppRouteLocation {
  if (!values?.path) return { href: null, state: null };

  const pathname = getLocationPathFromAppRouteValues(route, values);
  const search = getLocationSearchFromAppRouteValues(route, values);
  const hash = getLocationHashFromAppRouteValues(route, values);
  const state = getLocationStateFromAppRouteValues(route, values);

  return { href: `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`, state };
};

export const getLocationFromSnapshot = function <const Path extends AppRoute['path']>(
  snapshot: InferLocationSnapshotFromPath<Path>
): AppRouteLocation {
  if (!snapshot?.appRoute) return null;

  const pathname = getLocationPathFromAppRouteValues(snapshot.appRoute, snapshot.params);
  const search = getLocationSearchFromAppRouteValues(snapshot.appRoute, snapshot);
  const hash = getLocationHashFromAppRouteValues(snapshot.appRoute, snapshot);
  const state = getLocationStateFromAppRouteValues(snapshot.appRoute, snapshot);

  return { href: `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`, state };
};

export const getLocationFromSearchObject = function <const Path extends AppRoute['path']>(
  appRoute: InferAppRouteFromPath<Path>,
  searchObject: InferSearchParamValueFromPath<Path>
): AppRouteLocation {
  if (!appRoute) return { href: null, state: null };

  const values = {
    path: appRoute.path,
    search: searchObject
  } as InferAppRouteValuesFromPath<Path>;

  return getLocationFromAppRouteValues(appRoute, values);
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
const getPathParamsFromLocation = function <const Path extends AppRoute['path']>(
  route: InferAppRouteFromPath<Path>,
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
export const getSearchParamsFromLocation = function <const Path extends AppRoute['path']>(
  route: InferAppRouteFromPath<Path>,
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
export const getHashFromLocation = function <const Path extends AppRoute['path']>(
  route: InferAppRouteFromPath<Path>,
  { href }: AppRouteLocation
) {
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
export const getAppRouteValuesFromLocation = function <const Path extends AppRoute['path']>(
  route: InferAppRouteFromPath<Path>,
  { href, state }: AppRouteLocation
): InferAppRouteValuesFromPath<Path> {
  if (!route || !href) return null;

  const params = getPathParamsFromLocation(route, { href, state });
  const search = getSearchParamsFromLocation(route, { href, state });
  const hash = getHashFromLocation(route, { href, state });

  return {
    path: route.path,
    params,
    search,
    hash
  } as InferAppRouteValuesFromPath<Path>;
};

export const getAppRouteValuesFromSnapshot = function <const Path extends AppRoute['path']>(
  snapshot: InferLocationSnapshotFromPath<Path>
): InferAppRouteValuesFromPath<Path> {
  if (!snapshot?.appRoute) return null;

  return {
    path: snapshot.appRoute.path,
    params: snapshot.params,
    search: snapshot.search?.toObject() || null,
    hash: snapshot.hash ?? undefined
  } as InferAppRouteValuesFromPath<Path>;
};

/**
 * @name findLocationFromRouteKey
 * @description Retrieves a location snapshot by route key from the location store and falls back to the default snapshot when the key is missing.
 * @param store - Location snapshot store keyed by route identifiers
 * @param routeKey - Route key used to read a location snapshot from the store
 * @returns Matching location snapshot, or the default snapshot when no value is stored for the provided key
 */
export const findSnapshotFromRouteKey = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  routeKey: keyof AppLocationStore
): InferLocationSnapshotFromPath<Path> {
  return (store?.[routeKey] ?? DEFAULT_APP_LOCATION_SNAPSHOT) as InferLocationSnapshotFromPath<Path>;
};

export const getSnapshotFromLocation = function <const Path extends AppRoute['path']>(
  route: InferAppRouteFromPath<Path>,
  { href, state }: AppRouteLocation
): InferLocationSnapshotFromPath<Path> {
  if (!route || !href) return DEFAULT_APP_LOCATION_SNAPSHOT;

  const params = getPathParamsFromLocation(route, { href, state });
  const search = getSearchParamsFromLocation(route, { href, state });
  const hash = getHashFromLocation(route, { href, state });

  return {
    ...DEFAULT_APP_LOCATION_SNAPSHOT,
    params,
    search,
    hash
  };
};

//*****************************************************************************************
// Parser
//*****************************************************************************************

export const getLocationHrefFromStore = (store: AppRouterStore): string => {
  void store;
  return null;
};

export const getLocationStateFromStore = (store: AppRouterStore): AppRouterState => {
  return {
    id: store.id,
    panels: store.panels,
    routes: store.routes
  };
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
 * @description Encodes the current router store into a multi-panel hash URL and navigates.
 * Encodes all panels into hash fragments and calls navigate() with the updated URL.
 * @param store - Current router store state
 * @param navigate - React Router navigate function used to push/replace URL updates
 * @returns Updated store after sync
 */
export const syncStoreToLocation = (store: AppRouterStore, navigate: NavigateFunction = () => null): AppRouterStore => {
  // Encode all panels into hash fragments
  const hashFragment = store.panels
    .map(panel => {
      const route = store.routes[panel.routeKey];
      return route?.href ? getHashFragmentFromLocation(route) : null;
    })
    .filter((f): f is string => f !== null)
    .join('#');

  store = sanitizeAppRouterStore(store);

  void navigate(hashFragment ? `/v1#${hashFragment}` : '/v1', {
    state: getLocationStateFromStore(store),
    replace: false
  });

  return store;
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
 * @param store - Current router store
 * @param location - React Router location
 * @returns Updated router store
 */
export const parseLocationState = (
  router: AppRouterStore,
  location: Location<AppLocationState>
): Partial<AppNavigationStore> | null => {
  const nextState = location.state;

  console.log(nextState);

  let navigation = initializeNavigation();
  navigation = setNavigationFromRouter(navigation, router);

  for (const [nextRouteKey, nextRoute] of Object.entries(nextState?.routes || {})) {
    navigation = upsertRoute(navigation, nextRouteKey, nextRoute);
  }

  for (const [nextPanelKey, nextPanel] of (nextState?.panels || []).entries()) {
    navigation = upsertPanel(navigation, nextPanelKey, nextPanel);
  }

  for (let panelKey = (navigation?.panels?.length || 0) - 1; panelKey >= (nextState?.panels?.length || 0); panelKey--) {
    navigation = removePanel(navigation, panelKey);
  }

  navigation.replace = false;
  navigation.id = nextState.id || generateRandomUUID();

  return navigation;
};

/**
 * @name parseLocationHash
 * @description Reconciles the router store against the multi-panel hash grammar.
 * Decodes each fragment and reconstructs the panel layout.
 * @param store - Current router store
 * @param location - React Router location
 * @returns Updated router store
 */
export const parseLocationHash = (
  navigation: AppNavigationStore,
  router: AppRouterStore,
  location: Location<AppLocationState>
): Partial<AppNavigationStore> | null => {
  const hashFragment = location.hash ? location.hash.slice(1) : '';
  if (!hashFragment) return null;

  let store = setNavigationFromRouter(navigation, router);

  let panelKey: number = -1;

  for (const [i, fragment] of hashFragment.split('#/').entries()) {
    const rawLocation = getLocationFromHashFragment(i === 0 ? fragment : `/${fragment}`);
    const nextAppRoute = findAppRouteFromLocation(APP_ROUTES, rawLocation);
    const nextAppRouteValues = getAppRouteValuesFromLocation(nextAppRoute, rawLocation);
    const nextLocation = getLocationFromAppRouteValues(nextAppRoute, nextAppRouteValues);

    if (!nextLocation?.href) continue;
    panelKey++;

    const currentRoute = getRouteFromPanelKey(navigation, panelKey);
    const currentAppRoute = findAppRouteFromLocation(APP_ROUTES, currentRoute);

    if (!!currentAppRoute?.path && currentAppRoute?.path === nextAppRoute?.path) {
      store = updateRoute(store, navigation.panels[panelKey].routeKey, nextLocation);
    } else {
      const [nextStore, nextRouteKey] = addRoute(store, nextLocation);
      store = updatePanel(nextStore, panelKey, { routeKey: nextRouteKey });
    }
  }

  for (let i = navigation.panels.length - 1; i >= panelKey; i--) {
    navigation = removePanel(navigation, i);
  }

  // const panelFragments = hashFragment
  //   .split('#/')
  //   .filter(Boolean)
  //   .map((fragment, i) => (i === 0 ? fragment : `/${fragment}`));

  // const normalizedLocations = panelFragments
  //   .map(fragment => getLocationFromHashFragment(fragment))
  //   .filter((routeLocation): routeLocation is AppRouteLocation => !!routeLocation?.href)
  //   .map(routeLocation => {
  //     const appRoute = findAppRouteFromLocation(APP_ROUTES, routeLocation);
  //     if (!appRoute) return null;

  //     const appRouteValues = getAppRouteValuesFromLocation(appRoute, routeLocation);
  //     if (!appRouteValues) return null;

  //     const normalized = getLocationFromAppRouteValues(appRoute, appRouteValues);
  //     if (!normalized?.href) return null;

  //     return {
  //       appRoute,
  //       location: normalized
  //     };
  //   })
  //   .filter((entry): entry is { appRoute: AppRoute; location: AppRouteLocation } => !!entry?.location?.href);

  // if (!normalizedLocations.length) return null;

  // let navigation = initializeNavigation();
  // navigation = setNavigationFromRouter(navigation, router);

  // for (const [i, { appRoute: nextAppRoute, location: nextLocation }] of normalizedLocations.entries()) {
  //   if (i < navigation?.panels?.length || 0) {
  //     const currentRoute = getRouteFromPanelKey(navigation, i);
  //     const currentAppRoute = findAppRouteFromLocation(APP_ROUTES, currentRoute);

  //     if (nextAppRoute.path === currentAppRoute.path) {
  //       navigation = updateRoute(navigation, navigation.panels[i].routeKey, nextLocation);
  //     } else {
  //       let [s, routeKey] = addRoute(navigation, nextLocation);
  //       navigation = updatePanel(s, i, { routeKey });
  //     }
  //   } else {
  //     let [s, routeKey] = addRoute(navigation, nextLocation);
  //     [navigation] = insertRightPanel(s, i, { routeKey });
  //   }
  // }

  // for (let panelKey = navigation.panels.length - 1; panelKey >= normalizedLocations.length; panelKey--) {
  //   navigation = removePanel(navigation, panelKey);
  // }

  delete navigation.blockedRoutes;
  navigation.replace = false;
  navigation.id = generateRandomUUID();

  return navigation;
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
export const syncLocationToStore = (
  navigation: AppNavigationStore,
  router: AppRouterStore,
  location: Location<AppLocationState>
): Partial<AppNavigationStore> | null => {
  if (!location?.state && !location?.hash) return null;
  if (location.state?.id && location.state.id === router.id) return null;

  try {
    if (!!location.state) return parseLocationState(router, location);
    if (!!location.hash) return parseLocationHash(navigation, router, location);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('error parsing the location', e);
  }

  return null;
};

/**
 * @name syncLocationToNavigationStore
 * @description Translates a React Router location into AppNavigationStore by applying state or hash parsing.
 * Acts as the navigation-specific counterpart to syncLocationToStore — operates on AppNavigationStore
 * instead of AppRouterStore so staged navigation state stays separate from the router graph.
 * @param store - Current navigation store state
 * @param location - Current React Router location
 * @returns The next navigation store state
 */
const getLocationNavigationId = (location: Location<AppLocationState>): string =>
  location.state?.id ?? location.key ?? `${location.pathname}${location.search}${location.hash}`;

export const syncLocationToNavigationStore = (
  store: AppNavigationStore,
  location: Location<AppLocationState>
): Partial<AppNavigationStore> | null => {
  if (!location.state && !location.hash) return null;

  try {
    if (location.state) {
      const nextState = location.state;
      if (!nextState?.routes || !nextState?.panels) return null;
      const nextId = nextState.id ?? getLocationNavigationId(location);
      if (
        store.id === nextId &&
        deepCompare(store.routes, nextState.routes) &&
        deepCompare(store.panels, nextState.panels)
      )
        return null;

      return {
        id: nextId,
        panels: nextState.panels,
        replace: false,
        routes: nextState.routes
      };
    }

    if (location.hash) {
      const hashFragment = location.hash.slice(1);
      if (!hashFragment) return null;

      const panelFragments = hashFragment
        .split('#/')
        .filter(Boolean)
        .map((fragment, i) => (i === 0 ? fragment : `/${fragment}`));

      const locations = panelFragments
        .map(fragment => getLocationFromHashFragment(fragment))
        .filter((l): l is AppRouteLocation => !!l?.href);

      if (!locations.length) return null;

      const nextPanels = locations.map(loc => {
        const currentPanel = store.panels.find(p => store.routes[p.routeKey]?.href === loc.href);
        return currentPanel || { ...DEFAULT_APP_ROUTER_PANEL, routeKey: null };
      });

      const nextId = getLocationNavigationId(location);
      if (store.id === nextId && deepCompare(store.panels, nextPanels)) return null;

      return {
        id: nextId,
        panels: nextPanels
      };
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('error parsing the location into navigation store', e);
  }

  return null;
};

//*****************************************************************************************
// Navigation
//*****************************************************************************************

const getNavigationAffectedRouteKeys = (navigationStore: AppNavigationStore, routerStore: AppRouterStore): string[] => {
  const affectedRouteKeys = new Set<string>();
  // Only check routes present in the navigation store — the apply is additive
  // and does not remove existing router routes absent from navigation.
  for (const routeKey of Object.keys(navigationStore.routes)) {
    const previousRoute = routerStore.routes[routeKey] ?? null;
    const nextRoute = navigationStore.routes[routeKey] ?? null;

    if (!deepCompare(previousRoute, nextRoute)) affectedRouteKeys.add(routeKey);
  }

  const panelCount = Math.max(routerStore.panels.length, navigationStore.panels.length);
  for (let panelIndex = 0; panelIndex < panelCount; panelIndex++) {
    const previousRouteKey = routerStore.panels[panelIndex]?.routeKey ?? null;
    const nextRouteKey = navigationStore.panels[panelIndex]?.routeKey ?? null;

    if (previousRouteKey === nextRouteKey) continue;
    if (previousRouteKey) affectedRouteKeys.add(previousRouteKey);
    if (nextRouteKey) affectedRouteKeys.add(nextRouteKey);
  }

  return Array.from(affectedRouteKeys);
};

const getBlockedRouteKeysForNavigation = (
  navigationStore: AppNavigationStore,
  affectedRouteKeys: string[]
): string[] => {
  return affectedRouteKeys.filter(routeKey => !!navigationStore.blockedRoutes?.[routeKey]);
};

export type NavigationToRouterSyncResult = {
  /** Whether any affected route is currently blocked. */
  blocked: boolean;
  /** Route keys that are blocking this commit. */
  blockedRouteKeys: string[];
};

/**
 * @name syncNavigationStoreToRouterStore
 * @description Checks whether a staged navigation can be committed to the router store.
 * Returns a blocker assessment so the caller can decide to apply or defer the navigation.
 * Does not apply any changes itself — use applyNavigationToRouterStore for the actual merge.
 * @param navigationStore - Staged navigation store state
 * @param routerStore - Current router store state
 * @returns Blocker assessment result
 */
export const syncNavigationStoreToRouterStore = (
  navigationStore: AppNavigationStore,
  routerStore: AppRouterStore
): NavigationToRouterSyncResult => {
  if (!navigationStore.routes || Object.keys(navigationStore.routes).length === 0) {
    return { blocked: false, blockedRouteKeys: [] };
  }

  const affectedRouteKeys = getNavigationAffectedRouteKeys(navigationStore, routerStore);
  const blockedRouteKeys = getBlockedRouteKeysForNavigation(navigationStore, affectedRouteKeys);

  return {
    blocked: blockedRouteKeys.length > 0,
    blockedRouteKeys
  };
};

/**
 * @name applyNavigationToRouterStore
 * @description Merges staged navigation state into the router store using field-level diffing.
 * Only creates new object references for routes or panels that actually changed,
 * preserving stable references for unchanged entries to minimize subscriber re-renders.
 * @param navStore - Staged navigation store state to merge from
 * @param routerStore - Current router store state to merge into
 * @returns Updated router store, or the same reference when nothing changed
 */
export const applyNavigationToRouterStore = (
  navStore: AppNavigationStore,
  routerStore: AppRouterStore
): AppRouterStore => {
  let routesChanged = false;
  const nextRoutes: Record<string, AppRouterRoute> = { ...routerStore.routes };

  for (const [routeKey, navRoute] of Object.entries(navStore.routes)) {
    if (!deepCompare(routerStore.routes[routeKey], navRoute)) {
      nextRoutes[routeKey] = navRoute;
      routesChanged = true;
    }
  }

  const panelsChanged = !deepCompare(routerStore.panels, navStore.panels);
  const idChanged = routerStore.id !== navStore.id;

  if (!routesChanged && !panelsChanged && !idChanged) return routerStore;

  return {
    ...routerStore,
    id: idChanged ? navStore.id : routerStore.id,
    routes: routesChanged ? nextRoutes : routerStore.routes,
    panels: panelsChanged ? navStore.panels : routerStore.panels
  };
};

/**
 * @name getInferNavigationMapFromPath
 * @description Breaks down an InferNavigationMapFromPath object into its first key/value pair.
 * @returns Tuple of `[toKey, toValue]`, or `[null, null]` when `to` is empty
 */
export const getNavigationEntriesFromPath = function <const Path extends AppRoute['path']>(
  to: InferNavigationValueFromPath<Path>
): InferNavigationTupleFromPath<Path> {
  return Object.entries(to)[0] as InferNavigationTupleFromPath<Path>;
};

export type InferNavigationEntryFromPath<
  Path extends AppRoute['path'],
  Key extends keyof InferNavigationMapFromPath<Path>
> = Extract<InferNavigationTupleFromPath<Path>, [Key, unknown]>;

export const isNavigationEntryFromPath = function <
  const Path extends AppRoute['path'],
  const Key extends keyof InferNavigationMapFromPath<Path>
>(entry: InferNavigationTupleFromPath<Path>, key: Key): entry is InferNavigationEntryFromPath<Path, Key> {
  return entry[0] === key;
};

/**
 * @name getPreviousLocationFromRouter
 * @description Returns a selector that resolves the previous route context used by functional navigation inputs.
 * For non-functional updates, it returns the default empty route.
 */

export const getPreviousLocationFromRouter = function <
  const Path extends AppRoute['path'],
  const Key extends keyof InferNavigationMapFromPath<Path>
>(
  toKey: Key,
  toValue: InferNavigationMapFromPath<Path>[Key],
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
 * @description Builds navigation metadata for opening a route.
 * Note: This is currently a placeholder - actual route transitions should use openRoute in router.hooks.tsx
 */
export const getNavigationFromOpenRoute = function <const Path extends AppRoute['path']>(
  toValue: InferNavigationMapFromPath<Path>['openRoute'],
  appRoute: InferAppRouteFromPath<Path>,
  values: InferAppRouteValuesFromRoute<AppRoute>,
  { replace }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
): { href: string | null; state: unknown; replace: boolean } {
  const nextRoute = typeof toValue !== 'function' ? findAppRouteFromValues(APP_ROUTES, toValue) : appRoute;
  const nextValues = typeof toValue === 'function' ? toValue(values) : toValue;
  const nextLocation = getLocationFromAppRouteValues(nextRoute, nextValues);
  return { href: nextLocation.href, state: nextLocation.state || null, replace };
};

/**
 * @name getNavigationFromReplaceRoute
 * @description Builds navigation metadata for replacing the current route.
 * Note: This is currently a placeholder - actual route transitions should use replaceRoute in router.hooks.tsx
 */
export const getNavigationFromReplaceRoute = function <const Path extends AppRoute['path']>(
  toValue: InferNavigationMapFromPath<Path>['replaceRoute'],
  appRoute: InferAppRouteFromPath<Path>,
  values: InferAppRouteValuesFromRoute<AppRoute>,
  { replace }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
): { href: string | null; state: unknown; replace: boolean } {
  const nextRoute = typeof toValue !== 'function' ? findAppRouteFromValues(APP_ROUTES, toValue) : appRoute;
  const nextValues = typeof toValue === 'function' ? toValue(values) : toValue;
  const nextLocation = getLocationFromAppRouteValues(nextRoute, nextValues);
  return { href: nextLocation.href, state: nextLocation.state || null, replace };
};

/**
 * @name getNavigationFromReplaceSearchObject
 * @description Builds navigation metadata by replacing search values.
 * Note: This is currently a placeholder - actual route transitions should use replaceSearchObject in router.hooks.tsx
 */
export const getNavigationFromReplaceSearchObject = function <const Path extends AppRoute['path']>(
  toValue: InferNavigationMapFromPath<Path>['replaceSearchObject'],
  appRoute: InferAppRouteFromPath<Path>,
  values: InferAppRouteValuesFromRoute<AppRoute>,
  { replace }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
): { href: string | null; state: unknown; replace: boolean } {
  const prevSearchObject = values.search as InferAppRouteSearchValuesFromPath<Path>;
  const prevSearch = (appRoute?.search?.full?.(prevSearchObject)?.toObject?.() ||
    null) as InferAppRouteSearchValuesFromPath<Path>;
  const nextSearchObject = typeof toValue === 'function' ? toValue(prevSearch) : toValue;
  const nextSearch = appRoute?.search?.delta?.(nextSearchObject)?.toObject?.() || null;
  const nextValues = { ...values, search: nextSearch };
  const nextLocation = getLocationFromAppRouteValues(appRoute, nextValues as InferAppRouteValuesFromRoute<AppRoute>);
  return { href: nextLocation.href, state: nextLocation.state || null, replace };
};

/**
 * @name getNavigationFromReplaceURLSearchParams
 * @description Builds navigation metadata by replacing search values with URLSearchParams.
 * Note: This is currently a placeholder - actual route transitions should use replaceURLSearchParams in router.hooks.tsx
 */
export const getNavigationFromReplaceURLSearchParams = function <const Path extends AppRoute['path']>(
  toValue: InferNavigationMapFromPath<Path>['replaceURLSearchParams'],
  appRoute: InferAppRouteFromPath<Path>,
  values: InferAppRouteValuesFromRoute<AppRoute>,
  { replace }: NavigateOptions = DEFAULT_NAVIGATE_OPTIONS
): { href: string | null; state: unknown; replace: boolean } {
  const prevSearchObject = values.search as InferAppRouteSearchValuesFromPath<Path>;
  const prevSearch = appRoute?.search?.full?.(prevSearchObject)?.toParams?.();
  const nextSearchParams = typeof toValue === 'function' ? toValue(prevSearch) : toValue;
  const nextSearch = appRoute?.search?.delta?.(nextSearchParams)?.toObject?.() || null;
  const nextValues = { ...values, search: nextSearch };
  const nextLocation = getLocationFromAppRouteValues(appRoute, nextValues as InferAppRouteValuesFromRoute<AppRoute>);
  return { href: nextLocation.href, state: nextLocation.state || null, replace };
};

export const getAppLocationStateFromApi = (api: StoreApi<AppLocationStore>): AppLocationStore => {
  return api?.getState() || DEFAULT_APP_LOCATION_STORE;
};
