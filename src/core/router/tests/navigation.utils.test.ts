import type { AppNavigationStore, AppRouterStore } from 'core/router';
import {
  applyDefaultNavigationStore,
  applyNavigationDispatch,
  clearNavigationStore,
  getDefaultNavigateOptions,
  getDefaultNavigationStore,
  getDefaultRouterPanel,
  getDefaultRouterStore,
  getHashFragmentsFromRouter,
  getLocationStateFromRouter,
  getNavigationStoreFromRouter,
  getTitlesFromNavigation,
  reconcileRouterFromNavigation,
  resolveNavigationIntent,
  sanitizeRouterStore
} from 'core/router';
import { makePage, makePreferences } from 'core/router/tests/test-defaults';
import { createReversePortalNode } from 'features/portal';
import { hashObject } from 'shared/utils/app.utils';
import { describe, expect, it } from 'vitest';

//*****************************************************************************************
// Navigation
//*****************************************************************************************
describe('getDefaultNavigateOptions', () => {
  it('returns default navigate options', () => {
    expect(getDefaultNavigateOptions()).toEqual({
      hashScrollIntoView: false,
      href: '',
      ignoreBlocker: false,
      reloadDocument: false,
      replace: false,
      resetScroll: false,
      viewTransition: false
    });
  });

  it('applies partial overrides', () => {
    expect(getDefaultNavigateOptions({ replace: true }).replace).toBe(true);
  });
});

describe('resolveNavigationIntent', () => {
  it('returns null target/operation/dispatch when nav is not provided', () => {
    const result = resolveNavigationIntent(undefined as never);
    expect(result.target).toBeNull();
    expect(result.operation).toBeNull();
    expect(result.dispatch).toBeNull();
  });

  it('captures a "to" create operation', () => {
    const result = resolveNavigationIntent(nav => nav.to().create('/next' as never));
    expect(result.target).toBe('to');
    expect(result.operation).toBe('create');
    expect(result.dispatch).toBe('/next');
  });

  it('captures an "at" operation with the target panel key', () => {
    const result = resolveNavigationIntent(nav => nav.at(2).update('/next' as never));
    expect(result.target).toBe('at');
    expect(result.panelKey).toBe(2);
    expect(result.operation).toBe('update');
  });

  it('captures options passed to the capture function', () => {
    const result = resolveNavigationIntent(nav => nav.here({ replace: true }).only('/x' as never));
    expect(result.options.replace).toBe(true);
  });
});

describe('applyNavigationDispatch', () => {
  it('returns the value directly when dispatch is not a function', () => {
    expect(applyNavigationDispatch('literal' as never, 'prev' as never)).toBe('literal');
  });

  it('invokes the dispatch function with the previous value', () => {
    const dispatch = (prev: string) => `${prev}-next`;
    expect(applyNavigationDispatch(dispatch as never, 'prev')).toBe('prev-next');
  });
});

//*****************************************************************************************
// Router Store
//*****************************************************************************************
describe('getHashFragmentsFromRouter', () => {
  it('builds fragments for panel pages with an href', () => {
    const store = {
      ...getDefaultNavigationStore(),
      panels: [{ pageKey: 'r1' }],
      pages: { r1: makePage('/foo?x=1#bar') }
    };
    expect(getHashFragmentsFromRouter(store)).toEqual(['/foo?x=1#bar']);
  });

  it('skips panels whose page has no href', () => {
    const store = { ...getDefaultNavigationStore(), panels: [{ pageKey: 'missing' }], pages: {} };
    expect(getHashFragmentsFromRouter(store)).toEqual([]);
  });

  it('returns an empty array when there are no panels', () => {
    const store = { ...getDefaultNavigationStore(), panels: [] };
    expect(getHashFragmentsFromRouter(store)).toEqual([]);
  });
});

