import type { AppRouterRoute, AppRouterState, AppRouterStore } from 'core/router';
import { getDefaultRouterRoute, getRouteDigestFromRoute } from 'core/router';
import type {
  AppLocationParamStore,
  InferAppRouteParamFromPath,
  InferAppRouteSearchValuesFromPath,
  InferAppRouteSpecFromPath,
  InferAppRouteValuesFromPath
} from 'core/routes';
import { getDefaultLocationParamStore } from 'core/routes';
import { createHashParamCodec } from 'features/hash-params';
import { createPathParamsCodec } from 'features/path-params';
import type { SearchParamBlueprintMap } from 'features/search-params';
import { SearchParamEngine } from 'features/search-params';
import { createStateParamCodec, mergeStateParamValues } from 'features/state-params';
import type { Location } from 'react-router';
import { matchPath } from 'react-router';
import { hashObject } from 'shared/utils/app.utils';
import type { StoreApi } from 'zustand/vanilla';

//*****************************************************************************************
// Route Specs
//*****************************************************************************************

export const getDefaultRouteSpec = function <
  const Origin extends AppRoute['route']
>(): InferAppRouteSpecFromPath<Origin> {
  return {
    element: null,
    title: null,
    icon: null,
    component: null,

    route: null,
    path: createPathParamsCodec(null)(() => null),
    search: new SearchParamEngine<SearchParamBlueprintMap>(null),
    hash: createHashParamCodec()(() => null),
    state: createStateParamCodec(() => null),
    transient: createStateParamCodec(() => null),

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
  routeKey: keyof AppRouterState['routes']
): InferAppRouteSpecFromPath<Origin> {
  const params = store?.params?.[routeKey];
  return !params?.route ? getDefaultRouteSpec() : findRouteSpecFromPath(store, params.route as Origin);
};

export const findRouteSpecFromRoute = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  route: AppRouterRoute
): InferAppRouteSpecFromPath<Origin> {
  if (!route?.href) return getDefaultRouteSpec();
  const { pathname } = new URL(route.href, 'http://localhost');
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

export const findRouteSpecFromValues = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  values: InferAppRouteValuesFromPath<Origin>
): InferAppRouteSpecFromPath<Origin> {
  return !values?.route ? getDefaultRouteSpec() : findRouteSpecFromPath(store, values.route as Origin);
};

//*****************************************************************************************
// Route Location
//*****************************************************************************************

export const getDefaultLocation = function (): Location {
  return { key: '', pathname: '', search: '', hash: '', state: undefined };
};

export const getLocationPathnameFromParam = function <const Origin extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Origin>,
  param: InferAppRouteParamFromPath<Origin>
): Location['pathname'] {
  if (param?.route == null) return '';

  if (spec?.path && param?.path) {
    return spec.path.stringify(param.path as never);
  }

  if (param?.path) {
    return Object.entries(param.path).reduce(
      (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(String(value))),
      param.route
    );
  }

  return param?.route;
};

export const getLocationSearchFromParam = function <const Origin extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Origin>,
  param: InferAppRouteParamFromPath<Origin>
): Location['search'] {
  const delta = !spec?.search || spec?.search == null ? undefined : spec.search.delta(param.search as never);
  return !delta ? '' : delta.toLocationSearch();
};

export const getLocationHashFromParam = function <const Origin extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Origin>,
  param: InferAppRouteParamFromPath<Origin>
): Location['hash'] {
  if (param?.hash == null) return '';

  const resolvedHash = !spec?.hash ? '' : spec.hash.stringify(param.hash as never);
  return resolvedHash.startsWith('#') ? resolvedHash.slice(1) : resolvedHash;
};

export const getLocationStateFromParam = function <const Origin extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Origin>,
  param: InferAppRouteParamFromPath<Origin>
): AppRouterRoute['state'] {
  if (!spec?.state) return null;
  return spec.state.delta(param.state as never);
};

export const getLocationTransientFromParam = function <const Origin extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Origin>,
  param: InferAppRouteParamFromPath<Origin>
): AppRouterRoute['transient'] {
  if (!spec?.transient) return null;
  return spec.transient.delta(param.transient as never);
};

