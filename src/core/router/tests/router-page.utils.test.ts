import type { AppNavigationStore, AppRouterStore } from 'core/router';
import {
  addPage,
  addPageToPanel,
  captureScrollPositions,
  filterOrphanedPages,
  findPageKeyFromPanelKey,
  getDefaultNavigationStore,
  getDefaultRouterPage,
  getDefaultRouterPanel,
  getDefaultRouterStore,
  getPage,
  getPageDigestFromPage,
  getPageFromPanelKey,
  hasPages,
  isPageVisible,
  refreshPageAges,
  removePage,
  sanitizePages,
  setPage,
  setPageScrollPositions,
  shouldUpdatePage,
  updatePage,
  updatePageFromNavigationPage,
  upsertPage
} from 'core/router';
import { makePage } from 'core/router/tests/test-defaults';
import { createReversePortalNode } from 'features/portal';
import { hashObject } from 'shared/utils/app.utils';
import { describe, expect, it, vi } from 'vitest';

describe('getDefaultRouterPage', () => {
  it('returns default page fields', () => {
    expect(getDefaultRouterPage()).toEqual({
      age: 0,
      digest: null,
      href: null,
      scroll: null,
      state: null,
      transient: null
    });
  });

  it('applies partial overrides', () => {
    expect(getDefaultRouterPage({ href: '/submit' }).href).toBe('/submit');
  });
});

describe('getPageDigestFromPage', () => {
  it('produces the same digest regardless of key order in state', () => {
    const digestA = getPageDigestFromPage({ href: '/a', state: { x: 1, y: 2 } });
    const digestB = getPageDigestFromPage({ href: '/a', state: { y: 2, x: 1 } });
    expect(digestA).toBe(digestB);
  });

  it('produces different digests for different hrefs', () => {
    const digestA = getPageDigestFromPage({ href: '/a', state: null });
    const digestB = getPageDigestFromPage({ href: '/b', state: null });
    expect(digestA).not.toBe(digestB);
  });

  it('treats missing state/transient as empty objects', () => {
    const digestA = getPageDigestFromPage({ href: '/a', state: null, transient: null });
    const digestB = getPageDigestFromPage({ href: '/a', state: {}, transient: {} });
    expect(digestA).toBe(digestB);
  });
});

describe('getPage', () => {
  it('returns the page at the given key', () => {
    const store = { ...getDefaultRouterStore(), pages: { r1: makePage('/r1') } };
    expect(getPage(store, 'r1').href).toBe('/r1');
  });

  it('returns a default page when the key is missing', () => {
    const store: AppRouterStore = { ...getDefaultRouterStore(), pages: {} };
    expect(getPage(store, 'missing')).toEqual(getDefaultRouterPage());
  });

  it('returns a default page when the key is falsy', () => {
    const store = { ...getDefaultRouterStore(), pages: {} };
    expect(getPage(store, null as never)).toEqual(getDefaultRouterPage());
  });
});

describe('shouldUpdatePage', () => {
  it('returns false when the page has no href', () => {
    const store = { ...getDefaultRouterStore(), pages: {} };
    expect(shouldUpdatePage(store, 'r1', { href: null } as never)).toBe(false);
  });

  it('returns true when the pageKey does not yet exist', () => {
    const store = { ...getDefaultRouterStore(), pages: {} };
    expect(shouldUpdatePage(store, 'r1', makePage('/r1'))).toBe(true);
  });

  it('returns false when the digest is unchanged', () => {
    const page = makePage('/r1');
    const store = { ...getDefaultRouterStore(), pages: { r1: page } };
    expect(shouldUpdatePage(store, 'r1', page)).toBe(false);
  });

  it('returns true when the digest changed', () => {
    const store = { ...getDefaultRouterStore(), pages: { r1: makePage('/r1') } };
    expect(shouldUpdatePage(store, 'r1', makePage('/r2'))).toBe(true);
  });
});

