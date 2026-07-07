import type { AppNavigationStore, AppRouterState, AppRouterStore } from 'core/router';
import type {
  AppLocationStore,
  AppRouteLocation,
  InferAppRouteDefinitionFromPath,
  InferAppRouteSnapshotFromPath,
  InferAppRouteValuesFromPath
} from 'core/routes';
import {
  DEFAULT_APP_ROUTE_DEFINITION,
  DEFAULT_APP_ROUTE_LOCATION,
  DEFAULT_APP_ROUTE_SNAPSHOT,
  DEFAULT_APP_ROUTE_VALUES
} from 'core/routes';
import type { Location, NavigateFunction } from 'react-router';
import { matchPath } from 'react-router';
import { hashObject } from 'shared/utils/app.utils';

//*****************************************************************************************
// Route Definitions
//*****************************************************************************************

export const getDefaultRouteDefinition = function <const Path extends AppRoute['path']>() {
  return DEFAULT_APP_ROUTE_DEFINITION as unknown as InferAppRouteDefinitionFromPath<Path>;
};

export const findRouteDefinitionFromPath = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  path: Path
): InferAppRouteDefinitionFromPath<Path> {
  if (!store?.definitions) return getDefaultRouteDefinition<Path>();
  return (store.definitions[path] ?? getDefaultRouteDefinition<Path>()) as InferAppRouteDefinitionFromPath<Path>;
};

export const findRouteDefinitionFromKey = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  routeKey: keyof AppRouterState['routes']
): InferAppRouteDefinitionFromPath<Path> {
  const snapshot = findRouteSnapshotFromKey(store, routeKey);
  if (!snapshot?.path) return getDefaultRouteDefinition();
  return findRouteDefinitionFromPath(store, snapshot.path) as InferAppRouteDefinitionFromPath<Path>;
};

export const findRouteDefinitionFromLocation = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  location: AppRouteLocation
): InferAppRouteDefinitionFromPath<Path> {
  if (!location?.href) return getDefaultRouteDefinition();
  const { pathname } = new URL(location.href, 'http://localhost');
  return (Object.values(store?.definitions || {}).find(r => matchPath({ path: r.path, end: true }, pathname)) ??
    getDefaultRouteDefinition<Path>()) as InferAppRouteDefinitionFromPath<Path>;
};

export const findRouteDefinitionFromSnapshot = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  snapshot: InferAppRouteSnapshotFromPath<Path>
): InferAppRouteDefinitionFromPath<Path> {
  if (!snapshot?.path) return getDefaultRouteDefinition<Path>();
  return findRouteDefinitionFromPath(store, snapshot.path);
};

export const findRouteDefinitionFromValues = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  values: InferAppRouteValuesFromPath<Path>
): InferAppRouteDefinitionFromPath<Path> {
  if (!values?.path) return getDefaultRouteDefinition<Path>();
  return findRouteDefinitionFromPath(store, values.path) as InferAppRouteDefinitionFromPath<Path>;
};

//*****************************************************************************************
// Route Snapshots
//*****************************************************************************************

export const getDefaultRouteSnapshot = function <const Path extends AppRoute['path']>() {
  return DEFAULT_APP_ROUTE_SNAPSHOT as unknown as InferAppRouteSnapshotFromPath<Path>;
};

export const findRouteSnapshotFromKey = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  routeKey: keyof AppRouterState['routes']
): InferAppRouteSnapshotFromPath<Path> {
  return (store?.snapshots?.[routeKey] ?? getDefaultRouteSnapshot()) as InferAppRouteSnapshotFromPath<Path>;
};

