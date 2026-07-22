import type { AppRouterPage, AppRouterState, AppRouterStore, InferAppNavigationInputFromPath } from 'core/router';
import { getDefaultRouterPage, getNotFoundRouterPage, getPageDigestFromPage } from 'core/router/router.utils';
import type {
  AppLocationParamStore,
  InferAppRouteParamFromPath,
  InferAppRouteSpecFromPath,
  InferAppRouteValuesFromPath
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
// Route Specs
//*****************************************************************************************

export const getDefaultRouteSpec = function <
  const Origin extends AppRoute['route']
>(): InferAppRouteSpecFromPath<Origin> {
  return {
    title: { key: null, ns: null },
    icon: { primary: null, secondary: null },
    element: null,

    route: null,
    path: createPathParamsCodec(null)(() => null),
    search: new SearchParamEngine<SearchParamBlueprintMap>(null),
    hash: createHashParamCodec()(() => null),

    disabled: true,
    forbidden: true,
    loader: false
  } as InferAppRouteSpecFromPath<Origin>;
};

export const findRouteSpecFromPath = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  path: Origin
): InferAppRouteSpecFromPath<Origin> {
  return (store?.specs?.[path] ?? getDefaultRouteSpec()) as InferAppRouteSpecFromPath<Origin>;
};

export const findRouteSpecFromKey = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  pageKey: keyof AppRouterState['pages']
): InferAppRouteSpecFromPath<Origin> {
  const params = store?.params?.[pageKey];
  return !params?.route ? getDefaultRouteSpec() : findRouteSpecFromPath(store, params.route as Origin);
};

export const findRouteSpecFromPage = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  page: AppRouterPage
): InferAppRouteSpecFromPath<Origin> {
  if (!page?.href) return getDefaultRouteSpec();
  const { pathname } = new URL(page.href, 'http://localhost');
  const found = Object.values(store?.specs || {}).find(
    r => !!r?.route && !!matchPath({ path: r.route, end: true }, pathname)
  );
  return (found ?? getDefaultRouteSpec()) as InferAppRouteSpecFromPath<Origin>;
};

export const findRouteSpecFromParam = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  param: InferAppRouteParamFromPath<Origin>
): InferAppRouteSpecFromPath<Origin> {
  return !param?.route ? getDefaultRouteSpec() : findRouteSpecFromPath(store, param.route);
};

// export const findRouteSpecFromValues = function <const Origin extends AppRoute['route']>(
//   store: AppLocationParamStore,
//   values: InferAppRouteValuesFromPath<Origin>
// ): InferAppRouteSpecFromPath<Origin> {
//   return !values?.route ? getDefaultRouteSpec() : findRouteSpecFromPath(store, values.route as Origin);
// };

export const addRouteSpec = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  spec: InferAppRouteValuesFromPath<Origin>
): AppLocationParamStore {
  const route = spec?.route;
  if (!route) return store;

  if (!store.specs) {
    store.specs = {} as AppLocationParamStore['specs'];
  }

  if (route in store.specs) return store;
  store.specs[route] = spec as unknown as AppRoute;
  return store;
};

export const updateRouteSpec = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  spec: InferAppRouteValuesFromPath<Origin>
): AppLocationParamStore {
  const route = spec?.route;
  if (!route || !store.specs || !(route in store.specs)) return store;

  const currentSpec = store.specs[route];
  const nextSpec = spec as unknown as Partial<AppRoute>;

  if ('title' in nextSpec) currentSpec.title = nextSpec.title;
  if ('icon' in nextSpec) currentSpec.icon = nextSpec.icon;
  if ('element' in nextSpec) currentSpec.element = nextSpec.element;

  if ('route' in nextSpec) currentSpec.route = nextSpec.route;
  if ('path' in nextSpec) currentSpec.path = nextSpec.path;
  if ('search' in nextSpec) currentSpec.search = nextSpec.search;
  if ('hash' in nextSpec) currentSpec.hash = nextSpec.hash;

  if ('loader' in nextSpec) currentSpec.loader = nextSpec.loader;
  if ('disabled' in nextSpec) currentSpec.disabled = nextSpec.disabled;
  if ('forbidden' in nextSpec) currentSpec.forbidden = nextSpec.forbidden;
  return store;
};