describe('findPageKeyFromPanelKey', () => {
  it('returns the active page key of the panel', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    expect(findPageKeyFromPanelKey(store, 0)).toBe('r1');
  });

  it('returns null for an out-of-range panel index', () => {
    const store = { ...getDefaultRouterStore(), panels: [] };
    expect(findPageKeyFromPanelKey(store, 0)).toBeNull();
  });

  it('returns null when the panel has no pageKey', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: null }] };
    expect(findPageKeyFromPanelKey(store, 0)).toBeNull();
  });
});

describe('captureScrollPositions', () => {
  it('returns null positions when the panel scroll elements are missing', () => {
    expect(captureScrollPositions()).toEqual([null, null]);
  });

  it('captures scrollTop by panel index', () => {
    const el = document.createElement('div');
    el.id = 'app-scrollct';
    Object.defineProperty(el, 'scrollTop', { value: 42, configurable: true });
    document.body.appendChild(el);

    expect(captureScrollPositions()).toEqual([42, null]);

    document.body.removeChild(el);
  });
});

describe('setPageScrollPositions', () => {
  it('applies captured scroll positions to matching pages', () => {
    const el = document.createElement('div');
    el.id = 'app-scrollct';
    Object.defineProperty(el, 'scrollTop', { value: 88, configurable: true });
    document.body.appendChild(el);

    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }], pages: { r1: makePage('/r1') } };
    const next = setPageScrollPositions(store);
    expect(next.pages.r1.scroll).toBe(88);

    document.body.removeChild(el);
  });

  it('ignores scroll positions for pages not in the store', () => {
    const store = { ...getDefaultRouterStore(), pages: {} };
    expect(() => setPageScrollPositions(store)).not.toThrow();
  });

  it('captures panel scroll using the pre-navigation page keys', () => {
    const app = document.createElement('div');
    Object.defineProperty(app, 'scrollTop', { value: 123, configurable: true });
    const getElementById = vi
      .spyOn(document, 'getElementById')
      .mockImplementation(id => (id === 'app-scrollct' ? app : null));

    const store = {
      ...getDefaultNavigationStore(),
      panels: [{ pageKey: 'previous' }],
      pages: { previous: makePage('/previous') }
    };

    setPageScrollPositions(store);

    expect(store.pages.previous.scroll).toBe(123);
    getElementById.mockRestore();
  });
});

describe('getPageFromPanelKey', () => {
  it('returns the active page of the panel', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }], pages: { r1: makePage('/r1') } };
    expect(getPageFromPanelKey(store, 0).href).toBe('/r1');
  });

  it('returns a default page for an out-of-range panel index', () => {
    const store = { ...getDefaultRouterStore(), panels: [] };
    expect(getPageFromPanelKey(store, 0)).toEqual(getDefaultRouterPage());
  });

  it('returns a default page when the panel pageKey is missing from pages', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'missing' }], pages: {} };
    expect(getPageFromPanelKey(store, 0)).toEqual(getDefaultRouterPage());
  });
});

describe('hasPages', () => {
  it('returns true when the store has at least one page', () => {
    const store = { ...getDefaultRouterStore(), pages: { r1: makePage('/r1') } };
    expect(hasPages(store)).toBe(true);
  });

  it('returns false when the store has no pages', () => {
    const store = { ...getDefaultRouterStore(), pages: {} };
    expect(hasPages(store)).toBe(false);
  });
});

describe('isPageVisible', () => {
  it('returns true when the pageKey is active in a panel', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }], pages: { r1: makePage('/r1') } };
    expect(isPageVisible(store, 'r1')).toBe(true);
  });

  it('returns false when the page exists but is not active in any panel', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r2' }], pages: { r1: makePage('/r1') } };
    expect(isPageVisible(store, 'r1')).toBe(false);
  });

  it('returns false when the page does not exist', () => {
    const store: AppRouterStore = { ...getDefaultRouterStore(), panels: [], pages: {} };
    expect(isPageVisible(store, 'missing')).toBe(false);
  });
});

