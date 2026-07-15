import type { AppRouterRoute, AppRouterState, AppRouterStore } from 'core/router';
import type {
  AppLocationParamStore,
  InferAppRouteParamFromPath,
  InferAppRouteSearchValuesFromPath,
  InferAppRouteSpecFromPath,
  InferAppRouteValuesFromPath
} from 'core/routes';
import { createPathParamsCodec } from 'features/path-params';
import type { SearchParamBlueprintMap } from 'features/search-params';
import { SearchParamEngine } from 'features/search-params';
import type { Location } from 'react-router';
import { matchPath } from 'react-router';
import { hashObject } from 'shared/utils/app.utils';
import type { StoreApi } from 'zustand/vanilla';

//*****************************************************************************************
// Route Specs
//*****************************************************************************************

export const getDefaultRouteSpec = function <const Path extends AppRoute['route']>(): InferAppRouteSpecFromPath<Path> {
  return {
    element: null,
    title: '',
    icon: '',
    component: '',

    route: null,
    path: createPathParamsCodec(null)(() => null),
    search: new SearchParamEngine<SearchParamBlueprintMap>(null),
    hash: (s: string | undefined) => s,
    state: undefined,
    temporary: undefined,

    loader: false
  } as unknown as InferAppRouteSpecFromPath<Path>;
};

export const findRouteSpecFromPath = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  path: Path
): InferAppRouteSpecFromPath<Path> {
  return (store?.specs?.[path] ?? getDefaultRouteSpec()) as InferAppRouteSpecFromPath<Path>;
};

export const findRouteSpecFromKey = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppRouterState['routes']
): InferAppRouteSpecFromPath<Path> {
  const params = store?.params?.[routeKey];
  return !params?.route ? getDefaultRouteSpec() : findRouteSpecFromPath(store, params.route as Path);
};

export const findRouteSpecFromRoute = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  route: AppRouterRoute
): InferAppRouteSpecFromPath<Path> {
  if (!route?.href) return getDefaultRouteSpec();
  const { pathname } = new URL(route.href, 'http://localhost');
  const found = Object.values(store?.specs || {}).find(
    r => !!r?.route && !!matchPath({ path: r.route, end: true }, pathname)
  );
  return (found ?? getDefaultRouteSpec()) as InferAppRouteSpecFromPath<Path>;
};

export const findRouteSpecFromParam = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  param: InferAppRouteParamFromPath<Path>
): InferAppRouteSpecFromPath<Path> {
  return !param?.route ? getDefaultRouteSpec() : findRouteSpecFromPath(store, param.route);
};

export const findRouteSpecFromValues = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  values: InferAppRouteValuesFromPath<Path>
): InferAppRouteSpecFromPath<Path> {
  return !values?.route ? getDefaultRouteSpec() : findRouteSpecFromPath(store, values.route as Path);
};

//*****************************************************************************************
// Route Location
//*****************************************************************************************

export const getDefaultLocation = function (): Location {
  return { key: '', pathname: '', search: '', hash: '', state: undefined };
};

export const getLocationPathnameFromParam = function <const Path extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Path>,
  param: InferAppRouteParamFromPath<Path>
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

export const getLocationSearchFromParam = function <const Path extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Path>,
  param: InferAppRouteParamFromPath<Path>
): Location['search'] {
  const delta = !spec?.search || spec?.search == null ? undefined : spec.search.delta(param.search.toParams());
  return !delta ? '' : delta.toLocationSearch();
};

export const getLocationHashFromParam = function <const Path extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Path>,
  param: InferAppRouteParamFromPath<Path>
): Location['hash'] {
  if (param?.hash == null) return '';

  const resolvedHash = !spec?.hash ? String(param.hash) || '' : String(spec.hash(param.hash as never)) || '';
  return resolvedHash.startsWith('#') ? resolvedHash.slice(1) : resolvedHash;
};

export const getLocationStateFromParam = function <const Path extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Path>,
  param: InferAppRouteParamFromPath<Path>
): AppRouterRoute['state'] {
  const delta = !spec?.search || spec?.search == null ? undefined : spec.search.delta(param.search.toParams());
  return !delta ? null : delta.toLocationState();
};

export const getLocationFromParam = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  param: InferAppRouteParamFromPath<Path>
): Location {
  const spec = findRouteSpecFromParam<Path>(store, param);
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

export const getDefaultRouterRoute = function (): AppRouterRoute {
  return { href: '', state: null };
};

export const getRouteIdFromRoute = function (route: AppRouterRoute): string {
  return hashObject({ href: route?.href || '', state: route?.state || {} });
};

export const getRouteFromLocation = function (location: Location): AppRouterRoute {
  return {
    href: `${location.pathname}${location.search ? `?${location.search}` : ''}${location.hash ? `#${location.hash}` : ''}`,
    state: location.state
  };
};

export const getRouteFromParam = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  param: InferAppRouteParamFromPath<Path>
): AppRouterRoute {
  if (!param?.route) return getDefaultRouterRoute();

  const spec = findRouteSpecFromParam<Path>(store, param);
  if (!spec?.route) return getDefaultRouterRoute();

  const route = getLocationFromParam(store, param);

  return {
    href: `${route.pathname}${route.search ? `?${route.search}` : ''}${route.hash ? `#${route.hash}` : ''}`,
    state: route.state
  };
};

