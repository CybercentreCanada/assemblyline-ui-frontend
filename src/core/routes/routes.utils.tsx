import type { AppRouterPage, AppRouterState, AppRouterStore, InferAppNavigationInputFromPath } from 'core/router';
import { getDefaultRouterPage, getPageDigestFromPage, isNotFoundRouterPage } from 'core/router/router.utils';
import type {
  AppLocationParamStore,
  InferAppLocationFromPath,
  InferAppRouteFromPath,
  InferAppRouteParamFromPath
} from 'core/routes';
import { getDefaultLocationParamStore } from 'core/routes';
import { createHashParamCodec } from 'features/hash-params';
import { createPathParamsCodec } from 'features/path-params';
import type { SearchParamBlueprintMap, SearchParamValueMap } from 'features/search-params';
import { SearchParamEngine } from 'features/search-params';
import type { Location, Location as ReactRouterLocation } from 'react-router';
import { matchPath } from 'react-router';
import type { StoreApi } from 'zustand/vanilla';

//*****************************************************************************************
// App Routes
//*****************************************************************************************

const DEFAULT_APP_ROUTE = {
  element: null,

  path: null,
  params: createPathParamsCodec(null)(() => null),
  search: new SearchParamEngine<SearchParamBlueprintMap>(null),
  hash: createHashParamCodec()(() => null),

  ancestor: null,
  shortname: (() => null) as unknown,
  fullname: (() => null) as unknown,
  shorticon: (() => null) as unknown,
  fullicon: (() => null) as unknown,

  disabled: true,
  forbidden: true,
  loader: false
} as InferAppRouteFromPath<never>;

export const getDefaultAppRoute = function <const Origin extends AppRoute['path']>(): InferAppRouteFromPath<Origin> {
  return DEFAULT_APP_ROUTE as InferAppRouteFromPath<Origin>;
};

export const findAppRouteFromPath = function <const Origin extends AppRoute['path']>(
  store: AppLocationParamStore,
  path: Origin
): InferAppRouteFromPath<Origin> {
  return (store?.routes?.[path] as InferAppRouteFromPath<Origin>) ?? getDefaultAppRoute();
};

export const findAppRouteFromKey = function <const Origin extends AppRoute['path']>(
  store: AppLocationParamStore,
  pageKey: keyof AppRouterState['pages']
): InferAppRouteFromPath<Origin> {
  const location = store?.locations?.[pageKey];
  return !location?.route ? getDefaultAppRoute() : findAppRouteFromPath(store, location.route as Origin);
};

export const findAppRouteFromPage = function <const Origin extends AppRoute['path']>(
  store: AppLocationParamStore,
  page: AppRouterPage
): InferAppRouteFromPath<Origin> {
  if (isNotFoundRouterPage(page)) {
    const notFoundRoute = store?.routes?.['/not-found'];
    return (notFoundRoute as InferAppRouteFromPath<Origin>) ?? getDefaultAppRoute();
  }

  if (!page?.href) return getDefaultAppRoute();
  const { pathname } = new URL(page.href, 'http://localhost');
  const found = Object.values(store?.routes || {}).find(
    r => !!r?.path && !!matchPath({ path: r.path, end: true }, pathname)
  );
  return (found as InferAppRouteFromPath<Origin>) ?? getDefaultAppRoute();
};

export const findAppRouteFromParam = function <const Origin extends AppRoute['path']>(
  store: AppLocationParamStore,
  param: InferAppLocationFromPath<Origin>
): InferAppRouteFromPath<Origin> {
  return !param?.route ? getDefaultAppRoute() : findAppRouteFromPath(store, param.route);
};

// export const findAppRouteFromValues = function <const Origin extends AppRoute['path']>(
//   store: AppLocationParamStore,
//   values: InferAppRouteParamFromPath<Origin>
// ): InferAppRouteFromPath<Origin> {
//   return !values?.route ? getDefaultAppRoute() : findAppRouteFromPath(store, values.route as Origin);
// };

export const addAppRoute = function <const Origin extends AppRoute['path']>(
  store: AppLocationParamStore,
  route: InferAppRouteFromPath<Origin>
): AppLocationParamStore {
  const path = route?.path;
  if (!path) return store;

  if (!store.routes) {
    store.routes = {} as AppLocationParamStore['routes'];
  }

  if (path in store.routes) return store;
  store.routes[path] = route as unknown as AppRoute;
  return store;
};

