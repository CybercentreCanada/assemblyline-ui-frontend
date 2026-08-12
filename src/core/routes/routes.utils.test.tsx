import type { AppRouterPage } from 'core/router';
import { getDefaultRouterPage, getPageDigestFromPage } from 'core/router/router.utils';
import type { AppLocationParamStore } from 'core/routes';
import {
  addAppRoute,
  addRouteParam,
  addRouteParamFromPage,
  evaluateMediaQuery,
  findAppRouteFromKey,
  findAppRouteFromPage,
  findAppRouteFromParam,
  findAppRouteFromPath,
  getAppLocationParamStateFromApi,
  getDefaultAppRoute,
  getDefaultRouteParam,
  getExternalHrefFromPage,
  getExternalHrefFromParam,
  getHashParamFromLocation,
  getLocationFromPage,
  getLocationHashFromParam,
  getLocationPathnameFromParam,
  getLocationSearchFromParam,
  getPageFromInput,
  getPageFromLocation,
  getPageFromParam,
  getPageFromURL,
  getPathParamFromLocation,
  getRouteParamFromKey,
  getRouteParamFromPage,
  getSearchParamFromPage,
  isNavigationInputLocation,
  isNavigationInputRouteParam,
  isNavigationInputString,
  parseMediaQuery,
  removeAppRoute,
  removeAppRouteFromKey,
  removeRouteParamFromKey,
  sanitizePage,
  setAppRouteFromAppRoutes,
  syncRouteParamsFromRouter,
  updateAppRoute,
  updateRouteParam,
  updateRouteParamFromPage,
  upsertAppRoute,
  upsertRouteParam,
  upsertRouteParamFromPage
} from 'core/routes';
import { createHashParamCodec } from 'features/hash-params';
import { createPathParamsCodec } from 'features/path-params';
import { SEARCH_PARAM_BLUEPRINTS_MAP, SearchParamEngine } from 'features/search-params';
import { describe, expect, it } from 'vitest';
import type { StoreApi } from 'zustand/vanilla';

//*****************************************************************************************
// Test fixtures
//*****************************************************************************************

const makeSimpleRoute = (overrides: Partial<AppRoute> = {}): AppRoute =>
  ({
    element: null,
    path: '/simple',
    params: null,
    search: null,
    hash: null,
    ancestor: null,
    shortname: () => null,
    fullname: () => null,
    shorticon: () => null,
    fullicon: () => null,
    disabled: false,
    forbidden: false,
    loader: false,
    ...overrides
  }) as unknown as AppRoute;

const makeParamRoute = (overrides: Partial<AppRoute> = {}): AppRoute =>
  ({
    element: null,
    path: '/item/:itemID',
    params: createPathParamsCodec('/item/:itemID')(b => ({ itemID: b.string() })),
    search: new SearchParamEngine({ q: SEARCH_PARAM_BLUEPRINTS_MAP.string('') }),
    hash: createHashParamCodec()(b => b.string()),
    ancestor: null,
    shortname: () => null,
    fullname: () => null,
    shorticon: () => null,
    fullicon: () => null,
    disabled: false,
    forbidden: false,
    loader: false,
    ...overrides
  }) as unknown as AppRoute;

const makeNotFoundRoute = (): AppRoute => makeSimpleRoute({ path: '/not-found' } as never);

const makeStore = (routes: AppRoute[] = []): AppLocationParamStore => {
  const store: AppLocationParamStore = { routes: {} as never, locations: {} };
  for (const route of routes) {
    (store.routes as Record<string, AppRoute>)[route.path as string] = route;
  }
  return store;
};

const makePage = (href: string, overrides: Partial<AppRouterPage> = {}): AppRouterPage => {
  const page = getDefaultRouterPage({ href, state: null, ...overrides });
  page.digest = getPageDigestFromPage(page);
  return page;
};

//*****************************************************************************************
// App Routes
//*****************************************************************************************

describe('getDefaultAppRoute', () => {
  it('returns a disabled/forbidden placeholder route with a null path', () => {
    const route = getDefaultAppRoute();
    expect(route.path).toBeNull();
    expect(route.disabled).toBe(true);
    expect(route.forbidden).toBe(true);
  });
});

