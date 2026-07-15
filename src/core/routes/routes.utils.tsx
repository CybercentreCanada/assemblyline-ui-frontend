import type { AppRouterState, AppRouterStore } from 'core/router';
import type {
  AppLocationParam,
  AppLocationParamStore,
  InferAppLocationParamFromPath,
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

//*****************************************************************************************
// Route Specs
//*****************************************************************************************

export const getDefaultRouteSpec = function <const Path extends AppRoute['route']>() {
  return {
    route: null,
    path: createPathParamsCodec(null)(() => null),
    search: new SearchParamEngine<SearchParamBlueprintMap>(null),
    hash: (s: string | undefined) => s,
    element: null
  } as InferAppRouteSpecFromPath<Path>;
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
  const snapshot = store?.locations?.[routeKey];
  return !snapshot?.route ? getDefaultRouteSpec() : findRouteSpecFromPath(store, snapshot.route as Path);
};

export const findRouteSpecFromLocation = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  location: AppLocationParam
): InferAppRouteSpecFromPath<Path> {
  if (!location?.href) return getDefaultRouteSpec();
  const { pathname } = new URL(location.href, 'http://localhost');
  const found = Object.values(store?.specs || {}).find(
    r => !!r?.route && !!matchPath({ path: r.route, end: true }, pathname)
  );
  return (found ?? getDefaultRouteSpec()) as InferAppRouteSpecFromPath<Path>;
};

export const findRouteSpecFromSnapshot = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  snapshot: InferAppLocationParamFromPath<Path>
): InferAppRouteSpecFromPath<Path> {
  return !snapshot?.route ? getDefaultRouteSpec() : findRouteSpecFromPath(store, snapshot.route);
};

export const findRouteSpecFromValues = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  values: InferAppRouteValuesFromPath<Path>
): InferAppRouteSpecFromPath<Path> {
  return !values?.route ? getDefaultRouteSpec() : findRouteSpecFromPath(store, values.route as Path);
};

//*****************************************************************************************
// Location
//*****************************************************************************************

export const getDefaultLocation = function (): Location {
  return { key: '', pathname: '', search: '', hash: '', state: undefined };
};

export const getLocationPathnameFromSnapshot = function <const Path extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Path>,
  snapshot: InferAppLocationParamFromPath<Path>
): Location['pathname'] {
  if (snapshot?.route == null) return '';

  if (spec?.path && snapshot?.path) {
    return spec.path.stringify(snapshot.path as never);
  }

  if (snapshot?.path) {
    return Object.entries(snapshot.path).reduce(
      (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(String(value))),
      snapshot.route
    );
  }

  return snapshot?.route;
};

export const getLocationSearchFromSnapshot = function <const Path extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Path>,
  snapshot: InferAppLocationParamFromPath<Path>
): Location['search'] {
  const delta = !spec?.search || spec?.search == null ? undefined : spec.search.delta(snapshot.search.toParams());
  return !delta ? '' : delta.toLocationSearch();
};

export const getLocationHashFromSnapshot = function <const Path extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Path>,
  snapshot: InferAppLocationParamFromPath<Path>
): Location['hash'] {
  if (snapshot?.hash == null) return '';

  const resolvedHash = !spec?.hash ? String(snapshot.hash) || '' : String(spec.hash(snapshot.hash as never)) || '';
  return resolvedHash.startsWith('#') ? resolvedHash.slice(1) : resolvedHash;
};

export const getLocationStateFromSnapshot = function <const Path extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Path>,
  snapshot: InferAppLocationParamFromPath<Path>
): AppLocationParam['state'] {
  const delta = !spec?.search || spec?.search == null ? undefined : spec.search.delta(snapshot.search.toParams());
  return !delta ? null : delta.toLocationState();
};

export const getLocationFromSnapshot = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  snapshot: InferAppLocationParamFromPath<Path>
): Location {
  const spec = findRouteSpecFromSnapshot<Path>(store, snapshot);
  if (!spec?.route) return getDefaultLocation();

  return {
    key: 'default',
    pathname: getLocationPathnameFromSnapshot(spec, snapshot),
    search: getLocationSearchFromSnapshot(spec, snapshot),
    hash: getLocationHashFromSnapshot(spec, snapshot),
    state: getLocationStateFromSnapshot(spec, snapshot)
  };
};