export const updateAppRoute = function <const Origin extends AppRoute['path']>(
  store: AppLocationParamStore,
  route: InferAppRouteFromPath<Origin>
): AppLocationParamStore {
  const path = route?.path;
  if (!path || !store.routes || !(path in store.routes)) return store;

  const currentRoute = store.routes[path];
  const nextRoute = route;

  if ('shortname' in nextRoute) currentRoute.shortname = nextRoute.shortname;
  if ('fullname' in nextRoute) currentRoute.fullname = nextRoute.fullname;
  if ('shorticon' in nextRoute) currentRoute.shorticon = nextRoute.shorticon;
  if ('fullicon' in nextRoute) currentRoute.fullicon = nextRoute.fullicon;
  if ('element' in nextRoute) currentRoute.element = nextRoute.element;

  if ('path' in nextRoute) currentRoute.path = nextRoute.path;
  if ('params' in nextRoute) currentRoute.params = nextRoute.params;
  if ('search' in nextRoute) currentRoute.search = nextRoute.search;
  if ('hash' in nextRoute) currentRoute.hash = nextRoute.hash;

  if ('loader' in nextRoute) currentRoute.loader = nextRoute.loader;
  if ('disabled' in nextRoute) currentRoute.disabled = nextRoute.disabled;
  if ('forbidden' in nextRoute) currentRoute.forbidden = nextRoute.forbidden;
  return store;
};

export const upsertAppRoute = function <const Origin extends AppRoute['path']>(
  store: AppLocationParamStore,
  route: InferAppRouteFromPath<Origin>
): AppLocationParamStore {
  const path = route?.path;
  if (!path) return store;

  if (store.routes && path in store.routes) return updateAppRoute(store, route);
  else return addAppRoute(store, route);
};

/**
 * @name removeAppRoute
 * @description Removes a route using a full route object.
 * Use this overload when the caller already has a typed route payload.
 * For key-only workflows (e.g. sync/pruning), use `removeAppRouteFromKey`.
 */
export const removeAppRoute = function <const Origin extends AppRoute['path']>(
  store: AppLocationParamStore,
  route: InferAppRouteFromPath<Origin>
): AppLocationParamStore {
  const path = route?.path;
  if (!path || !store.routes || !(path in store.routes)) return store;

  delete store.routes[path];
  return store;
};

/**
 * @name removeAppRouteFromKey
 * @description Removes a route directly by route key.
 * Preferred for reconciliation and bulk sync operations where keys are enumerated.
 */
export const removeAppRouteFromKey = function (
  store: AppLocationParamStore,
  routeKey: keyof AppLocationParamStore['routes']
): AppLocationParamStore {
  if (!store.routes || !(routeKey in store.routes)) return store;
  delete store.routes[routeKey];
  return store;
};

export const setAppRouteFromAppRoutes = function (
  store: AppLocationParamStore,
  routes: AppRoutes
): AppLocationParamStore {
  const nextPageKeys = new Set<keyof AppLocationParamStore['routes']>();

  for (const route of routes || []) {
    if (!route?.path) continue;
    nextPageKeys.add(route.path);
    store = upsertAppRoute(store, route);
  }

  for (const routeKey of Object.keys(store.routes || {}) as (keyof AppLocationParamStore['routes'])[]) {
    if (!nextPageKeys.has(routeKey)) {
      store = removeAppRouteFromKey(store, routeKey);
    }
  }

  return store;
};

//*****************************************************************************************
// Router Page
//*****************************************************************************************

export const getLocationPathnameFromParam = function <const Origin extends AppRoute['path']>(
  route: InferAppRouteFromPath<Origin>,
  param: InferAppLocationFromPath<Origin>
): Location['pathname'] {
  if (param?.route == null) return '';

  if (route?.params && param?.path) {
    return route.params.stringify(param.path as never);
  }

  if (param?.path) {
    let pathname: string = param.route;
    for (const [key, value] of Object.entries(param.path)) {
      pathname = pathname.replace(`:${key}`, encodeURIComponent(String(value)));
    }
    return pathname;
  }

  return param?.route;
};

export const getLocationSearchFromParam = function <const Origin extends AppRoute['path']>(
  route: InferAppRouteFromPath<Origin>,
  param: InferAppLocationFromPath<Origin>
): [Location['search'], SearchParamValueMap, SearchParamValueMap] {
  const search = route?.search as SearchParamEngine<SearchParamBlueprintMap> | null;
  const delta = !search ? undefined : search.delta(param.search as never);
  return !delta ? [null, null, null] : [delta.toLocationSearch(), delta.toLocationState(), delta.toLocationTransient()];
};