describe('getTitlesFromNavigation', () => {
  it('returns an empty array when there are no panels', () => {
    const navigation = { ...getDefaultNavigationStore(), panels: [] };
    expect(
      getTitlesFromNavigation(
        navigation,
        { routes: {}, locations: {} } as never,
        {} as never,
        ((k: string) => k) as never
      )
    ).toEqual([]);
  });

  it('skips panels whose page has no href', () => {
    const navigation = { ...getDefaultNavigationStore(), panels: [{ pageKey: 'missing' }], pages: {} };
    expect(
      getTitlesFromNavigation(
        navigation,
        { routes: {}, locations: {} } as never,
        {} as never,
        ((k: string) => k) as never
      )
    ).toEqual([]);
  });

  it('skips panels whose page has no matching route', () => {
    const navigation = { ...getDefaultNavigationStore(), panels: [{ pageKey: 'r1' }], pages: { r1: makePage('/r1') } };
    const locationParam = { routes: {}, locations: {} } as never;
    expect(getTitlesFromNavigation(navigation, locationParam, {} as never, ((k: string) => k) as never)).toEqual([]);
  });
});

describe('getLocationStateFromRouter', () => {
  it('converts AppRouterStore to AppLocationState', () => {
    const router: AppRouterStore = {
      ...getDefaultRouterStore(),
      id: 'router-location-id',
      panels: [{ ...getDefaultRouterPanel(), pageKey: 'r1' }],
      pages: {
        r1: {
          digest: hashObject({ href: '/submit', state: { foo: 'bar' } }),
          href: '/submit',
          state: { foo: 'bar' },
          scroll: 15,
          age: 3
        }
      }
    };

    const navigation = getNavigationStoreFromRouter(getDefaultNavigationStore(), router);
    const locationState = getLocationStateFromRouter(navigation);

    expect(locationState.id).toBe('router-location-id');
    expect(locationState.panels[0].pageKey).toBe('r1');
    expect(locationState.pages.r1.href).toBe('/submit');
    expect(locationState.pages.r1.state).toEqual({ foo: 'bar' });
    expect(locationState.pages.r1.scroll).toBe(15);
  });
});

describe('reconcileRouterFromNavigation', () => {
  it('reconciles AppRouterStore from AppNavigationStore', () => {
    const navigation = {
      ...getDefaultNavigationStore(),
      id: 'navigation-id',
      panels: [{ ...getDefaultRouterPanel(), pageKey: 'r1' }],
      nodes: {
        n1: {
          pageKey: 'r1',
          lastUsedAt: 20
        }
      },
      pages: {
        r1: { digest: hashObject({ href: '/submit', state: null }), href: '/submit', state: null, age: 2 }
      }
    } as AppNavigationStore;

    const router: AppRouterStore = {
      ...getDefaultRouterStore(),
      id: 'old-router-id',
      panels: [{ ...getDefaultRouterPanel(), pageKey: 'old' }],
      nodes: {
        stale: {
          pageKey: 'old',
          portal: createReversePortalNode()
        }
      },
      pages: {
        old: { digest: hashObject({ href: '/old', state: null }), href: '/old', state: null, age: 1 }
      }
    };

    const nextPager = reconcileRouterFromNavigation(router, navigation);

    expect(nextPager).toBe(router);
    expect(router.id).toBe('navigation-id');
    expect(router.panels[0].pageKey).toBe('r1');
    expect(router.nodes.n1.pageKey).toBe('r1');
    expect(router.nodes.n1.portal).toBeDefined();
    expect(router.pages.r1.href).toBe('/submit');
    expect('old' in router.pages).toBe(false);
    expect('stale' in router.nodes).toBe(false);
  });
});

describe('sanitizeRouterStore', () => {
  it('sanitizes panels, nodes, then pages in order', () => {
    const store: AppRouterStore = {
      ...getDefaultRouterStore(),
      panels: [{ pageKey: 'missing' }],
      nodes: { orphan: { portal: createReversePortalNode(), pageKey: 'missing' } },
      pages: {}
    };

    const next = sanitizeRouterStore(store, makePreferences());
    expect(next.panels).toHaveLength(0);
    expect('orphan' in next.nodes).toBe(false);
  });
});