export const upsertRouteSpec = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  spec: InferAppRouteValuesFromPath<Origin>
): AppLocationParamStore {
  const route = spec?.route;
  if (!route) return store;

  if (store.specs && route in store.specs) return updateRouteSpec(store, spec);
  else return addRouteSpec(store, spec);
};

/**
 * @name removeRouteSpec
 * @description Removes a route spec using a full route spec object.
 * Use this overload when the caller already has a typed spec payload.
 * For key-only workflows (e.g. sync/pruning), use `removeRouteSpecFromKey`.
 */
export const removeRouteSpec = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  spec: InferAppRouteValuesFromPath<Origin>
): AppLocationParamStore {
  const route = spec?.route;
  if (!route || !store.specs || !(route in store.specs)) return store;

  delete store.specs[route];
  return store;
};

/**
 * @name removeRouteSpecFromKey
 * @description Removes a route spec directly by route key.
 * Preferred for reconciliation and bulk sync operations where keys are enumerated.
 */
export const removeRouteSpecFromKey = function (
  store: AppLocationParamStore,
  specKey: keyof AppLocationParamStore['specs']
): AppLocationParamStore {
  if (!store.specs || !(specKey in store.specs)) return store;
  delete store.specs[specKey];
  return store;
};

export const setRouteSpecsFromAppRoutes = function (
  store: AppLocationParamStore,
  routes: AppRoutes
): AppLocationParamStore {
  const nextPageKeys = new Set<keyof AppLocationParamStore['specs']>();

  for (const routeSpec of routes || []) {
    if (!routeSpec?.route) continue;
    nextPageKeys.add(routeSpec.route);
    store = upsertRouteSpec(store, routeSpec as never);
  }

  for (const specKey of Object.keys(store.specs || {}) as (keyof AppLocationParamStore['specs'])[]) {
    if (!nextPageKeys.has(specKey)) {
      store = removeRouteSpecFromKey(store, specKey);
    }
  }

  return store;
};

//*****************************************************************************************
// Router Route
//*****************************************************************************************

export const getLocationPathnameFromParam = function <const Origin extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Origin>,
  param: InferAppRouteParamFromPath<Origin>
): Location['pathname'] {
  if (param?.route == null) return '';

  if (spec?.path && param?.path) {
    return spec.path.stringify(param.path as never);
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

export const getLocationSearchFromParam = function <const Origin extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Origin>,
  param: InferAppRouteParamFromPath<Origin>
): [Location['search'], SearchParamValueMap, SearchParamValueMap] {
  const delta = !spec?.search || spec?.search == null ? undefined : spec.search.delta(param.search as never);
  return !delta ? [null, null, null] : [delta.toLocationSearch(), delta.toLocationState(), delta.toLocationTransient()];
};

export const getLocationHashFromParam = function <const Origin extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Origin>,
  param: InferAppRouteParamFromPath<Origin>
): Location['hash'] {
  if (param?.hash == null) return '';

  const resolvedHash = !spec?.hash ? '' : spec.hash.stringify(param.hash as never);
  return resolvedHash.startsWith('#') ? resolvedHash.slice(1) : resolvedHash;
};

export const getPageFromParam = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  param: InferAppRouteParamFromPath<Origin>
): AppRouterPage {
  if (!param?.route)
    return getNotFoundRouterPage({ route: param?.route, path: param?.path, search: param?.search, hash: param?.hash });

  const spec = findRouteSpecFromParam<Origin>(store, param);
  if (!spec?.route)
    return getNotFoundRouterPage({ route: param?.route, path: param?.path, search: param?.search, hash: param?.hash });

  const pathname = getLocationPathnameFromParam(spec, param);
  const [search, state, transient] = getLocationSearchFromParam(spec, param);
  const hash = getLocationHashFromParam(spec, param);

  const route = getDefaultRouterPage({
    href: `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`,
    state,
    transient
  });

  route.digest = getPageDigestFromPage(route);
  return route;
};

export const getPageFromLocation = function (
  store: AppLocationParamStore,
  location: ReactRouterLocation
): AppRouterPage {
  if (!location?.pathname) return getNotFoundRouterPage(location);

  const href = `${location.pathname}${location.search || ''}${location.hash || ''}`;
  const route = getDefaultRouterPage({ href, state: location.state });
  const spec = findRouteSpecFromPage(store, route);
  if (!spec?.route)
    return getNotFoundRouterPage({ href: route?.href, state: route?.state, transient: route?.transient });

  route.digest = getPageDigestFromPage(route);
  return route;
};