export const getLocationHashFromParam = function <const Origin extends AppRoute['path']>(
  route: InferAppRouteFromPath<Origin>,
  param: InferAppLocationFromPath<Origin>
): Location['hash'] {
  if (param?.hash == null) return '';

  const resolvedHash = !route?.hash ? '' : route.hash.stringify(param.hash as never);
  return resolvedHash.startsWith('#') ? resolvedHash.slice(1) : resolvedHash;
};

export const getPageFromParam = function <const Origin extends AppRoute['path']>(
  store: AppLocationParamStore,
  param: InferAppLocationFromPath<Origin>
): AppRouterPage {
  if (!param?.route) return getDefaultRouterPage();

  const route = findAppRouteFromParam<Origin>(store, param);
  if (!route?.path) return getDefaultRouterPage();

  const pathname = getLocationPathnameFromParam(route, param);
  const [search, state, transient] = getLocationSearchFromParam(route, param);
  const hash = getLocationHashFromParam(route, param);

  const page = getDefaultRouterPage({
    href: `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`,
    state,
    transient
  });

  page.digest = getPageDigestFromPage(page);
  return page;
};

export const getPageFromLocation = function (
  store: AppLocationParamStore,
  location: ReactRouterLocation
): AppRouterPage {
  if (!location?.pathname) return getDefaultRouterPage();

  const href = `${location.pathname}${location.search || ''}${location.hash || ''}`;
  const page = getDefaultRouterPage({ href, state: location.state });
  const route = findAppRouteFromPage(store, page);
  if (!route?.path) return getDefaultRouterPage();

  page.digest = getPageDigestFromPage(page);
  return page;
};

export const getPageFromURL = function (store: AppLocationParamStore, url: string): AppRouterPage {
  if (!url?.trim()) return getDefaultRouterPage();

  try {
    const parsed = new URL(url, 'http://localhost');
    return getPageFromLocation(store, {
      key: 'default',
      pathname: parsed.pathname,
      search: parsed.search,
      hash: parsed.hash,
      state: null
    });
  } catch {
    return getDefaultRouterPage();
  }
};

export const isNavigationInputRouteParam = function <const Origin extends AppRoute['path']>(
  input: InferAppNavigationInputFromPath<Origin>
): input is InferAppRouteParamFromPath<Origin> {
  if (typeof input !== 'object' || input == null) return false;
  if (!('route' in input)) return false;
  return typeof input.route === 'string';
};

export const isNavigationInputLocation = function <const Origin extends AppRoute['path']>(
  input: InferAppNavigationInputFromPath<Origin>
): input is ReactRouterLocation {
  if (typeof input !== 'object' || input == null) return false;
  if (!('pathname' in input) || !('search' in input) || !('hash' in input)) return false;
  return typeof input.pathname === 'string' && typeof input.search === 'string' && typeof input.hash === 'string';
};

export const isNavigationInputString = function <const Origin extends AppRoute['path']>(
  input: InferAppNavigationInputFromPath<Origin>
): input is string {
  return typeof input === 'string';
};

export const getPageFromInput = function <const Origin extends AppRoute['path']>(
  store: AppLocationParamStore,
  input: InferAppNavigationInputFromPath<Origin>
): AppRouterPage {
  if (isNavigationInputString<Origin>(input)) return getPageFromURL(store, input);
  else if (isNavigationInputLocation<Origin>(input)) return getPageFromLocation(store, input);
  else if (isNavigationInputRouteParam<Origin>(input)) return getPageFromParam<Origin>(store, input);
  else return getDefaultRouterPage();
};

// export const getRouteFromLocation = function (location: Location): AppRouterRoute {
//   const href = `${location.pathname}${location.search ? `?${location.search}` : ''}${location.hash ? `#${location.hash}` : ''}`;
//   const state = location.state as never;
//   const route = getDefaultRouterRoute({ href, state });
//   route.digest = getPageDigestFromPage(route);
//   return route;
// };

// export const getRouteFromValues = function <const Origin extends AppRoute['path']>(
//   store: AppLocationParamStore,
//   values: InferAppRouteParamFromPath<Origin>
// ): AppRouterRoute {
//   const param = getRouteParamFromValues(store, values);
//   return !param?.route ? getDefaultRouterRoute() : getRouteFromParam(store, param);
// };

//*****************************************************************************************
// Route Param
//*****************************************************************************************

