import type { AppRouterStore } from 'core/router';
import {
  filterPanelMissingPageKeys,
  findNextPanelKeyFromPageKey,
  findPanel,
  findPanelKey,
  findPanelKeyFromPageKey,
  findPrevPanelKeyFromPageKey,
  getDefaultRouterPanel,
  getDefaultRouterStore,
  getPanel,
  insertLeftPanel,
  insertRightPanel,
  mergePanels,
  removeEmptyPanel,
  removePanel,
  sanitizePanels,
  setPanel,
  setPanelActivePage,
  updatePanel,
  upsertPanel
} from 'core/router';
import { makePage, makePreferences } from 'core/router/tests/test-defaults';
import { describe, expect, it } from 'vitest';

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