export const getPageFromURL = function (store: AppLocationParamStore, url: string): AppRouterPage {
  if (!url?.trim()) return getNotFoundRouterPage({ url });

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
    return getNotFoundRouterPage({ url });
  }
};

export const isNavigationInputRouteParam = function <const Origin extends AppRoute['route']>(
  input: InferAppNavigationInputFromPath<Origin>
): input is InferAppRouteValuesFromPath<Origin> {
  if (typeof input !== 'object' || input == null) return false;
  if (!('route' in input)) return false;
  return typeof input.route === 'string';
};

export const isNavigationInputLocation = function <const Origin extends AppRoute['route']>(
  input: InferAppNavigationInputFromPath<Origin>
): input is ReactRouterLocation {
  if (typeof input !== 'object' || input == null) return false;
  if (!('pathname' in input) || !('search' in input) || !('hash' in input)) return false;
  return typeof input.pathname === 'string' && typeof input.search === 'string' && typeof input.hash === 'string';
};

export const isNavigationInputString = function <const Origin extends AppRoute['route']>(
  input: InferAppNavigationInputFromPath<Origin>
): input is string {
  return typeof input === 'string';
};

export const getPageFromInput = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  input: InferAppNavigationInputFromPath<Origin>
): AppRouterPage {
  if (isNavigationInputString<Origin>(input)) return getPageFromURL(store, input);
  else if (isNavigationInputLocation<Origin>(input)) return getPageFromLocation(store, input);
  else if (isNavigationInputRouteParam<Origin>(input)) return getPageFromParam<Origin>(store, input as never);
  else return getNotFoundRouterPage(input);
};

// export const getRouteFromLocation = function (location: Location): AppRouterRoute {
//   const href = `${location.pathname}${location.search ? `?${location.search}` : ''}${location.hash ? `#${location.hash}` : ''}`;
//   const state = location.state as never;
//   const route = getDefaultRouterRoute({ href, state });
//   route.digest = getPageDigestFromPage(route);
//   return route;
// };

// export const getRouteFromValues = function <const Origin extends AppRoute['route']>(
//   store: AppLocationParamStore,
//   values: InferAppRouteValuesFromPath<Origin>
// ): AppRouterRoute {
//   const param = getRouteParamFromValues(store, values);
//   return !param?.route ? getDefaultRouterRoute() : getRouteFromParam(store, param);
// };

//*****************************************************************************************
// Route Param
//*****************************************************************************************

export const getDefaultRouteParam = function <const Origin extends AppRoute['route']>(
  param: InferAppRouteParamFromPath<Origin> = null
): InferAppRouteParamFromPath<Origin> {
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

export const getPathParamFromLocation = function <const Origin extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Origin>,
  location: Location
): InferAppRouteParamFromPath<Origin>['path'] {
  return (!spec?.path ? null : spec.path.parse(location)) as InferAppRouteParamFromPath<Origin>['path'];
};

export const getSearchParamFromPage = function <const Origin extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Origin>,
  { href, state, transient }: AppRouterPage
): InferAppRouteParamFromPath<Origin>['search'] {
  return !spec?.search
    ? null
    : (spec.search.fromRoute(href, state, transient).toObject() as InferAppRouteParamFromPath<Origin>['search']);
};

export const getHashParamFromLocation = function <const Origin extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Origin>,
  location: Location
): InferAppRouteParamFromPath<Origin>['hash'] {
  return !spec?.hash ? null : (spec.hash.parse(location) as InferAppRouteParamFromPath<Origin>['hash']);
};

export const getRouteParamFromPage = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  page: AppRouterPage
): InferAppRouteParamFromPath<Origin> {
  const spec = findRouteSpecFromPage<Origin>(store, page);
  if (!spec?.route || !page?.href) return getDefaultRouteParam();

  const location = getLocationFromPage(page);

  return {
    digest: page.digest,
    route: spec.route as never,
    path: getPathParamFromLocation<Origin>(spec, location),
    search: getSearchParamFromPage<Origin>(spec, page),
    hash: getHashParamFromLocation<Origin>(spec, location)
  };
};

export const sanitizePage = function (store: AppLocationParamStore, page: AppRouterPage): AppRouterPage {
  const param = getRouteParamFromPage(store, page);
  return !param?.route
    ? getNotFoundRouterPage({ route: param?.route, path: param?.path, search: param?.search, hash: param?.hash })
    : getPageFromParam(store, param);
};