export const getDefaultRouteParam = function <const Origin extends AppRoute['path']>(
  param: InferAppLocationFromPath<Origin> = null
): InferAppLocationFromPath<Origin> {
  return {
    digest: null,
    route: null,
    path: null,
    search: null,
    hash: null,
    ...param
  };
};

export const getLocationFromPage = function (page: AppRouterPage): Location {
  const url = new URL(page.href, 'http://localhost');
  return {
    key: 'default',
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    state: page?.state ?? null
  };
};

export const getPathParamFromLocation = function <const Origin extends AppRoute['path']>(
  route: InferAppRouteFromPath<Origin>,
  location: Location
): InferAppLocationFromPath<Origin>['path'] {
  return (!route?.params ? null : route.params.parse(location)) as InferAppLocationFromPath<Origin>['path'];
};

export const getSearchParamFromPage = function <const Origin extends AppRoute['path']>(
  route: InferAppRouteFromPath<Origin>,
  { href, state, transient }: AppRouterPage
): InferAppLocationFromPath<Origin>['search'] {
  return !route?.search
    ? null
    : (route.search.fromRoute(href, state, transient).toObject() as InferAppLocationFromPath<Origin>['search']);
};

export const getHashParamFromLocation = function <const Origin extends AppRoute['path']>(
  route: InferAppRouteFromPath<Origin>,
  location: Location
): InferAppLocationFromPath<Origin>['hash'] {
  return !route?.hash ? null : (route.hash.parse(location) as InferAppLocationFromPath<Origin>['hash']);
};

export const getRouteParamFromPage = function <const Origin extends AppRoute['path']>(
  store: AppLocationParamStore,
  page: AppRouterPage
): InferAppLocationFromPath<Origin> {
  const route = findAppRouteFromPage<Origin>(store, page);
  if (!route?.path || !page?.href) return getDefaultRouteParam();

  const location = getLocationFromPage(page);

  return {
    digest: page.digest,
    route: route.path as never,
    path: getPathParamFromLocation<Origin>(route, location),
    search: getSearchParamFromPage<Origin>(route, page),
    hash: getHashParamFromLocation<Origin>(route, location)
  };
};

export const sanitizePage = function (store: AppLocationParamStore, page: AppRouterPage): AppRouterPage {
  if (isNotFoundRouterPage(page)) {
    const nextPage = getDefaultRouterPage(page);
    nextPage.digest = page?.digest || getPageDigestFromPage(nextPage);
    return nextPage;
  }

  const param = getRouteParamFromPage(store, page);
  if (!param?.route) return getDefaultRouterPage();

  const nextPage = getPageFromParam(store, param);
  nextPage.scroll = page?.scroll || 0;
  return nextPage;
};

// export const getRouteParamFromValues = function <const Origin extends AppRoute['path']>(
//   store: AppLocationParamStore,
//   values: InferAppRouteParamFromPath<Origin>
// ): InferAppLocationFromPath<Origin> {
//   const route = findAppRouteFromValues(store, values);
//   if (!route?.route || !values?.route) return getDefaultRouteParam<Origin>();

//   const delta = !route?.search || values?.search == null ? undefined : route.search.delta(values.search as never);
//   const hash = values?.hash == null ? '' : String(route.hash?.stringify?.(values.hash as never) ?? values.hash).trim();
//   const routeState = !route?.state ? null : route.state.delta(values.state as never);
//   const searchState = (delta?.toLocationState as (() => unknown) | undefined)?.() ?? null;
//   const next: Location = {
//     key: 'default',
//     pathname: route.path?.stringify?.(values.path as never) ?? values.route,
//     search: delta ? `?${delta.toLocationSearch()}` : '',
//     hash: !hash ? '' : hash.startsWith('#') ? hash : `#${hash}`,
//     state:
//       routeState == null
//         ? searchState
//         : searchState == null
//           ? routeState
//           : mergeStateParamValues(routeState as Record<string, never>, searchState)
//   };

//   const param = {
//     ...getDefaultRouteParam(),
//     route: route.route,
//     path: route.path?.parse?.(next) ?? null,
//     search: route.search?.fromLocation?.(next) ?? null,
//     hash: getHashParamFromLocation(route, next),
//     state: getStateParamFromLocation(route, next),
//     transient: getTransientParamFromValue(route, values.transient)
//   } as InferAppLocationFromPath<Origin>;

//   param.digest = getPageDigestFromPage(getRouteFromLocation(next));

//   return param;
// };