export const sanitizeRoute = function (store: AppLocationParamStore, route: AppRouterRoute): AppRouterRoute {
  const param = getRouteParamFromRoute(store, route);
  return !param?.route ? getDefaultRouterRoute() : getRouteFromParam(store, param);
};

export const getRouteLocationFromValues = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  values: InferAppRouteValuesFromPath<Path>
): AppRouterRoute {
  const param = getRouteParamFromValues(store, values);
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

export const getExternalHrefFromParam = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  param: InferAppRouteParamFromPath<Path>
): AppRouterRoute['href'] {
  const location = getRouteFromParam(store, param);
  return !location?.href ? null : `/v1#${location.href}`;
};

//*****************************************************************************************
// Route Param
//*****************************************************************************************

export const getDefaultRouteParam = function <const Path extends AppRoute['route']>() {
  return { id: '', route: null, path: null, search: null, hash: '' } as InferAppRouteParamFromPath<Path>;
};

export const findRouteParamFromKey = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppRouterState['routes']
): InferAppRouteParamFromPath<Path> {
  return !(routeKey in (store?.params || {}))
    ? getDefaultRouteParam<Path>()
    : (store.params[routeKey] as unknown as InferAppRouteParamFromPath<Path>);
};

export const getPathParamFromLocation = function <const Path extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Path>,
  location: Location
): InferAppRouteParamFromPath<Path>['path'] {
  return (!spec?.path ? null : spec.path.parse(location)) as InferAppRouteParamFromPath<Path>['path'];
};

export const getSearchParamFromLocation = function <const Path extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Path>,
  location: Location
): InferAppRouteParamFromPath<Path>['search'] {
  return (!spec?.search ? null : spec.search.fromLocation(location)) as InferAppRouteParamFromPath<Path>['search'];
};

export const getHashParamFromLocation = function <const Path extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Path>,
  location: Location
): InferAppRouteParamFromPath<Path>['hash'] {
  const resolvedHash = !spec?.hash
    ? String(location?.hash ?? '')
    : String(spec.hash(location.hash as never) ?? location.hash ?? '');

  return resolvedHash.startsWith('#') ? resolvedHash.slice(1) : resolvedHash;
};
export const getRouteParamFromRoute = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  route: AppRouterRoute
): InferAppRouteParamFromPath<Path> {
  const spec = findRouteSpecFromRoute(store, route);
  if (!spec?.route || !route?.href) return getDefaultRouteParam();

  const location = getLocationFromRoute(route);
  return {
    id: getRouteIdFromRoute(route),
    route: spec.route,
    path: getPathParamFromLocation(spec, location),
    search: getSearchParamFromLocation(spec, location),
    hash: getHashParamFromLocation(spec, location)
  } as InferAppRouteParamFromPath<Path>;
};

export const getRouteParamFromValues = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  values: InferAppRouteValuesFromPath<Path>
): InferAppRouteParamFromPath<Path> {
  const spec = findRouteSpecFromValues(store, values);
  if (!spec?.route || !values?.route) return getDefaultRouteParam<Path>();

  const delta = !spec?.search || values?.search == null ? undefined : spec.search.delta(values.search as never);
  const next: Location = {
    key: 'default',
    pathname: spec.path?.stringify?.(values.path as never) ?? values.route,
    search: delta ? `?${delta.toLocationSearch()}` : '',
    hash: values?.hash == null ? '' : `#${String(spec.hash?.(values.hash as never) ?? values.hash).replace(/^#/, '')}`,
    state: (delta?.toLocationState as (() => unknown) | undefined)?.() ?? null
  };

  const param = {
    ...getDefaultRouteParam(),
    route: spec.route,
    path: spec.path?.parse?.(next) ?? null,
    search: spec.search?.fromLocation?.(next) ?? null,
    hash: next.hash.slice(1) || null
  } as InferAppRouteParamFromPath<Path>;

  param.id = getRouteIdFromRoute(getRouteFromLocation(next));

  return param;
};

export const applySearchParamToRouteParam = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  param: InferAppRouteParamFromPath<Path>,
  search: URLSearchParams | InferAppRouteSearchValuesFromPath<Path>
): InferAppRouteParamFromPath<Path> {
  const spec = findRouteSpecFromParam<Path>(store, param);
  if (!spec?.route || !param?.route) return getDefaultRouteParam<Path>();

  param.search = !search ? undefined : (spec.search.delta(search as never) as never);
  const next = getRouteFromParam(store, param);
  param.id = getRouteIdFromRoute(next);

  return param;
};