// export const getRouteParamFromValues = function <const Origin extends AppRoute['route']>(
//   store: AppLocationParamStore,
//   values: InferAppRouteValuesFromPath<Origin>
// ): InferAppRouteParamFromPath<Origin> {
//   const spec = findRouteSpecFromValues(store, values);
//   if (!spec?.route || !values?.route) return getDefaultRouteParam<Origin>();

//   const delta = !spec?.search || values?.search == null ? undefined : spec.search.delta(values.search as never);
//   const hash = values?.hash == null ? '' : String(spec.hash?.stringify?.(values.hash as never) ?? values.hash).trim();
//   const routeState = !spec?.state ? null : spec.state.delta(values.state as never);
//   const searchState = (delta?.toLocationState as (() => unknown) | undefined)?.() ?? null;
//   const next: Location = {
//     key: 'default',
//     pathname: spec.path?.stringify?.(values.path as never) ?? values.route,
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
//     route: spec.route,
//     path: spec.path?.parse?.(next) ?? null,
//     search: spec.search?.fromLocation?.(next) ?? null,
//     hash: getHashParamFromLocation(spec, next),
//     state: getStateParamFromLocation(spec, next),
//     transient: getTransientParamFromValue(spec, values.transient)
//   } as InferAppRouteParamFromPath<Origin>;

//   param.digest = getPageDigestFromPage(getRouteFromLocation(next));

//   return param;
// };

// export const applySearchParamToRouteParam = function <const Origin extends AppRoute['route']>(
//   store: AppLocationParamStore,
//   param: InferAppRouteParamFromPath<Origin>,
//   search: URLSearchParams | InferAppRouteSearchValuesFromPath<Origin>
// ): InferAppRouteParamFromPath<Origin> {
//   const spec = findRouteSpecFromParam<Origin>(store, param);
//   if (!spec?.route || !param?.route) return getDefaultRouteParam<Origin>();

//   param.search = !search ? undefined : (spec.search.delta(search as never) as never);
//   const next = getRouteFromParam(store, param);
//   param.digest = getPageDigestFromPage(next);

//   return param;
// };

// export const sanitizeRouteParam = function <const Origin extends AppRoute['route']>(
//   store: AppLocationParamStore,
//   param: InferAppRouteParamFromPath<Origin>
// ): InferAppRouteParamFromPath<Origin> {
//   const spec = findRouteSpecFromParam(store, param);
//   if (!spec?.route) return getDefaultRouteParam<Origin>();
//   const route = getRouteFromParam(store, param);
//   return getRouteParamFromRoute(store, route);
// };

export const getRouteParamFromKey = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  pageKey: keyof AppRouterState['pages']
): InferAppRouteParamFromPath<Origin> {
  return !(pageKey in (store?.params || {}))
    ? getDefaultRouteParam<Origin>()
    : (store.params[pageKey] as unknown as InferAppRouteParamFromPath<Origin>);
};

export const addRouteParam = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  pageKey: keyof AppLocationParamStore['params'],
  param: InferAppRouteParamFromPath<Origin>
): AppLocationParamStore {
  if (pageKey in (store?.params || {}) || !param?.route) return store;
  store.params[pageKey] = param as unknown as AppLocationParamStore['params'][Origin];
  return store;
};

export const addRouteParamFromPage = function (
  store: AppLocationParamStore,
  pageKey: keyof AppRouterStore['pages'],
  page: AppRouterPage
): AppLocationParamStore {
  return addRouteParam(store, pageKey, getRouteParamFromPage(store, page));
};

export const updateRouteParam = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  pageKey: keyof AppLocationParamStore['params'],
  param: InferAppRouteParamFromPath<Origin>
): AppLocationParamStore {
  if (!(pageKey in (store?.params || {})) || !param?.route) return store;

  if ('digest' in param) store.params[pageKey].digest = param.digest;
  if ('route' in param) store.params[pageKey].route = param.route;
  if ('path' in param) store.params[pageKey].path = param.path;
  if ('search' in param) store.params[pageKey].search = param.search;
  if ('hash' in param) store.params[pageKey].hash = param.hash as never;

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

export const upsertRouteParam = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  pageKey: keyof AppLocationParamStore['params'],
  param: InferAppRouteParamFromPath<Origin>
): AppLocationParamStore {
  if (pageKey in (store?.params || {})) return updateRouteParam(store, pageKey, param);
  else return addRouteParam(store, pageKey, param);
};