export const sanitizeRouteSnapshot = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  snapshot: InferAppRouteSnapshotFromPath<Path>
): InferAppRouteSnapshotFromPath<Path> {
  const definition = findRouteDefinitionFromSnapshot(store, snapshot);
  if (!definition?.path) return getDefaultRouteSnapshot<Path>();

  const location: Location = {
    key: 'default',
    pathname: snapshot?.params
      ? (definition.params?.stringify?.(snapshot.params as never) ?? definition.path)
      : definition.path,
    search: snapshot?.search ? `?${snapshot.search.toLocationSearch()}` : '',
    hash: snapshot?.hash
      ? `#${String(definition.hash?.(snapshot.hash as never) ?? snapshot.hash).replace(/^#/, '')}`
      : '',
    state: snapshot?.search?.toLocationState?.() ?? null
  };

  return {
    ...snapshot,
    path: definition.path,
    params: definition.params?.parse?.(location) ?? null,
    search: definition.search?.fromLocation?.(location) ?? null,
    hash: location.hash.slice(1) || null
  } as InferAppRouteSnapshotFromPath<Path>;
};

export const getRouteSnapshotFromLocation = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  location: AppRouteLocation
): InferAppRouteSnapshotFromPath<Path> {
  const definition = findRouteDefinitionFromLocation(store, location);
  if (!definition?.path || !location?.href) return getDefaultRouteSnapshot();

  const url = new URL(location.href, 'http://localhost');
  const next: Location = {
    key: 'default',
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    state: location?.state || null
  };

  return {
    ...getDefaultRouteSnapshot(),
    path: definition.path,
    params: definition.params?.parse?.(next) ?? null,
    search: definition.search?.fromLocation?.(next) ?? null,
    hash: next.hash ? next.hash.slice(1) : null
  } as InferAppRouteSnapshotFromPath<Path>;
};

export const getRouteSnapshotFromValues = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  values: InferAppRouteValuesFromPath<Path>
): InferAppRouteSnapshotFromPath<Path> {
  const definition = findRouteDefinitionFromValues(store, values);
  if (!definition?.path || !values?.path) return getDefaultRouteSnapshot<Path>();

  const delta =
    !definition?.search || values?.search == null ? undefined : definition.search.delta(values.search as never);
  const next: Location = {
    key: 'default',
    pathname: definition.params?.stringify?.(values.params as never) ?? values.path,
    search: delta ? `?${delta.toLocationSearch()}` : '',
    hash:
      values?.hash == null
        ? ''
        : `#${String(definition.hash?.(values.hash as never) ?? values.hash).replace(/^#/, '')}`,
    state: delta?.toLocationState?.() ?? null
  };

  return {
    ...getDefaultRouteSnapshot(),
    path: definition.path,
    params: definition.params?.parse?.(next) ?? null,
    search: definition.search?.fromLocation?.(next) ?? null,
    hash: next.hash.slice(1) || null
  } as InferAppRouteSnapshotFromPath<Path>;
};

export const addRouteSnapshot = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  routeKey: keyof AppLocationStore['snapshots'],
  snapshot: InferAppRouteSnapshotFromPath<Path>
): AppLocationStore {
  if (routeKey in (store?.snapshots || {}) || !snapshot?.path) return store;
  store.snapshots[routeKey] = snapshot as unknown as AppLocationStore['snapshots'][Path];
  return store;
};

export const updateRouteSnapshot = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  routeKey: keyof AppLocationStore['snapshots'],
  snapshot: InferAppRouteSnapshotFromPath<Path>
): AppLocationStore {
  if (!(routeKey in (store?.snapshots || {})) || !snapshot?.path) return store;

  const location = getRouteLocationFromSnapshot(store, snapshot);
  const id = hashRouteLocation(location);
  if (store.snapshots[routeKey].id === id) return store;

  store.snapshots[routeKey].id = snapshot.id;
  store.snapshots[routeKey].path = snapshot.path;
  store.snapshots[routeKey].params = snapshot.params;
  store.snapshots[routeKey].search = snapshot.search;
  store.snapshots[routeKey].hash = snapshot.hash;

  return store;
};

export const upsertRouteSnapshot = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  routeKey: keyof AppLocationStore['snapshots'],
  snapshot: InferAppRouteSnapshotFromPath<Path>
): AppLocationStore {
  if (routeKey in (store?.snapshots || {})) return updateRouteSnapshot(store, routeKey, snapshot);
  else return addRouteSnapshot(store, routeKey, snapshot);
};