//*****************************************************************************************
// Navigation Store
//*****************************************************************************************
describe('applyDefaultNavigationStore', () => {
  it('seeds a default page and panel when the store is empty', () => {
    const store = { ...getDefaultNavigationStore(), panels: [], pages: {} };
    const next = applyDefaultNavigationStore(store, makePreferences());
    expect(next.panels).toHaveLength(1);
    expect(Object.values(next.pages).some(p => p.href === '/submit')).toBe(true);
  });

  it('leaves the store unchanged when it already has panels and pages', () => {
    const store = {
      ...getDefaultNavigationStore(),
      panels: [{ pageKey: 'r1' }],
      pages: { r1: makePage('/r1') }
    };
    const next = applyDefaultNavigationStore(store, makePreferences());
    expect(next).toBe(store);
    expect(Object.keys(next.pages)).toEqual(['r1']);
  });
});

describe('getNavigationStoreFromRouter', () => {
  it('reconciles AppNavigationStore from AppRouterStore', () => {
    const router: AppRouterStore = {
      ...getDefaultRouterStore(),
      id: 'router-id',
      panels: [{ ...getDefaultRouterPanel(), pageKey: 'r1' }],
      nodes: {
        n1: {
          pageKey: 'r1',
          portal: createReversePortalNode()
        }
      },
      pages: {
        r1: { digest: hashObject({ href: '/submit', state: null }), href: '/submit', state: null, age: 1 }
      }
    };

    const navigation: AppNavigationStore = {
      ...getDefaultNavigationStore(),
      id: 'old-id',
      panels: [{ ...getDefaultRouterPanel(), pageKey: 'old' }],
      nodes: {
        n1: {
          pageKey: 'old'
        }
      },
      pages: {
        old: { digest: hashObject({ href: '/old', state: null }), href: '/old', state: null }
      },
      blockedPages: {
        stale: 'unsaved_changes' as const
      }
    };

    const nextNavigation = getNavigationStoreFromRouter(navigation, router);

    expect(nextNavigation).toBe(navigation);
    expect(navigation.id).toBe('router-id');
    expect(navigation.panels[0].pageKey).toBe('r1');
    expect(navigation.nodes.n1.pageKey).toBe('r1');
    expect(navigation.pages.r1.href).toBe('/submit');
    expect('old' in navigation.pages).toBe(false);
    expect('stale' in navigation.blockedPages).toBe(false);
  });

  it('does not touch blockedPages entries that are still referenced in router.pages', () => {
    const router: AppRouterStore = {
      ...getDefaultRouterStore(),
      panels: [{ pageKey: 'r1' }],
      pages: { r1: makePage('/r1') }
    };
    const navigation = {
      ...getDefaultNavigationStore(),
      panels: [{ pageKey: 'r1' }],
      pages: { r1: makePage('/r1') },
      blockedPages: { r1: 'unsaved_changes' as const }
    };

    const next = getNavigationStoreFromRouter(navigation, router);
    expect(next.blockedPages.r1).toBe('unsaved_changes');
  });
});

describe('clearNavigationStore', () => {
  it('resets all fields to empty defaults', () => {
    const store = {
      ...getDefaultNavigationStore(),
      id: 'x',
      panels: [{ pageKey: 'r1' }],
      nodes: { n1: { pageKey: 'r1' } },
      pages: { r1: makePage('/r1') },
      blockedPages: { r1: 'unsaved_changes' as const }
    };

    const next = clearNavigationStore(store);

    expect(next.id).toBeNull();
    expect(next.panels).toEqual([]);
    expect(next.nodes).toEqual({});
    expect(next.pages).toEqual({});
    expect(next.blockedPages).toEqual({});
    expect(next.options).toEqual(getDefaultNavigateOptions());
  });
});
