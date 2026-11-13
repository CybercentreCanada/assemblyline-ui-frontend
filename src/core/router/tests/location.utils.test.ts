import type { AppLocationParamStore } from 'core/router';
import {
  getAppLocationParamStateFromApi,
  getExternalHrefFromPage,
  getExternalHrefFromParam,
  syncRouteParamsFromRouter
} from 'core/router';
import { makePage, makeSimpleRoute, makeStore } from 'core/router/tests/test-defaults';
import { describe, expect, it } from 'vitest';
import type { StoreApi } from 'zustand/vanilla';

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