export const removeRouteSnapshot = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  snapshot: InferAppRouteSnapshotFromPath<Path>
) {
  for (const [routeKey, route] of Object.entries(store?.snapshots || {})) {
    if (snapshot?.id && snapshot?.id === route?.id) delete store.snapshots[routeKey];
    else if (snapshot?.path && snapshot?.path === route?.path) delete store.snapshots[routeKey];
  }
  return store;
};

export const removeRouteSnapshotFromKey = function (
  store: AppLocationStore,
  routeKey: keyof AppLocationStore['snapshots']
): AppLocationStore {
  if (routeKey in (store?.snapshots || {})) {
    delete store.snapshots[routeKey];
  }
  return store;
};

//*****************************************************************************************
// Route Values
//*****************************************************************************************

export const getDefaultAppRouteValues = function <
  const Path extends AppRoute['path']
>(): InferAppRouteValuesFromPath<Path> {
  return DEFAULT_APP_ROUTE_VALUES as InferAppRouteValuesFromPath<Path>;
};

export const sanitizeAppRouteValues = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  values: InferAppRouteValuesFromPath<Path>
): InferAppRouteValuesFromPath<Path> {
  const snapshot = getRouteSnapshotFromValues(store, values);
  if (!snapshot?.path) return getDefaultAppRouteValues<Path>();

  return {
    path: snapshot.path,
    params: snapshot.params ?? null,
    search: snapshot.search?.toObject?.() ?? null,
    hash: snapshot.hash ?? null
  } as InferAppRouteValuesFromPath<Path>;
};

export const getAppRouteValuesFromKey = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  routeKey: keyof AppRouterState['routes']
): InferAppRouteValuesFromPath<Path> {
  const snapshot = findRouteSnapshotFromKey(store, routeKey);
  if (!snapshot?.path) return getDefaultAppRouteValues<Path>();

  return {
    path: snapshot?.path || null,
    params: snapshot?.params || null,
    search: snapshot?.search?.toObject() || null,
    hash: snapshot?.hash || null
  } as InferAppRouteValuesFromPath<Path>;
};

export const getAppRouteValuesFromSnapshot = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  snapshot: InferAppRouteSnapshotFromPath<Path>
): InferAppRouteValuesFromPath<Path> {
  if (!snapshot?.path || !(snapshot.path in store.definitions)) return getDefaultAppRouteValues<Path>();

  return {
    path: snapshot.path,
    params: snapshot.params,
    search: snapshot.search?.toObject() || null,
    hash: snapshot.hash ?? undefined
  } as InferAppRouteValuesFromPath<Path>;
};

export const getAppRouteValuesFromLocation = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  location: AppRouteLocation
): InferAppRouteValuesFromPath<Path> {
  const definition = findRouteDefinitionFromLocation(store, location);
  if (!definition?.path || !location?.href) return getDefaultAppRouteValues<Path>();

  const url = new URL(location.href, 'http://localhost');
  const next: Location = {
    key: 'default',
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    state: location?.state ?? null
  };

  return {
    path: definition.path,
    params: definition.params?.parse?.(next) ?? null,
    search: definition.search?.fromLocation?.(next)?.toObject?.() ?? null,
    hash: next.hash ? next.hash.slice(1) : null
  } as InferAppRouteValuesFromPath<Path>;
};

//*****************************************************************************************
// Route Location
//*****************************************************************************************

export const getDefaultRouteLocation = function (): AppRouteLocation {
  return DEFAULT_APP_ROUTE_LOCATION;
};

export const hashRouteLocation = function (location: AppRouteLocation): AppLocationStore['snapshots'][string]['id'] {
  return hashObject({ href: location?.href || '', state: location?.state || {} });
};