export const getLocationFromLocationParam = function (route: AppLocationParam): Location {
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
// Route Location
//*****************************************************************************************

export const getDefaultLocationParam = function (): AppLocationParam {
  return { href: '', state: null };
};

export const getRouteIdFromLocation = function (location: AppLocationParam): string {
  return hashObject({ href: location?.href || '', state: location?.state || {} });
};

export const getLocationParamFromLocation = function (location: Location): AppLocationParam {
  return {
    href: `${location.pathname}${location.search ? `?${location.search}` : ''}${location.hash ? `#${location.hash}` : ''}`,
    state: location.state
  };
};

export const getLocationParamFromSnapshot = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  snapshot: InferAppLocationParamFromPath<Path>
): AppLocationParam {
  if (!snapshot?.route) return getDefaultLocationParam();

  const spec = findRouteSpecFromSnapshot<Path>(store, snapshot);
  if (!spec?.route) return getDefaultLocationParam();

  const route = getLocationFromSnapshot(store, snapshot);

  return {
    href: `${route.pathname}${route.search ? `?${route.search}` : ''}${route.hash ? `#${route.hash}` : ''}`,
    state: route.state
  };
};

export const sanitizeLocationParam = function (
  store: AppLocationParamStore,
  location: AppLocationParam
): AppLocationParam {
  const snapshot = getRouteSnapshotFromLocation(store, location);
  return !snapshot?.route ? getDefaultLocationParam() : getLocationParamFromSnapshot(store, snapshot);
};

export const getLocationParamFromValues = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  values: InferAppRouteValuesFromPath<Path>
): AppLocationParam {
  const snapshot = getRouteSnapshotFromValues(store, values);
  return !snapshot?.route ? getDefaultLocationParam() : getLocationParamFromSnapshot(store, snapshot);
};

//*****************************************************************************************
// External Href
//*****************************************************************************************

export const getExternalHrefFromLocation = function (
  store: AppLocationParamStore,
  location: AppLocationParam
): AppLocationParam['href'] {
  const next = sanitizeLocationParam(store, location);
  return !next?.href ? null : `/v1#${next.href}`;
};

export const getExternalHrefFromSnapshot = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  snapshot: InferAppLocationParamFromPath<Path>
): AppLocationParam['href'] {
  const location = getLocationParamFromSnapshot(store, snapshot);
  return !location?.href ? null : `/v1#${location.href}`;
};

//*****************************************************************************************
// Route Snapshots
//*****************************************************************************************

export const getDefaultRouteSnapshot = function <const Path extends AppRoute['route']>() {
  return { id: '', route: null, path: null, search: null, hash: '' } as InferAppLocationParamFromPath<Path>;
};

export const findRouteSnapshotFromKey = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppRouterState['routes']
): InferAppLocationParamFromPath<Path> {
  return !(routeKey in (store?.locations || {}))
    ? getDefaultRouteSnapshot<Path>()
    : (store.locations[routeKey] as unknown as InferAppLocationParamFromPath<Path>);
};

export const getSnapshotParamsFromLocation = function <const Path extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Path>,
  location: Location
): InferAppLocationParamFromPath<Path>['path'] {
  return (!spec?.path ? null : spec.path.parse(location)) as InferAppLocationParamFromPath<Path>['path'];
};

export const getSnapshotSearchFromLocation = function <const Path extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Path>,
  location: Location
): InferAppLocationParamFromPath<Path>['search'] {
  return (!spec?.search ? null : spec.search.fromLocation(location)) as InferAppLocationParamFromPath<Path>['search'];
};

export const getSnapshotHashFromLocation = function <const Path extends AppRoute['route']>(
  spec: InferAppRouteSpecFromPath<Path>,
  location: Location
): InferAppLocationParamFromPath<Path>['hash'] {
  const resolvedHash = !spec?.hash
    ? String(location?.hash ?? '')
    : String(spec.hash(location.hash as never) ?? location.hash ?? '');

  return resolvedHash.startsWith('#') ? resolvedHash.slice(1) : resolvedHash;
};
export const getRouteSnapshotFromLocation = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  route: AppLocationParam
): InferAppLocationParamFromPath<Path> {
  const spec = findRouteSpecFromLocation(store, route);
  if (!spec?.route || !route?.href) return getDefaultRouteSnapshot();

  const location = getLocationFromLocationParam(route);
  return {
    id: getRouteIdFromLocation(route),
    route: spec.route,
    path: getSnapshotParamsFromLocation(spec, location),
    search: getSnapshotSearchFromLocation(spec, location),
    hash: getSnapshotHashFromLocation(spec, location)
  } as InferAppLocationParamFromPath<Path>;
};

