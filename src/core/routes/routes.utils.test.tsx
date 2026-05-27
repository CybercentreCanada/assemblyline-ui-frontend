import { APP_ROUTES } from 'app/app.routes';
import type { AppRouterState, AppRouterStore } from 'core/router';
import { DEFAULT_APP_ROUTER_STORE } from 'core/router';
import {
  findAppRouteFromLocation,
  findAppRouteFromValues,
  getAppLinkFromLocation,
  getAppRouteValuesFromLocation,
  getHashFromLocation,
  getLocationFromAppRouteValues,
  getLocationHashFromAppRouteValues,
  getLocationPathFromAppRouteValues,
  getLocationSearchFromAppRouteValues,
  getLocationStateFromAppRouteValues,
  getPathParamsFromLocation,
  getSearchParamsFromLocation,
  parseLocationSearch,
  parseLocationState,
  syncLocationToStore,
  syncStoreToLocation
} from 'core/routes/routes.utils';
import type { Location } from 'react-router';
import { describe, expect, it } from 'vitest';

const createStore = (): AppRouterStore => ({
  ...DEFAULT_APP_ROUTER_STORE,
  id: 'store-id',
  maxNodes: 4,
  maxPanels: 4,
  nodes: {},
  panels: [],
  routes: {}
});

const createRouterLocation = (overrides: Partial<Location<AppRouterState>> = {}): Location<AppRouterState> =>
  ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
    ...overrides
  }) as Location<AppRouterState>;

//*****************************************************************************************
// findAppRouteFromValues
//*****************************************************************************************
describe('findAppRouteFromValues', () => {
  it('returns route for a known path', () => {
    const route = findAppRouteFromValues(APP_ROUTES, { path: '/page1' } as never);
    expect(route?.path).toBe('/page1');
  });

  it('returns null for unknown path', () => {
    const route = findAppRouteFromValues(APP_ROUTES, { path: '/does-not-exist' } as never);
    expect(route).toBeNull();
  });

  it('returns null for empty input values', () => {
    const route = findAppRouteFromValues(APP_ROUTES, null as never);
    expect(route).toBeNull();
  });
});

//*****************************************************************************************
// findAppRouteFromLocation
//*****************************************************************************************
describe('findAppRouteFromLocation', () => {
  it('returns route for a known location href', () => {
    const route = findAppRouteFromLocation(APP_ROUTES, { href: '/page1', state: null });
    expect(route?.path).toBe('/page1');
  });

  it('matches dynamic routes by pathname', () => {
    const route = findAppRouteFromLocation(APP_ROUTES, { href: '/page2/abc123?x=1', state: null });
    expect(route?.path).toBe('/page2/:fileID');
  });

  it('returns null for empty href', () => {
    const route = findAppRouteFromLocation(APP_ROUTES, { href: null, state: null } as never);
    expect(route).toBeNull();
  });
});

//*****************************************************************************************
// getLocationPathFromAppRouteValues
//*****************************************************************************************
describe('getLocationPathFromAppRouteValues', () => {
  it('uses route params codec stringify when available', () => {
    const route = APP_ROUTES.find(r => r.path === '/page2/:fileID');
    expect(route).toBeDefined();

    const pathname = getLocationPathFromAppRouteValues(
      route as never,
      {
        path: '/page2/:fileID',
        params: { fileID: 'abc 123' }
      } as never
    );
    expect(pathname).toBe('/page2/abc%20123');
  });

  it('falls back to manual param replacement when codec is missing', () => {
    const route = { path: '/file/:id', params: null } as never;
    const pathname = getLocationPathFromAppRouteValues(route, { path: '/file/:id', params: { id: '1 2' } } as never);
    expect(pathname).toBe('/file/1%202');
  });

  it('returns empty string when path is missing', () => {
    const pathname = getLocationPathFromAppRouteValues({ path: '/x' } as never, { path: null } as never);
    expect(pathname).toBe('');
  });
});