export const getLocationFromParam = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  param: InferAppRouteParamFromPath<Origin>
): Location {
  const spec = findRouteSpecFromParam<Origin>(store, param);
  if (!spec?.route) return getDefaultLocation();

  return {
    key: 'default',
    pathname: getLocationPathnameFromParam(spec, param),
    search: getLocationSearchFromParam(spec, param),
    hash: getLocationHashFromParam(spec, param),
    state: getLocationStateFromParam(spec, param)
  };
};

export const getLocationFromRoute = function (route: AppRouterRoute): Location {
  const url = new URL(route.href, 'http://localhost');
  return {
    key: 'default',
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    state: route?.state ?? null
  };
};

//*****************************************************************************************
// Router Route
//*****************************************************************************************

export const getRouteFromLocation = function (location: Location): AppRouterRoute {
  const href = `${location.pathname}${location.search ? `?${location.search}` : ''}${location.hash ? `#${location.hash}` : ''}`;
  const state = location.state as never;
  return { digest: getRouteDigestFromRoute({ href, state }), href, state: state };
};

export const getRouteFromParam = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  param: InferAppRouteParamFromPath<Origin>
): AppRouterRoute {
  if (!param?.route) return getDefaultRouterRoute();

  const spec = findRouteSpecFromParam<Origin>(store, param);
  if (!spec?.route) return getDefaultRouterRoute();

  const route = getLocationFromParam(store, param);
  const href = `${route.pathname}${route.search ? `?${route.search}` : ''}${route.hash ? `#${route.hash}` : ''}`;

  return {
    digest: hashObject({ href, state: route.state || {} }),
    href,
    state: route.state
  };
};

export const getRouteFromValues = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  values: InferAppRouteValuesFromPath<Origin>
): AppRouterRoute {
  const param = getRouteParamFromValues(store, values);
  return !param?.route ? getDefaultRouterRoute() : getRouteFromParam(store, param);
};

export const sanitizeRoute = function (store: AppLocationParamStore, route: AppRouterRoute): AppRouterRoute {
  const param = getRouteParamFromRoute(store, route);
  return !param?.route ? getDefaultRouterRoute() : getRouteFromParam(store, param);
};

//*****************************************************************************************
// External Href
//*****************************************************************************************

export const getExternalHrefFromRoute = function (
  store: AppLocationParamStore,
  route: AppRouterRoute
): AppRouterRoute['href'] {
  const next = sanitizeRoute(store, route);
  return !next?.href ? null : `/v1#${next.href}`;
};

export const getExternalHrefFromParam = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  param: InferAppRouteParamFromPath<Origin>
): AppRouterRoute['href'] {
  const location = getRouteFromParam(store, param);
  return !location?.href ? null : `/v1#${location.href}`;
};

//*****************************************************************************************
// Route Param
//*****************************************************************************************

export const getDefaultRouteParam = function <const Origin extends AppRoute['route']>() {
  return {
    digest: '',
    route: null,
    path: null,
    search: null,
    hash: null,
    state: null,
    transient: null
  } as InferAppRouteParamFromPath<Origin>;
};

export const findRouteParamFromKey = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppRouterState['routes']
): InferAppRouteParamFromPath<Origin> {
  return !(routeKey in (store?.params || {}))
    ? getDefaultRouteParam<Origin>()
    : (store.params[routeKey] as unknown as InferAppRouteParamFromPath<Origin>);
};

export const getPathParamFromLocation = function <const Origin extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Origin>,
  location: Location
): InferAppRouteParamFromPath<Origin>['path'] {
  return (!spec?.path ? null : spec.path.parse(location)) as InferAppRouteParamFromPath<Origin>['path'];
};

export const getSearchSnapshotFromLocation = function <const Origin extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Origin>,
  location: Location
): InferAppRouteParamFromPath<Origin>['searchSnapshot'] {
  return (
    !spec?.search ? spec.search.fromLocation(location) : spec.search.fromLocation(location)
  ) as InferAppRouteParamFromPath<Origin>['searchSnapshot'];
};

export const getHashParamFromLocation = function <const Origin extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Origin>,
  location: Location
): InferAppRouteParamFromPath<Origin>['hash'] {
  if (!spec?.hash) {
    return null as InferAppRouteParamFromPath<Origin>['hash'];
  }

  return (spec.hash.parse(location) ?? null) as InferAppRouteParamFromPath<Origin>['hash'];
};