export const getRouteLocationFromSnapshot = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  snapshot: InferAppRouteSnapshotFromPath<Path>
): AppRouteLocation {
  if (!snapshot?.path) return getDefaultRouteLocation();

  const definition = findRouteDefinitionFromSnapshot(store, snapshot);
  if (!definition?.path) return getDefaultRouteLocation();

  const pathname = snapshot?.params
    ? (definition.params?.stringify?.(snapshot.params as never) ?? definition.path)
    : definition.path;
  const search = snapshot?.search?.toLocationSearch?.() ?? '';
  const hash =
    snapshot?.hash == null ? '' : String(definition.hash?.(snapshot.hash as never) ?? snapshot.hash).replace(/^#/, '');

  return {
    href: `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`,
    state: snapshot?.search?.toLocationState?.() ?? null
  };
};

export const sanitizeRouteLocation = function (store: AppLocationStore, location: AppRouteLocation): AppRouteLocation {
  const snapshot = getRouteSnapshotFromLocation(store, location);
  if (!snapshot?.path) return getDefaultRouteLocation();

  return getRouteLocationFromSnapshot(store, snapshot);
};

export const getRouteLocationFromValues = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  values: InferAppRouteValuesFromPath<Path>
): AppRouteLocation {
  const snapshot = getRouteSnapshotFromValues(store, values);
  if (!snapshot?.path) return getDefaultRouteLocation();

  return getRouteLocationFromSnapshot(store, snapshot);
};

//*****************************************************************************************
// External Href
//*****************************************************************************************

export const getExternalHrefFromLocation = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  location: AppRouteLocation
): AppRouteLocation['href'] {
  const next = sanitizeRouteLocation(store, location);
  return !next?.href ? null : `/v1#${next.href}`;
};

export const getExternalHrefFromSnapshot = function <const Path extends AppRoute['path']>(
  store: AppLocationStore,
  snapshot: InferAppRouteSnapshotFromPath<Path>
): AppRouteLocation['href'] {
  const location = getRouteLocationFromSnapshot(store, snapshot);
  return !location?.href ? null : `/v1#${location.href}`;
};

//*****************************************************************************************
// URL Decoding
//*****************************************************************************************

export const parseLocationFromHashFragment = function (fragment: string): AppRouteLocation | null {
  if (!fragment) return null;

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
    return null;
  }
};

export const getLocationsFromLegacyURL = (
  store: AppLocationStore,
  url: Location<AppRouterState>
): AppRouteLocation[] => {
  return [];
};

export const getLocationsFromURLHash = (store: AppLocationStore, url: Location<AppRouterState>): AppRouteLocation[] => {
  if (url?.pathname !== '/v1' || !url?.hash) return [];

  const hashFragment = url.hash.slice(1);
  if (!hashFragment) return [];

  return hashFragment
    .split('#/')
    .map((fragment, index) => {
      const location = parseLocationFromHashFragment(`${index === 0 ? '' : '/'}${fragment}`);
      return sanitizeRouteLocation(store, location);
    })
    .filter((parsedLocation): parsedLocation is AppRouteLocation => !!parsedLocation?.href);
};

//*****************************************************************************************
// Location Store
//*****************************************************************************************

export const setRouteDefinitionsFromAppRoutes = function (
  store: AppLocationStore,
  routes: AppRoutes
): AppLocationStore {
  store.definitions = Object.fromEntries(routes.map(route => [route.path, route])) as Record<
    AppRoute['path'],
    AppRoute
  >;
  return store;
};

export const syncRouteSnapshotsFromRouter = function (
  store: AppLocationStore,
  router: AppRouterStore
): AppLocationStore {
  for (const routeKey of Object.keys(store?.snapshots || {})) {
    if (!(routeKey in (router?.routes || {}))) {
      store = removeRouteSnapshotFromKey(store, routeKey);
    }
  }

  for (const [routeKey, route] of Object.entries(router?.routes || {})) {
    const id = hashRouteLocation(route);
    const snapshot = getRouteSnapshotFromLocation(store, route);
    snapshot.id = id;
    store = upsertRouteSnapshot(store, routeKey, snapshot);
  }

  return store;
};

// /**
//  *
//  * @param store
//  *

//  * @param route
//  * @returns
//  */

// const normalizeParsedLocation = (store: AppLocationStore, location: AppRouteLocation): AppRouteLocation | null => {
//   if (!location?.href) return null;

//   const normalized = sanitizeRouteLocation(store, location);
//   return normalized?.href ? normalized : location;
// };

// export const parseLocationFromDefinition = function (
//   store: AppLocationStore,
//   route: AppRouteLocation
// ): AppRouteLocation {
//   return null;
// };

