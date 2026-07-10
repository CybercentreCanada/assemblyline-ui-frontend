import type { AppRouterState, AppRouterStore } from 'core/router';
import type {
  AppRouteLocation,
  AppRouteLocationsStore,
  InferAppRouteSearchValuesFromPath,
  InferAppRouteLocationFromPath,
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

export const getDefaultRouteSpec = function <const Path extends AppRoute['path']>() {
  return {
    path: null,
    params: createPathParamsCodec(null)(() => null),
    search: new SearchParamEngine<SearchParamBlueprintMap>(null),
    hash: (s: string | undefined) => s,
    element: null
  } as InferAppRouteSpecFromPath<Path>;
};

export const findRouteSpecFromPath = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  path: Path
): InferAppRouteSpecFromPath<Path> {
  return (store?.specs?.[path] ?? getDefaultRouteSpec()) as InferAppRouteSpecFromPath<Path>;
};

export const findRouteSpecFromKey = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  routeKey: keyof AppRouterState['routes']
): InferAppRouteSpecFromPath<Path> {
  const snapshot = store?.locations?.[routeKey];
  return !snapshot?.path ? getDefaultRouteSpec() : findRouteSpecFromPath(store, snapshot.path as Path);
};

export const findRouteSpecFromLocation = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  location: AppRouteLocation
): InferAppRouteSpecFromPath<Path> {
  if (!location?.href) return getDefaultRouteSpec();
  const { pathname } = new URL(location.href, 'http://localhost');
  const found = Object.values(store?.specs || {}).find(
    r => !!r?.path && !!matchPath({ path: r.path, end: true }, pathname)
  );
  return (found ?? getDefaultRouteSpec()) as InferAppRouteSpecFromPath<Path>;
};

export const findRouteSpecFromSnapshot = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  snapshot: InferAppRouteLocationFromPath<Path>
): InferAppRouteSpecFromPath<Path> {
  return !snapshot?.path ? getDefaultRouteSpec() : findRouteSpecFromPath(store, snapshot.path);
};

export const findRouteSpecFromValues = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  values: InferAppRouteValuesFromPath<Path>
): InferAppRouteSpecFromPath<Path> {
  return !values?.path ? getDefaultRouteSpec() : findRouteSpecFromPath(store, values.path as Path);
};

//*****************************************************************************************
// Location
//*****************************************************************************************

export const getDefaultLocation = function (): Location {
  return { key: '', pathname: '', search: '', hash: '', state: undefined };
};

export const getLocationPathnameFromSnapshot = function <const Path extends AppRoute['path']>(
  spec: InferAppRouteSpecFromPath<Path>,
  snapshot: InferAppRouteLocationFromPath<Path>
): Location['pathname'] {
  if (snapshot?.path == null) return '';

  if (spec?.params && snapshot?.params) {
    return spec.params.stringify(snapshot.params as never);
  }

  if (snapshot?.params) {
    return Object.entries(snapshot.params).reduce(
      (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(String(value))),
      snapshot.path
    );
  }

  return snapshot?.path;
};

export const getLocationSearchFromSnapshot = function <const Path extends AppRoute['path']>(
  spec: InferAppRouteSpecFromPath<Path>,
  snapshot: InferAppRouteLocationFromPath<Path>
): Location['search'] {
  const delta = !spec?.search || spec?.search == null ? undefined : spec.search.delta(snapshot.search.toParams());
  return !delta ? '' : delta.toLocationSearch();
};

export const getLocationHashFromSnapshot = function <const Path extends AppRoute['path']>(
  spec: InferAppRouteSpecFromPath<Path>,
  snapshot: InferAppRouteLocationFromPath<Path>
): Location['hash'] {
  if (snapshot?.hash == null) return '';

  const resolvedHash = !spec?.hash ? String(snapshot.hash) || '' : String(spec.hash(snapshot.hash as never)) || '';
  return resolvedHash.startsWith('#') ? resolvedHash.slice(1) : resolvedHash;
};

export const getLocationStateFromSnapshot = function <const Path extends AppRoute['path']>(
  spec: InferAppRouteSpecFromPath<Path>,
  snapshot: InferAppRouteLocationFromPath<Path>
): AppRouteLocation['state'] {
  const delta = !spec?.search || spec?.search == null ? undefined : spec.search.delta(snapshot.search.toParams());
  return !delta ? null : delta.toLocationState();
};

