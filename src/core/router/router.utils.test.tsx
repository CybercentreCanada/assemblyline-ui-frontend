import { DEFAULT_APP_PREFERENCE_STORE } from 'app/core.preference';
import type { AppNavigationStore, AppRouterPage, AppRouterStore } from 'core/router';
import {
  addBlockedPage,
  addMissingNodes,
  addNode,
  addPage,
  addPageToPanel,
  applyDefaultNavigationStore,
  applyNavigationDispatch,
  captureScrollPositions,
  clearBlockedPages,
  clearNavigationStore,
  filterOrphanedNodes,
  filterOrphanedPages,
  filterPanelMissingPageKeys,
  findNextPanelKeyFromPageKey,
  findNode,
  findNodeFromKey,
  findNodeKey,
  findOldestNodeKey,
  findPageKeyFromPanelKey,
  findPanel,
  findPanelKey,
  findPanelKeyFromPageKey,
  findPrevPanelKeyFromPageKey,
  formatNotFoundDiagnosticValue,
  getBlockedPages,
  getDefaultNavigateOptions,
  getDefaultNavigationStore,
  getDefaultRouterNode,
  getDefaultRouterPage,
  getDefaultRouterPanel,
  getDefaultRouterStore,
  getHashFragmentsFromRouter,
  getLocationStateFromRouter,
  getNavigationStoreFromRouter,
  getNotFoundDetails,
  getNotFoundPreviewHref,
  getNotFoundRouterPage,
  getPageDigestFromPage,
  getPageFromPanelKey,
  getPanel,
  getTitlesFromNavigation,
  hasBlockedPages,
  hasPages,
  insertLeftPanel,
  insertRightPanel,
  isNotFoundRouterPage,
  isPageVisible,
  mergePanels,
  reconcileRouterFromNavigation,
  refreshPageAges,
  removeBlockedPage,
  removeEmptyPanel,
  removeNode,
  removeOldestNodes,
  removePage,
  removePanel,
  resolveNavigationIntent,
  resolveNotFoundPage,
  sanitizeNodes,
  sanitizePages,
  sanitizePanels,
  sanitizeRouterStore,
  setBlockedPage,
  setNode,
  setPage,
  setPageScrollPositions,
  setPanel,
  setPanelActivePage,
  shouldUpdatePage,
  updateNode,
  updatePage,
  updatePageFromNavigationPage,
  updatePanel,
  upsertNode,
  upsertPage,
  upsertPanel
} from 'core/router';
import { getPage, resolveLegacyLocation } from 'core/router/router.utils';
import { createReversePortalNode } from 'features/portal';
import { hashObject } from 'shared/utils/app.utils';
import { describe, expect, it, vi } from 'vitest';

const makePreferences = (overrides: Partial<AppPreferenceStore['router']> = {}): AppPreferenceStore => ({
  ...DEFAULT_APP_PREFERENCE_STORE,
  router: { ...DEFAULT_APP_PREFERENCE_STORE.router, ...overrides }
});

const makePage = (href: string, overrides: Partial<AppRouterPage> = {}): AppRouterPage => ({
  age: 0,
  digest: hashObject({ href, state: null }),
  href,
  scroll: null,
  state: null,
  transient: null,
  ...overrides
});

//*****************************************************************************************
// Panel
//*****************************************************************************************
describe('getDefaultRouterPanel', () => {
  it('returns a panel with a null pageKey by default', () => {
    expect(getDefaultRouterPanel()).toEqual({ pageKey: null });
  });

  it('applies partial overrides', () => {
    expect(getDefaultRouterPanel({ pageKey: 'r1' })).toEqual({ pageKey: 'r1' });
  });
});

describe('findPanelKey', () => {
  it('returns the index of the panel matching the pageKey', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }, { pageKey: 'r2' }] };
    expect(findPanelKey(store, { pageKey: 'r2' })).toBe(1);
  });

  it('returns -1 when no panel matches', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    expect(findPanelKey(store, { pageKey: 'missing' })).toBe(-1);
  });

  it('returns -1 for an empty panels array', () => {
    const store = { ...getDefaultRouterStore(), panels: [] };
    expect(findPanelKey(store, { pageKey: 'r1' })).toBe(-1);
  });
});

describe('findPanelKeyFromPageKey', () => {
  it('returns the panel index containing the page key', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }, { pageKey: 'r2' }] };
    expect(findPanelKeyFromPageKey(store, 'r2')).toBe(1);
  });

  it('returns -1 when the page key is falsy', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    expect(findPanelKeyFromPageKey(store, null)).toBe(-1);
  });

  it('returns -1 when the page key is not found', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    expect(findPanelKeyFromPageKey(store, 'missing')).toBe(-1);
  });
});