// export const applySearchParamToRouteParam = function <const Origin extends AppRoute['path']>(
//   store: AppLocationParamStore,
//   param: InferAppLocationFromPath<Origin>,
//   search: URLSearchParams | InferAppRouteSearchValuesFromPath<Origin>
// ): InferAppLocationFromPath<Origin> {
//   const route = findAppRouteFromParam<Origin>(store, param);
//   if (!route?.route || !param?.route) return getDefaultRouteParam<Origin>();

//   param.search = !search ? undefined : (route.search.delta(search as never) as never);
//   const next = getRouteFromParam(store, param);
//   param.digest = getPageDigestFromPage(next);

//   return param;
// };

// export const sanitizeRouteParam = function <const Origin extends AppRoute['path']>(
//   store: AppLocationParamStore,
//   param: InferAppLocationFromPath<Origin>
// ): InferAppLocationFromPath<Origin> {
//   const route = findAppRouteFromParam(store, param);
//   if (!route?.route) return getDefaultRouteParam<Origin>();
//   const route = getRouteFromParam(store, param);
//   return getRouteParamFromRoute(store, route);
// };

export const getRouteParamFromKey = function <const Origin extends AppRoute['path']>(
  store: AppLocationParamStore,
  pageKey: keyof AppRouterState['pages']
): InferAppLocationFromPath<Origin> {
  return !(pageKey in (store?.locations || {}))
    ? getDefaultRouteParam<Origin>()
    : (store.locations[pageKey] as unknown as InferAppLocationFromPath<Origin>);
};

export const addRouteParam = function <const Origin extends AppRoute['path']>(
  store: AppLocationParamStore,
  pageKey: keyof AppLocationParamStore['locations'],
  param: InferAppLocationFromPath<Origin>
): AppLocationParamStore {
  if (pageKey in (store?.locations || {}) || !param?.route) return store;
  store.locations[pageKey] = param as unknown as AppLocationParamStore['locations'][Origin];
  return store;
};

export const addRouteParamFromPage = function (
  store: AppLocationParamStore,
  pageKey: keyof AppRouterStore['pages'],
  page: AppRouterPage
): AppLocationParamStore {
  return addRouteParam(store, pageKey, getRouteParamFromPage(store, page));
};

export const updateRouteParam = function <const Origin extends AppRoute['path']>(
  store: AppLocationParamStore,
  pageKey: keyof AppLocationParamStore['locations'],
  param: InferAppLocationFromPath<Origin>
): AppLocationParamStore {
  if (!(pageKey in (store?.locations || {})) || !param?.route) return store;

  if ('digest' in param) store.locations[pageKey].digest = param.digest;
  if ('route' in param) store.locations[pageKey].route = param.route;
  if ('path' in param) store.locations[pageKey].path = param.path;
  if ('search' in param) store.locations[pageKey].search = param.search;
  if ('hash' in param) store.locations[pageKey].hash = param.hash as never;

  return store;
};

export const updateRouteParamFromPage = function (
  store: AppLocationParamStore,
  pageKey: keyof AppRouterStore['pages'],
  page: AppRouterPage
): AppLocationParamStore {
  const prevParam = getRouteParamFromKey(store, pageKey);
  if (!prevParam?.route) return store;

  const nextParam = getRouteParamFromPage(store, page);
  if (!nextParam?.route || prevParam?.digest === nextParam?.digest) return store;

  return updateRouteParam(store, pageKey, nextParam);
};

export const upsertRouteParam = function <const Origin extends AppRoute['path']>(
  store: AppLocationParamStore,
  pageKey: keyof AppLocationParamStore['locations'],
  param: InferAppLocationFromPath<Origin>
): AppLocationParamStore {
  if (pageKey in (store?.locations || {})) return updateRouteParam(store, pageKey, param);
  else return addRouteParam(store, pageKey, param);
};

export const upsertRouteParamFromPage = function (
  store: AppLocationParamStore,
  pageKey: keyof AppLocationParamStore['locations'],
  page: AppRouterPage
): AppLocationParamStore {
  if (pageKey in (store?.locations || {})) return updateRouteParamFromPage(store, pageKey, page);
  else return addRouteParamFromPage(store, pageKey, page);
};

export const removeRouteParamFromKey = function (
  store: AppLocationParamStore,
  pageKey: keyof AppLocationParamStore['locations']
): AppLocationParamStore {
  if (!(pageKey in (store?.locations || {}))) return store;
  delete store.locations[pageKey];
  return store;
};

// export const setRouteParamsFromRouterStore = function (
//   store: AppLocationParamStore,
//   router: AppRouterStore
// ): AppLocationParamStore {
//   const nextPageKeys = new Set<keyof AppLocationParamStore['locations']>();

