import type { AppRouterNode, AppRouterStore, AppSharedRouterStore } from 'core/router';
import { createReversePortalNode } from 'features/portal';
import { generateRandomUUID } from 'shared/utils/app.utils';

//*****************************************************************************************
// Node
//*****************************************************************************************

/**
 * @name getDefaultRouterNode
 * @description Creates a router node with a new portal and optional overrides.
 * @param node - Optional node fields that override the defaults.
 * @returns A complete router node.
 */
export const getDefaultRouterNode = function (node: Partial<AppRouterNode> = null): AppRouterNode {
  return {
    portal: createReversePortalNode(),
    pageKey: null,
    ...node
  };
};

/**
 * @name findOldestNodeKey
 * @description Finds the node whose associated page has the highest age value.
 * @param store - Router store
 * @returns Oldest node key, or null
 */
export const findOldestNodeKey = function <const Store extends AppSharedRouterStore>(
  store: Store
): keyof Store['nodes'] {
  let oldestNodeKey: keyof Store['nodes'] = null;
  let oldestAge = -Infinity;

  for (const nodeKey in store.nodes) {
    const node = store.nodes[nodeKey];
    if (!(node.pageKey in store.pages)) continue;
    const age = store.pages[node.pageKey].age;
    if (age > oldestAge) {
      oldestAge = age;
      oldestNodeKey = nodeKey;
    }
  }

  return oldestNodeKey;
};

/**
 * @name findNodeKey
 * @description Finds a node key by partial node criteria.
 * @param store - Router store
 * @param partialNode - Partial node matcher
 * @returns Matching node key, or null
 */
export const findNodeKey = function <const Store extends AppSharedRouterStore>(
  store: Store,
  partialNode: Partial<AppRouterNode>
): keyof Store['nodes'] {
  const node = Object.entries(store?.nodes || {}).find(
    ([, node]) => partialNode?.pageKey && node?.pageKey === partialNode?.pageKey
  );
  return node?.[0] ?? null;
};

/**
 * @name findNode
 * @description Finds and returns a node by partial criteria.
 * @param store - Router store
 * @param partialNode - Partial node matcher
 * @returns Matching node, or null
 */
export const findNode = (store: AppRouterStore, partialNode: Partial<AppRouterNode>): AppRouterNode => {
  const nodeKey = findNodeKey(store, partialNode);
  return store.nodes?.[nodeKey] ?? null;
};

/**
 * @name findNodeFromKey
 * @description Finds a router node by its key.
 * @param store - Router store to inspect.
 * @param nodeKey - Node key to resolve.
 * @returns Matching node or a default router node.
 */
export const findNodeFromKey = (store: AppRouterStore, nodeKey: string): AppRouterNode => {
  if (nodeKey in (store?.nodes || {})) return store.nodes[nodeKey];
  return getDefaultRouterNode();
};

/**
 * @name removeNode
 * @description Removes a node from the store.
 * @param store - Router store
 * @returns Updated router store with one node removed when available
 */
export const removeNode = function <const Store extends AppSharedRouterStore>(
  store: Store,
  nodeKey: keyof Store['nodes']
): Store {
  if (!(nodeKey in store.nodes)) return store;
  delete store.nodes[nodeKey as string];
  return store;
};

/**
 * @name updateNode
 * @description Updates node fields by key.
 * @param store - Router store
 * @param nodeKey - Node key to update
 * @param partialNode - Partial node values
 * @returns Updated router store
 */
export const updateNode = (
  store: AppRouterStore,
  nodeKey: keyof AppRouterStore['nodes'],
  partialNode: Partial<AppRouterNode> = null
): AppRouterStore => {
  if (!(nodeKey in store.nodes)) return store;

  if (partialNode?.pageKey) {
    store.nodes[nodeKey].pageKey = partialNode.pageKey;
  }

  if (partialNode?.portal) {
    store.nodes[nodeKey].portal = partialNode.portal;
  }

  return store;
};

/**
 * @name setNode
 * @description Sets or replaces a node by key using node defaults plus the supplied partial values.
 * @param store - Router store
 * @param nodeKey - Target node key
 * @param partialNode - Partial node payload
 * @returns Updated router store
 */
export const setNode = (
  store: AppRouterStore,
  nodeKey: keyof AppRouterStore['nodes'],
  partialNode: Partial<AppRouterNode>
): AppRouterStore => {
  store.nodes[nodeKey] = { ...getDefaultRouterNode(), ...partialNode };
  return store;
};

/**
 * @name addNode
 * @description Adds a node and returns its generated key.
 * @param store - Router store
 * @param partialNode - Partial node payload
 * @returns Tuple of updated store and new node key
 */
export const addNode = (
  store: AppRouterStore,
  partialNode: Partial<AppRouterNode> = null
): [AppRouterStore, keyof AppRouterStore['nodes']] => {
  const nodeKey = generateRandomUUID(Object.keys(store.nodes));
  store.nodes[nodeKey] = { ...getDefaultRouterNode(), ...partialNode, portal: createReversePortalNode() };
  return [store, nodeKey];
};