export const getStateParamFromLocation = function <const Origin extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Origin>,
  location: Location
): InferAppRouteParamFromPath<Origin>['state'] {
  if (!spec?.state) {
    return null as InferAppRouteParamFromPath<Origin>['state'];
  }

  return spec.state.full(location) as InferAppRouteParamFromPath<Origin>['state'];
};

export const getTransientParamFromValue = function <const Origin extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Origin>,
  value: unknown
): InferAppRouteParamFromPath<Origin>['transient'] {
  if (!spec?.transient) {
    return null as InferAppRouteParamFromPath<Origin>['transient'];
  }

  return spec.transient.full({ state: value } as Location) as InferAppRouteParamFromPath<Origin>['transient'];
};

export const getRouteParamFromRoute = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  route: AppRouterRoute
): InferAppRouteParamFromPath<Origin> {
  const spec = findRouteSpecFromRoute(store, route);
  if (!spec?.route || !route?.href) return getDefaultRouteParam();

  const location = getLocationFromRoute(route);
  const searchSnapshot = getSearchSnapshotFromLocation(spec, location);

  return {
    digest: getRouteDigestFromRoute(route),
    route: spec.route,
    path: getPathParamFromLocation(spec, location),
    search: searchSnapshot.toObject(),
    searchSnapshot: searchSnapshot,
    hash: getHashParamFromLocation(spec, location),
    state: getStateParamFromLocation(spec, location),
    transient: getTransientParamFromValue(spec, undefined)
  } as unknown as InferAppRouteParamFromPath<Origin>;
};

export const getRouteParamFromValues = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  values: InferAppRouteValuesFromPath<Origin>
): InferAppRouteParamFromPath<Origin> {
  const spec = findRouteSpecFromValues(store, values);
  if (!spec?.route || !values?.route) return getDefaultRouteParam<Origin>();

  const delta = !spec?.search || values?.search == null ? undefined : spec.search.delta(values.search as never);
  const hash = values?.hash == null ? '' : String(spec.hash?.stringify?.(values.hash as never) ?? values.hash).trim();
  const routeState = !spec?.state ? null : spec.state.delta(values.state as never);
  const searchState = (delta?.toLocationState as (() => unknown) | undefined)?.() ?? null;
  const next: Location = {
    key: 'default',
    pathname: spec.path?.stringify?.(values.path as never) ?? values.route,
    search: delta ? `?${delta.toLocationSearch()}` : '',
    hash: !hash ? '' : hash.startsWith('#') ? hash : `#${hash}`,
    state:
      routeState == null
        ? searchState
        : searchState == null
          ? routeState
          : mergeStateParamValues(routeState as Record<string, never>, searchState)
  };

  const param = {
    ...getDefaultRouteParam(),
    route: spec.route,
    path: spec.path?.parse?.(next) ?? null,
    search: spec.search?.fromLocation?.(next) ?? null,
    hash: getHashParamFromLocation(spec, next),
    state: getStateParamFromLocation(spec, next),
    transient: getTransientParamFromValue(spec, values.transient)
  } as InferAppRouteParamFromPath<Origin>;

  param.digest = getRouteDigestFromRoute(getRouteFromLocation(next));

  return param;
};

export const applySearchParamToRouteParam = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  param: InferAppRouteParamFromPath<Origin>,
  search: URLSearchParams | InferAppRouteSearchValuesFromPath<Origin>
): InferAppRouteParamFromPath<Origin> {
  const spec = findRouteSpecFromParam<Origin>(store, param);
  if (!spec?.route || !param?.route) return getDefaultRouteParam<Origin>();

  param.search = !search ? undefined : (spec.search.delta(search as never) as never);
  const next = getRouteFromParam(store, param);
  param.digest = getRouteDigestFromRoute(next);

  return param;
};

export const sanitizeRouteParam = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  param: InferAppRouteParamFromPath<Origin>
): InferAppRouteParamFromPath<Origin> {
  const spec = findRouteSpecFromParam(store, param);
  if (!spec?.route) return getDefaultRouteParam<Origin>();
  const route = getRouteFromParam(store, param);
  return getRouteParamFromRoute(store, route);
};

export const addRouteParam = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppLocationParamStore['params'],
  param: InferAppRouteParamFromPath<Origin>
): AppLocationParamStore {
  if (routeKey in (store?.params || {}) || !param?.route) return store;
  store.params[routeKey] = param as unknown as AppLocationParamStore['params'][Origin];
  return store;
};