describe('findAppRouteFromPath', () => {
  it('returns the matching route for a known path', () => {
    const route = makeSimpleRoute();
    const store = makeStore([route]);
    expect(findAppRouteFromPath(store, '/simple' as never)).toBe(route);
  });

  it('returns the default route when the path is unknown', () => {
    const store = makeStore([]);
    expect((findAppRouteFromPath(store, '/missing' as never) as AppRoute).path).toBeNull();
  });
});

describe('findAppRouteFromKey', () => {
  it('resolves the route via the stored location entry for the page key', () => {
    const route = makeSimpleRoute();
    const store = makeStore([route]);
    store.locations['p1' as never] = { digest: 'd', route: '/simple', path: null, search: null, hash: null } as never;
    expect(findAppRouteFromKey(store, 'p1' as never)).toBe(route);
  });

  it('returns the default route when the page key has no location', () => {
    const store = makeStore([]);
    expect(findAppRouteFromKey(store, 'missing' as never).path).toBeNull();
  });
});

describe('findAppRouteFromPage', () => {
  it('returns the not-found route for a not-found page', () => {
    const notFoundRoute = makeNotFoundRoute();
    const store = makeStore([notFoundRoute]);
    const page = getDefaultRouterPage({ href: '/anything', state: null, digest: 'not-found' });
    expect(findAppRouteFromPage(store, page)).toBe(notFoundRoute);
  });

  it('matches a route by pathname', () => {
    const route = makeSimpleRoute();
    const store = makeStore([route]);
    const page = makePage('/simple');
    expect(findAppRouteFromPage(store, page)).toBe(route);
  });

  it('returns the default route when the page has no href', () => {
    const store = makeStore([]);
    expect(findAppRouteFromPage(store, getDefaultRouterPage()).path).toBeNull();
  });
});

describe('findAppRouteFromParam', () => {
  it('resolves the route for a known param route', () => {
    const route = makeSimpleRoute();
    const store = makeStore([route]);
    expect(findAppRouteFromParam(store, { route: '/simple' } as never)).toBe(route);
  });

  it('returns the default route when the param has no route', () => {
    const store = makeStore([]);
    expect(findAppRouteFromParam(store, null as never).path).toBeNull();
  });
});

describe('addAppRoute', () => {
  it('adds a new route to an empty store', () => {
    const route = makeSimpleRoute();
    const store = makeStore([]);
    const next = addAppRoute(store, route);
    expect(next.routes['/simple' as never]).toBe(route);
  });

  it('does nothing when the route has no path', () => {
    const store = makeStore([]);
    const next = addAppRoute(store, { path: null } as never);
    expect(Object.keys(next.routes || {})).toHaveLength(0);
  });

  it('does not overwrite an existing route for the same path', () => {
    const original = makeSimpleRoute();
    const store = makeStore([original]);
    const next = addAppRoute(store, makeSimpleRoute({ disabled: true } as never));
    expect(next.routes['/simple' as never]).toBe(original);
  });
});

describe('updateAppRoute', () => {
  it('merges provided fields onto the existing route', () => {
    const original = makeSimpleRoute();
    const store = makeStore([original]);
    const next = updateAppRoute(store, { path: '/simple', disabled: true } as never);
    expect((next.routes['/simple' as never] as AppRoute).disabled).toBe(true);
  });

  it('does nothing when the route is not registered', () => {
    const store = makeStore([]);
    const next = updateAppRoute(store, { path: '/missing' } as never);
    expect(Object.keys(next.routes || {})).toHaveLength(0);
  });
});

describe('upsertAppRoute', () => {
  it('adds the route when missing', () => {
    const route = makeSimpleRoute();
    const store = makeStore([]);
    const next = upsertAppRoute(store, route);
    expect(next.routes['/simple' as never]).toBe(route);
  });

  it('updates the route when already present', () => {
    const original = makeSimpleRoute();
    const store = makeStore([original]);
    const next = upsertAppRoute(store, { path: '/simple', disabled: true } as never);
    expect((next.routes['/simple' as never] as AppRoute).disabled).toBe(true);
  });
});