export const upsertRouteParamFromPage = function (
  store: AppLocationParamStore,
  pageKey: keyof AppLocationParamStore['params'],
  page: AppRouterPage
): AppLocationParamStore {
  if (pageKey in (store?.params || {})) return updateRouteParamFromPage(store, pageKey, page);
  else return addRouteParamFromPage(store, pageKey, page);
};

export const removeRouteParamFromKey = function (
  store: AppLocationParamStore,
  pageKey: keyof AppLocationParamStore['params']
): AppLocationParamStore {
  if (!(pageKey in (store?.params || {}))) return store;
  delete store.params[pageKey];
  return store;
};

// export const setRouteParamsFromRouterStore = function (
//   store: AppLocationParamStore,
//   router: AppRouterStore
// ): AppLocationParamStore {
//   const nextPageKeys = new Set<keyof AppLocationParamStore['params']>();

//   for (const [routeKey, route] of Object.entries(router?.routes || {}) as [
//     keyof AppLocationParamStore['params'],
//     AppRouterRoute
//   ][]) {
//     nextPageKeys.add(routeKey);
//     store = upsertRouteParamFromRoute(store, routeKey, route);
//   }

//   for (const routeKey in store.params || {}) {
//     if (!nextPageKeys.has(routeKey)) {
//       store = removeRouteParamFromKey(store, routeKey);
//     }
//   }

//   return store;
// };

// export const removeRouteParamFromKey = function (
//   store: AppLocationParamStore,
//   pageKey: keyof AppLocationParamStore['params']
// ): AppLocationParamStore {
//   for (const [routeKey, route] of Object.entries(store?.params || {})) {
//     if (param?.digest && param?.digest === route?.digest) delete store.params[routeKey];
//     else if (param?.route && param?.route === route?.route) delete store.params[routeKey];
//   }
//   return store;
// };

// export const removeRouteParam = function <const Origin extends AppRoute['route']>(
//   store: AppLocationParamStore,
//   param: InferAppRouteParamFromPath<Origin>
// ): AppLocationParamStore {
//   for (const [routeKey, route] of Object.entries(store?.params || {})) {
//     if (param?.digest && param?.digest === route?.digest) delete store.params[routeKey];
//     else if (param?.route && param?.route === route?.route) delete store.params[routeKey];
//   }
//   return store;
// };

//*****************************************************************************************
// Route Values
//*****************************************************************************************

// export const getDefaultRouteValues = function <
//   const Origin extends AppRoute['route']
// >(): InferAppRouteValuesFromPath<Origin> {
//   return {
//     path: null,
//     params: null,
//     search: null,
//     hash: null,
//     state: null,
//     transient: null
//   } as InferAppRouteValuesFromPath<Origin>;
// };

// export const sanitizeRouteValues = function <const Origin extends AppRoute['route']>(
//   store: AppLocationParamStore,
//   values: InferAppRouteValuesFromPath<Origin>
// ): InferAppRouteValuesFromPath<Origin> {
//   const param = getRouteParamFromValues(store, values);
//   if (!param?.route) return getDefaultRouteValues<Origin>();

//   return {
//     route: param.route,
//     path: param.path ?? null,
//     search: param.search && 'toObject' in param.search ? (param.search as any).toObject() : null,
//     hash: param.hash ?? null,
//     state: param.state ?? null,
//     transient: param.transient ?? null
//   } as InferAppRouteValuesFromPath<Origin>;
// };

// export const findRouteValuesFromKey = function <const Origin extends AppRoute['route']>(
//   store: AppLocationParamStore,
//   routeKey: keyof AppRouterState['routes']
// ): InferAppRouteValuesFromPath<Origin> {
//   const param = getRouteParamFromKey(store, routeKey);
//   if (!param?.route) return getDefaultRouteValues<Origin>();

//   return {
//     route: param?.route || null,
//     path: param?.path || null,
//     search: !param.search ? null : param.searchSnapshot.toObject(),
//     hash: param?.hash || null,
//     state: param?.state || null,
//     transient: param?.transient || null
//   } as InferAppRouteValuesFromPath<Origin>;
// };