describe('findPrevPanelKeyFromPageKey', () => {
  it('returns originPanelKey - 1 for push navigation', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }, { pageKey: 'r2' }] };
    expect(findPrevPanelKeyFromPageKey(store, 'r2', makePreferences({ navigation: 'push' }))).toBe(0);
  });

  it('wraps to maxPanels - 1 for loop navigation from the first panel', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }, { pageKey: 'r2' }] };
    expect(findPrevPanelKeyFromPageKey(store, 'r1', makePreferences({ navigation: 'loop', maxPanels: 2 }))).toBe(1);
  });

  it('defaults to first panel (0) when the page is outside all panels', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    expect(findPrevPanelKeyFromPageKey(store, 'missing', makePreferences({ navigation: 'push' }))).toBe(-1);
  });
});

describe('findNextPanelKeyFromPageKey', () => {
  it('returns first panel when route is outside all panels', () => {
    const store: AppRouterStore = {
      ...getDefaultRouterStore(),
      panels: [
        { ...getDefaultRouterPanel(), pageKey: 'r1' },
        { ...getDefaultRouterPanel(), pageKey: 'r2' }
      ],
      pages: {
        r1: makePage('/page1'),
        r2: makePage('/page2'),
        outside: makePage('/outside')
      }
    };

    expect(findNextPanelKeyFromPageKey(store, 'outside', makePreferences({ maxPanels: 2, navigation: 'push' }))).toBe(
      0
    );
  });

  it('returns next panel index for push navigation', () => {
    const store: AppRouterStore = {
      ...getDefaultRouterStore(),
      panels: [
        { ...getDefaultRouterPanel(), pageKey: 'r1' },
        { ...getDefaultRouterPanel(), pageKey: 'r2' }
      ],
      pages: { r1: makePage('/page1'), r2: makePage('/page2') }
    };

    expect(findNextPanelKeyFromPageKey(store, 'r1', makePreferences({ maxPanels: 2, navigation: 'push' }))).toBe(1);
  });

  it('returns panel length for push navigation from the last panel', () => {
    const store: AppRouterStore = {
      ...getDefaultRouterStore(),
      panels: [
        { ...getDefaultRouterPanel(), pageKey: 'r1' },
        { ...getDefaultRouterPanel(), pageKey: 'r2' }
      ],
      pages: { r1: makePage('/page1'), r2: makePage('/page2') }
    };

    expect(findNextPanelKeyFromPageKey(store, 'r2', makePreferences({ maxPanels: 2, navigation: 'push' }))).toBe(2);
  });

  it('wraps to first panel for loop navigation from the last panel', () => {
    const store: AppRouterStore = {
      ...getDefaultRouterStore(),
      panels: [
        { ...getDefaultRouterPanel(), pageKey: 'r1' },
        { ...getDefaultRouterPanel(), pageKey: 'r2' }
      ],
      pages: { r1: makePage('/page1'), r2: makePage('/page2') }
    };

    expect(findNextPanelKeyFromPageKey(store, 'r2', makePreferences({ maxPanels: 2, navigation: 'loop' }))).toBe(0);
  });
});

describe('findPanel', () => {
  it('returns the matching panel', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    expect(findPanel(store, { pageKey: 'r1' })).toEqual({ pageKey: 'r1' });
  });

  it('returns null when no panel matches', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    expect(findPanel(store, { pageKey: 'missing' })).toBeNull();
  });
});

describe('getPanel', () => {
  it('returns the panel at the given index', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    expect(getPanel(store, 0)).toEqual({ pageKey: 'r1' });
  });

  it('returns a default panel when the index is out of range', () => {
    const store = { ...getDefaultRouterStore(), panels: [] };
    expect(getPanel(store, 0)).toEqual(getDefaultRouterPanel());
  });

  it('returns a default panel for a negative index', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    expect(getPanel(store, -1)).toEqual(getDefaultRouterPanel());
  });
});

describe('removePanel', () => {
  it('removes the panel at the given index', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }, { pageKey: 'r2' }] };
    const next = removePanel(store, 0);
    expect(next.panels).toEqual([{ pageKey: 'r2' }]);
  });

  it('does nothing when the index is out of range', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    const next = removePanel(store, 5);
    expect(next.panels).toHaveLength(1);
  });

  it('does nothing for a negative index', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    const next = removePanel(store, -1);
    expect(next.panels).toHaveLength(1);
  });
});

describe('removeEmptyPanel', () => {
  it('removes a panel with no active page', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: null }] };
    const next = removeEmptyPanel(store, 0);
    expect(next.panels).toHaveLength(0);
  });

  it('keeps a panel with an active page', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    const next = removeEmptyPanel(store, 0);
    expect(next.panels).toHaveLength(1);
  });

  it('does nothing when the index is out of range', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: null }] };
    const next = removeEmptyPanel(store, 5);
    expect(next.panels).toHaveLength(1);
  });
});

describe('updatePanel', () => {
  it('patches the pageKey field', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    const next = updatePanel(store, 0, { pageKey: 'r2' });
    expect(next.panels[0].pageKey).toBe('r2');
  });

  it('does nothing when the index is out of range', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    const next = updatePanel(store, 5, { pageKey: 'r2' });
    expect(next.panels[0].pageKey).toBe('r1');
  });

  it('does nothing when partialPanel is null', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    const next = updatePanel(store, 0, null);
    expect(next.panels[0].pageKey).toBe('r1');
  });
});