export const sanitizeRouteParam = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  param: InferAppRouteParamFromPath<Path>
): InferAppRouteParamFromPath<Path> {
  const spec = findRouteSpecFromParam(store, param);
  if (!spec?.route) return getDefaultRouteParam<Path>();
  const route = getRouteFromParam(store, param);
  return getRouteParamFromRoute(store, route);
};

export const addRouteParam = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppLocationParamStore['params'],
  param: InferAppRouteParamFromPath<Path>
): AppLocationParamStore {
  if (routeKey in (store?.params || {}) || !param?.route) return store;
  store.params[routeKey] = param as unknown as AppLocationParamStore['params'][Path];
  return store;
};

export const hasDifferentRouteParam = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppLocationParamStore['params'],
  param: InferAppRouteParamFromPath<Path>
): boolean {
  if (!(routeKey in (store?.params || {})) || !param?.route) return false;

  const id = getRouteIdFromRoute(getRouteFromParam(store, param));

  return store.params[routeKey].id === id;
};

export const updateRouteParam = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppLocationParamStore['params'],
  param: InferAppRouteParamFromPath<Path>
): AppLocationParamStore {
  if (!(routeKey in (store?.params || {})) || !param?.route) return store;

  const id = getRouteIdFromRoute(getRouteFromParam(store, param));
  if (store.params[routeKey].id === id) return store;

  store.params[routeKey].id = id;
  store.params[routeKey].route = param.route;
  store.params[routeKey].path = param.path;
  store.params[routeKey].search = param.search;
  store.params[routeKey].hash = param.hash;

  return store;
};

export const upsertRouteParam = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppLocationParamStore['params'],
  param: InferAppRouteParamFromPath<Path>
): AppLocationParamStore {
  const nextParam = sanitizeRouteParam(store, param);
  if (routeKey in (store?.params || {})) return updateRouteParam(store, routeKey, nextParam);
  else return addRouteParam(store, routeKey, nextParam);
};

export const removeRouteParam = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  param: InferAppRouteParamFromPath<Path>
): AppLocationParamStore {
  for (const [routeKey, route] of Object.entries(store?.params || {})) {
    if (param?.id && param?.id === route?.id) delete store.params[routeKey];
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
  const Path extends AppRoute['route']
>(): InferAppRouteValuesFromPath<Path> {
  return { path: null, params: null, search: null, hash: null } as InferAppRouteValuesFromPath<Path>;
};

export const sanitizeRouteValues = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  values: InferAppRouteValuesFromPath<Path>
): InferAppRouteValuesFromPath<Path> {
  const param = getRouteParamFromValues(store, values);
  if (!param?.route) return getDefaultRouteValues<Path>();

  return {
    route: param.route,
    path: param.path ?? null,
    search: param.search?.toObject?.() ?? null,
    hash: param.hash ?? null
  } as InferAppRouteValuesFromPath<Path>;
};

export const findRouteValuesFromKey = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppRouterState['routes']
): InferAppRouteValuesFromPath<Path> {
  const param = findRouteParamFromKey(store, routeKey);
  if (!param?.route) return getDefaultRouteValues<Path>();

  return {
    route: param?.route || null,
    path: param?.path || null,
    search: !param.search ? null : param.search.toObject(),
    hash: param?.hash || null
  } as InferAppRouteValuesFromPath<Path>;
};

export const getRouteValuesFromParam = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  param: InferAppRouteParamFromPath<Path>
): InferAppRouteValuesFromPath<Path> {
  if (!param?.route || !(param.route in store.specs)) return getDefaultRouteValues<Path>();

  return {
    route: param.route,
    path: param.path,
    search: !param.search ? null : param.search.toObject(),
    hash: param.hash
  } as InferAppRouteValuesFromPath<Path>;
};

export const getRouteValuesFromRouteLocation = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  route: AppRouterRoute
): InferAppRouteValuesFromPath<Path> {
  const spec = findRouteSpecFromRoute(store, route);
  if (!spec?.route || !route?.href) return getDefaultRouteValues<Path>();

  const param = getRouteParamFromRoute(store, route);

  return {
    route: param.route,
    path: param.path,
    search: !param.search ? null : param.search.toObject(),
    hash: param.hash
  } as InferAppRouteValuesFromPath<Path>;
};

//*****************************************************************************************
// URL Decoding
//*****************************************************************************************

export const parseRouteLocationFromHashFragment = function (fragment: string): AppRouterRoute | null {
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

export const getRouteLocationsFromLegacyURL = (
  store: AppLocationParamStore,
  url: Location<AppRouterState>
): AppRouterRoute[] => {
  if (!url?.pathname || url.pathname === '/v1') return [];

  const pathname = url.pathname === '/' ? '/submit' : url.pathname;
  const route: AppRouterRoute = {
    href: `${pathname}${url.search || ''}${url.hash || ''}`,
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

export const getDefaultLocationParamStore = function (): AppLocationParamStore {
  return { specs: null, params: {} };
};

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
    const param = getRouteParamFromRoute(store, route);
    param.id = getRouteIdFromRoute(route);
    store = upsertRouteParam(store, routeKey, param);
  }

  return store;
};