// export const getRouteValuesFromParam = function <const Origin extends AppRoute['route']>(
//   store: AppLocationParamStore,
//   param: InferAppRouteParamFromPath<Origin>
// ): InferAppRouteValuesFromPath<Origin> {
//   if (!param?.route || !(param.route in store.specs)) return getDefaultRouteValues<Origin>();

//   return {
//     route: param.route,
//     path: param.path,
//     search: !param.search ? null : param.searchSnapshot.toObject(),
//     hash: param.hash,
//     state: param.state,
//     transient: param.transient
//   } as InferAppRouteValuesFromPath<Origin>;
// };

// export const getRouteValuesFromRouteLocation = function <const Origin extends AppRoute['route']>(
//   store: AppLocationParamStore,
//   route: AppRouterRoute
// ): InferAppRouteValuesFromPath<Origin> {
//   const spec = findRouteSpecFromRoute(store, route);
//   if (!spec?.route || !route?.href) return getDefaultRouteValues<Origin>();

//   const param = getRouteParamFromRoute(store, route);

//   return {
//     route: param.route,
//     path: param.path,
//     search: !param.search ? null : param.searchSnapshot.toObject(),
//     hash: param.hash,
//     state: param.state,
//     transient: param.transient
//   } as InferAppRouteValuesFromPath<Origin>;
// };

//*****************************************************************************************
// Route Location
//*****************************************************************************************

// export const getDefaultLocation = function (): Location {
//   return { key: '', pathname: '', search: '', hash: '', state: undefined };
// };

// export const getLocationPathnameFromParam = function <const Origin extends AppRoute['route']>(
//   spec: InferAppRouteSpecFromPath<Origin>,
//   param: InferAppRouteParamFromPath<Origin>
// ): Location['pathname'] {
//   if (param?.route == null) return '';

//   if (spec?.path && param?.path) {
//     return spec.path.stringify(param.path as never);
//   }

//   if (param?.path) {
//     return Object.entries(param.path).reduce(
//       (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(String(value))),
//       param.route
//     );
//   }

//   return param?.route;
// };

// export const getLocationSearchFromParam = function <const Origin extends AppRoute['route']>(
//   spec: InferAppRouteSpecFromPath<Origin>,
//   param: InferAppRouteParamFromPath<Origin>
// ): Location['search'] {
//   const delta = !spec?.search || spec?.search == null ? undefined : spec.search.delta(param.search as never);
//   return !delta ? '' : delta.toLocationSearch();
// };

// export const getLocationHashFromParam = function <const Origin extends AppRoute['route']>(
//   spec: InferAppRouteSpecFromPath<Origin>,
//   param: InferAppRouteParamFromPath<Origin>
// ): Location['hash'] {
//   if (param?.hash == null) return '';

//   const resolvedHash = !spec?.hash ? '' : spec.hash.stringify(param.hash as never);
//   return resolvedHash.startsWith('#') ? resolvedHash.slice(1) : resolvedHash;
// };

// export const getLocationStateFromParam = function <const Origin extends AppRoute['route']>(
//   spec: InferAppRouteSpecFromPath<Origin>,
//   param: InferAppRouteParamFromPath<Origin>
// ): AppRouterRoute['state'] {
//   if (!spec?.state) return null;
//   return spec.state.delta(param.state as never);
// };

// export const getLocationTransientFromParam = function <const Origin extends AppRoute['route']>(
//   spec: InferAppRouteSpecFromPath<Origin>,
//   param: InferAppRouteParamFromPath<Origin>
// ): AppRouterRoute['transient'] {
//   if (!spec?.transient) return null;
//   return spec.transient.delta(param.transient as never);
// };

// export const getLocationFromParam = function <const Origin extends AppRoute['route']>(
//   store: AppLocationParamStore,
//   param: InferAppRouteParamFromPath<Origin>
// ): Location {
//   const spec = findRouteSpecFromParam<Origin>(store, param);
//   if (!spec?.route) return getDefaultLocation();

//   return {
//     key: 'default',
//     pathname: getLocationPathnameFromParam(spec, param),
//     search: getLocationSearchFromParam(spec, param),
//     hash: getLocationHashFromParam(spec, param),
//     state: getLocationStateFromParam(spec, param)
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

export const getExternalHrefFromParam = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  param: InferAppRouteParamFromPath<Origin>
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
  for (const pageKey of Object.keys(store?.params || {})) {
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