//*****************************************************************************************
// getLocationSearchFromAppRouteValues
//*****************************************************************************************
describe('getLocationSearchFromAppRouteValues', () => {
  it('serializes search via route search delta', () => {
    const route = {
      path: '/search',
      search: {
        delta: (input: { q: string }) => ({ toLocationSearch: () => `q=${encodeURIComponent(input.q)}` })
      }
    };

    const search = getLocationSearchFromAppRouteValues(
      route as never,
      { path: '/search', search: { q: 'a b' } } as never
    );
    expect(search).toBe('q=a%20b');
  });

  it('returns empty string when route has no search engine', () => {
    const search = getLocationSearchFromAppRouteValues(
      { path: '/search', search: null } as never,
      {
        path: '/search',
        search: { q: 'x' }
      } as never
    );
    expect(search).toBe('');
  });

  it('returns empty string when search values are missing', () => {
    const route = {
      path: '/search',
      search: {
        delta: () => ({ toLocationSearch: () => 'q=x' })
      }
    };

    const search = getLocationSearchFromAppRouteValues(route as never, { path: '/search', search: null } as never);
    expect(search).toBe('');
  });
});

//*****************************************************************************************
// getLocationHashFromAppRouteValues
//*****************************************************************************************
describe('getLocationHashFromAppRouteValues', () => {
  it('returns plain hash when route hash codec is not provided', () => {
    const hash = getLocationHashFromAppRouteValues({ path: '/h' } as never, { path: '/h', hash: 'section-1' } as never);
    expect(hash).toBe('section-1');
  });

  it('normalizes leading hash symbol from hash codec output', () => {
    const route = { path: '/h', hash: (value: string) => `#${value}` };
    const hash = getLocationHashFromAppRouteValues(route as never, { path: '/h', hash: 'section-2' } as never);
    expect(hash).toBe('section-2');
  });

  it('returns empty string when hash is missing', () => {
    const hash = getLocationHashFromAppRouteValues({ path: '/h' } as never, { path: '/h', hash: null } as never);
    expect(hash).toBe('');
  });
});

//*****************************************************************************************
// getLocationStateFromAppRouteValues
//*****************************************************************************************
describe('getLocationStateFromAppRouteValues', () => {
  it('returns search-derived location state when delta exists', () => {
    const route = {
      path: '/state',
      search: {
        delta: (input: { q: string }) => ({ toLocationState: () => ({ query: input.q }) })
      }
    };

    const state = getLocationStateFromAppRouteValues(
      route as never,
      { path: '/state', search: { q: 'hello' } } as never
    );
    expect(state).toEqual({ query: 'hello' });
  });

  it('returns undefined when route has no search engine', () => {
    const state = getLocationStateFromAppRouteValues(
      { path: '/state', search: null } as never,
      {
        path: '/state',
        search: { q: 'x' }
      } as never
    );
    expect(state).toBeUndefined();
  });

  it('returns undefined for missing search values', () => {
    const route = {
      path: '/state',
      search: {
        delta: () => ({ toLocationState: () => ({}) })
      }
    };

    const state = getLocationStateFromAppRouteValues(route as never, { path: '/state', search: null } as never);
    expect(state).toBeUndefined();
  });
});