describe('removeAppRoute', () => {
  it('removes a registered route', () => {
    const route = makeSimpleRoute();
    const store = makeStore([route]);
    const next = removeAppRoute(store, route);
    expect(next.routes['/simple' as never]).toBeUndefined();
  });

  it('does nothing when the route is not registered', () => {
    const store = makeStore([]);
    const next = removeAppRoute(store, makeSimpleRoute());
    expect(Object.keys(next.routes || {})).toHaveLength(0);
  });
});

describe('removeAppRouteFromKey', () => {
  it('removes a route by its path key', () => {
    const route = makeSimpleRoute();
    const store = makeStore([route]);
    const next = removeAppRouteFromKey(store, '/simple' as never);
    expect(next.routes['/simple' as never]).toBeUndefined();
  });

  it('does nothing when the key is not registered', () => {
    const store = makeStore([]);
    const next = removeAppRouteFromKey(store, '/missing' as never);
    expect(Object.keys(next.routes || {})).toHaveLength(0);
  });
});

describe('setAppRouteFromAppRoutes', () => {
  it('adds all provided routes and removes routes no longer present', () => {
    const stale = makeSimpleRoute({ path: '/stale' } as never);
    const store = makeStore([stale]);
    const next = makeSimpleRoute({ path: '/next' } as never);
    const result = setAppRouteFromAppRoutes(store, [next] as never);
    expect(result.routes['/next' as never]).toBe(next);
    expect(result.routes['/stale' as never]).toBeUndefined();
  });

  it('handles an empty routes array by clearing the store', () => {
    const store = makeStore([makeSimpleRoute()]);
    const result = setAppRouteFromAppRoutes(store, [] as never);
    expect(Object.keys(result.routes || {})).toHaveLength(0);
  });
});

//*****************************************************************************************
// Router Page
//*****************************************************************************************

describe('getLocationPathnameFromParam', () => {
  it('stringifies path params using the route codec', () => {
    const route = makeParamRoute();
    const pathname = getLocationPathnameFromParam(route, { route: '/item/:itemID', path: { itemID: 'a1' } } as never);
    expect(pathname).toBe('/item/a1');
  });

  it('returns an empty string when the param has no route', () => {
    expect(getLocationPathnameFromParam(makeSimpleRoute(), null as never)).toBe('');
  });
});

describe('getLocationSearchFromParam', () => {
  it('returns a location search string computed from the route search engine', () => {
    const route = makeParamRoute();
    const [search] = getLocationSearchFromParam(route, { route: '/item/:itemID', search: { q: 'abc' } } as never);
    expect(search).toContain('q=abc');
  });

  it('returns nulls when the route has no search engine', () => {
    const [search, state, transient] = getLocationSearchFromParam(makeSimpleRoute(), { route: '/simple' } as never);
    expect(search).toBeNull();
    expect(state).toBeNull();
    expect(transient).toBeNull();
  });
});

describe('getLocationHashFromParam', () => {
  it('stringifies the hash value using the route codec', () => {
    const route = makeParamRoute();
    expect(getLocationHashFromParam(route, { hash: 'section' } as never)).toBe('section');
  });

  it('returns an empty string when the param has no hash', () => {
    expect(getLocationHashFromParam(makeParamRoute(), { hash: null } as never)).toBe('');
  });
});

describe('getPageFromParam', () => {
  it('builds a page href from a route param', () => {
    const route = makeSimpleRoute();
    const store = makeStore([route]);
    const page = getPageFromParam(store, { route: '/simple', path: null, search: null, hash: null } as never);
    expect(page.href).toBe('/simple');
    expect(page.digest).toBeTruthy();
  });

  it('returns the default page when the param has no route', () => {
    const store = makeStore([]);
    expect(getPageFromParam(store, null as never).href).toBeNull();
  });

  it('returns the default page when the route cannot be resolved', () => {
    const store = makeStore([]);
    expect(getPageFromParam(store, { route: '/missing' } as never).href).toBeNull();
  });
});