// export const parseRouterLocationState = function (
//   store: AppLocationStore,
//   location: Location<AppRouterState>
// ): AppRouteLocation[] {
//   if (!location?.state?.panels?.length || !location?.state?.routes) return [];

//   return location.state.panels
//     .map(panel => {
//       if (!location?.state?.routes?.[panel?.routeKey]) return null;

//       const definition = findRouteDefinitionFromRoute(store, location.state.routes[panel?.routeKey]);

//       if (!panel?.routeKey) return null;

//       const route = location.state.routes[routeKey];
//       if (!route?.href) return null;

//       return normalizeParsedLocation(store, {
//         href: route.href,
//         state: route.state ?? null
//       });
//     })
//     .filter((location): location is AppRouteLocation => !!location?.href);
// };

// export const parseRouterLocationHash = function (store: AppLocationStore, location: Location): AppRouteLocation[] {
//   return getLocationsFromURLHash(store, location as Location<AppRouterState>);
// };

// export const parseLegacyLocation = function (store: AppLocationStore, location: Location): AppRouteLocation[] {
//   if (!location?.pathname || location.pathname === '/v1') return [];

//   const pathname = location.pathname === '/' ? '/submit' : location.pathname;
//   const rawLocation: AppRouteLocation = {
//     href: `${pathname}${location.search || ''}${location.hash || ''}`,
//     state: location.state ?? null
//   };

//   const normalized = normalizeParsedLocation(store, rawLocation);
//   return normalized?.href ? [normalized] : [];
// };

// export const parseReactRouterLocation = function (store: AppLocationStore, location: Location): AppRouteLocation[] {
//   if (!location) return [];

//   try {
//     if (!!location?.state) return parseRouterLocationState(store, location);
//     if (location?.pathname === '/v1' && !!location?.hash) return parseRouterLocationHash(store, location);
//     return parseLegacyLocation(store, location);
//   } catch (e) {
//     // eslint-disable-next-line no-console
//     console.error('error parsing the location', e);
//   }

//   return [];
// };

// /**
//  *
//  *

//  */

// //*****************************************************************************************
// // Find Routes
// //*****************************************************************************************

// /**
//  * @name findAppRouteFromValues
//  * @description Finds a route definition from the routes array that matches the path in the given destination.
//  * @param routes - Array of created route definitions
//  * @param to - Typed destination containing the target path
//  * @returns Matching route definition, or null when not found
//  */
// export const findAppRouteFromSnapshot = function <const Path extends AppRoute['path']>(
//   location: AppLocationStore,
//   to: InferAppRouteValuesFromPath<Path>
// ): InferAppRouteFromPath<Path> {
//   return (Object.values(location?.definitions || {}).find(r => r.path === to?.path) ??
//     DEFAULT_APP_ROUTE_SNAPSHOT) as InferAppRouteFromPath<Path>;
// };

// /**
//  * @name findRouteFromLocation
//  * @description Finds a route definition from the routes array that matches the pathname extracted from the given href.
//  * @param routes - Array of created route definitions
//  * @param href - The href string to match against (pathname + optional search + hash)
//  * @returns Matching route definition, or null when not found
//  */
// export const findAppRouteFromLocation = function <const Path extends AppRoute['path']>(
//   routes: AppRoutes,
//   { href }: AppRouteLocation
// ): InferAppRouteFromPath<Path> | null {
//   if (!href) return null;
//   const { pathname } = new URL(href, 'http://localhost');
//   return (routes.find(r => matchPath({ path: r.path, end: true }, pathname)) ??
//     null) as InferAppRouteFromPath<Path> | null;
// };

// // //*****************************************************************************************
// // // Locations
// // //*****************************************************************************************

// // /**
// //  * @name buildRoutePathname
// //  * @description Resolves the pathname for a destination by stringifying typed path params through the route codec, or falling back to manual encoding when no codec is available.
// //  * @param route - Matched route definition, if found
// //  * @param values - Typed destination containing path and optional params
// //  * @returns Resolved pathname string
// //  */
// // export const getLocationPathFromAppRouteValues = function <const Path extends AppRoute['path']>(
// //   route: InferAppRouteFromPath<Path>,
// //   values: InferAppRouteValuesFromPath<Path>
// // ): Location['pathname'] {
// //   if (values?.path == null) return '';