export const hasDifferentRouteParam = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppLocationParamStore['params'],
  param: InferAppRouteParamFromPath<Origin>
): boolean {
  if (!(routeKey in (store?.params || {})) || !param?.route) return false;

  const digest = getRouteDigestFromRoute(getRouteFromParam(store, param));

  return store.params[routeKey].digest === digest;
};

export const updateRouteParam = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppLocationParamStore['params'],
  param: InferAppRouteParamFromPath<Origin>
): AppLocationParamStore {
  if (!(routeKey in (store?.params || {})) || !param?.route) return store;

  const digest = getRouteDigestFromRoute(getRouteFromParam(store, param));
  if (store.params[routeKey].digest === digest) return store;

  store.params[routeKey].digest = digest;
  store.params[routeKey].route = param.route;
  store.params[routeKey].path = param.path;
  store.params[routeKey].search = param.search;
  store.params[routeKey].hash = param.hash as AppLocationParamStore['params'][typeof routeKey]['hash'];
  store.params[routeKey].state = param.state as AppLocationParamStore['params'][typeof routeKey]['state'];
  store.params[routeKey].transient = param.transient as AppLocationParamStore['params'][typeof routeKey]['transient'];

  return store;
};

export const upsertRouteParam = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppLocationParamStore['params'],
  param: InferAppRouteParamFromPath<Origin>
): AppLocationParamStore {
  const nextParam = sanitizeRouteParam(store, param);
  if (routeKey in (store?.params || {})) return updateRouteParam(store, routeKey, nextParam);
  else return addRouteParam(store, routeKey, nextParam);
};

export const removeRouteParam = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  param: InferAppRouteParamFromPath<Origin>
): AppLocationParamStore {
  for (const [routeKey, route] of Object.entries(store?.params || {})) {
    if (param?.digest && param?.digest === route?.digest) delete store.params[routeKey];
    else if (param?.route && param?.route === route?.route) delete store.params[routeKey];
  }
  return store;
};

export const removeRouteParamFromKey = function (
  store: AppLocationParamStore,
  routeKey: keyof AppLocationParamStore['params']
): AppLocationParamStore {
  if (routeKey in (store?.params || {})) {
    delete store.params[routeKey];
  }
  return store;
};

//*****************************************************************************************
// Route Values
//*****************************************************************************************

export const getDefaultRouteValues = function <
  const Origin extends AppRoute['route']
>(): InferAppRouteValuesFromPath<Origin> {
  return {
    path: null,
    params: null,
    search: null,
    hash: null,
    state: null,
    transient: null
  } as InferAppRouteValuesFromPath<Origin>;
};

export const sanitizeRouteValues = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  values: InferAppRouteValuesFromPath<Origin>
): InferAppRouteValuesFromPath<Origin> {
  const param = getRouteParamFromValues(store, values);
  if (!param?.route) return getDefaultRouteValues<Origin>();

  return {
    route: param.route,
    path: param.path ?? null,
    search: param.search && 'toObject' in param.search ? (param.search as any).toObject() : null,
    hash: param.hash ?? null,
    state: param.state ?? null,
    transient: param.transient ?? null
  } as InferAppRouteValuesFromPath<Origin>;
};

export const findRouteValuesFromKey = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppRouterState['routes']
): InferAppRouteValuesFromPath<Origin> {
  const param = findRouteParamFromKey(store, routeKey);
  if (!param?.route) return getDefaultRouteValues<Origin>();

  return {
    route: param?.route || null,
    path: param?.path || null,
    search: !param.search ? null : param.searchSnapshot.toObject(),
    hash: param?.hash || null,
    state: param?.state || null,
    transient: param?.transient || null
  } as InferAppRouteValuesFromPath<Origin>;
};

export const getRouteValuesFromParam = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  param: InferAppRouteParamFromPath<Origin>
): InferAppRouteValuesFromPath<Origin> {
  if (!param?.route || !(param.route in store.specs)) return getDefaultRouteValues<Origin>();

  return {
    route: param.route,
    path: param.path,
    search: !param.search ? null : param.searchSnapshot.toObject(),
    hash: param.hash,
    state: param.state,
    transient: param.transient
  } as InferAppRouteValuesFromPath<Origin>;
};