//*****************************************************************************************
// getLocationFromAppRouteValues
//*****************************************************************************************
describe('getLocationFromAppRouteValues', () => {
  it('builds href and state from route values', () => {
    const route = {
      path: '/combo/:id',
      params: { stringify: (params: { id: string }) => `/combo/${params.id}` },
      search: {
        delta: (input: { q: string }) => ({
          toLocationSearch: () => `q=${input.q}`,
          toLocationState: () => ({ q: input.q })
        })
      },
      hash: (value: string) => value
    };

    const location = getLocationFromAppRouteValues(
      route as never,
      {
        path: '/combo/:id',
        params: { id: '42' },
        search: { q: 'abc' },
        hash: 'top'
      } as never
    );

    expect(location.href).toBe('/combo/42?q=abc#top');
    expect(location.state).toEqual({ q: 'abc' });
  });

  it('returns null location when path is missing', () => {
    const location = getLocationFromAppRouteValues({ path: '/x' } as never, { path: null } as never);
    expect(location).toEqual({ href: null, state: null });
  });

  it('avoids duplicating hash prefix when codec returns #', () => {
    const route = { path: '/h', hash: (value: string) => `#${value}` };
    const location = getLocationFromAppRouteValues(route as never, { path: '/h', hash: 'section' } as never);
    expect(location.href).toBe('/h#section');
  });
});

//*****************************************************************************************
// getPathParamsFromLocation
//*****************************************************************************************
describe('getPathParamsFromLocation', () => {
  it('parses params from href using route param codec', () => {
    const route = APP_ROUTES.find(r => r.path === '/page2/:fileID');
    expect(route).toBeDefined();

    const params = getPathParamsFromLocation(route as never, { href: '/page2/file-77?x=1', state: null });
    expect(params).toEqual({ fileID: 'file-77' });
  });

  it('returns null when route has no param codec', () => {
    const route = APP_ROUTES.find(r => r.path === '/page1');
    expect(route).toBeDefined();

    const params = getPathParamsFromLocation(route as never, { href: '/page1', state: null });
    expect(params).toBeNull();
  });

  it('returns null when href is missing', () => {
    const route = APP_ROUTES.find(r => r.path === '/page2/:fileID');
    const params = getPathParamsFromLocation(route as never, { href: null, state: null } as never);
    expect(params).toBeNull();
  });
});

//*****************************************************************************************
// getSearchParamsFromLocation
//*****************************************************************************************
describe('getSearchParamsFromLocation', () => {
  it('parses search snapshot from href and state', () => {
    const route = APP_ROUTES.find(r => r.path === '/submissions');
    expect(route).toBeDefined();

    const snapshot = getSearchParamsFromLocation(route as never, {
      href: '/submissions?query=abc&rows=25',
      state: { offset: 3 }
    });
    expect(snapshot?.toObject?.()).toMatchObject({ query: 'abc', rows: 25 });
  });

  it('returns null when route has no search engine', () => {
    const route = APP_ROUTES.find(r => r.path === '/page1');
    const snapshot = getSearchParamsFromLocation(route as never, { href: '/page1?x=1', state: null });
    expect(snapshot).toBeNull();
  });

  it('returns null when href is missing', () => {
    const route = APP_ROUTES.find(r => r.path === '/submissions');
    const snapshot = getSearchParamsFromLocation(route as never, { href: null, state: null } as never);
    expect(snapshot).toBeNull();
  });
});

//*****************************************************************************************
// getHashFromLocation
//*****************************************************************************************
describe('getHashFromLocation', () => {
  it('returns hash without leading #', () => {
    const hash = getHashFromLocation({ path: '/x' } as never, { href: '/x#section-3', state: null });
    expect(hash).toBe('section-3');
  });

  it('returns null when href has no hash', () => {
    const hash = getHashFromLocation({ path: '/x' } as never, { href: '/x', state: null });
    expect(hash).toBeNull();
  });

  it('returns null when href is missing', () => {
    const hash = getHashFromLocation({ path: '/x' } as never, { href: null, state: null } as never);
    expect(hash).toBeNull();
  });
});