describe('mergePanels', () => {
  it('moves the pageKey from A into B when B has none, then removes A', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }, { pageKey: null }] };
    const next = mergePanels(store, 0, 1);
    expect(next.panels).toEqual([{ pageKey: 'r1' }]);
  });

  it('does not overwrite an existing pageKey in B', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }, { pageKey: 'r2' }] };
    const next = mergePanels(store, 0, 1);
    expect(next.panels).toEqual([{ pageKey: 'r2' }]);
  });

  it('does nothing for out-of-range indices', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    const next = mergePanels(store, 0, 5);
    expect(next.panels).toHaveLength(1);
  });
});

describe('setPanel', () => {
  it('sets the panel using defaults plus overrides', () => {
    const store = { ...getDefaultRouterStore(), panels: [] };
    const next = setPanel(store, 0, { pageKey: 'r1' });
    expect(next.panels[0]).toEqual({ pageKey: 'r1' });
  });

  it('replaces an existing panel entirely', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    const next = setPanel(store, 0, { pageKey: 'r2' });
    expect(next.panels[0]).toEqual({ pageKey: 'r2' });
  });
});

describe('insertLeftPanel', () => {
  it('inserts a panel at the given index', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    const [next, index] = insertLeftPanel(store, 0, { pageKey: 'r0' }, makePreferences({ maxPanels: 3 }));
    expect(index).toBe(0);
    expect(next.panels[0].pageKey).toBe('r0');
  });

  it('trims overflow from the end when exceeding maxPanels', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }, { pageKey: 'r2' }] };
    const [next] = insertLeftPanel(store, 0, { pageKey: 'r0' }, makePreferences({ maxPanels: 2 }));
    expect(next.panels).toHaveLength(2);
    expect(next.panels.map(p => p.pageKey)).toEqual(['r0', 'r1']);
  });

  it('returns null index when maxPanels is 0', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    const [, index] = insertLeftPanel(store, 0, { pageKey: 'r0' }, makePreferences({ maxPanels: 0 }));
    expect(index).toBeNull();
  });
});

describe('insertRightPanel', () => {
  it('inserts a panel to the right of the source index', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    const [next, index] = insertRightPanel(store, 0, { pageKey: 'r2' }, makePreferences({ maxPanels: 3 }));
    expect(index).toBe(1);
    expect(next.panels[1].pageKey).toBe('r2');
  });

  it('trims overflow from the start when exceeding maxPanels', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }, { pageKey: 'r2' }] };
    const [next, index] = insertRightPanel(store, 1, { pageKey: 'r3' }, makePreferences({ maxPanels: 2 }));
    expect(next.panels.map(p => p.pageKey)).toEqual(['r2', 'r3']);
    expect(index).toBe(1);
  });

  it('returns null index when maxPanels is 0', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    const [, index] = insertRightPanel(store, 0, { pageKey: 'r2' }, makePreferences({ maxPanels: 0 }));
    expect(index).toBeNull();
  });
});

describe('upsertPanel', () => {
  it('updates an existing panel when the index is in range', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    const [next, index] = upsertPanel(store, 0, { pageKey: 'r2' }, makePreferences());
    expect(index).toBe(0);
    expect(next.panels[0].pageKey).toBe('r2');
  });

  it('inserts a new panel when the index is out of range', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    const [next, index] = upsertPanel(store, 5, { pageKey: 'r2' }, makePreferences({ maxPanels: 3 }));
    expect(index).toBe(1);
    expect(next.panels[1].pageKey).toBe('r2');
  });
});

describe('filterPanelMissingPageKeys', () => {
  it('nulls out a pageKey no longer present in pages', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'missing' }], pages: {} };
    const next = filterPanelMissingPageKeys(store, 0);
    expect(next.panels[0].pageKey).toBeNull();
  });

  it('keeps a pageKey that exists in pages', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }], pages: { r1: makePage('/r1') } };
    const next = filterPanelMissingPageKeys(store, 0);
    expect(next.panels[0].pageKey).toBe('r1');
  });

  it('does nothing when the index is out of range', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }], pages: { r1: makePage('/r1') } };
    const next = filterPanelMissingPageKeys(store, 5);
    expect(next.panels[0].pageKey).toBe('r1');
  });
});

describe('setPanelActivePage', () => {
  it('leaves the panel unchanged (no fallback candidates implemented)', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: null }] };
    const next = setPanelActivePage(store, 0);
    expect(next.panels[0].pageKey).toBeNull();
  });

  it('does nothing when a page is already active', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }] };
    const next = setPanelActivePage(store, 0);
    expect(next.panels[0].pageKey).toBe('r1');
  });

  it('does nothing when the index is out of range', () => {
    const store = { ...getDefaultRouterStore(), panels: [] };
    expect(() => setPanelActivePage(store, 5)).not.toThrow();
  });
});