export const getLocationFromSnapshot = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  snapshot: InferAppRouteLocationFromPath<Path>
): Location {
  const spec = findRouteSpecFromSnapshot<Path>(store, snapshot);
  if (!spec?.path) return getDefaultLocation();

  return {
    key: 'default',
    pathname: getLocationPathnameFromSnapshot(spec, snapshot),
    search: getLocationSearchFromSnapshot(spec, snapshot),
    hash: getLocationHashFromSnapshot(spec, snapshot),
    state: getLocationStateFromSnapshot(spec, snapshot)
  };
};

export const getLocationFromRouteLocation = function (route: AppRouteLocation): Location {
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

export const getDefaultRouteLocation = function (): AppRouteLocation {
  return { href: '', state: null };
};

export const getRouteIdFromLocation = function (location: AppRouteLocation): string {
  return hashObject({ href: location?.href || '', state: location?.state || {} });
};

export const getRouteLocationFromLocation = function (location: Location): AppRouteLocation {
  return {
    href: `${location.pathname}${location.search ? `?${location.search}` : ''}${location.hash ? `#${location.hash}` : ''}`,
    state: location.state
  };
};

export const getRouteLocationFromSnapshot = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  snapshot: InferAppRouteLocationFromPath<Path>
): AppRouteLocation {
  if (!snapshot?.path) return getDefaultRouteLocation();

  const spec = findRouteSpecFromSnapshot<Path>(store, snapshot);
  if (!spec?.path) return getDefaultRouteLocation();

  const route = getLocationFromSnapshot(store, snapshot);

  return {
    href: `${route.pathname}${route.search ? `?${route.search}` : ''}${route.hash ? `#${route.hash}` : ''}`,
    state: route.state
  };
};

export const sanitizeRouteLocation = function (
  store: AppRouteLocationsStore,
  location: AppRouteLocation
): AppRouteLocation {
  const snapshot = getRouteSnapshotFromLocation(store, location);
  return !snapshot?.path ? getDefaultRouteLocation() : getRouteLocationFromSnapshot(store, snapshot);
};

export const getRouteLocationFromValues = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  values: InferAppRouteValuesFromPath<Path>
): AppRouteLocation {
  const snapshot = getRouteSnapshotFromValues(store, values);
  return !snapshot?.path ? getDefaultRouteLocation() : getRouteLocationFromSnapshot(store, snapshot);
};

//*****************************************************************************************
// External Href
//*****************************************************************************************

export const getExternalHrefFromLocation = function (
  store: AppRouteLocationsStore,
  location: AppRouteLocation
): AppRouteLocation['href'] {
  const next = sanitizeRouteLocation(store, location);
  return !next?.href ? null : `/v1#${next.href}`;
};

export const getExternalHrefFromSnapshot = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  snapshot: InferAppRouteLocationFromPath<Path>
): AppRouteLocation['href'] {
  const location = getRouteLocationFromSnapshot(store, snapshot);
  return !location?.href ? null : `/v1#${location.href}`;
};

//*****************************************************************************************
// Route Snapshots
//*****************************************************************************************

export const getDefaultRouteSnapshot = function <const Path extends AppRoute['path']>() {
  return { id: '', path: null, params: null, search: null, hash: '' } as InferAppRouteLocationFromPath<Path>;
};

export const findRouteSnapshotFromKey = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  routeKey: keyof AppRouterState['routes']
): InferAppRouteLocationFromPath<Path> {
  return !(routeKey in (store?.locations || {}))
    ? getDefaultRouteSnapshot<Path>()
    : (store.locations[routeKey] as unknown as InferAppRouteLocationFromPath<Path>);
};

export const getSnapshotParamsFromLocation = function <const Path extends AppRoute['path']>(
  spec: InferAppRouteSpecFromPath<Path>,
  location: Location
): InferAppRouteLocationFromPath<Path>['params'] {
  return (!spec?.params ? null : spec.params.parse(location)) as InferAppRouteLocationFromPath<Path>['params'];
};

export const getSnapshotSearchFromLocation = function <const Path extends AppRoute['path']>(
  spec: InferAppRouteSpecFromPath<Path>,
  location: Location
): InferAppRouteLocationFromPath<Path>['search'] {
  return (!spec?.search ? null : spec.search.fromLocation(location)) as InferAppRouteLocationFromPath<Path>['search'];
};