//*****************************************************************************************
// getAppRouteValuesFromLocation
//*****************************************************************************************
describe('getAppRouteValuesFromLocation', () => {
  it('parses path/search/hash into app route values', () => {
    const route = APP_ROUTES.find(r => r.path === '/submissions');
    expect(route).toBeDefined();

    const values = getAppRouteValuesFromLocation(route as never, {
      href: '/submissions?query=hello#bottom',
      state: null
    }) as unknown as { hash: string | null; path: string; search: Record<string, unknown> | null } | null;

    expect(values?.path).toBe('/submissions');
    expect(values?.search).toMatchObject({ query: 'hello' });
    expect(values?.hash).toBe('bottom');
  });

  it('returns null when route is missing', () => {
    const values = getAppRouteValuesFromLocation(null as never, { href: '/page1', state: null });
    expect(values).toBeNull();
  });

  it('returns null when href is missing', () => {
    const route = APP_ROUTES.find(r => r.path === '/page1');
    const values = getAppRouteValuesFromLocation(route as never, { href: null, state: null } as never);
    expect(values).toBeNull();
  });
});

//*****************************************************************************************
// getAppLinkFromLocation
//*****************************************************************************************
describe('getAppLinkFromLocation', () => {
  it('wraps href in panel query format', () => {
    const next = getAppLinkFromLocation({ href: '/submit?x=1#h', state: { from: 'test' } });
    expect(next?.href).toBe('/?p=%2Fsubmit%3Fx%3D1%23h');
    expect(next?.state).toEqual({ from: 'test' });
  });

  it('returns null when href is empty', () => {
    const next = getAppLinkFromLocation({ href: null, state: null } as never);
    expect(next).toBeNull();
  });

  it('supports root path href', () => {
    const next = getAppLinkFromLocation({ href: '/', state: null });
    expect(next?.href).toBe('/?p=%2F');
  });
});

//*****************************************************************************************
// parseLocationSearch
//*****************************************************************************************
describe('parseLocationSearch', () => {
  it('creates routes and panels from repeated p params', () => {
    const store = createStore();
    const location = createRouterLocation({ search: '?p=%2Fpage1&p=%2Fsubmit' });

    const next = parseLocationSearch(store, location);

    expect(
      Object.values(next.routes)
        .map(route => route.href)
        .sort()
    ).toEqual(['/page1', '/submit']);
    expect(next.panels).toHaveLength(2);
    expect(next.id).not.toBe('store-id');
  });

  it('ignores invalid p values and keeps store valid', () => {
    const store = createStore();
    const location = createRouterLocation({ search: '?p=%25%25%25' });

    const next = parseLocationSearch(store, location);
    expect(Object.keys(next.routes)).toHaveLength(0);
    expect(next.panels).toHaveLength(0);
  });

  it('handles empty search gracefully', () => {
    const store = createStore();
    const location = createRouterLocation({ search: '' });

    const next = parseLocationSearch(store, location);
    expect(next.routes).toEqual({});
    expect(next.panels).toEqual([]);
  });
});

//*****************************************************************************************
// parseLocationState
//*****************************************************************************************
describe('parseLocationState', () => {
  it('hydrates routes and panels from location state', () => {
    const store = createStore();
    const location = createRouterLocation({
      state: {
        id: 'state-id-1',
        routes: { r1: { href: '/page1', state: { source: 'state' } } },
        panels: [{ routeKey: 'r1', tabbedRouteKeys: ['r1'], pinnedRouteKeys: [], temporaryRouteKey: null }]
      } as AppRouterState
    });

    const next = parseLocationState(store, location);
    expect(next.routes.r1?.href).toBe('/page1');
    expect(next.panels).toHaveLength(1);
    expect(next.id).toBe('state-id-1');
  });

  it('trims extra existing panels when new state has fewer panels', () => {
    const store = createStore();
    store.panels = [
      { routeKey: 'a', tabbedRouteKeys: ['a'], pinnedRouteKeys: [], temporaryRouteKey: null },
      { routeKey: 'b', tabbedRouteKeys: ['b'], pinnedRouteKeys: [], temporaryRouteKey: null }
    ];

    const location = createRouterLocation({
      state: {
        id: 'state-id-2',
        routes: { a: { href: '/a', state: null } },
        panels: [{ routeKey: 'a', tabbedRouteKeys: ['a'], pinnedRouteKeys: [], temporaryRouteKey: null }]
      } as AppRouterState
    });

    const next = parseLocationState(store, location);
    expect(next.panels).toHaveLength(1);
    expect(next.panels[0].routeKey).toBe('a');
  });

  it('generates an id when state id is missing', () => {
    const store = createStore();
    const location = createRouterLocation({ state: { routes: {}, panels: [] } as AppRouterState });
    const next = parseLocationState(store, location);
    expect(typeof next.id).toBe('string');
    expect(next.id.length).toBeGreaterThan(0);
  });
});