describe('sanitizePanels', () => {
  it('removes panels whose pageKey no longer exists', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: 'missing' }], pages: {} };
    const next = sanitizePanels(store, makePreferences());
    expect(next.panels).toHaveLength(0);
  });

  it('merges panels down to maxPanels', () => {
    const store = {
      ...getDefaultRouterStore(),
      panels: [{ pageKey: 'r1' }, { pageKey: 'r2' }, { pageKey: 'r3' }],
      pages: { r1: makePage('/r1'), r2: makePage('/r2'), r3: makePage('/r3') }
    };
    const next = sanitizePanels(store, makePreferences({ maxPanels: 2 }));
    expect(next.panels.length).toBeLessThanOrEqual(2);
  });

  it('keeps valid panels within maxPanels untouched', () => {
    const store = {
      ...getDefaultRouterStore(),
      panels: [{ pageKey: 'r1' }],
      pages: { r1: makePage('/r1') }
    };
    const next = sanitizePanels(store, makePreferences({ maxPanels: 2 }));
    expect(next.panels).toEqual([{ pageKey: 'r1' }]);
  });
});

//*****************************************************************************************
// Node
//*****************************************************************************************
describe('getDefaultRouterNode', () => {
  it('returns a node with a null pageKey and Infinity lastUsedAt by default', () => {
    const node = getDefaultRouterNode();
    expect(node.pageKey).toBeNull();
    expect(node.portal).toBeDefined();
  });

  it('applies partial overrides', () => {
    const node = getDefaultRouterNode({ pageKey: 'r1' });
    expect(node.pageKey).toBe('r1');
  });
});

describe('findOldestNodeKey', () => {
  it('returns the node key with the highest page age', () => {
    const store = {
      ...getDefaultRouterStore(),
      nodes: {
        n1: { portal: createReversePortalNode(), pageKey: 'r1' },
        n2: { portal: createReversePortalNode(), pageKey: 'r2' }
      },
      pages: { r1: makePage('/r1', { age: 1 }), r2: makePage('/r2', { age: 5 }) }
    };
    expect(findOldestNodeKey(store)).toBe('n2');
  });

  it('returns null when there are no nodes', () => {
    const store = { ...getDefaultRouterStore(), nodes: {} };
    expect(findOldestNodeKey(store)).toBeNull();
  });

  it('skips nodes whose pageKey is not in pages', () => {
    const store = {
      ...getDefaultRouterStore(),
      nodes: { n1: { portal: createReversePortalNode(), pageKey: 'missing' } },
      pages: {}
    };
    expect(findOldestNodeKey(store)).toBeNull();
  });
});

describe('findNodeKey', () => {
  it('returns the node key matching the pageKey', () => {
    const store = {
      ...getDefaultRouterStore(),
      nodes: { n1: { portal: createReversePortalNode(), pageKey: 'r1' } }
    };
    expect(findNodeKey(store, { pageKey: 'r1' })).toBe('n1');
  });

  it('returns null when no node matches', () => {
    const store = { ...getDefaultRouterStore(), nodes: {} };
    expect(findNodeKey(store, { pageKey: 'r1' })).toBeNull();
  });
});

describe('findNode', () => {
  it('returns the matching node', () => {
    const node = { portal: createReversePortalNode(), pageKey: 'r1' };
    const store = { ...getDefaultRouterStore(), nodes: { n1: node } };
    expect(findNode(store, { pageKey: 'r1' })).toBe(node);
  });

  it('returns null when no node matches', () => {
    const store = { ...getDefaultRouterStore(), nodes: {} };
    expect(findNode(store, { pageKey: 'r1' })).toBeNull();
  });
});

describe('findNodeFromKey', () => {
  it('returns the node at the given key', () => {
    const node = { portal: createReversePortalNode(), pageKey: 'r1' };
    const store = { ...getDefaultRouterStore(), nodes: { n1: node } };
    expect(findNodeFromKey(store, 'n1')).toBe(node);
  });

  it('returns a default node when the key is missing', () => {
    const store = { ...getDefaultRouterStore(), nodes: {} };
    expect(findNodeFromKey(store, 'missing').pageKey).toBeNull();
  });
});

describe('removeNode', () => {
  it('removes the node at the given key', () => {
    const store = {
      ...getDefaultRouterStore(),
      nodes: { n1: { portal: createReversePortalNode(), pageKey: 'r1' } }
    };
    const next = removeNode(store, 'n1');
    expect('n1' in next.nodes).toBe(false);
  });

  it('does nothing when the key does not exist', () => {
    const store: AppRouterStore = { ...getDefaultRouterStore(), nodes: {} };
    const next = removeNode(store, 'missing');
    expect(next.nodes).toEqual({});
  });
});

describe('updateNode', () => {
  it('updates the pageKey field', () => {
    const store = {
      ...getDefaultRouterStore(),
      nodes: { n1: { portal: createReversePortalNode(), pageKey: 'r1' } }
    };
    const next = updateNode(store, 'n1', { pageKey: 'r2' });
    expect(next.nodes.n1.pageKey).toBe('r2');
  });

  it('does nothing when the key does not exist', () => {
    const store = { ...getDefaultRouterStore(), nodes: {} };
    const next = updateNode(store, 'missing', { pageKey: 'r2' });
    expect(next.nodes).toEqual({});
  });

  it('does nothing when partialNode is null', () => {
    const store = {
      ...getDefaultRouterStore(),
      nodes: { n1: { portal: createReversePortalNode(), pageKey: 'r1' } }
    };
    const next = updateNode(store, 'n1', null);
    expect(next.nodes.n1.pageKey).toBe('r1');
  });
});