export const getSnapshotHashFromLocation = function <const Path extends AppRoute['path']>(
  spec: InferAppRouteSpecFromPath<Path>,
  location: Location
): InferAppRouteLocationFromPath<Path>['hash'] {
  const resolvedHash = !spec?.hash
    ? String(location?.hash ?? '')
    : String(spec.hash(location.hash as never) ?? location.hash ?? '');

  return resolvedHash.startsWith('#') ? resolvedHash.slice(1) : resolvedHash;
};
export const getRouteSnapshotFromLocation = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  route: AppRouteLocation
): InferAppRouteLocationFromPath<Path> {
  const spec = findRouteSpecFromLocation(store, route);
  if (!spec?.path || !route?.href) return getDefaultRouteSnapshot();

  const location = getLocationFromRouteLocation(route);
  return {
    id: getRouteIdFromLocation(route),
    path: spec.path,
    params: getSnapshotParamsFromLocation(spec, location),
    search: getSnapshotSearchFromLocation(spec, location),
    hash: getSnapshotHashFromLocation(spec, location)
  } as InferAppRouteLocationFromPath<Path>;
};

export const getRouteSnapshotFromValues = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  values: InferAppRouteValuesFromPath<Path>
): InferAppRouteLocationFromPath<Path> {
  const spec = findRouteSpecFromValues(store, values);
  if (!spec?.path || !values?.path) return getDefaultRouteSnapshot<Path>();

  const delta = !spec?.search || values?.search == null ? undefined : spec.search.delta(values.search as never);
  const next: Location = {
    key: 'default',
    pathname: spec.params?.stringify?.(values.params as never) ?? values.path,
    search: delta ? `?${delta.toLocationSearch()}` : '',
    hash: values?.hash == null ? '' : `#${String(spec.hash?.(values.hash as never) ?? values.hash).replace(/^#/, '')}`,
    state: (delta?.toLocationState as (() => unknown) | undefined)?.() ?? null
  };

  const snapshot = {
    ...getDefaultRouteSnapshot(),
    path: spec.path,
    params: spec.params?.parse?.(next) ?? null,
    search: spec.search?.fromLocation?.(next) ?? null,
    hash: next.hash.slice(1) || null
  } as InferAppRouteLocationFromPath<Path>;

  snapshot.id = getRouteIdFromLocation(getRouteLocationFromLocation(next));

  return snapshot;
};

export const applyRouteLocationSearchToSnapshot = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  snapshot: InferAppRouteLocationFromPath<Path>,
  search: URLSearchParams | InferAppRouteSearchValuesFromPath<Path>
): InferAppRouteLocationFromPath<Path> {
  const spec = findRouteSpecFromSnapshot<Path>(store, snapshot);
  if (!spec?.path || !snapshot?.path) return getDefaultRouteSnapshot<Path>();

  snapshot.search = !search ? undefined : (spec.search.delta(search as never) as never);
  const next = getRouteLocationFromSnapshot(store, snapshot);
  snapshot.id = getRouteIdFromLocation(next);

  return snapshot;
};

export const sanitizeRouteSnapshot = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  snapshot: InferAppRouteLocationFromPath<Path>
): InferAppRouteLocationFromPath<Path> {
  const spec = findRouteSpecFromSnapshot(store, snapshot);
  if (!spec?.path) return getDefaultRouteSnapshot<Path>();
  const location = getRouteLocationFromSnapshot(store, snapshot);
  return getRouteSnapshotFromLocation(store, location);
};

export const addRouteSnapshot = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  routeKey: keyof AppRouteLocationsStore['locations'],
  snapshot: InferAppRouteLocationFromPath<Path>
): AppRouteLocationsStore {
  if (routeKey in (store?.locations || {}) || !snapshot?.path) return store;
  store.locations[routeKey] = snapshot as unknown as AppRouteLocationsStore['locations'][Path];
  return store;
};

export const hasDifferentSnapshot = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  routeKey: keyof AppRouteLocationsStore['locations'],
  snapshot: InferAppRouteLocationFromPath<Path>
): boolean {
  if (!(routeKey in (store?.locations || {})) || !snapshot?.path) return false;

  const id = getRouteIdFromLocation(getRouteLocationFromSnapshot(store, snapshot));

  return store.locations[routeKey].id === id;
};

export const updateRouteSnapshot = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  routeKey: keyof AppRouteLocationsStore['locations'],
  snapshot: InferAppRouteLocationFromPath<Path>
): AppRouteLocationsStore {
  if (!(routeKey in (store?.locations || {})) || !snapshot?.path) return store;

  const id = getRouteIdFromLocation(getRouteLocationFromSnapshot(store, snapshot));
  if (store.locations[routeKey].id === id) return store;

  store.locations[routeKey].id = id;
  store.locations[routeKey].path = snapshot.path;
  store.locations[routeKey].params = snapshot.params;
  store.locations[routeKey].search = snapshot.search;
  store.locations[routeKey].hash = snapshot.hash;

  return store;
};