//*****************************************************************************************
// syncLocationToStore
//*****************************************************************************************
describe('syncLocationToStore', () => {
  it('returns current store when location state id matches store id', () => {
    const store = createStore();
    store.id = 'same-id';
    const location = createRouterLocation({ state: { id: 'same-id', panels: [], routes: {} } as AppRouterState });

    const next = syncLocationToStore(store, location);
    expect(next).toBe(store);
  });

  it('parses location state when state is present', () => {
    const store = createStore();
    const location = createRouterLocation({
      state: {
        id: 'synced-id',
        routes: { r1: { href: '/submit', state: null } },
        panels: [{ routeKey: 'r1', tabbedRouteKeys: ['r1'], pinnedRouteKeys: [], temporaryRouteKey: null }]
      } as AppRouterState
    });

    const next = syncLocationToStore(store, location);
    expect(next.id).toBe('synced-id');
    expect(next.routes.r1?.href).toBe('/submit');
  });

  it('falls back to router example when parsing throws', () => {
    const store = createStore();
    store.maxNodes = 7;
    store.maxPanels = 8;

    const invalidState = {} as AppRouterState;
    Object.defineProperty(invalidState, 'routes', {
      get() {
        throw new Error('boom');
      }
    });

    const location = createRouterLocation({ state: invalidState });
    const next = syncLocationToStore(store, location);
    expect(next.id).toBe('test');
    expect(next.maxNodes).toBe(7);
    expect(next.maxPanels).toBe(8);
  });
});

//*****************************************************************************************
// syncStoreToLocation
//*****************************************************************************************
describe('syncStoreToLocation', () => {
  it('returns null when location and store share the same id', () => {
    const store = createStore();
    store.id = 'same-id';
    const location = createRouterLocation({ state: { id: 'same-id', routes: {}, panels: [] } as AppRouterState });

    const next = syncStoreToLocation(store, location);
    expect(next).toBeNull();
  });

  it('builds navigation payload from panel routes', () => {
    const store = createStore();
    store.id = 'store-sync-id';
    store.routes = {
      r1: { href: '/page1', state: null },
      r2: { href: '/submit', state: { source: 'x' } }
    };
    store.panels = [
      { routeKey: 'r1', tabbedRouteKeys: ['r1'], pinnedRouteKeys: [], temporaryRouteKey: null },
      { routeKey: 'r2', tabbedRouteKeys: ['r2'], pinnedRouteKeys: [], temporaryRouteKey: null }
    ];

    const location = createRouterLocation({ state: { id: 'other-id', routes: {}, panels: [] } as AppRouterState });
    const next = syncStoreToLocation(store, location);

    expect(next?.to).toBe('/?p=%2Fpage1&p=%2Fsubmit');
    const navigationState = next?.options?.state as {
      id: string;
      panels: AppRouterStore['panels'];
      routes: AppRouterStore['routes'];
    };

    expect(navigationState?.id).toBe('store-sync-id');
    expect(navigationState?.panels).toEqual(store.panels);
  });

  it('returns base query string when store has no panels', () => {
    const store = createStore();
    const location = createRouterLocation({ state: null });

    const next = syncStoreToLocation(store, location);
    expect(next?.to).toBe('/?');
  });
});