describe('getPageFromLocation', () => {
  it('builds a page from a matching react-router location', () => {
    const route = makeSimpleRoute();
    const store = makeStore([route]);
    const page = getPageFromLocation(store, { pathname: '/simple', search: '', hash: '', state: null, key: 'k' });
    expect(page.href).toBe('/simple');
  });

  it('returns the default page when the location has no pathname', () => {
    const store = makeStore([]);
    expect(getPageFromLocation(store, null as never).href).toBeNull();
  });

  it('returns the default page when no route matches', () => {
    const store = makeStore([]);
    const page = getPageFromLocation(store, { pathname: '/missing', search: '', hash: '', state: null, key: 'k' });
    expect(page.href).toBeNull();
  });
});

describe('getPageFromURL', () => {
  it('builds a page from an absolute-like URL string', () => {
    const route = makeSimpleRoute();
    const store = makeStore([route]);
    expect(getPageFromURL(store, '/simple').href).toBe('/simple');
  });

  it('returns the default page for an empty string', () => {
    const store = makeStore([]);
    expect(getPageFromURL(store, '').href).toBeNull();
  });

  it('returns the default page when the URL cannot be parsed', () => {
    const store = makeStore([]);
    expect(getPageFromURL(store, undefined as never).href).toBeNull();
  });
});

describe('isNavigationInputRouteParam', () => {
  it('returns true for an object with a string route field', () => {
    expect(isNavigationInputRouteParam({ route: '/simple' } as never)).toBe(true);
  });

  it('returns false for a non-object input', () => {
    expect(isNavigationInputRouteParam('/simple' as never)).toBe(false);
  });

  it('returns false when the route field is missing', () => {
    expect(isNavigationInputRouteParam({} as never)).toBe(false);
  });
});

describe('isNavigationInputLocation', () => {
  it('returns true for a location-shaped object', () => {
    expect(isNavigationInputLocation({ pathname: '/a', search: '', hash: '' } as never)).toBe(true);
  });

  it('returns false when required fields are missing', () => {
    expect(isNavigationInputLocation({ pathname: '/a' } as never)).toBe(false);
  });

  it('returns false for a non-object input', () => {
    expect(isNavigationInputLocation(42 as never)).toBe(false);
  });
});

describe('isNavigationInputString', () => {
  it('returns true for a string input', () => {
    expect(isNavigationInputString('/simple' as never)).toBe(true);
  });

  it('returns false for a non-string input', () => {
    expect(isNavigationInputString({} as never)).toBe(false);
  });
});

describe('getPageFromInput', () => {
  it('resolves a page from a string href', () => {
    const store = makeStore([makeSimpleRoute()]);
    expect(getPageFromInput(store, '/simple' as never).href).toBe('/simple');
  });

  it('resolves a page from a location-shaped input', () => {
    const store = makeStore([makeSimpleRoute()]);
    const page = getPageFromInput(store, { pathname: '/simple', search: '', hash: '', state: null, key: 'k' } as never);
    expect(page.href).toBe('/simple');
  });

  it('resolves a page from a route-param-shaped input', () => {
    const store = makeStore([makeSimpleRoute()]);
    const page = getPageFromInput(store, { route: '/simple', path: null, search: null, hash: null } as never);
    expect(page.href).toBe('/simple');
  });

  it('returns the default page for unrecognized input shapes', () => {
    const store = makeStore([]);
    expect(getPageFromInput(store, 42 as never).href).toBeNull();
  });
});

//*****************************************************************************************
// Route Param
//*****************************************************************************************

describe('getDefaultRouteParam', () => {
  it('returns a fully-null placeholder param', () => {
    const param = getDefaultRouteParam();
    expect(param.route).toBeNull();
    expect(param.path).toBeNull();
    expect(param.search).toBeNull();
    expect(param.hash).toBeNull();
  });

  it('merges provided overrides', () => {
    const param = getDefaultRouteParam({ route: '/simple' } as never);
    expect(param.route).toBe('/simple');
  });
});