// //   if (route?.params && values?.params) {
// //     return route.params.stringify(values.params as never);
// //   }

// //   if (values?.params) {
// //     return Object.entries(values.params).reduce(
// //       (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(String(value))),
// //       values.path
// //     );
// //   }

// //   return values?.path;
// // };

// // /**
// //  * @name buildRouteSearch
// //  * @description Serializes provided search params via the route search engine delta method.
// //  * Produces the query string content without a leading `?`.
// //  * @param route - Matched route definition, if found
// //  * @param values - Typed destination containing optional search values
// //  * @returns Query string content, or empty string when no search delta is available
// //  */
// // export const getLocationSearchFromAppRouteValues = function <const Path extends AppRoute['path']>(
// //   route: InferAppRouteFromPath<Path>,
// //   values: InferAppRouteValuesFromPath<Path>
// // ): Location['search'] {
// //   const delta = !route?.search || values?.search == null ? undefined : route.search.delta(values.search as never);
// //   if (!delta) return '';
// //   return delta.toLocationSearch();
// // };

// // /**
// //  * @name buildRouteHash
// //  * @description Resolves and normalizes hash content for a destination.
// //  * Ensures the returned value excludes a leading `#` when non-empty.
// //  * @param route - Matched route definition, if found
// //  * @param values - Typed destination containing optional hash value
// //  * @returns Normalized hash string without `#`, or empty string when hash is absent
// //  */
// // export const getLocationHashFromAppRouteValues = function <const Path extends AppRoute['path']>(
// //   route: InferAppRouteFromPath<Path>,
// //   values: InferAppRouteValuesFromPath<Path>
// // ): Location['hash'] {
// //   if (values?.hash == null) return '';

// //   const resolvedHash = !route?.hash ? String(values.hash) || '' : String(route.hash(values.hash as never)) || '';
// //   return resolvedHash.startsWith('#') ? resolvedHash.slice(1) : resolvedHash;
// // };

// // /**
// //  * @name buildRouteState
// //  * @description Builds route state from the same search delta used to create the query string.
// //  * This keeps URL search and navigation state in sync.
// //  * @param route - Matched route definition, if found
// //  * @param values - Typed destination containing optional search values
// //  * @returns Route state object, or undefined when no state delta is available
// //  */
// // export const getLocationStateFromAppRouteValues = function <const Path extends AppRoute['path']>(
// //   route: InferAppRouteFromPath<Path>,
// //   values: InferAppRouteValuesFromPath<Path>
// // ): AppRouteLocation['state'] {
// //   const delta = !route?.search || values?.search == null ? undefined : route.search.delta(values.search as never);
// //   if (!delta) return undefined;
// //   return delta.toLocationState();
// // };

// // /**
// //  * @name buildRouteLocation
// //  * @description Builds the final route location payload for navigation from a typed destination.
// //  * Computes pathname, search, hash, and state in a single pass — the search delta is resolved once.
// //  * @param route - Matched route definition, if found
// //  * @param values - Typed destination containing path, optional params, search, and hash
// //  * @returns Route location with `href` and `state`
// //  */
// // export const getLocationFromAppRouteValues = function <const Path extends AppRoute['path']>(
// //   route: InferAppRouteFromPath<Path>,
// //   values: InferAppRouteValuesFromPath<Path>
// // ): AppRouteLocation {
// //   if (!values?.path) return { href: null, state: null };

// //   const pathname = getLocationPathFromAppRouteValues(route, values);
// //   const search = getLocationSearchFromAppRouteValues(route, values);
// //   const hash = getLocationHashFromAppRouteValues(route, values);
// //   const state = getLocationStateFromAppRouteValues(route, values);

// //   return { href: `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`, state };
// // };

// export const getLocationFromSnapshot2 = function <const Path extends AppRoute['path']>(
//   snapshot: InferLocationSnapshotFromPath<Path>
// ): AppRouteLocation {
//   if (!snapshot?.appRoute) return null;