//   for (const [routeKey, route] of Object.entries(router?.routes || {}) as [
//     keyof AppLocationParamStore['locations'],
//     AppRouterRoute
//   ][]) {
//     nextPageKeys.add(routeKey);
//     store = upsertRouteParamFromRoute(store, routeKey, route);
//   }

//   for (const routeKey in store.locations || {}) {
//     if (!nextPageKeys.has(routeKey)) {
//       store = removeRouteParamFromKey(store, routeKey);
//     }
//   }

//   return store;
// };

// export const removeRouteParamFromKey = function (
//   store: AppLocationParamStore,
//   pageKey: keyof AppLocationParamStore['locations']
// ): AppLocationParamStore {
//   for (const [routeKey, route] of Object.entries(store?.locations || {})) {
//     if (param?.digest && param?.digest === route?.digest) delete store.locations[routeKey];
//     else if (param?.route && param?.route === route?.route) delete store.locations[routeKey];
//   }
//   return store;
// };

// export const removeRouteParam = function <const Origin extends AppRoute['path']>(
//   store: AppLocationParamStore,
//   param: InferAppLocationFromPath<Origin>
// ): AppLocationParamStore {
//   for (const [routeKey, route] of Object.entries(store?.locations || {})) {
//     if (param?.digest && param?.digest === route?.digest) delete store.locations[routeKey];
//     else if (param?.route && param?.route === route?.route) delete store.locations[routeKey];
//   }
//   return store;
// };

//*****************************************************************************************
// Route Values
//*****************************************************************************************

// export const getDefaultRouteValues = function <
//   const Origin extends AppRoute['path']
// >(): InferAppRouteParamFromPath<Origin> {
//   return {
//     path: null,
//     params: null,
//     search: null,
//     hash: null,
//     state: null,
//     transient: null
//   } as InferAppRouteParamFromPath<Origin>;
// };

// export const sanitizeRouteValues = function <const Origin extends AppRoute['path']>(
//   store: AppLocationParamStore,
//   values: InferAppRouteParamFromPath<Origin>
// ): InferAppRouteParamFromPath<Origin> {
//   const param = getRouteParamFromValues(store, values);
//   if (!param?.route) return getDefaultRouteValues<Origin>();

//   return {
//     route: param.route,
//     path: param.path ?? null,
//     search: param.search && 'toObject' in param.search ? (param.search as any).toObject() : null,
//     hash: param.hash ?? null,
//     state: param.state ?? null,
//     transient: param.transient ?? null
//   } as InferAppRouteParamFromPath<Origin>;
// };

// export const findRouteValuesFromKey = function <const Origin extends AppRoute['path']>(
//   store: AppLocationParamStore,
//   routeKey: keyof AppRouterState['routes']
// ): InferAppRouteParamFromPath<Origin> {
//   const param = getRouteParamFromKey(store, routeKey);
//   if (!param?.route) return getDefaultRouteValues<Origin>();

//   return {
//     route: param?.route || null,
//     path: param?.path || null,
//     search: !param.search ? null : param.searchSnapshot.toObject(),
//     hash: param?.hash || null,
//     state: param?.state || null,
//     transient: param?.transient || null
//   } as InferAppRouteParamFromPath<Origin>;
// };

// export const getRouteValuesFromParam = function <const Origin extends AppRoute['path']>(
//   store: AppLocationParamStore,
//   param: InferAppLocationFromPath<Origin>
// ): InferAppRouteParamFromPath<Origin> {
//   if (!param?.route || !(param.path in store.routes)) return getDefaultRouteValues<Origin>();

//   return {
//     route: param.route,
//     path: param.path,
//     search: !param.search ? null : param.searchSnapshot.toObject(),
//     hash: param.hash,
//     state: param.state,
//     transient: param.transient
//   } as InferAppRouteParamFromPath<Origin>;
// };

// export const getRouteValuesFromRouteLocation = function <const Origin extends AppRoute['path']>(
//   store: AppLocationParamStore,
//   route: AppRouterRoute
// ): InferAppRouteParamFromPath<Origin> {
//   const appRoute = findAppRouteFromRoute(store, route);
//   if (!appRoute?.route || !route?.href) return getDefaultRouteValues<Origin>();

//   const param = getRouteParamFromRoute(store, route);

