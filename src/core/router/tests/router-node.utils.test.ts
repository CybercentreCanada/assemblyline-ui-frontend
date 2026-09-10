import type { AppRouterStore } from 'core/router';
import {
  addMissingNodes,
  addNode,
  filterOrphanedNodes,
  findNode,
  findNodeFromKey,
  findNodeKey,
  findOldestNodeKey,
  getDefaultRouterNode,
  getDefaultRouterStore,
  removeNode,
  removeOldestNodes,
  sanitizeNodes,
  setNode,
  updateNode,
  upsertNode
} from 'core/router';
import { makePage, makePreferences } from 'core/router/tests/test-defaults';
import { createReversePortalNode } from 'features/portal';
import { describe, expect, it } from 'vitest';

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
    expect(next.nodes[nodeKey].pageKey).toBe('r1');
    expect(next.nodes[nodeKey].portal).toBeDefined();
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
    expect(next.nodes[nodeKey].pageKey).toBe('r1');
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