describe('getLocationFromPage', () => {
  it('splits a page href into pathname/search/hash', () => {
    const page = makePage('/simple?x=1#y');
    const location = getLocationFromPage(page);
    expect(location.pathname).toBe('/simple');
    expect(location.search).toBe('?x=1');
    expect(location.hash).toBe('#y');
  });
});

describe('getPathParamFromLocation', () => {
  it('parses path params using the route codec', () => {
    const route = makeParamRoute();
    const params = getPathParamFromLocation(route, {
      pathname: '/item/a1',
      search: '',
      hash: '',
      state: null,
      key: 'k'
    });
    expect((params as never as { itemID: string }).itemID).toBe('a1');
  });

  it('returns null when the route has no path codec', () => {
    expect(
      getPathParamFromLocation(makeSimpleRoute(), { pathname: '/simple', search: '', hash: '', state: null, key: 'k' })
    ).toBeNull();
  });
});

describe('getSearchParamFromPage', () => {
  it('parses search params from the page href using the route search engine', () => {
    const route = makeParamRoute();
    const search = getSearchParamFromPage(route, makePage('/item/a1?q=abc'));
    expect((search as never as { q: string }).q).toBe('abc');
  });

  it('returns null when the route has no search engine', () => {
    expect(getSearchParamFromPage(makeSimpleRoute(), makePage('/simple'))).toBeNull();
  });
});

describe('getHashParamFromLocation', () => {
  it('parses the hash value using the route codec', () => {
    const route = makeParamRoute();
    const hash = getHashParamFromLocation(route, {
      pathname: '/item/a1',
      search: '',
      hash: '#section',
      state: null,
      key: 'k'
    });
    expect(hash).toBe('section');
  });

  it('returns null when the route has no hash codec', () => {
    expect(
      getHashParamFromLocation(makeSimpleRoute(), { pathname: '/simple', search: '', hash: '', state: null, key: 'k' })
    ).toBeNull();
  });
});

describe('getRouteParamFromPage', () => {
  it('builds a full route param from a matching page', () => {
    const route = makeParamRoute();
    const store = makeStore([route]);
    const page = makePage('/item/a1?q=abc');
    const param = getRouteParamFromPage(store, page);
    expect(param.route).toBe('/item/:itemID');
    expect((param.path as never as { itemID: string }).itemID).toBe('a1');
  });

  it('returns the default param when no route matches', () => {
    const store = makeStore([]);
    expect(getRouteParamFromPage(store, makePage('/missing')).route).toBeNull();
  });

  it('returns the default param when the page has no href', () => {
    const store = makeStore([makeSimpleRoute()]);
    expect(getRouteParamFromPage(store, getDefaultRouterPage()).route).toBeNull();
  });
});

describe('sanitizePage', () => {
  it('preserves a not-found page while ensuring a digest', () => {
    const store = makeStore([]);
    const notFoundPage = getDefaultRouterPage({ href: '/missing', state: null, digest: 'not-found' });
    const next = sanitizePage(store, notFoundPage);
    expect(next.digest).toBe('not-found');
  });

  it('round-trips a page through its resolved route param', () => {
    const route = makeSimpleRoute();
    const store = makeStore([route]);
    const next = sanitizePage(store, makePage('/simple'));
    expect(next.href).toBe('/simple');
  });

  it('returns the default page when no route matches', () => {
    const store = makeStore([]);
    expect(sanitizePage(store, makePage('/missing')).href).toBeNull();
  });
});

describe('getRouteParamFromKey', () => {
  it('returns the stored location entry for a known page key', () => {
    const store = makeStore([]);
    store.locations['p1' as never] = { digest: 'd', route: '/simple', path: null, search: null, hash: null } as never;
    expect(getRouteParamFromKey(store, 'p1' as never).route).toBe('/simple');
  });

  it('returns the default param when the page key is missing', () => {
    const store = makeStore([]);
    expect(getRouteParamFromKey(store, 'missing' as never).route).toBeNull();
  });
});