//   return {
//     route: param.route,
//     path: param.path,
//     search: !param.search ? null : param.searchSnapshot.toObject(),
//     hash: param.hash,
//     state: param.state,
//     transient: param.transient
//   } as InferAppRouteParamFromPath<Origin>;
// };

//*****************************************************************************************
// Route Location
//*****************************************************************************************

// export const getDefaultLocation = function (): Location {
//   return { key: '', pathname: '', search: '', hash: '', state: undefined };
// };

// export const getLocationPathnameFromParam = function <const Origin extends AppRoute['path']>(
//   route: InferAppRouteFromPath<Origin>,
//   param: InferAppLocationFromPath<Origin>
// ): Location['pathname'] {
//   if (param?.route == null) return '';

//   if (route?.path && param?.path) {
//     return route.path.stringify(param.path as never);
//   }

//   if (param?.path) {
//     return Object.entries(param.path).reduce(
//       (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(String(value))),
//       param.route
//     );
//   }

//   return param?.route;
// };

// export const getLocationSearchFromParam = function <const Origin extends AppRoute['path']>(
//   route: InferAppRouteFromPath<Origin>,
//   param: InferAppLocationFromPath<Origin>
// ): Location['search'] {
//   const delta = !route?.search || route?.search == null ? undefined : route.search.delta(param.search as never);
//   return !delta ? '' : delta.toLocationSearch();
// };

// export const getLocationHashFromParam = function <const Origin extends AppRoute['path']>(
//   route: InferAppRouteFromPath<Origin>,
//   param: InferAppLocationFromPath<Origin>
// ): Location['hash'] {
//   if (param?.hash == null) return '';

//   const resolvedHash = !route?.hash ? '' : route.hash.stringify(param.hash as never);
//   return resolvedHash.startsWith('#') ? resolvedHash.slice(1) : resolvedHash;
// };

// export const getLocationStateFromParam = function <const Origin extends AppRoute['path']>(
//   route: InferAppRouteFromPath<Origin>,
//   param: InferAppLocationFromPath<Origin>
// ): AppRouterRoute['state'] {
//   if (!route?.state) return null;
//   return route.state.delta(param.state as never);
// };

// export const getLocationTransientFromParam = function <const Origin extends AppRoute['path']>(
//   route: InferAppRouteFromPath<Origin>,
//   param: InferAppLocationFromPath<Origin>
// ): AppRouterRoute['transient'] {
//   if (!route?.transient) return null;
//   return route.transient.delta(param.transient as never);
// };

// export const getLocationFromParam = function <const Origin extends AppRoute['path']>(
//   store: AppLocationParamStore,
//   param: InferAppLocationFromPath<Origin>
// ): Location {
//   const route = findAppRouteFromParam<Origin>(store, param);
//   if (!route?.route) return getDefaultLocation();

//   return {
//     key: 'default',
//     pathname: getLocationPathnameFromParam(route, param),
//     search: getLocationSearchFromParam(route, param),
//     hash: getLocationHashFromParam(route, param),
//     state: getLocationStateFromParam(route, param)
//   };
// };

// export const getLocationFromRoute = function (route: AppRouterRoute): Location {
//   const url = new URL(route.href, 'http://localhost');
//   return {
//     key: 'default',
//     pathname: url.pathname,
//     search: url.search,
//     hash: url.hash,
//     state: route?.state ?? null
//   };
// };

//*****************************************************************************************
// External Href
//*****************************************************************************************

export const getExternalHrefFromPage = function (
  store: AppLocationParamStore,
  page: AppRouterPage
): AppRouterPage['href'] {
  const next = sanitizePage(store, page);
  return !next?.href ? null : `/v1#${next.href}`;
};

export const getExternalHrefFromParam = function <const Origin extends AppRoute['path']>(
  store: AppLocationParamStore,
  param: InferAppLocationFromPath<Origin>
): AppRouterPage['href'] {
  const location = getPageFromParam(store, param);
  return !location?.href ? null : `/v1#${location.href}`;
};

//*****************************************************************************************
// URL Decoding
//*****************************************************************************************

// export const parseRouteLocationFromHashFragment = function (fragment: string): AppRouterRoute | null {
//   if (!fragment) return null;

//   const hashIndex = fragment.indexOf('#');
//   if (hashIndex === -1) return { digest: hashObject({ href: fragment, state: null }), href: fragment, state: null };

//   const pathname = fragment.slice(0, hashIndex);
//   const hashAndSearch = fragment.slice(hashIndex + 1);
//   const searchIndex = hashAndSearch.indexOf('?');

