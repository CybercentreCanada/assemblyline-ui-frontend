import type { AppNavigationStore, AppRouterStore } from 'core/router';
import {
  addPageToPanel,
  findNextPanelKeyFromPageKey,
  getDefaultRouterPanel,
  getDefaultRouterStore,
  getLocationStateFromRouter,
  getNavigationStoreFromRouter,
  getPageFromPanelKey,
  reconcileRouterFromNavigation,
  sanitizePages
} from 'core/router';
import { createReversePortalNode } from 'features/portal';
import { hashObject } from 'shared/utils/app.utils';
import { describe, expect, it } from 'vitest';

/** Example router store shape used for parsing fallbacks and tests. */
export const ROUTER_STORE_EXAMPLE: AppRouterStore = {
  id: 'default',
  nodes: { default: { portal: createReversePortalNode(), pageKey: 'default' } },
  panels: [
    {
      pageKey: 'default'
    }
  ],
  pages: {
    default: {
      age: 0,
      href: '/submit',
      state: null,
      digest: ''
    }
  }
};

//*****************************************************************************************
// findNextPanelKey
//*****************************************************************************************
describe('findNextPanelKey', () => {
  it('returns first panel when route is outside all panels', () => {
    const store: AppRouterStore = {
      ...getDefaultRouterStore(),
      panels: [
        { ...getDefaultRouterPanel(), pageKey: 'r1' },
        { ...getDefaultRouterPanel(), pageKey: 'r2' }
      ],
      pages: {
        r1: { digest: hashObject({ href: '/page1', state: null }), href: '/page1', state: null },
        r2: { digest: hashObject({ href: '/page2', state: null }), href: '/page2', state: null },
        outside: { digest: hashObject({ href: '/outside', state: null }), href: '/outside', state: null }
      }
    };

    const preferences: AppPreferenceStore = {
      api: {},
      auth: {},
      layout: {},
      router: { maxPanels: 2, maxNodes: 2, navigation: 'push' },
      safeResults: {}
    };

    const nextPanelKey = findNextPanelKeyFromPageKey(store, 'outside', preferences);
    expect(nextPanelKey).toBe(0);
  });

  it('returns next panel index for push navigation', () => {
    const store: AppRouterStore = {
      ...getDefaultRouterStore(),
      panels: [
        { ...getDefaultRouterPanel(), pageKey: 'r1' },
        { ...getDefaultRouterPanel(), pageKey: 'r2' }
      ],
      pages: {
        r1: { digest: hashObject({ href: '/page1', state: null }), href: '/page1', state: null },
        r2: { digest: hashObject({ href: '/page2', state: null }), href: '/page2', state: null }
      }
    };

    const preferences: AppPreferenceStore = {
      api: {},
      auth: {},
      layout: {},
      router: { maxPanels: 2, maxNodes: 2, navigation: 'push' },
      safeResults: {}
    };

    const nextPanelKey = findNextPanelKeyFromPageKey(store, 'r1', preferences);
    expect(nextPanelKey).toBe(1);
  });

  it('returns panel length for push navigation from the last panel', () => {
    const store: AppRouterStore = {
      ...getDefaultRouterStore(),
      panels: [
        { ...getDefaultRouterPanel(), pageKey: 'r1' },
        { ...getDefaultRouterPanel(), pageKey: 'r2' }
      ],
      pages: {
        r1: { digest: hashObject({ href: '/page1', state: null }), href: '/page1', state: null },
        r2: { digest: hashObject({ href: '/page2', state: null }), href: '/page2', state: null }
      }
    };

    const preferences: AppPreferenceStore = {
      api: {},
      auth: {},
      layout: {},
      router: { maxPanels: 2, maxNodes: 2, navigation: 'push' },
      safeResults: {}
    };

    const nextPanelKey = findNextPanelKeyFromPageKey(store, 'r2', preferences);
    expect(nextPanelKey).toBe(2);
  });

  it('wraps to first panel for loop navigation from the last panel', () => {
    const store: AppRouterStore = {
      ...getDefaultRouterStore(),
      panels: [
        { ...getDefaultRouterPanel(), pageKey: 'r1' },
        { ...getDefaultRouterPanel(), pageKey: 'r2' }
      ],
      pages: {
        r1: { digest: hashObject({ href: '/page1', state: null }), href: '/page1', state: null },
        r2: { digest: hashObject({ href: '/page2', state: null }), href: '/page2', state: null }
      }
    };

    const preferences: AppPreferenceStore = {
      api: {},
      auth: {},
      layout: {},
      router: { maxPanels: 2, maxNodes: 2, navigation: 'loop' },
      safeResults: {}
    };

    const nextPanelKey = findNextPanelKeyFromPageKey(store, 'r2', preferences);
    expect(nextPanelKey).toBe(0);
  });
});