/**
 * @name upsertNode
 * @description Updates an existing node or inserts a new node when missing.
 * @param store - Router store
 * @param nodeKey - Optional target node key
 * @param partialNode - Partial node payload
 * @returns Tuple of updated store and resolved node key
 */
export const upsertNode = (
  store: AppRouterStore,
  nodeKey: keyof AppRouterStore['nodes'] = null,
  partialNode: Partial<AppRouterNode> = null
): [AppRouterStore, keyof AppRouterStore['nodes']] => {
  if (nodeKey in store.nodes) store = updateNode(store, nodeKey, partialNode);
  else [store, nodeKey] = addNode(store, partialNode);
  return [store, nodeKey];
};

/**
 * @name filterOrphanedNodes
 * @description Removes nodes whose page keys are missing from the page store.
 * @param store - Router store
 * @returns Updated router store
 */
export const filterOrphanedNodes = function <const Store extends AppSharedRouterStore>(store: Store): Store {
  Object.keys(store.nodes).forEach(nodeKey => {
    if (!(store.nodes[nodeKey].pageKey in store.pages)) {
      delete store.nodes[nodeKey];
    }
  });

  return store;
};

/**
 * @name addMissingNodes
 * @description Ensures each active panel page has a backing node.
 * @param store - Router store
 * @returns Updated router store
 */
export const addMissingNodes = function <const Store extends AppSharedRouterStore>(store: Store): Store {
  for (const [, panel] of store.panels.entries()) {
    if (!panel.pageKey) continue;
    const nodeKey = findNodeKey(store, { pageKey: panel.pageKey });
    if (nodeKey !== null) continue;

    const nextNodeKey = generateRandomUUID(Object.keys(store.nodes));
    if ('blockedPages' in (store as Record<string, unknown>)) {
      store.nodes[nextNodeKey] = { pageKey: panel.pageKey } as Store['nodes'][string];
    } else {
      store.nodes[nextNodeKey] = {
        pageKey: panel.pageKey,
        portal: createReversePortalNode()
      } as unknown as Store['nodes'][string];
    }
  }

  return store;
};

/**
 * @name findOldestBackgroundNodeKey
 * @description Finds the oldest node that is not attached to an active panel.
 * @param store - Router-compatible store to inspect.
 * @param activePageKeys - Page keys currently displayed by router panels.
 * @returns Oldest background node key, or null when none is available.
 */
export const findOldestBackgroundNodeKey = <const Store extends AppSharedRouterStore>(
  store: Store,
  activePageKeys: ReadonlySet<keyof Store['pages']>
): keyof Store['nodes'] => {
  let oldestNodeKey: keyof Store['nodes'] = null;
  let oldestAge = -Infinity;

  for (const nodeKey in store.nodes) {
    const node = store.nodes[nodeKey];
    if (activePageKeys.has(node.pageKey) || !(node.pageKey in store.pages)) continue;

    const age = store.pages[node.pageKey].age;
    if (age > oldestAge) {
      oldestAge = age;
      oldestNodeKey = nodeKey;
    }
  }

  return oldestNodeKey;
};

/**
 * @name getBackgroundNodeCount
 * @description Counts nodes that are not attached to an active panel.
 * @param store - Router-compatible store to inspect.
 * @param activePageKeys - Page keys currently displayed by router panels.
 * @returns Number of background nodes.
 */
export const getBackgroundNodeCount = <const Store extends AppSharedRouterStore>(
  store: Store,
  activePageKeys: ReadonlySet<keyof Store['pages']>
): number => {
  return Object.values(store.nodes).filter(node => !activePageKeys.has(node.pageKey)).length;
};

/**
 * @name removeOldestNodes
 * @description Trims background nodes to `maxExtraNodes` while preserving nodes for active panels.
 * @param store - Router store
 * @param preferences - Preferences containing the background page cache limit.
 * @returns Updated router store
 */
export const removeOldestNodes = function <const Store extends AppSharedRouterStore>(
  store: Store,
  preferences: AppPreferenceStore
): Store {
  const activePageKeys = new Set(store.panels.map(panel => panel.pageKey).filter(Boolean));

  while (getBackgroundNodeCount(store, activePageKeys) > preferences.router.maxExtraNodes) {
    const nodeKey = findOldestBackgroundNodeKey(store, activePageKeys);
    if (nodeKey === null) break;
    store = removeNode(store, nodeKey);
  }

  return store;
};

/**
 * @name sanitizeNodes
 * @description Normalizes nodes by removing orphaned nodes, adding missing nodes, and trimming excess nodes.
 * @param store - Router store
 * @returns Updated router store
 */
export const sanitizeNodes = function <const Store extends AppSharedRouterStore>(
  store: Store,
  preferences: AppPreferenceStore
): Store {
  store = filterOrphanedNodes(store);
  store = addMissingNodes(store);
  store = removeOldestNodes(store, preferences);
  return store;
};