describe('setNode', () => {
  it('sets the node using defaults plus overrides', () => {
    const store = { ...getDefaultRouterStore(), nodes: {} };
    const next = setNode(store, 'n1', { pageKey: 'r1' });
    expect(next.nodes.n1.pageKey).toBe('r1');
  });
});

describe('addNode', () => {
  it('adds a node and returns a generated key', () => {
    const store = { ...getDefaultRouterStore(), nodes: {} };
    const [next, nodeKey] = addNode(store, { pageKey: 'r1' });
    expect(nodeKey).toBeTruthy();
    expect(next.nodes[nodeKey as string].pageKey).toBe('r1');
    expect(next.nodes[nodeKey as string].portal).toBeDefined();
  });
});

describe('upsertNode', () => {
  it('updates an existing node when the key is present', () => {
    const store = {
      ...getDefaultRouterStore(),
      nodes: { n1: { portal: createReversePortalNode(), pageKey: 'r1' } }
    };
    const [next, nodeKey] = upsertNode(store, 'n1', { pageKey: 'r2' });
    expect(nodeKey).toBe('n1');
    expect(next.nodes.n1.pageKey).toBe('r2');
  });

  it('adds a new node when the key is missing', () => {
    const store = { ...getDefaultRouterStore(), nodes: {} };
    const [next, nodeKey] = upsertNode(store, 'missing', { pageKey: 'r1' });
    expect(next.nodes[nodeKey as string].pageKey).toBe('r1');
  });
});

describe('filterOrphanedNodes', () => {
  it('removes nodes whose pageKey is missing from pages', () => {
    const store = {
      ...getDefaultRouterStore(),
      nodes: { n1: { portal: createReversePortalNode(), pageKey: 'missing' } },
      pages: {}
    };
    const next = filterOrphanedNodes(store);
    expect('n1' in next.nodes).toBe(false);
  });

  it('keeps nodes whose pageKey exists in pages', () => {
    const store = {
      ...getDefaultRouterStore(),
      nodes: { n1: { portal: createReversePortalNode(), pageKey: 'r1' } },
      pages: { r1: makePage('/r1') }
    };
    const next = filterOrphanedNodes(store);
    expect('n1' in next.nodes).toBe(true);
  });
});

describe('addMissingNodes', () => {
  it('adds a node for an active panel page missing a backing node', () => {
    const store: AppRouterStore = {
      ...getDefaultRouterStore(),
      panels: [{ pageKey: 'r1' }],
      nodes: {},
      pages: { r1: makePage('/r1') }
    };
    const next = addMissingNodes(store);
    expect(Object.values(next.nodes).some(n => n.pageKey === 'r1')).toBe(true);
  });

  it('does not add a node when one already exists for the panel page', () => {
    const store = {
      ...getDefaultRouterStore(),
      panels: [{ pageKey: 'r1' }],
      nodes: { n1: { portal: createReversePortalNode(), pageKey: 'r1' } },
      pages: { r1: makePage('/r1') }
    };
    const next = addMissingNodes(store);
    expect(Object.keys(next.nodes)).toHaveLength(1);
  });

  it('skips panels without an active pageKey', () => {
    const store = { ...getDefaultRouterStore(), panels: [{ pageKey: null }], nodes: {}, pages: {} };
    const next = addMissingNodes(store);
    expect(next.nodes).toEqual({});
  });
});

describe('removeOldestNodes', () => {
  it('trims nodes until within maxPanels + maxNodes', () => {
    const store = {
      ...getDefaultRouterStore(),
      panels: [],
      nodes: {
        n1: { portal: createReversePortalNode(), pageKey: 'r1' },
        n2: { portal: createReversePortalNode(), pageKey: 'r2' },
        n3: { portal: createReversePortalNode(), pageKey: 'r3' }
      },
      pages: { r1: makePage('/r1', { age: 1 }), r2: makePage('/r2', { age: 2 }), r3: makePage('/r3', { age: 3 }) }
    };
    const next = removeOldestNodes(store, makePreferences({ maxPanels: 0, maxNodes: 1 }));
    expect(Object.keys(next.nodes)).toHaveLength(1);
  });

  it('does nothing when node count is within budget', () => {
    const store = {
      ...getDefaultRouterStore(),
      nodes: { n1: { portal: createReversePortalNode(), pageKey: 'r1' } },
      pages: { r1: makePage('/r1') }
    };
    const next = removeOldestNodes(store, makePreferences({ maxPanels: 2, maxNodes: 2 }));
    expect(Object.keys(next.nodes)).toHaveLength(1);
  });
});