export const upsertRouteSnapshot = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  routeKey: keyof AppRouteLocationsStore['locations'],
  snapshot: InferAppRouteLocationFromPath<Path>
): AppRouteLocationsStore {
  const nextSnapshot = sanitizeRouteSnapshot(store, snapshot);
  if (routeKey in (store?.locations || {})) return updateRouteSnapshot(store, routeKey, nextSnapshot);
  else return addRouteSnapshot(store, routeKey, nextSnapshot);
};

export const removeRouteSnapshot = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  snapshot: InferAppRouteLocationFromPath<Path>
): AppRouteLocationsStore {
  for (const [routeKey, route] of Object.entries(store?.locations || {})) {
    if (snapshot?.id && snapshot?.id === route?.id) delete store.locations[routeKey];
    else if (snapshot?.path && snapshot?.path === route?.path) delete store.locations[routeKey];
  }
  return store;
};

export const removeRouteSnapshotFromKey = function (
  store: AppRouteLocationsStore,
  routeKey: keyof AppRouteLocationsStore['locations']
): AppRouteLocationsStore {
  if (routeKey in (store?.locations || {})) {
    delete store.locations[routeKey];
  }
  return store;
};

//*****************************************************************************************
// Route Values
//*****************************************************************************************

export const getDefaultAppRouteValues = function <
  const Path extends AppRoute['path']
>(): InferAppRouteValuesFromPath<Path> {
  return {
    path: null,
    params: null,
    search: null,
    hash: null
  } as InferAppRouteValuesFromPath<Path>;
};

export const sanitizeAppRouteValues = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
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

export const findAppRouteValuesFromKey = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  routeKey: keyof AppRouterState['routes']
): InferAppRouteValuesFromPath<Path> {
  const snapshot = findRouteSnapshotFromKey(store, routeKey);
  if (!snapshot?.path) return getDefaultAppRouteValues<Path>();

  return {
    path: snapshot?.path || null,
    params: snapshot?.params || null,
    search: !snapshot.search ? null : snapshot.search.toObject(),
    hash: snapshot?.hash || null
  } as InferAppRouteValuesFromPath<Path>;
};

export const getAppRouteValuesFromSnapshot = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  snapshot: InferAppRouteLocationFromPath<Path>
): InferAppRouteValuesFromPath<Path> {
  if (!snapshot?.path || !(snapshot.path in store.specs)) return getDefaultAppRouteValues<Path>();

  return {
    path: snapshot.path,
    params: snapshot.params,
    search: !snapshot.search ? null : snapshot.search.toObject(),
    hash: snapshot.hash
  } as InferAppRouteValuesFromPath<Path>;
};

export const getAppRouteValuesFromLocation = function <const Path extends AppRoute['path']>(
  store: AppRouteLocationsStore,
  location: AppRouteLocation
): InferAppRouteValuesFromPath<Path> {
  const spec = findRouteSpecFromLocation(store, location);
  if (!spec?.path || !location?.href) return getDefaultAppRouteValues<Path>();

  const snapshot = getRouteSnapshotFromLocation(store, location);

  return {
    path: snapshot.path,
    params: snapshot.params,
    search: !snapshot.search ? null : snapshot.search.toObject(),
    hash: snapshot.hash
  } as InferAppRouteValuesFromPath<Path>;
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
  store: AppRouteLocationsStore,
  url: Location<AppRouterState>
): AppRouteLocation[] => {
  if (!url?.pathname || url.pathname === '/v1') return [];

  const pathname = url.pathname === '/' ? '/submit' : url.pathname;
  const location: AppRouteLocation = {
    href: `${pathname}${url.search || ''}${url.hash || ''}`,
    state: url.state ?? null
  };

  const normalized = sanitizeRouteLocation(store, location);
  return normalized?.href ? [normalized] : [];
};

export const getLocationsFromURLHash = (
  store: AppRouteLocationsStore,
  url: Location<AppRouterState>
): AppRouteLocation[] => {
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

export const setRouteSpecsFromAppRoutes = function (
  store: AppRouteLocationsStore,
  routes: AppRoutes
): AppRouteLocationsStore {
  store.specs = Object.fromEntries(routes.map(route => [route.path, route])) as Record<AppRoute['path'], AppRoute>;
  return store;
};

export const syncRouteSnapshotsFromRouter = function (
  store: AppRouteLocationsStore,
  router: AppRouterStore
): AppRouteLocationsStore {
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