describe('addRouteParam', () => {
  it('adds a new location entry for the page key', () => {
    const store = makeStore([]);
    const next = addRouteParam(store, 'p1' as never, { route: '/simple' } as never);
    expect(next.locations['p1' as never].route).toBe('/simple');
  });

  it('does nothing when the page key already has a location', () => {
    const store = makeStore([]);
    store.locations['p1' as never] = { digest: 'd', route: '/simple', path: null, search: null, hash: null } as never;
    const next = addRouteParam(store, 'p1' as never, { route: '/other' } as never);
    expect(next.locations['p1' as never].route).toBe('/simple');
  });

  it('does nothing when the param has no route', () => {
    const store = makeStore([]);
    const next = addRouteParam(store, 'p1' as never, null as never);
    expect(next.locations['p1' as never]).toBeUndefined();
  });
});

describe('addRouteParamFromPage', () => {
  it('derives and adds a route param from a page', () => {
    const route = makeSimpleRoute();
    const store = makeStore([route]);
    const next = addRouteParamFromPage(store, 'p1' as never, makePage('/simple'));
    expect(next.locations['p1' as never].route).toBe('/simple');
  });
});

describe('updateRouteParam', () => {
  it('merges provided fields onto an existing location entry', () => {
    const store = makeStore([]);
    store.locations['p1' as never] = { digest: 'd', route: '/simple', path: null, search: null, hash: null } as never;
    const next = updateRouteParam(store, 'p1' as never, { route: '/simple', digest: 'd2' } as never);
    expect(next.locations['p1' as never].digest).toBe('d2');
  });

  it('does nothing when the page key has no location', () => {
    const store = makeStore([]);
    const next = updateRouteParam(store, 'missing' as never, { route: '/simple' } as never);
    expect(Object.keys(next.locations || {})).toHaveLength(0);
  });
});

describe('updateRouteParamFromPage', () => {
  it('updates the location entry when the digest changes', () => {
    const route = makeSimpleRoute();
    const store = makeStore([route]);
    store.locations['p1' as never] = {
      digest: 'stale',
      route: '/simple',
      path: null,
      search: null,
      hash: null
    } as never;
    const next = updateRouteParamFromPage(store, 'p1' as never, makePage('/simple'));
    expect(next.locations['p1' as never].digest).not.toBe('stale');
  });

  it('does nothing when the page key has no prior location', () => {
    const store = makeStore([makeSimpleRoute()]);
    const next = updateRouteParamFromPage(store, 'missing' as never, makePage('/simple'));
    expect(Object.keys(next.locations || {})).toHaveLength(0);
  });
});

describe('upsertRouteParam', () => {
  it('adds the location entry when missing', () => {
    const store = makeStore([]);
    const next = upsertRouteParam(store, 'p1' as never, { route: '/simple' } as never);
    expect(next.locations['p1' as never].route).toBe('/simple');
  });

  it('updates the location entry when already present', () => {
    const store = makeStore([]);
    store.locations['p1' as never] = { digest: 'd', route: '/simple', path: null, search: null, hash: null } as never;
    const next = upsertRouteParam(store, 'p1' as never, { route: '/simple', digest: 'd2' } as never);
    expect(next.locations['p1' as never].digest).toBe('d2');
  });
});

describe('upsertRouteParamFromPage', () => {
  it('adds a new location entry derived from a page', () => {
    const route = makeSimpleRoute();
    const store = makeStore([route]);
    const next = upsertRouteParamFromPage(store, 'p1' as never, makePage('/simple'));
    expect(next.locations['p1' as never].route).toBe('/simple');
  });

  it('updates an existing location entry derived from a page', () => {
    const route = makeSimpleRoute();
    const store = makeStore([route]);
    store.locations['p1' as never] = {
      digest: 'stale',
      route: '/simple',
      path: null,
      search: null,
      hash: null
    } as never;
    const next = upsertRouteParamFromPage(store, 'p1' as never, makePage('/simple'));
    expect(next.locations['p1' as never].digest).not.toBe('stale');
  });
});