//*****************************************************************************************
// sanitizeRoutes
//*****************************************************************************************
describe('sanitizeRoutes', () => {
  it('removes routes not referenced by panels or nodes', () => {
    const store: AppRouterStore = {
      ...getDefaultRouterStore(),
      panels: [{ ...getDefaultRouterPanel(), pageKey: 'r1' }],
      pages: {
        r1: { digest: hashObject({ href: '/page1', state: null }), href: '/page1', state: null },
        orphan: { digest: hashObject({ href: '/orphan', state: null }), href: '/orphan', state: null }
      }
    };

    const next = sanitizePages(store);
    expect(next.pages.r1).toBeDefined();
    expect(next.pages.orphan).toBeUndefined();
  });

  it('keeps routes referenced by node keys', () => {
    const store: AppRouterStore = {
      ...getDefaultRouterStore(),
      nodes: {
        n1: {
          pageKey: 'from-node',
          portal: { hostEl: document.createElement('div'), setOutlet: () => {} },
          lastUsedAt: 1
        }
      },
      pages: {
        'from-node': { digest: hashObject({ href: '/from-node', state: null }), href: '/from-node', state: null },
        orphan: { digest: hashObject({ href: '/orphan', state: null }), href: '/orphan', state: null }
      }
    };

    const next = sanitizePages(store);
    expect(next.pages['from-node']).toBeDefined();
    expect(next.pages.orphan).toBeUndefined();
  });
});

//*****************************************************************************************
// addRouteToPanel / getPageFromPanelKey
//*****************************************************************************************
describe('panel route helpers', () => {
  it('adds a route to panel and reads it back by panel key', () => {
    const store: AppRouterStore = {
      ...getDefaultRouterStore(),
      panels: [{ ...getDefaultRouterPanel() }],
      pages: {}
    };

    const next = addPageToPanel(store, 0, { digest: '', href: '/submit', state: { source: 'test' } });
    const route = getPageFromPanelKey(next, 0);

    expect(route.href).toBe('/submit');
    expect(route.state).toEqual({ source: 'test' });
  });
});

//*****************************************************************************************
// Store conversion helpers
//*****************************************************************************************
describe('store conversion helpers', () => {
  it('reconciles AppNavigationStore from AppRouterStore', () => {
    const router: AppRouterStore = {
      ...getDefaultRouterStore(),
      id: 'router-id',
      panels: [{ ...getDefaultRouterPanel(), pageKey: 'r1' }],
      nodes: {
        n1: {
          pageKey: 'r1',
          portal: createReversePortalNode(),
          lastUsedAt: 10
        }
      },
      pages: {
        r1: { digest: hashObject({ href: '/submit', state: null }), href: '/submit', state: null, age: 1 }
      }
    };

    const navigation = {
      id: 'old-id',
      panels: [{ ...getDefaultRouterPanel(), pageKey: 'old' }],
      nodes: {
        n1: {
          pageKey: 'old',
          lastUsedAt: 1
        }
      },
      pages: {
        old: { digest: hashObject({ href: '/old', state: null }), href: '/old', state: null }
      },
      blockedPages: {
        stale: {
          reasons: {
            unsaved_changes: true
          }
        }
      },
      options: {
        hashScrollIntoView: false,
        href: '',
        ignoreBlocker: false,
        reloadDocument: false,
        replace: false,
        resetScroll: false,
        viewTransition: false
      }
    } as AppNavigationStore;

    const nextNavigation = getNavigationStoreFromRouter(navigation, router);

    expect(nextNavigation).toBe(navigation);
    expect(navigation.id).toBe('router-id');
    expect(navigation.panels[0].pageKey).toBe('r1');
    expect(navigation.nodes.n1.pageKey).toBe('r1');
    expect(navigation.nodes.n1.lastUsedAt).toBe(10);
    expect(navigation.pages.r1.href).toBe('/submit');
    expect('old' in navigation.pages).toBe(false);
    expect('stale' in navigation.blockedPages).toBe(false);
  });

  it('reconciles AppRouterStore from AppNavigationStore', () => {
    const navigation = {
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
      },
      blockedPages: {},
      options: {
        hashScrollIntoView: false,
        href: '',
        ignoreBlocker: false,
        reloadDocument: false,
        replace: false,
        resetScroll: false,
        viewTransition: false
      }
    } as AppNavigationStore;

    const router: AppRouterStore = {
      ...getDefaultRouterStore(),
      id: 'old-router-id',
      panels: [{ ...getDefaultRouterPanel(), pageKey: 'old' }],
      nodes: {
        stale: {
          pageKey: 'old',
          portal: createReversePortalNode(),
          lastUsedAt: 5
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
    expect(router.nodes.n1.lastUsedAt).toBe(20);
    expect(router.nodes.n1.portal).toBeDefined();
    expect(router.pages.r1.href).toBe('/submit');
    expect('old' in router.pages).toBe(false);
    expect('stale' in router.nodes).toBe(false);
  });

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

    const navigation = getNavigationStoreFromRouter(
      {
        id: '',
        panels: [],
        nodes: {},
        pages: {},
        blockedPages: {},
        options: {
          hashScrollIntoView: false,
          href: '',
          ignoreBlocker: false,
          reloadDocument: false,
          replace: false,
          resetScroll: false,
          viewTransition: false
        }
      },
      router
    );
    const locationState = getLocationStateFromRouter(navigation);

    expect(locationState.id).toBe('router-location-id');
    expect(locationState.panels[0].pageKey).toBe('r1');
    expect(locationState.pages.r1.href).toBe('/submit');
    expect(locationState.pages.r1.state).toEqual({ foo: 'bar' });
    expect(locationState.pages.r1.scroll).toBe(15);
  });
});