//   const pathname = getLocationPathFromAppRouteValues(snapshot.appRoute, snapshot.params);
//   const search = getLocationSearchFromAppRouteValues(snapshot.appRoute, snapshot);
//   const hash = getLocationHashFromAppRouteValues(snapshot.appRoute, snapshot);
//   const state = getLocationStateFromAppRouteValues(snapshot.appRoute, snapshot);

//   return { href: `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`, state };
// };

// export const getLocationFromSearchObject = function <const Path extends AppRoute['path']>(
//   appRoute: InferAppRouteFromPath<Path>,
//   searchObject: InferSearchParamValueFromPath<Path>
// ): AppRouteLocation {
//   if (!appRoute) return { href: null, state: null };

//   const values = {
//     path: appRoute.path,
//     search: searchObject
//   } as InferAppRouteValuesFromPath<Path>;

//   return getLocationFromAppRouteValues(appRoute, values);
// };

// //*****************************************************************************************
// // App Route Values
// //*****************************************************************************************

// /**
//  * @name parseRouteParams
//  * @description Parses typed path params from an href using the matched route's param codec.
//  * @param route - Matched route definition containing the param codec
//  * @param href - The href string to extract params from
//  * @returns Parsed params object, or null when route has no param codec
//  */
// const getPathParamsFromLocation = function <const Path extends AppRoute['path']>(
//   route: InferAppRouteFromPath<Path>,
//   { href }: AppRouteLocation
// ) {
//   if (!route?.params || !href) return null;

//   const { pathname } = new URL(href, 'http://localhost');
//   const location: Location = { pathname, search: '', hash: '', state: null, key: 'default' };
//   return route.params.parse(location);
// };

// /**
//  * @name parseRouteSearch
//  * @description Parses typed search params from an href using the matched route's search engine.
//  * @param route - Matched route definition containing the search engine
//  * @param href - The href string to extract search params from
//  * @param state - Optional location state (used for state-sourced search params)
//  * @returns SearchParamSnapshot, or null when route has no search engine
//  */
// export const getSearchParamsFromLocation = function <const Path extends AppRoute['path']>(
//   route: InferAppRouteFromPath<Path>,
//   { href, state }: AppRouteLocation
// ) {
//   if (!route?.search || !href) return null;

//   const url = new URL(href, 'http://localhost');
//   const location: Location = { pathname: url.pathname, search: url.search, hash: url.hash, state, key: 'default' };
//   return route.search.fromLocation(location);
// };

// /**
//  * @name parseRouteHash
//  * @description Extracts the hash value from an href string, stripping the leading `#`.
//  * @param href - The href string to extract hash from
//  * @returns Hash string without leading `#`, or null when no hash is present
//  */
// export const getHashFromLocation = function <const Path extends AppRoute['path']>(
//   route: InferAppRouteFromPath<Path>,
//   { href }: AppRouteLocation
// ) {
//   void route;
//   if (!href) return null;
//   const { hash } = new URL(href, 'http://localhost');
//   return hash ? hash.slice(1) : null;
// };

// /**
//  * @name getAppRouteValuesFromLocation
//  * @description Parses an AppRouteLocation into typed route values by extracting path params, search params, and hash.
//  * @param route - The matched route definition
//  * @param location - The route location containing href and optional state
//  * @returns Typed route values with path, params, search, and hash
//  */
// export const getAppRouteValuesFromRoute = function <const Path extends AppRoute['path']>(
//   route: InferAppRouteFromPath<Path>,
//   { href, state }: AppRouteLocation
// ): InferAppRouteValuesFromPath<Path> {
//   if (!route || !href) return null;

//   const params = getPathParamsFromLocation(route, { href, state });
//   const search = getSearchParamsFromLocation(route, { href, state });
//   const hash = getHashFromLocation(route, { href, state });

//   return {
//     path: route.path,
//     params,
//     search,
//     hash
//   } as InferAppRouteValuesFromPath<Path>;
// };

