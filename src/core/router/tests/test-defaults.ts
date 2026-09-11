import { DEFAULT_APP_PREFERENCE_STORE } from 'app/core.preference';
import type { AppLocationParamStore, AppRouterPage } from 'core/router';
import { createHashParamCodec } from 'features/hash-params';
import { createPathParamsCodec } from 'features/path-params';
import { SEARCH_PARAM_BLUEPRINTS_MAP, SearchParamEngine } from 'features/search-params';
import { hashObject } from 'shared/utils/app.utils';

export const makePreferences = (overrides: Partial<AppPreferenceStore['router']> = {}): AppPreferenceStore => ({
  ...DEFAULT_APP_PREFERENCE_STORE,
  router: { ...DEFAULT_APP_PREFERENCE_STORE.router, ...overrides }
});

export const makePage = (href: string, overrides: Partial<AppRouterPage> = {}): AppRouterPage => ({
  age: 0,
  digest: hashObject({ href, state: null }),
  href,
  scroll: null,
  state: null,
  transient: null,
  ...overrides
});

export const makeSimpleRoute = (overrides: Partial<AppRoute> = {}): AppRoute =>
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

export const makeParamRoute = (overrides: Partial<AppRoute> = {}): AppRoute =>
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

export const makeNotFoundRoute = (): AppRoute => makeSimpleRoute({ path: '/not-found' } as never);

export const makeStore = (routes: AppRoute[] = []): AppLocationParamStore => {
  const store: AppLocationParamStore = { routes: {} as never, locations: {} };
  for (const route of routes) {
    (store.routes as Record<string, AppRoute>)[route.path as string] = route;
  }
  return store;
};

// export const makePage = (href: string, overrides: Partial<AppRouterPage> = {}): AppRouterPage => {
//   const page = getDefaultRouterPage({ href, state: null, ...overrides });
//   page.digest = getPageDigestFromPage(page);
//   return page;
// };