//   const hash = searchIndex === -1 ? hashAndSearch : hashAndSearch.slice(0, searchIndex);
//   const search = searchIndex === -1 ? '' : hashAndSearch.slice(searchIndex);

//   try {
//     const href = `${pathname}${search}${hash ? `#${decodeURIComponent(hash)}` : ''}`;
//     return {
//       digest: hashObject({ href, state: null }),
//       href,
//       state: null
//     };
//   } catch {
//     return null;
//   }
// };

// export const getRouteLocationsFromLegacyURL = (
//   store: AppLocationParamStore,
//   url: Location<AppRouterState>
// ): AppRouterRoute[] => {
//   if (!url?.pathname || url.pathname === '/v1') return [];

//   const pathname = url.pathname === '/' ? '/submit' : url.pathname;
//   const href = `${pathname}${url.search || ''}${url.hash || ''}`;
//   const route: AppRouterRoute = {
//     digest: hashObject({ href, state: url.state ?? null }),
//     href,
//     state: url.state ?? null
//   };

//   const normalized = sanitizeRoute(store, route);
//   return normalized?.href ? [normalized] : [];
// };

// export const getRouteLocationsFromURLHash = (
//   store: AppLocationParamStore,
//   url: Location<AppRouterState>
// ): AppRouterRoute[] => {
//   if (url?.pathname !== '/v1' || !url?.hash) return [];

//   const hashFragment = url.hash.slice(1);
//   if (!hashFragment) return [];

//   return hashFragment
//     .split('#/')
//     .map((fragment, index) => {
//       const route = parseRouteLocationFromHashFragment(`${index === 0 ? '' : '/'}${fragment}`);
//       return sanitizeRoute(store, route);
//     })
//     .filter((parsedRoute): parsedRoute is AppRouterRoute => !!parsedRoute?.href);
// };

//*****************************************************************************************
// Location Store
//*****************************************************************************************

export const getAppLocationParamStateFromApi = (api: StoreApi<AppLocationParamStore>): AppLocationParamStore => {
  return api?.getState() || getDefaultLocationParamStore();
};

export const syncRouteParamsFromRouter = function (
  store: AppLocationParamStore,
  router: AppRouterStore
): AppLocationParamStore {
  for (const pageKey of Object.keys(store?.locations || {})) {
    if (!(pageKey in (router?.pages || {}))) {
      store = removeRouteParamFromKey(store, pageKey);
    }
  }

  for (const [pageKey, route] of Object.entries(router?.pages || {})) {
    store = upsertRouteParamFromPage(store, pageKey, route);
  }

  return store;
};

//*****************************************************************************************
// Media Query Evaluation
//*****************************************************************************************

export type MediaQueryCondition = {
  minWidth?: number;
  maxWidth?: number;
};

/**
 * @name parseMediaQuery
 * @description Pre-parses a CSS media query string into condition objects for efficient repeated evaluation.
 * Supports patterns like "(min-width:600px)", "(max-width:959px)", and compound queries with "and".
 * Parsing is done once, allowing evaluateMediaQuery to run efficiently on every resize event.
 * @param query - Media query string to parse
 * @returns Array of conditions, or empty array if parsing fails
 */
export function parseMediaQuery(query: string): MediaQueryCondition[] {
  const conditionStrings = query.match(/\([^)]+\)/g);
  if (!conditionStrings) return [];

  return conditionStrings.map(condition => {
    const result: MediaQueryCondition = {};
    const minWidthMatch = condition.match(/min-width:\s*(\d+)px/);
    const maxWidthMatch = condition.match(/max-width:\s*(\d+)px/);

    if (minWidthMatch?.[1]) {
      result.minWidth = parseInt(minWidthMatch[1], 10);
    }
    if (maxWidthMatch?.[1]) {
      result.maxWidth = parseInt(maxWidthMatch[1], 10);
    }

    return result;
  });
}

/**
 * @name evaluateMediaQuery
 * @description Evaluates pre-parsed media query conditions against a given width.
 * All conditions must pass (AND logic). This function is very fast since conditions are pre-parsed.
 * @param conditions - Pre-parsed conditions from parseMediaQuery
 * @param width - Container width in pixels to test against
 * @returns Boolean indicating if the query matches the width
 */
export function evaluateMediaQuery(conditions: MediaQueryCondition[], width: number): boolean {
  return conditions.every(condition => {
    if (condition.minWidth !== undefined && width < condition.minWidth) return false;
    if (condition.maxWidth !== undefined && width > condition.maxWidth) return false;
    return true;
  });
}