// /**
//  * @name findLocationFromRouteKey
//  * @description Retrieves a location snapshot by route key from the location store and falls back to the default snapshot when the key is missing.
//  * @param store - Location snapshot store keyed by route identifiers
//  * @param routeKey - Route key used to read a location snapshot from the store
//  * @returns Matching location snapshot, or the default snapshot when no value is stored for the provided key
//  */
// export const findSnapshotFromRouteKey = function <const Path extends AppRoute['path']>(
//   store: AppLocationStore,
//   routeKey: keyof AppLocationStore['snapshots']
// ): InferLocationSnapshotFromPath<Path> {
//   return (store?.[routeKey] ?? getDefaultRouteSnapshot()) as InferLocationSnapshotFromPath<Path>;
// };

// export const getSnapshotFromLocation = function <const Path extends AppRoute['path']>(
//   route: InferAppRouteFromPath<Path>,
//   { href, state }: AppRouteLocation
// ): InferLocationSnapshotFromPath<Path> {
//   if (!route || !href) return DEFAULT_APP_LOCATION_SNAPSHOT;

//   const params = getPathParamsFromLocation(route, { href, state });
//   const search = getSearchParamsFromLocation(route, { href, state });
//   const hash = getHashFromLocation(route, { href, state });

//   return {
//     ...DEFAULT_APP_LOCATION_SNAPSHOT,
//     params,
//     search,
//     hash
//   };
// };

// //*****************************************************************************************
// // Parser
// //*****************************************************************************************

// export const getLocationHrefFromStore = (store: AppRouterStore): string => {
//   void store;
//   return null;
// };

// export const getLocationStateFromStore = (store: AppRouterStore): AppRouterState => {
//   return {
//     id: store.id,
//     panels: store.panels,
//     routes: store.routes
//   };
// };

// export const getStoreFromLocationHref = (store: AppRouterStore, location: AppRouteLocation): AppRouterStore => {
//   void store;
//   void location;
//   return null;
// };

// export const getStoreFromLocationState = (store: AppRouterStore, location: AppRouteLocation): AppRouterStore => {
//   void store;
//   void location;
//   return null;
// };

// //*****************************************************************************************
// // Location Encoding
// //*****************************************************************************************

// /**
//  * @name getAppLinkFromLocation
//  * @description Wraps a route location into the multi-panel hash URL format `/v1#<encoded-panel>`.
//  * Preserves the incoming location state as-is.
//  * @param location - Route location with href and state
//  * @returns Panel-wrapped location with v1 pathname and hash encoding, or null when href is empty
//  */
// export const getAppLinkFromLocation = ({ href, state }: AppRouteLocation): AppRouteLocation | null => {
//   if (!href) return null;
//   const fragment = getHashFragmentFromLocation({ href, state });
//   if (!fragment) return null;
//   return { href: `/v1#${fragment}`, state };
// };

/**
 * @name syncStoreToLocation
 * @description Encodes the current router store into a multi-panel hash URL and navigates.
 * Encodes all panels into hash fragments and calls navigate() with the updated URL.
 * @param store - Current router store state
 * @param navigate - React Router navigate function used to push/replace URL updates
 * @returns Updated store after sync
 */
export const syncStoreToLocation = (
  navigation: AppNavigationStore,
  router: AppRouterStore,
  preference: AppPreferenceStore,
  navigate: NavigateFunction = () => null
): AppRouterStore => {
  let store = reconcileRouterFromNavigation(router, navigation, preference);

  // Encode all panels into hash fragments
  const hashFragments = store.panels
    .map(panel => {
      const route = store.routes[panel.routeKey];
      return route?.href ? getHashFragmentFromLocation(route) : null;
    })
    .filter((f): f is string => f !== null);

  const hashFragment = hashFragments.join('#');

  store = sanitizeAppRouterStore(store, preference);

  document.title = !hashFragments?.[0] ? 'Assemblyline 4' : `ALV4 | ${hashFragments?.[0]}`;

  void navigate(hashFragment ? `/v1#${hashFragment}` : '/v1', {
    state: getLocationStateFromStore(store),
    replace: navigation?.replace || false
  });

  return store;
};