export const getRouteSnapshotFromValues = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  values: InferAppRouteValuesFromPath<Path>
): InferAppLocationParamFromPath<Path> {
  const spec = findRouteSpecFromValues(store, values);
  if (!spec?.route || !values?.route) return getDefaultRouteSnapshot<Path>();

  const delta = !spec?.search || values?.search == null ? undefined : spec.search.delta(values.search as never);
  const next: Location = {
    key: 'default',
    pathname: spec.path?.stringify?.(values.path as never) ?? values.route,
    search: delta ? `?${delta.toLocationSearch()}` : '',
    hash: values?.hash == null ? '' : `#${String(spec.hash?.(values.hash as never) ?? values.hash).replace(/^#/, '')}`,
    state: (delta?.toLocationState as (() => unknown) | undefined)?.() ?? null
  };

  const snapshot = {
    ...getDefaultRouteSnapshot(),
    route: spec.route,
    path: spec.path?.parse?.(next) ?? null,
    search: spec.search?.fromLocation?.(next) ?? null,
    hash: next.hash.slice(1) || null
  } as InferAppLocationParamFromPath<Path>;

  snapshot.id = getRouteIdFromLocation(getLocationParamFromLocation(next));

  return snapshot;
};

export const applyLocationParamSearchToSnapshot = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  snapshot: InferAppLocationParamFromPath<Path>,
  search: URLSearchParams | InferAppRouteSearchValuesFromPath<Path>
): InferAppLocationParamFromPath<Path> {
  const spec = findRouteSpecFromSnapshot<Path>(store, snapshot);
  if (!spec?.route || !snapshot?.route) return getDefaultRouteSnapshot<Path>();

  snapshot.search = !search ? undefined : (spec.search.delta(search as never) as never);
  const next = getLocationParamFromSnapshot(store, snapshot);
  snapshot.id = getRouteIdFromLocation(next);

  return snapshot;
};

export const sanitizeRouteSnapshot = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  snapshot: InferAppLocationParamFromPath<Path>
): InferAppLocationParamFromPath<Path> {
  const spec = findRouteSpecFromSnapshot(store, snapshot);
  if (!spec?.route) return getDefaultRouteSnapshot<Path>();
  const location = getLocationParamFromSnapshot(store, snapshot);
  return getRouteSnapshotFromLocation(store, location);
};

export const addRouteSnapshot = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppLocationParamStore['locations'],
  snapshot: InferAppLocationParamFromPath<Path>
): AppLocationParamStore {
  if (routeKey in (store?.locations || {}) || !snapshot?.route) return store;
  store.locations[routeKey] = snapshot as unknown as AppLocationParamStore['locations'][Path];
  return store;
};

export const hasDifferentSnapshot = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppLocationParamStore['locations'],
  snapshot: InferAppLocationParamFromPath<Path>
): boolean {
  if (!(routeKey in (store?.locations || {})) || !snapshot?.route) return false;

  const id = getRouteIdFromLocation(getLocationParamFromSnapshot(store, snapshot));

  return store.locations[routeKey].id === id;
};

export const updateRouteSnapshot = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppLocationParamStore['locations'],
  snapshot: InferAppLocationParamFromPath<Path>
): AppLocationParamStore {
  if (!(routeKey in (store?.locations || {})) || !snapshot?.route) return store;

  const id = getRouteIdFromLocation(getLocationParamFromSnapshot(store, snapshot));
  if (store.locations[routeKey].id === id) return store;

  store.locations[routeKey].id = id;
  store.locations[routeKey].route = snapshot.route;
  store.locations[routeKey].path = snapshot.path;
  store.locations[routeKey].search = snapshot.search;
  store.locations[routeKey].hash = snapshot.hash;

  return store;
};

export const upsertRouteSnapshot = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppLocationParamStore['locations'],
  snapshot: InferAppLocationParamFromPath<Path>
): AppLocationParamStore {
  const nextSnapshot = sanitizeRouteSnapshot(store, snapshot);
  if (routeKey in (store?.locations || {})) return updateRouteSnapshot(store, routeKey, nextSnapshot);
  else return addRouteSnapshot(store, routeKey, nextSnapshot);
};

export const removeRouteSnapshot = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  snapshot: InferAppLocationParamFromPath<Path>
): AppLocationParamStore {
  for (const [routeKey, route] of Object.entries(store?.locations || {})) {
    if (snapshot?.id && snapshot?.id === route?.id) delete store.locations[routeKey];
    else if (snapshot?.route && snapshot?.route === route?.route) delete store.locations[routeKey];
  }
  return store;
};

export const removeRouteSnapshotFromKey = function (
  store: AppLocationParamStore,
  routeKey: keyof AppLocationParamStore['locations']
): AppLocationParamStore {
  if (routeKey in (store?.locations || {})) {
    delete store.locations[routeKey];
  }
  return store;
};

//*****************************************************************************************
// Route Values
//*****************************************************************************************

export const getDefaultAppRouteValues = function <
  const Path extends AppRoute['route']