describe('removeRouteParamFromKey', () => {
  it('removes the location entry for a known page key', () => {
    const store = makeStore([]);
    store.locations['p1' as never] = { digest: 'd', route: '/simple', path: null, search: null, hash: null } as never;
    const next = removeRouteParamFromKey(store, 'p1' as never);
    expect(next.locations['p1' as never]).toBeUndefined();
  });

  it('does nothing when the page key is not registered', () => {
    const store = makeStore([]);
    const next = removeRouteParamFromKey(store, 'missing' as never);
    expect(Object.keys(next.locations || {})).toHaveLength(0);
  });
});

//*****************************************************************************************
// External Href
//*****************************************************************************************

describe('getExternalHrefFromPage', () => {
  it('prefixes a sanitized page href with the external href marker', () => {
    const route = makeSimpleRoute();
    const store = makeStore([route]);
    expect(getExternalHrefFromPage(store, makePage('/simple'))).toBe('/v1#/simple');
  });

  it('returns null when the page cannot be resolved to a route', () => {
    const store = makeStore([]);
    expect(getExternalHrefFromPage(store, makePage('/missing'))).toBeNull();
  });
});

describe('getExternalHrefFromParam', () => {
  it('prefixes a resolved param href with the external href marker', () => {
    const route = makeSimpleRoute();
    const store = makeStore([route]);
    expect(getExternalHrefFromParam(store, { route: '/simple', path: null, search: null, hash: null } as never)).toBe(
      '/v1#/simple'
    );
  });

  it('returns null when the param has no route', () => {
    const store = makeStore([]);
    expect(getExternalHrefFromParam(store, null as never)).toBeNull();
  });
});

//*****************************************************************************************
// Location Store
//*****************************************************************************************

describe('getAppLocationParamStateFromApi', () => {
  it('returns the current state from a store api', () => {
    const store = makeStore([makeSimpleRoute()]);
    const api = { getState: () => store } as StoreApi<AppLocationParamStore>;
    expect(getAppLocationParamStateFromApi(api)).toBe(store);
  });

  it('returns the default store when the api has no state', () => {
    const api = { getState: () => null } as unknown as StoreApi<AppLocationParamStore>;
    expect(getAppLocationParamStateFromApi(api).locations).toEqual({});
  });
});

describe('syncRouteParamsFromRouter', () => {
  it('adds route params for router pages and removes stale locations', () => {
    const route = makeSimpleRoute();
    const store = makeStore([route]);
    store.locations['stale' as never] = {
      digest: 'd',
      route: '/simple',
      path: null,
      search: null,
      hash: null
    } as never;

    const router = { pages: { r1: makePage('/simple') } } as never;
    const next = syncRouteParamsFromRouter(store, router);

    expect(next.locations['stale' as never]).toBeUndefined();
    expect(next.locations['r1' as never].route).toBe('/simple');
  });

  it('handles an empty router with no pages', () => {
    const store = makeStore([]);
    const next = syncRouteParamsFromRouter(store, { pages: {} } as never);
    expect(Object.keys(next.locations || {})).toHaveLength(0);
  });
});

//*****************************************************************************************
// Media Query Evaluation
//*****************************************************************************************

describe('parseMediaQuery', () => {
  it('parses a min-width condition', () => {
    expect(parseMediaQuery('(min-width:600px)')).toEqual([{ minWidth: 600 }]);
  });

  it('parses compound min/max-width conditions', () => {
    expect(parseMediaQuery('(min-width:600px) and (max-width:959px)')).toEqual([{ minWidth: 600 }, { maxWidth: 959 }]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(parseMediaQuery('screen')).toEqual([]);
  });
});

describe('evaluateMediaQuery', () => {
  it('returns true when all conditions pass', () => {
    expect(evaluateMediaQuery([{ minWidth: 600 }, { maxWidth: 959 }], 700)).toBe(true);
  });

  it('returns false when a condition fails', () => {
    expect(evaluateMediaQuery([{ minWidth: 600 }], 400)).toBe(false);
  });

  it('returns true for an empty conditions array', () => {
    expect(evaluateMediaQuery([], 400)).toBe(true);
  });
});