export const getRouteValuesFromRouteLocation = function <const Origin extends AppRoute['route']>(
  store: AppLocationParamStore,
  route: AppRouterRoute
): InferAppRouteValuesFromPath<Origin> {
  const spec = findRouteSpecFromRoute(store, route);
  if (!spec?.route || !route?.href) return getDefaultRouteValues<Origin>();

  const param = getRouteParamFromRoute(store, route);

  return {
    route: param.route,
    path: param.path,
    search: !param.search ? null : param.searchSnapshot.toObject(),
    hash: param.hash,
    state: param.state,
    transient: param.transient
  } as InferAppRouteValuesFromPath<Origin>;
};

//*****************************************************************************************
// URL Decoding
//*****************************************************************************************

export const parseRouteLocationFromHashFragment = function (fragment: string): AppRouterRoute | null {
  if (!fragment) return null;

  const hashIndex = fragment.indexOf('#');
  if (hashIndex === -1) return { digest: hashObject({ href: fragment, state: null }), href: fragment, state: null };

  const pathname = fragment.slice(0, hashIndex);
  const hashAndSearch = fragment.slice(hashIndex + 1);
  const searchIndex = hashAndSearch.indexOf('?');

  const hash = searchIndex === -1 ? hashAndSearch : hashAndSearch.slice(0, searchIndex);
  const search = searchIndex === -1 ? '' : hashAndSearch.slice(searchIndex);

  try {
    const href = `${pathname}${search}${hash ? `#${decodeURIComponent(hash)}` : ''}`;
    return {
      digest: hashObject({ href, state: null }),
      href,
      state: null
    };
  } catch {
    return null;
  }
};

export const getRouteLocationsFromLegacyURL = (
  store: AppLocationParamStore,
  url: Location<AppRouterState>
): AppRouterRoute[] => {
  if (!url?.pathname || url.pathname === '/v1') return [];

  const pathname = url.pathname === '/' ? '/submit' : url.pathname;
  const href = `${pathname}${url.search || ''}${url.hash || ''}`;
  const route: AppRouterRoute = {
    digest: hashObject({ href, state: url.state ?? null }),
    href,
    state: url.state ?? null
  };

  const normalized = sanitizeRoute(store, route);
  return normalized?.href ? [normalized] : [];
};

export const getRouteLocationsFromURLHash = (
  store: AppLocationParamStore,
  url: Location<AppRouterState>
): AppRouterRoute[] => {
  if (url?.pathname !== '/v1' || !url?.hash) return [];

  const hashFragment = url.hash.slice(1);
  if (!hashFragment) return [];

  return hashFragment
    .split('#/')
    .map((fragment, index) => {
      const route = parseRouteLocationFromHashFragment(`${index === 0 ? '' : '/'}${fragment}`);
      return sanitizeRoute(store, route);
    })
    .filter((parsedRoute): parsedRoute is AppRouterRoute => !!parsedRoute?.href);
};

//*****************************************************************************************
// Location Store
//*****************************************************************************************

export const getAppLocationParamStateFromApi = (api: StoreApi<AppLocationParamStore>): AppLocationParamStore => {
  return api?.getState() || getDefaultLocationParamStore();
};

export const setRouteSpecsFromAppRoutes = function (
  store: AppLocationParamStore,
  routes: AppRoutes
): AppLocationParamStore {
  store.specs = Object.fromEntries(routes.map(route => [route.route, route])) as Record<AppRoute['route'], AppRoute>;
  return store;
};

export const syncRouteParamsFromRouter = function (
  store: AppLocationParamStore,
  router: AppRouterStore
): AppLocationParamStore {
  for (const routeKey of Object.keys(store?.params || {})) {
    if (!(routeKey in (router?.routes || {}))) {
      store = removeRouteParamFromKey(store, routeKey);
    }
  }

  for (const [routeKey, route] of Object.entries(router?.routes || {})) {
    const normalizedRoute: AppRouterRoute = {
      digest: hashObject({ href: route?.href || '', state: route?.state || {} }),
      ...route
    };
    const param = getRouteParamFromRoute(store, normalizedRoute);
    const existingParam = routeKey in (store?.params || {}) ? store.params[routeKey] : null;
    if (existingParam?.transient != null) {
      param.transient = existingParam.transient as typeof param.transient;
    }
    param.digest = getRouteDigestFromRoute(normalizedRoute);
    store = upsertRouteParam(store, routeKey, param);
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