describe('removePage', () => {
  it('removes the page at the given key', () => {
    const store = { ...getDefaultRouterStore(), pages: { r1: makePage('/r1') } };
    const next = removePage(store, 'r1');
    expect('r1' in next.pages).toBe(false);
  });

  it('does nothing when the key does not exist', () => {
    const store: AppRouterStore = { ...getDefaultRouterStore(), pages: {} };
    const next = removePage(store, 'missing');
    expect(next.pages).toEqual({});
  });

  it('also removes the matching blockedPages entry on a navigation store', () => {
    const store: AppNavigationStore = {
      ...getDefaultNavigationStore(),
      pages: { r1: makePage('/r1') },
      blockedPages: { r1: 'unsaved_changes' }
    };
    const next = removePage(store, 'r1');
    expect('r1' in next.pages).toBe(false);
    expect('r1' in next.blockedPages).toBe(false);
  });
});

describe('updatePage', () => {
  it('updates href and refreshes the digest', () => {
    const store = { ...getDefaultRouterStore(), pages: { r1: makePage('/r1') } };
    const prevDigest = store.pages.r1.digest;
    const next = updatePage(store, 'r1', { href: '/r2' });
    expect(next.pages.r1.href).toBe('/r2');
    expect(next.pages.r1.digest).not.toBe(prevDigest);
  });

  it('does nothing when the key does not exist', () => {
    const store: AppRouterStore = { ...getDefaultRouterStore(), pages: {} };
    const next = updatePage(store, 'missing', { href: '/r2' });
    expect(next.pages).toEqual({});
  });

  it('preserves the provided digest when explicitly given', () => {
    const store = { ...getDefaultRouterStore(), pages: { r1: makePage('/r1') } };
    const next = updatePage(store, 'r1', { href: '/r2', digest: 'explicit' });
    expect(next.pages.r1.digest).toBe('explicit');
  });

  it('updates scroll without touching the digest', () => {
    const store = { ...getDefaultRouterStore(), pages: { r1: makePage('/r1') } };
    const prevDigest = store.pages.r1.digest;
    const next = updatePage(store, 'r1', { scroll: 10 });
    expect(next.pages.r1.scroll).toBe(10);
    expect(next.pages.r1.digest).toBe(prevDigest);
  });
});

describe('setPage', () => {
  it('sets a page using defaults plus overrides and computes the digest', () => {
    const store: AppRouterStore = { ...getDefaultRouterStore(), pages: {} };
    const next = setPage(store, 'r1', { href: '/r1' });
    expect(next.pages.r1.href).toBe('/r1');
    expect(next.pages.r1.digest).toBeTruthy();
  });
});

describe('updatePageFromNavigationPage', () => {
  it('creates the page when it does not yet exist', () => {
    const store = { ...getDefaultRouterStore(), pages: {} };
    const navPage = makePage('/r1');
    const next = updatePageFromNavigationPage(store, 'r1', navPage);
    expect(next.pages.r1.href).toBe('/r1');
  });

  it('updates href/state/transient when digests differ', () => {
    const store = { ...getDefaultRouterStore(), pages: { r1: makePage('/r1', { age: 1, scroll: 5 }) } };
    const navPage = makePage('/r2', { age: 9, scroll: 20 });
    const next = updatePageFromNavigationPage(store, 'r1', navPage);
    expect(next.pages.r1.href).toBe('/r2');
    expect(next.pages.r1.age).toBe(9);
    expect(next.pages.r1.scroll).toBe(20);
  });

  it('preserves href/state/transient when digests match', () => {
    const page = makePage('/r1', { age: 1 });
    const store = { ...getDefaultRouterStore(), pages: { r1: { ...page } } };
    const navPage = makePage('/r1', { age: 9, digest: page.digest });
    const next = updatePageFromNavigationPage(store, 'r1', navPage);
    expect(next.pages.r1.href).toBe('/r1');
    expect(next.pages.r1.age).toBe(9);
  });
});