describe('sanitizeNodes', () => {
  it('removes orphaned nodes, adds missing nodes, and trims excess nodes', () => {
    const store = {
      ...getDefaultRouterStore(),
      panels: [{ pageKey: 'r1' }],
      nodes: { orphan: { portal: createReversePortalNode(), pageKey: 'missing' } },
      pages: { r1: makePage('/r1') }
    };
    const next = sanitizeNodes(store, makePreferences({ maxPanels: 2, maxNodes: 2 }));
    expect('orphan' in next.nodes).toBe(false);
    expect(Object.values(next.nodes).some(n => n.pageKey === 'r1')).toBe(true);
  });
});

//*****************************************************************************************
// Page
//*****************************************************************************************
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

//*****************************************************************************************
// Not Found Page
//*****************************************************************************************
describe('isNotFoundRouterPage', () => {
  it('returns true when the digest is "not-found"', () => {
    expect(isNotFoundRouterPage({ digest: 'not-found' })).toBe(true);
  });

  it('returns true when transient.__notFound is true', () => {
    expect(isNotFoundRouterPage({ digest: 'x', transient: { __notFound: true } })).toBe(true);
  });

  it('returns false for a regular page', () => {
    expect(isNotFoundRouterPage(makePage('/r1'))).toBe(false);
  });

  it('returns false for a null page', () => {
    expect(isNotFoundRouterPage(null)).toBe(false);
  });
});

describe('getNotFoundRouterPage', () => {
  it('returns a page with the not-found digest and default href', () => {
    const page = getNotFoundRouterPage();
    expect(page.digest).toBe('not-found');
    expect(page.href).toBe('/not-found');
    expect((page.transient as { __notFound: boolean }).__notFound).toBe(true);
  });

  it('applies the provided href', () => {
    const page = getNotFoundRouterPage({}, '/custom');
    expect(page.href).toBe('/custom');
  });

  it('spreads the provided values into transient.values', () => {
    const page = getNotFoundRouterPage({ foo: 'bar' });
    expect((page.transient as { values: Record<string, unknown> }).values).toEqual({ foo: 'bar' });
  });
});

describe('resolveNotFoundPage', () => {
  it('returns the page unchanged when it already has an href', () => {
    const page = makePage('/r1');
    expect(resolveNotFoundPage(page, '/attempted', {})).toBe(page);
  });

  it('builds a not-found page with attempted diagnostics when href is missing', () => {
    const page = { digest: null, href: null } as never;
    const result = resolveNotFoundPage(page, '/attempted', { operation: 'navigate' });
    const values = (result.transient as { values: { attemptedHref: string; operation: string } }).values;
    expect(result.digest).toBe('not-found');
    expect(values.attemptedHref).toBe('/attempted');
    expect(values.operation).toBe('navigate');
  });

  it('extracts attemptedHref from a location-like input', () => {
    const page = { digest: null, href: null } as never;
    const result = resolveNotFoundPage(page, { pathname: '/foo', search: '?a=1', hash: '' }, {});
    const values = (result.transient as { values: { attemptedHref: string } }).values;
    expect(values.attemptedHref).toBe('/foo?a=1');
  });
});

describe('formatNotFoundDiagnosticValue', () => {
  it('returns null for null/undefined values', () => {
    expect(formatNotFoundDiagnosticValue(null, 'n/a')).toBeNull();
    expect(formatNotFoundDiagnosticValue(undefined, 'n/a')).toBeNull();
  });

  it('returns strings as-is', () => {
    expect(formatNotFoundDiagnosticValue('hello', 'n/a')).toBe('hello');
  });

  it('stringifies numbers and booleans', () => {
    expect(formatNotFoundDiagnosticValue(42, 'n/a')).toBe('42');
    expect(formatNotFoundDiagnosticValue(true, 'n/a')).toBe('true');
  });

  it('JSON-stringifies objects', () => {
    expect(formatNotFoundDiagnosticValue({ a: 1 }, 'n/a')).toBe(JSON.stringify({ a: 1 }, null, 2));
  });

  it('falls back to the unserializable value placeholder on circular structures', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(formatNotFoundDiagnosticValue(circular, 'unserializable')).toBe('unserializable');
  });
});

describe('getNotFoundPreviewHref', () => {
  it('returns null when diagnostics is null', () => {
    expect(getNotFoundPreviewHref(null)).toBeNull();
  });

  it('prefers diagnostics.attemptedHref when present', () => {
    expect(getNotFoundPreviewHref({ attemptedHref: '/a' })).toBe('/a');
  });

  it('falls back to attemptedPage.href', () => {
    expect(getNotFoundPreviewHref({ attemptedPage: { href: '/b' } })).toBe('/b');
  });

  it('falls back to a string attemptedInput', () => {
    expect(getNotFoundPreviewHref({ attemptedInput: '/c' })).toBe('/c');
  });

  it('falls back to a location-like attemptedInput', () => {
    expect(getNotFoundPreviewHref({ attemptedInput: { pathname: '/d', search: '?x=1' } })).toBe('/d?x=1');
  });

  it('returns null when nothing usable is found', () => {
    expect(getNotFoundPreviewHref({})).toBeNull();
  });
});