>(): InferAppRouteValuesFromPath<Path> {
  return {
    path: null,
    params: null,
    search: null,
    hash: null
  } as InferAppRouteValuesFromPath<Path>;
};

export const sanitizeAppRouteValues = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  values: InferAppRouteValuesFromPath<Path>
): InferAppRouteValuesFromPath<Path> {
  const snapshot = getRouteSnapshotFromValues(store, values);
  if (!snapshot?.route) return getDefaultAppRouteValues<Path>();

  return {
    route: snapshot.route,
    path: snapshot.path ?? null,
    search: snapshot.search?.toObject?.() ?? null,
    hash: snapshot.hash ?? null
  } as InferAppRouteValuesFromPath<Path>;
};

export const findAppRouteValuesFromKey = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  routeKey: keyof AppRouterState['routes']
): InferAppRouteValuesFromPath<Path> {
  const snapshot = findRouteSnapshotFromKey(store, routeKey);
  if (!snapshot?.route) return getDefaultAppRouteValues<Path>();

  return {
    route: snapshot?.route || null,
    path: snapshot?.path || null,
    search: !snapshot.search ? null : snapshot.search.toObject(),
    hash: snapshot?.hash || null
  } as InferAppRouteValuesFromPath<Path>;
};

export const getAppRouteValuesFromSnapshot = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  snapshot: InferAppLocationParamFromPath<Path>
): InferAppRouteValuesFromPath<Path> {
  if (!snapshot?.route || !(snapshot.route in store.specs)) return getDefaultAppRouteValues<Path>();

  return {
    route: snapshot.route,
    path: snapshot.path,
    search: !snapshot.search ? null : snapshot.search.toObject(),
    hash: snapshot.hash
  } as InferAppRouteValuesFromPath<Path>;
};

export const getAppRouteValuesFromLocation = function <const Path extends AppRoute['route']>(
  store: AppLocationParamStore,
  location: AppLocationParam
): InferAppRouteValuesFromPath<Path> {
  const spec = findRouteSpecFromLocation(store, location);
  if (!spec?.route || !location?.href) return getDefaultAppRouteValues<Path>();

  const snapshot = getRouteSnapshotFromLocation(store, location);

  return {
    route: snapshot.route,
    path: snapshot.path,
    search: !snapshot.search ? null : snapshot.search.toObject(),
    hash: snapshot.hash
  } as InferAppRouteValuesFromPath<Path>;
};

//*****************************************************************************************
// URL Decoding
//*****************************************************************************************

export const parseLocationFromHashFragment = function (fragment: string): AppLocationParam | null {
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
  store: AppLocationParamStore,
  url: Location<AppRouterState>
): AppLocationParam[] => {
  if (!url?.pathname || url.pathname === '/v1') return [];

  const pathname = url.pathname === '/' ? '/submit' : url.pathname;
  const location: AppLocationParam = {
    href: `${pathname}${url.search || ''}${url.hash || ''}`,
    state: url.state ?? null
  };

  const normalized = sanitizeLocationParam(store, location);
  return normalized?.href ? [normalized] : [];
};

export const getLocationsFromURLHash = (
  store: AppLocationParamStore,
  url: Location<AppRouterState>
): AppLocationParam[] => {
  if (url?.pathname !== '/v1' || !url?.hash) return [];

  const hashFragment = url.hash.slice(1);
  if (!hashFragment) return [];

  return hashFragment
    .split('#/')
    .map((fragment, index) => {
      const location = parseLocationFromHashFragment(`${index === 0 ? '' : '/'}${fragment}`);
      return sanitizeLocationParam(store, location);
    })
    .filter((parsedLocation): parsedLocation is AppLocationParam => !!parsedLocation?.href);
};

//*****************************************************************************************
// Location Store
//*****************************************************************************************

export const setRouteSpecsFromAppRoutes = function (
  store: AppLocationParamStore,
  routes: AppRoutes
): AppLocationParamStore {
  store.specs = Object.fromEntries(routes.map(route => [route.route, route])) as Record<AppRoute['route'], AppRoute>;
  return store;
};

export const syncRouteSnapshotsFromRouter = function (
  store: AppLocationParamStore,
  router: AppRouterStore
): AppLocationParamStore {
  for (const routeKey of Object.keys(store?.locations || {})) {
    if (!(routeKey in (router?.routes || {}))) {
      store = removeRouteSnapshotFromKey(store, routeKey);
    }
  }

  for (const [routeKey, route] of Object.entries(router?.routes || {})) {
    const snapshot = getRouteSnapshotFromLocation(store, route);
    snapshot.id = getRouteIdFromLocation(route);
    store = upsertRouteSnapshot(store, routeKey, snapshot);
  }

  return store;
};