describe('addPage', () => {
  it('creates a page and returns a generated key', () => {
    const store = { ...getDefaultRouterStore(), pages: {} };
    const [next, pageKey] = addPage(store, { href: '/r1' });
    expect(next.pages[pageKey as string].href).toBe('/r1');
  });

  it('uses the provided pageKey when given', () => {
    const store: AppRouterStore = { ...getDefaultRouterStore(), pages: {} };
    const [next, pageKey] = addPage(store, { href: '/r1' }, 'explicit');
    expect(pageKey).toBe('explicit');
    expect(next.pages.explicit.href).toBe('/r1');
  });
});

describe('addPageToPanel', () => {
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

  it('does nothing when there are no panels', () => {
    const store: AppRouterStore = { ...getDefaultRouterStore(), panels: [], pages: {} };
    const next = addPageToPanel(store, 0, { href: '/submit' });
    expect(next.pages).toEqual({});
  });

  it('does nothing for an out-of-range panelKey', () => {
    const store: AppRouterStore = { ...getDefaultRouterStore(), panels: [{ pageKey: null }], pages: {} };
    const next = addPageToPanel(store, 5, { href: '/submit' });
    expect(next.pages).toEqual({});
  });
});

describe('upsertPage', () => {
  it('updates an existing page', () => {
    const store = { ...getDefaultRouterStore(), pages: { r1: makePage('/r1') } };
    const [next, pageKey] = upsertPage(store, 'r1', { href: '/r2' });
    expect(pageKey).toBe('r1');
    expect(next.pages.r1.href).toBe('/r2');
  });

  it('creates a new page when the key is missing', () => {
    const store: AppRouterStore = { ...getDefaultRouterStore(), pages: {} };
    const [next, pageKey] = upsertPage(store, 'r1', { href: '/r1' });
    expect(pageKey).toBe('r1');
    expect(next.pages.r1.href).toBe('/r1');
  });
});

describe('refreshPageAges', () => {
  it('prioritizes displayed pages first', () => {
    const store = {
      ...getDefaultRouterStore(),
      panels: [{ pageKey: 'r2' }],
      pages: { r1: makePage('/r1', { age: 0 }), r2: makePage('/r2', { age: 0 }) }
    };
    const next = refreshPageAges(store);
    expect(next.pages.r2.age).toBe(0);
    expect(next.pages.r1.age).toBe(1);
  });

  it('orders non-displayed pages by prior age', () => {
    const store = {
      ...getDefaultRouterStore(),
      panels: [],
      pages: { r1: makePage('/r1', { age: 5 }), r2: makePage('/r2', { age: 1 }) }
    };
    const next = refreshPageAges(store);
    expect(next.pages.r2.age).toBe(0);
    expect(next.pages.r1.age).toBe(1);
  });
});

describe('filterOrphanedPages', () => {
  it('removes pages not referenced by any panel or node', () => {
    const store = {
      ...getDefaultRouterStore(),
      panels: [{ pageKey: 'r1' }],
      pages: { r1: makePage('/r1'), orphan: makePage('/orphan') }
    };
    const next = filterOrphanedPages(store);
    expect(next.pages.r1).toBeDefined();
    expect(next.pages.orphan).toBeUndefined();
  });

  it('keeps pages referenced by a node', () => {
    const store = {
      ...getDefaultRouterStore(),
      nodes: { n1: { portal: createReversePortalNode(), pageKey: 'from-node' } },
      pages: { 'from-node': makePage('/from-node'), orphan: makePage('/orphan') }
    };
    const next = filterOrphanedPages(store);
    expect(next.pages['from-node']).toBeDefined();
    expect(next.pages.orphan).toBeUndefined();
  });
});

describe('sanitizePages', () => {
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
          portal: { hostEl: document.createElement('div'), setOutlet: () => {} }
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

  it('recomputes ages after filtering', () => {
    const store: AppRouterStore = {
      ...getDefaultRouterStore(),
      panels: [{ pageKey: 'r1' }],
      pages: { r1: makePage('/r1', { age: 5 }) }
    };
    const next = sanitizePages(store);
    expect(next.pages.r1.age).toBe(0);
  });
});