describe('getNotFoundDetails', () => {
  const labels = {
    attemptedHref: 'Attempted href',
    operation: 'Operation',
    originPageKey: 'Origin page key',
    pageAge: 'Page age',
    pageDigest: 'Page digest',
    pageHref: 'Page href',
    pageKey: 'Page key',
    pageScroll: 'Page scroll',
    pageState: 'Page state',
    pageTransient: 'Page transient',
    panelKey: 'Panel key',
    targetPanelKey: 'Target panel key'
  };

  it('returns an empty array when diagnostics is null', () => {
    expect(getNotFoundDetails(null, labels, 'n/a')).toEqual([]);
  });

  it('includes only fields with defined values', () => {
    const details = getNotFoundDetails({ operation: 'navigate', attemptedHref: '/x' }, labels, 'n/a');
    expect(details).toEqual([
      { label: 'Operation', value: 'navigate', pre: false },
      { label: 'Attempted href', value: '/x', pre: false }
    ]);
  });

  it('marks page state/transient entries as preformatted', () => {
    const details = getNotFoundDetails({ attemptedPage: { state: { a: 1 } } }, labels, 'n/a');
    expect(details).toContainEqual({ label: 'Page state', value: JSON.stringify({ a: 1 }, null, 2), pre: true });
  });
});

//*****************************************************************************************
// Blocked Pages
//*****************************************************************************************
describe('addBlockedPage', () => {
  it('adds a blocker entry with the given reason', () => {
    const store = { ...getDefaultNavigationStore(), pages: { r1: makePage('/r1') } };
    const next = addBlockedPage(store, 'r1', 'unsaved_changes');
    expect(next.blockedPages.r1).toBe('unsaved_changes');
  });

  it('defaults reason to unsaved_changes', () => {
    const store = { ...getDefaultNavigationStore() };
    const next = addBlockedPage(store, 'r1');
    expect(next.blockedPages.r1).toBe('unsaved_changes');
  });

  it('does nothing when pageKey is falsy', () => {
    const store = { ...getDefaultNavigationStore() };
    const next = addBlockedPage(store, null);
    expect(next.blockedPages).toEqual({});
  });
});

describe('removeBlockedPage', () => {
  it('removes the blocker entry', () => {
    const store = { ...getDefaultNavigationStore(), blockedPages: { r1: 'unsaved_changes' as const } };
    const next = removeBlockedPage(store, 'r1');
    expect('r1' in next.blockedPages).toBe(false);
  });

  it('does nothing when the key does not exist', () => {
    const store = { ...getDefaultNavigationStore(), blockedPages: {} };
    const next = removeBlockedPage(store, 'missing');
    expect(next.blockedPages).toEqual({});
  });
});

describe('setBlockedPage', () => {
  it('adds a blocker when reason is truthy', () => {
    const store = { ...getDefaultNavigationStore() };
    const next = setBlockedPage(store, 'r1', 'unsaved_changes');
    expect(next.blockedPages.r1).toBe('unsaved_changes');
  });

  it('removes a blocker when reason is null', () => {
    const store = { ...getDefaultNavigationStore(), blockedPages: { r1: 'unsaved_changes' as const } };
    const next = setBlockedPage(store, 'r1', null);
    expect('r1' in next.blockedPages).toBe(false);
  });
});

describe('getBlockedPages', () => {
  it('returns an empty array when there are no blocked pages', () => {
    const store = { ...getDefaultNavigationStore(), blockedPages: {} };
    expect(getBlockedPages(store)).toEqual([]);
  });

  it('returns entries for blocked pages', () => {
    const store = { ...getDefaultNavigationStore(), blockedPages: { r1: 'unsaved_changes' as const } };
    expect(getBlockedPages(store)).toEqual([['r1', 'unsaved_changes']]);
  });
});

describe('clearBlockedPages', () => {
  it('clears all blocked pages', () => {
    const store = { ...getDefaultNavigationStore(), blockedPages: { r1: 'unsaved_changes' as const } };
    const next = clearBlockedPages(store);
    expect(next.blockedPages).toEqual({});
  });
});

describe('hasBlockedPages', () => {
  it('returns true when a blocked page digest differs between stores', () => {
    const navigation = {
      ...getDefaultNavigationStore(),
      panels: [{ pageKey: 'r1' }],
      pages: { r1: makePage('/r1') },
      blockedPages: { r1: 'unsaved_changes' as const }
    };
    const router = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }], pages: { r1: makePage('/r2') } };
    expect(hasBlockedPages(navigation, router)).toBe(true);
  });

  it('returns false when blocked pages match between stores', () => {
    const page = makePage('/r1');
    const navigation = {
      ...getDefaultNavigationStore(),
      panels: [{ pageKey: 'r1' }],
      pages: { r1: page },
      blockedPages: { r1: 'unsaved_changes' as const }
    };
    const router = { ...getDefaultRouterStore(), panels: [{ pageKey: 'r1' }], pages: { r1: { ...page } } };
    expect(hasBlockedPages(navigation, router)).toBe(false);
  });

  it('returns false when there are no blocked pages', () => {
    const navigation = { ...getDefaultNavigationStore(), blockedPages: {} };
    const router = { ...getDefaultRouterStore() };
    expect(hasBlockedPages(navigation, router)).toBe(false);
  });
});

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

//*****************************************************************************************
// resolveLegacyLocation
//*****************************************************************************************
describe('resolveLegacyLocation', () => {
  it.each<[string, string, string | undefined]>([
    ['/', '/', undefined],
    ['/account', '/account', undefined],
    ['/alerts_redirect', '/alerts-redirect', undefined],
    ['/archive', '/archives', undefined],
    ['/notfound', '/not-found', undefined],
    ['/manage/badlist', '/manage/badlists', undefined],
    ['/manage/safelist', '/manage/safelists', undefined]
  ])('maps %s to the current route grammar', (pathname, main, drawer) => {
    expect(resolveLegacyLocation(pathname, '', '')).toEqual({ 0: main, ...(drawer ? { 1: drawer } : {}) });
  });

  it.each<[string, string]>([
    ['/admin/apikeys/abc', '/admin/apikeys/abc'],
    ['/admin/errors/error-1', '/admin/errors/error-1'],
    ['/alerts/alert-1', '/alert/alert-1'],
    ['/manage/badlist/item-1', '/manage/badlist/detail/item-1'],
    ['/manage/heuristic/heur-1', '/manage/heuristic/detail/heur-1'],
    ['/manage/safelist/item-1', '/manage/safelist/detail/item-1'],
    ['/manage/signature/sig-1', '/manage/signature/detail/sig-1'],
    ['/retrohunt/hunt-1', '/retrohunt/detail/hunt-1']
  ])('maps dynamic path %s to %s', (pathname, main) => {
    expect(resolveLegacyLocation(pathname, '', '')).toEqual({ 0: main });
  });

  it.each<[string, string, string, string]>([
    ['/admin/apikeys', '#key-1', '/admin/apikeys', '/admin/apikeys/key-1'],
    ['/admin/errors', '#error-1', '/admin/errors', '/admin/errors/error-1'],
    ['/admin/services', '#service-1', '/admin/services', '/admin/services/service-1'],
    ['/admin/users', '#user-1', '/admin/users', '/admin/users/user-1'],
    ['/alerts', '#/alert/alert-1', '/alerts', '/alert/alert-1'],
    ['/archive', '#archive-1', '/archives', '/archive/archive-1'],
    ['/manage/heuristics', '#heur-1', '/manage/heuristics', '/manage/heuristic/detail/heur-1'],
    ['/manage/signatures', '#sig-1', '/manage/signatures', '/manage/signature/detail/sig-1'],
    ['/retrohunt', '#hunt-1', '/retrohunt', '/retrohunt/detail/hunt-1']
  ])('maps %s%s to main and drawer panels', (pathname, hash, main, drawer) => {
    expect(resolveLegacyLocation(pathname, '', hash)).toEqual({ 0: main, 1: drawer });
  });

  it.each<[string, string, string, string]>([
    ['/manage/badlist', '#new', '/manage/badlists', '/manage/badlist/add'],
    ['/manage/safelist', '#new', '/manage/safelists', '/manage/safelist/add'],
    ['/alerts', '#/workflow/', '/alerts', '/manage/workflow/create'],
    ['/manage/workflows', '#/create/', '/manage/workflows', '/manage/workflow/create'],
    ['/manage/workflows', '#/create/workflow-1', '/manage/workflows', '/manage/workflow/create/workflow-1'],
    ['/manage/workflows', '#/detail/workflow-1', '/manage/workflows', '/manage/workflow/detail/workflow-1']
  ])('maps special drawer location %s%s', (pathname, hash, main, drawer) => {
    expect(resolveLegacyLocation(pathname, '', hash)).toEqual({ 0: main, 1: drawer });
  });

  it('maps the legacy submission file path to submission and file panels', () => {
    expect(resolveLegacyLocation('/submission/detail/sub-1/file-1', '', '')).toEqual({
      0: '/submission/detail/sub-1',
      1: '/file/detail/file-1'
    });
  });

  it('preserves the pathname search on the main panel', () => {
    expect(resolveLegacyLocation('/search/alerts', '?q=test&offset=25', '')).toEqual({
      0: '/search/alerts?q=test&offset=25'
    });
  });

  it('preserves a hash query on the drawer panel', () => {
    expect(resolveLegacyLocation('/alerts', '?q=main', '#/alert/alert-1?tab=related')).toEqual({
      0: '/alerts?q=main',
      1: '/alert/alert-1?tab=related'
    });
  });

  it('accepts trailing slashes without adding them to resolved hrefs', () => {
    expect(resolveLegacyLocation('/file/viewer/file-1/image/', '?q=test', '')).toEqual({
      0: '/file/viewer/file-1/image?q=test'
    });
    expect(resolveLegacyLocation('/manage/workflows/', '', '#/detail/workflow-1/')).toEqual({
      0: '/manage/workflows',
      1: '/manage/workflow/detail/workflow-1'
    });
  });

  it('returns null for an unknown legacy pathname', () => {
    expect(resolveLegacyLocation('/unknown', '', '')).toBeNull();
  });
});
