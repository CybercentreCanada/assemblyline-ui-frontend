import type {
  AppLocationState,
  AppNavigateOptions,
  AppNavigationStore,
  AppRouterNode,
  AppRouterPanel,
  AppRouterRoute,
  AppRouterStore,
  AppSharedRouterStore,
  InferAppNavigationOperationMapFromPath,
  InferAppNavigationPropsFromPath,
  RouteKeyOf
} from 'core/router';
import { createReversePortalNode } from 'features/portal';
import type { SetStateAction } from 'react';
import { generateRandomUUID, hashObjectKeyOrderIndependent } from 'shared/utils/app.utils';

//*****************************************************************************************
// Panel
//*****************************************************************************************

export const getDefaultRouterPanel = function (panel: Partial<AppRouterPanel> = null): AppRouterPanel {
  return {
    routeKey: null,
    // pinnedRouteKeys: [],
    // tabbedRouteKeys: [],
    // temporaryRouteKey: null,
    ...panel
  };
};

/**
 * @name findPanelKey
 * @description Finds the first panel index matching the provided partial panel criteria.
 * @param store - Router store
 * @param partialPanel - Partial panel matcher
 * @returns Matching panel index, or -1 when not found
 */
export const findPanelKey = function <const Store extends AppSharedRouterStore>(
  store: Store,
  partialPanel: Partial<AppRouterPanel>
): number {
  for (let i = 0; i < store.panels.length; i++) {
    if (partialPanel?.routeKey && store.panels[i].routeKey === partialPanel?.routeKey) return i;
    // else if (partialPanel?.temporaryRouteKey && store.panels[i].temporaryRouteKey === partialPanel?.temporaryRouteKey)
    //   return i;
    // else if (
    //   Array.isArray(partialPanel?.tabbedRouteKeys) &&
    //   partialPanel?.tabbedRouteKeys.every(k => store.panels[i].tabbedRouteKeys.includes(k))
    // )
    //   return i;
    // else if (
    //   Array.isArray(partialPanel?.pinnedRouteKeys) &&
    //   partialPanel?.pinnedRouteKeys.every(k => store.panels[i].pinnedRouteKeys.includes(k))
    // )
    //   return i;
  }

  return -1;
};

export const findPanelKeyFromRouteKey = function <const Store extends AppSharedRouterStore>(
  store: Store,
  routeKey: RouteKeyOf<Store>
): number {
  if (!routeKey) return -1;

  for (let i = 0; i < store.panels.length; i++) {
    const panel = store.panels[i];

    if (panel?.routeKey && panel.routeKey === routeKey) return i;
    // if (panel?.temporaryRouteKey && panel.temporaryRouteKey === routeKey) return i;
    // if (panel?.tabbedRouteKeys?.includes(routeKey)) return i;
    // if (panel?.pinnedRouteKeys?.includes(routeKey)) return i;
  }

  return -1;
};

/**
 * @name findPrevPanelKeyFromRouteKey
 * @description Resolves the previous target panel index from the current route panel and navigation style.
 * When the route is outside all panels, defaults to the first panel.
 * @param store - Router store
 * @param routeKey - Current route key
 * @param preferences.router.navigation - Panel navigation strategy
 * @returns Previous target panel index
 */
export const findPrevPanelKeyFromRouteKey = function <const Store extends AppSharedRouterStore>(
  store: Store,
  routeKey: RouteKeyOf<Store>,
  preferences: AppPreferenceStore
): number {
  const currentPanelKey = findPanelKeyFromRouteKey(store, routeKey);
  const originPanelKey = currentPanelKey < 0 ? 0 : currentPanelKey;

  if (preferences.router.navigation === 'push') return originPanelKey - 1;
  else if (preferences.router.navigation === 'loop')
    return originPanelKey - 1 < 0 ? preferences.router.maxPanels - 1 : originPanelKey - 1;
  else return preferences.router.maxPanels - 1;
};

/**
 * @name findNextPanelKeyFromRouteKey
 * @description Resolves the next target panel index from the current route panel and navigation style.
 * When the route is outside all panels, defaults to the first panel.
 * @param store - Router store
 * @param routeKey - Current route key
 * @param preferences.router.navigation - Panel navigation strategy
 * @returns Next target panel index
 */
export const findNextPanelKeyFromRouteKey = function <const Store extends AppSharedRouterStore>(
  store: Store,
  routeKey: RouteKeyOf<Store>,
  preferences: AppPreferenceStore
): number {
  const currentPanelKey = findPanelKeyFromRouteKey(store, routeKey);

  if (preferences.router.navigation === 'push') return currentPanelKey + 1;
  else if (preferences.router.navigation === 'loop')
    return currentPanelKey + 1 >= preferences.router.maxPanels ? 0 : currentPanelKey + 1;
  else return 0;
};

/**
 * @name findPanel
 * @description Returns the first panel matching the provided partial panel criteria.
 * @param store - Router store
 * @param partialPanel - Partial panel matcher
 * @returns Matching panel, or null when not found
 */
export const findPanel = function <const Store extends AppSharedRouterStore>(
  store: Store,
  partialPanel: Partial<AppRouterPanel>
): AppRouterPanel {
  const panelKey = findPanelKey(store, partialPanel);
  return panelKey >= 0 ? store.panels[panelKey] : null;
};

/**
 * @name findPanel
 * @description Returns the first panel matching the provided partial panel criteria.
 * @param store - Router store
 * @param partialPanel - Partial panel matcher
 * @returns Matching panel, or null when not found
 */
export const getPanel = function <const Store extends AppSharedRouterStore>(
  store: Store,
  panelKey: number
): AppRouterPanel {
  if (panelKey < 0 || panelKey >= store?.panels?.length) return getDefaultRouterPanel();
  return store.panels[panelKey] ?? getDefaultRouterPanel();
};

/**
 * @name removePanel
 * @description Removes a panel by index when it exists.
 * @param store - Router store
 * @param panelKey - Panel index to remove
 * @returns Updated router store
 */
export const removePanel = function <const Store extends AppSharedRouterStore>(store: Store, panelKey: number): Store {
  if (panelKey < 0 || panelKey >= store?.panels?.length) return store;
  store.panels.splice(panelKey, 1);
  return store;
};

/**
 * @name removeEmptyPanel
 * @description Removes a panel when it has no active, temporary, tabbed, or pinned routes.
 * @param store - Router store
 * @param panelKey - Panel index to evaluate
 * @returns Updated router store
 */
export const removeEmptyPanel = function <const Store extends AppSharedRouterStore>(
  store: Store,
  panelKey: number
): Store {
  if (panelKey < 0 || panelKey >= store?.panels?.length) return store;

  //  if (
  //   !store.panels[panelKey].routeKey &&
  //   !store.panels[panelKey].temporaryRouteKey &&
  //   !store.panels[panelKey].tabbedRouteKeys.length &&
  //   !store.panels[panelKey].pinnedRouteKeys.length
  // )

  if (!store.panels[panelKey].routeKey) {
    store.panels.splice(panelKey, 1);
  }

  return store;
};

/**
 * @name updatePanel
 * @description Patches panel fields with provided partial values.
 * @param store - Router store
 * @param panelKey - Panel index to update
 * @param partialPanel - Partial panel payload
 * @returns Updated router store
 */
export const updatePanel = function <const Store extends AppSharedRouterStore>(
  store: Store,
  panelKey: number,
  partialPanel: Partial<AppRouterPanel> = null
): Store {
  if (panelKey < 0 || panelKey >= store?.panels?.length) return store;

  if (partialPanel && 'routeKey' in partialPanel) {
    store.panels[panelKey].routeKey = partialPanel.routeKey;
  }

  // if (partialPanel && 'temporaryRouteKey' in partialPanel) {
  //   store.panels[panelKey].temporaryRouteKey = partialPanel.temporaryRouteKey;
  // }

  // if (Array.isArray(partialPanel?.tabbedRouteKeys)) {
  //   store.panels[panelKey].tabbedRouteKeys = partialPanel.tabbedRouteKeys;
  // }

  // if (Array.isArray(partialPanel?.pinnedRouteKeys)) {
  //   store.panels[panelKey].pinnedRouteKeys = partialPanel.pinnedRouteKeys;
  // }

  return store;
};

/**
 * @name mergePanels
 * @description Merges tabbed and pinned routes from source panel into destination panel.
 * @param store - Router store
 * @param panelKeyA - Destination panel index
 * @param panelKeyB - Source panel index
 * @returns Updated router store
 */
export const mergePanels = function <const Store extends AppSharedRouterStore>(
  store: Store,
  panelKeyA: number,
  panelKeyB: number
): Store {
  if (panelKeyA < 0 || panelKeyB < 0 || panelKeyA >= store.panels.length || panelKeyB >= store.panels.length) {
    return store;
  }

  if (!store.panels[panelKeyB].routeKey && store.panels[panelKeyA].routeKey) {
    store.panels[panelKeyB].routeKey = store.panels[panelKeyA].routeKey;
  }

  // for (let i = store.panels[panelKeyA].tabbedRouteKeys.length - 1; i >= 0; i--) {
  //   store.panels[panelKeyB].tabbedRouteKeys.unshift(store.panels[panelKeyA].tabbedRouteKeys[i]);
  // }

  // for (let i = store.panels[panelKeyA].pinnedRouteKeys.length - 1; i >= 0; i--) {
  //   store.panels[panelKeyB].pinnedRouteKeys.unshift(store.panels[panelKeyA].pinnedRouteKeys[i]);
  // }

  store.panels.splice(panelKeyA, 1);

  return store;
};

/**
 * @name setPanel
 * @description Sets or replaces the panel at the provided index using panel defaults plus the supplied partial values.
 * @param store - Router store
 * @param panelKey - Target panel index
 * @param partialPanel - Partial panel payload
 * @returns Updated router store
 */
export const setPanel = function <const Store extends AppSharedRouterStore>(
  store: Store,
  panelKey: number,
  partialPanel: Partial<AppRouterPanel>
): Store {
  store.panels[panelKey] = { ...getDefaultRouterPanel(), ...partialPanel };
  return store;
};

/**
 * @name insertLeftPanel
 * @description Inserts a panel at the target index and trims overflow from the end.
 * @param store - Router store
 * @param panelKey - Target insertion index
 * @param partialPanel - Partial panel payload
 * @returns Tuple of updated store and inserted index
 */
export const insertLeftPanel = function <const Store extends AppSharedRouterStore>(
  store: Store,
  panelKey: number = 0,
  partialPanel: Partial<AppRouterPanel> = null,
  preferences: AppPreferenceStore
): [Store, number] {
  if (preferences.router.maxPanels <= 0) return [store, null];

  const panelIndex = Math.min(Math.max(0, Math.trunc(panelKey)), store.panels.length - 1);
  store.panels.splice(panelIndex, 0, { ...getDefaultRouterPanel(), ...partialPanel });
  if (store.panels.length > preferences.router.maxPanels) store.panels.splice(-1, 1);
  return [store, panelIndex];
};

/**
 * @name insertRightPanel
 * @description Inserts a panel to the right of source index and trims overflow from the start.
 * @param store - Router store
 * @param sourcePanelKey - Source panel index
 * @param partialPanel - Partial panel payload
 * @returns Tuple of updated store and inserted index
 */
export const insertRightPanel = function <const Store extends AppSharedRouterStore>(
  store: Store,
  sourcePanelKey: number = store.panels.length - 1,
  partialPanel: Partial<AppRouterPanel> = null,
  preferences: AppPreferenceStore
): [Store, number] {
  if (preferences.router.maxPanels <= 0) return [store, null];

  const panelIndex = Math.min(Math.max(0, Math.trunc(sourcePanelKey)), store.panels.length - 1);
  store.panels.splice(panelIndex + 1, 0, { ...getDefaultRouterPanel(), ...partialPanel });

  if (store.panels.length > preferences.router.maxPanels) {
    store.panels.splice(0, 1);
    return [store, panelIndex];
  } else {
    return [store, panelIndex + 1];
  }
};

/**
 * @name upsertPanel
 * @description Updates an existing panel or inserts one when index is out of range.
 * @param store - Router store
 * @param panelKey - Target panel index
 * @param partialPanel - Partial panel payload
 * @returns Tuple of updated store and resolved panel index
 */
export const upsertPanel = function <const Store extends AppSharedRouterStore>(
  store: Store,
  panelKey: number = store.panels.length - 1,
  partialPanel: Partial<AppRouterPanel> = null,
  preferences: AppPreferenceStore
): [Store, number] {
  if (panelKey >= 0 && panelKey < (store?.panels?.length || 0)) store = updatePanel(store, panelKey, partialPanel);
  else [store, panelKey] = insertRightPanel(store, panelKey, partialPanel, preferences);
  return [store, panelKey];
};

/**
 * @name filterPanelMissingRouteKeys
 * @description Removes panel route references that no longer exist in the route store.
 * @param store - Router store
 * @param panelKey - Panel index to sanitize
 * @returns Updated router store
 */
export const filterPanelMissingRouteKeys = function <const Store extends AppSharedRouterStore>(
  store: Store,
  panelKey: number
): Store {
  if (panelKey < 0 || panelKey >= store?.panels?.length) return store;

  if (!(store.panels[panelKey].routeKey in store.routes)) {
    store.panels[panelKey].routeKey = null;
  }

  // if (!(store.panels[panelKey].temporaryRouteKey in store.routes)) {
  //   store.panels[panelKey].temporaryRouteKey = null;
  // }

  // for (let i = store.panels[panelKey].tabbedRouteKeys.length - 1; i >= 0; i--) {
  //   if (!(store.panels[panelKey].tabbedRouteKeys[i] in store.routes)) {
  //     store.panels[panelKey].tabbedRouteKeys.splice(i, 1);
  //   }
  // }

  // for (let i = store.panels[panelKey].pinnedRouteKeys.length - 1; i >= 0; i--) {
  //   if (!(store.panels[panelKey].pinnedRouteKeys[i] in store.routes)) {
  //     store.panels[panelKey].pinnedRouteKeys.splice(i, 1);
  //   }
  // }

  return store;
};

/**
 * @name setPanelActiveRoute
 * @description Sets panel active route when missing by selecting the youngest associated route.
 * @param store - Router store
 * @param panelKey - Panel index to update
 * @returns Updated router store
 */
export const setPanelActiveRoute = function <const Store extends AppSharedRouterStore>(
  store: Store,
  panelKey: number
): Store {
  if (panelKey < 0 || panelKey >= store?.panels?.length || store.panels[panelKey].routeKey) return store;

  // const panel = store.panels[panelKey];
  // let youngestRouteKey: AppRouterPanel['routeKey'] = null;
  // let youngestAge = Infinity;
  // const candidates = new Set([panel.temporaryRouteKey, ...panel.tabbedRouteKeys, ...panel.pinnedRouteKeys]);

  // for (const candidate of candidates) {
  //   if (!candidate || !(candidate in store.routes)) continue;
  //   const age = store.routes[candidate].age;
  //   if (age < youngestAge) {
  //     youngestAge = age;
  //     youngestRouteKey = candidate;
  //   }
  // }

  // if (!youngestRouteKey) return store;
  // panel.routeKey = youngestRouteKey;

  return store;
};

/**
 * @name sanitizePanels
 * @description Normalizes panel references, removes empty panels, enforces max panels, and resolves active route keys.
 * @param store - Router store
 * @returns Updated router store
 */
export const sanitizePanels = function <const Store extends AppSharedRouterStore>(
  store: Store,
  preferences: AppPreferenceStore
): Store {
  for (let i = store.panels.length - 1; i >= 0; i--) {
    store = filterPanelMissingRouteKeys(store, i);
    store = removeEmptyPanel(store, i);
  }

  while (preferences.router.maxPanels > 1 && store.panels.length > preferences.router.maxPanels) {
    store = mergePanels(store, 0, 1);
  }

  for (let i = store.panels.length - 1; i >= 0; i--) {
    store = setPanelActiveRoute(store, i);
  }

  return store;
};

//*****************************************************************************************
// Node
//*****************************************************************************************

export const getDefaultRouterNode = function (node: Partial<AppRouterNode> = null): AppRouterNode {
  return {
    portal: createReversePortalNode(),
    routeKey: null,
    lastUsedAt: Infinity,
    ...node
  };
};

/**
 * @name findOldestNodeKey
 * @description Finds the node whose associated route has the highest age value.
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
    if (!(node.routeKey in store.routes)) continue;
    const age = store.routes[node.routeKey].age;
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
    ([, node]) => partialNode?.routeKey && node?.routeKey === partialNode?.routeKey
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

  if (partialNode?.routeKey) {
    store.nodes[nodeKey].routeKey = partialNode.routeKey;
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
 * @description Removes nodes whose route keys are missing from the route store.
 * @param store - Router store
 * @returns Updated router store
 */
export const filterOrphanedNodes = function <const Store extends AppSharedRouterStore>(store: Store): Store {
  Object.keys(store.nodes).forEach(nodeKey => {
    if (!(store.nodes[nodeKey].routeKey in store.routes)) {
      delete store.nodes[nodeKey];
    }
  });

  return store;
};

/**
 * @name addMissingNodes
 * @description Ensures each active panel route has a backing node.
 * @param store - Router store
 * @returns Updated router store
 */
export const addMissingNodes = function <const Store extends AppSharedRouterStore>(store: Store): Store {
  for (const [, panel] of store.panels.entries()) {
    if (!panel.routeKey) continue;
    const nodeKey = findNodeKey(store, { routeKey: panel.routeKey });
    if (nodeKey !== null) continue;

    const nextNodeKey = generateRandomUUID(Object.keys(store.nodes));
    if ('blockedRoutes' in (store as Record<string, unknown>)) {
      store.nodes[nextNodeKey] = {
        routeKey: panel.routeKey,
        lastUsedAt: Infinity
      } as Store['nodes'][string];
    } else {
      store.nodes[nextNodeKey] = {
        routeKey: panel.routeKey,
        lastUsedAt: Infinity,
        portal: createReversePortalNode()
      } as unknown as Store['nodes'][string];
    }
  }

  return store;
};

/**
 * @name removeOldestNodes
 * @description Trims node count to `maxPanels + maxNodes` by removing oldest nodes.
 * @param store - Router store
 * @returns Updated router store
 */
export const removeOldestNodes = function <const Store extends AppSharedRouterStore>(
  store: Store,
  preferences: AppPreferenceStore
): Store {
  while (Object.keys(store.nodes).length > preferences.router.maxPanels + preferences.router.maxNodes) {
    const nodeKey = findOldestNodeKey(store);
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

//*****************************************************************************************
// Route
//*****************************************************************************************

export const getDefaultRouterRoute = function (route: Partial<AppRouterRoute> = null): AppRouterRoute {
  return {
    age: 0,
    digest: null,
    href: null,
    scroll: null,
    state: null,
    transient: null,
    ...route
  };
};

export const getRouteDigestFromRoute = function (
  route: Pick<AppRouterRoute, 'href' | 'state' | 'transient'>
): AppRouterRoute['digest'] {
  return hashObjectKeyOrderIndependent({
    href: route?.href || '',
    state: route?.state || {},
    transient: route?.transient || {}
  });
};

// export const setRouteDigestFromKey = function (
//   store: AppRouterStore,
//   routeKey: keyof AppRouterStore['routes']
// ): AppRouterStore {
//   if (!(routeKey in store.routes)) return store;

//   const route = store.routes[routeKey];
//   store.routes[routeKey].digest = getRouteDigestFromRoute(route);

//   return store;
// };

export const shouldUpdateRoute = function (
  store: AppRouterStore,
  routeKey: keyof AppRouterStore['routes'],
  route: AppRouterRoute
): boolean {
  if (!route?.href) return false;

  const nextDigest = route.digest ?? getRouteDigestFromRoute(route);

  if (!(routeKey in (store?.routes || {}))) return true;

  const prevRoute = store.routes[routeKey];
  const prevDigest = prevRoute?.digest ?? getRouteDigestFromRoute(prevRoute);

  return prevDigest !== nextDigest;
};

// /**
//  * @name findRouteKey
//  * @description Finds the key of a route in the store by deep value comparison.
//  * @param store - Router store
//  * @param route - Route value to find
//  * @returns Matching route key, or null if none is found
//  */
// export const findRouteKey = (store: AppRouterStore, route: AppRouterRoute): keyof AppRouterStore['routes'] => {
//   for (const routeKey in store.routes) {
//     if (deepCompare(route, store.routes[routeKey])) return routeKey;
//   }
//   return null;
// };

/**
 * @name findRouteKeyFromPanelKey
 * @description Finds the active route key associated with the provided panel index.
 * @param store - Router store
 * @param panelKey - Panel index whose active route key should be returned
 * @returns Active route key from the panel, or null when panel/route is missing
 */
export const findRouteKeyFromPanelKey = (store: AppRouterStore, panelKey: number): keyof AppRouterStore['routes'] => {
  if (panelKey < 0 || panelKey >= store?.panels?.length) return null;
  const routeKey = store.panels[panelKey]?.routeKey;
  return routeKey ? routeKey : null;
};

/**
 * @name captureScrollPositions
 * @description Captures scroll positions for all active routes from their DOM elements.
 * Call this before navigation to preserve scroll state across route transitions.
 * @returns Object mapping routeKey to scrollTop value
 */
export const captureScrollPositions = (): Record<string, number> => {
  const positions: Record<string, number> = {};
  document.querySelectorAll('[id^="route-layout-"]').forEach(el => {
    const id = el.id;
    const routeKey = id.replace('route-layout-', '');
    const scrollContainer = el as HTMLDivElement;
    positions[routeKey] = scrollContainer.scrollTop;
  });
  return positions;
};

export const setRouteScrollPositions = function <const Store extends AppSharedRouterStore>(store: Store): Store {
  const positions = captureScrollPositions();

  for (const [routeKey, scroll] of Object.entries(positions)) {
    if (!(routeKey in store.routes)) continue;
    store.routes[routeKey].scroll = scroll;
  }

  return store;
};

// /**
//  * @name findRoute
//  * @description Finds and returns a matching route object from the store by deep value comparison.
//  * @param store - Router store
//  * @param route - Route value to find
//  * @returns Matching route object, or null if none is found
//  */
// export const findRoute = (store: AppRouterStore, route: AppRouterRoute): AppRouterRoute => {
//   const key = findRouteKey(store, route);
//   return key !== null ? store.routes[key] : null;
// };

// /**
//  * @name findNextRouteKey
//  * @description Finds the active route key from the next panel relative to the panel containing the provided route key.
//  * @param store - Router store
//  * @param routeKey - Current route key used as navigation origin
//  * @param preferences.router.navigation - Panel navigation strategy
//  * @returns Active route key from the next panel, or null when unavailable
//  */
// export const findNextRouteKey = (
//   store: AppRouterStore,
//   routeKey: keyof AppRouterStore['routes'],
//   preferences: AppPreferenceStore
// ): keyof AppRouterStore['routes'] => {
//   const nextPanelKey = findNextPanelKeyFromRouteKey(store, routeKey, preferences);

//   if (nextPanelKey < 0 || nextPanelKey >= store.panels.length) return null;

//   const nextRouteKey = store.panels[nextPanelKey]?.routeKey;
//   if (!nextRouteKey || !(nextRouteKey in store.routes)) return null;

//   return nextRouteKey;
// };

// export const getRouteFromKey = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   routeKey: keyof Store['routes']
// ): AppRouterRoute {
//   const route = routeKey in store.routes ? store.routes[routeKey as string] : getDefaultRouterRoute();
//   return route;
// };

// UNUSED: no call-sites found outside index re-exports.

/**
 * @name getRouteFromPanelKey
 * @description Returns the active route content associated with the provided panel index.
 * @param store - Router store
 * @param panelKey - Panel index whose active route should be returned
 * @returns Matching route object, or null when panel/route is missing
 */
export const getRouteFromPanelKey = function <const Store extends AppSharedRouterStore>(
  store: Store,
  panelKey: number
): AppRouterRoute {
  if (panelKey < 0 || panelKey >= store?.panels?.length) return getDefaultRouterRoute();

  const routeKey = store.panels[panelKey]?.routeKey;
  if (!routeKey || !(routeKey in store.routes)) return getDefaultRouterRoute();

  return store.routes[routeKey] ?? getDefaultRouterRoute();
};

// export const getNextRouteFromKey = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   routeKey: keyof Store['routes'],
//   preferences: AppPreferenceStore
// ): AppRouterRoute {
//   const currentPanelKey = findPanelKey(store, { routeKey } as Partial<Store['panels'][number]>);
//   if (currentPanelKey < 0 || currentPanelKey >= store.panels.length) return getDefaultRouterRoute();

//   let nextPanelKey: number | null = currentPanelKey;

//   if (preferences.router.navigation === 'push') {
//     nextPanelKey = currentPanelKey >= 0 ? currentPanelKey + 1 : 0;
//   } else if (preferences.router.navigation === 'loop') {
//     nextPanelKey = currentPanelKey >= 0 ? currentPanelKey + 1 : 0;
//     nextPanelKey = nextPanelKey >= store.panels.length ? 0 : nextPanelKey;
//   }

//   return getRouteFromPanelKey(store, nextPanelKey);
// };

// /**
//  * @name getFirstRouteKey
//  * @description Returns the active route key for the first panel when available.
//  * @param store - Router store
//  * @returns Active route key from panel index 0, or null when unavailable
//  */
// export const getFirstRouteKey = function <const Store extends AppSharedRouterStore>(
//   store: Store
// ): keyof Store['routes'] {
//   const firstRouteKey = store.panels?.[0]?.routeKey;
//   if (!firstRouteKey || !(firstRouteKey in store.routes)) return null;
//   return firstRouteKey;
// };

export const hasRoutes = function <const Store extends AppSharedRouterStore>(store: Store): boolean {
  return Object.keys(store?.routes || {}).length > 0;
};

// export const isRouteVisible = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   routeKey: RouteKeyOf<Store>
// ): boolean {
//   if (!(routeKey in store.routes)) return false;

//   for (const panel of store.panels) {
//     if (panel?.routeKey === routeKey) return true;
//   }

//   return false;
// };

/**
 * @name removeRoute
 * @description Removes a route by key when it exists.
 * @param store - Router store
 * @param routeKey - Route key to remove
 * @returns Updated router store
 */
export const removeRoute = function <const Store extends AppSharedRouterStore>(
  store: Store,
  routeKey: RouteKeyOf<Store>
): Store {
  if (!(routeKey in store.routes)) return store;
  delete store.routes[routeKey];
  return store;
};

/**
 * @name updateRoute
 * @description Updates route fields by key.
 * @param store - Router store
 * @param routeKey - Route key to update
 * @param partialRoute - Partial route payload
 * @returns Updated router store
 */
export const updateRoute = function <const Store extends AppSharedRouterStore>(
  store: Store,
  routeKey: RouteKeyOf<Store>,
  partialRoute: Partial<AppRouterRoute> = null
): Store {
  if (!(routeKey in store.routes)) return store;

  let shouldRefreshDigest = false;

  if (partialRoute && 'href' in partialRoute) {
    store.routes[routeKey].href = partialRoute.href;
    shouldRefreshDigest = true;
  }

  if (partialRoute && 'state' in partialRoute) {
    store.routes[routeKey].state = partialRoute.state;
    shouldRefreshDigest = true;
  }

  if (partialRoute && 'transient' in partialRoute) {
    store.routes[routeKey].transient = partialRoute.transient;
    shouldRefreshDigest = true;
  }

  if (partialRoute && 'scroll' in partialRoute) {
    store.routes[routeKey].scroll = partialRoute.scroll;
  }

  if (partialRoute && 'age' in partialRoute) {
    store.routes[routeKey].age = partialRoute.age;
  }

  if (partialRoute && 'digest' in partialRoute) {
    store.routes[routeKey].digest = partialRoute.digest;
  } else if (shouldRefreshDigest || !store.routes[routeKey].digest) {
    store.routes[routeKey].digest = getRouteDigestFromRoute(store.routes[routeKey]);
  }

  return store;
};

/**
 * @name setRoute
 * @description Sets or replaces a route by key using route defaults plus the supplied partial values.
 * @param store - Router store
 * @param routeKey - Target route key
 * @param partialRoute - Partial route payload
 * @returns Updated router store
 */
export const setRoute = function <const Store extends AppSharedRouterStore>(
  store: Store,
  routeKey: RouteKeyOf<Store>,
  partialRoute: Partial<AppRouterRoute>
): Store {
  const route = getDefaultRouterRoute(partialRoute);
  route.digest = getRouteDigestFromRoute(route);
  store.routes[routeKey] = route;
  return store;
};

/**
 * @name updateRouteFromNavigationRoute
 * @description Applies navigation route values into router route with digest-aware field updates.
 * If digests match, href/state/transient are preserved while other fields still update.
 */
export const updateRouteFromNavigationRoute = function (
  store: AppRouterStore,
  routeKey: keyof AppRouterStore['routes'],
  nextRoute: AppNavigationStore['routes'][string]
): AppRouterStore {
  if (!(routeKey in store.routes)) {
    const route = getDefaultRouterRoute(nextRoute);
    route.digest = nextRoute?.digest || getRouteDigestFromRoute(route);
    store.routes[routeKey] = route;
    return store;
  }

  const currentRoute = store.routes[routeKey];
  const hasSameDigest = !!currentRoute?.digest && !!nextRoute?.digest && currentRoute.digest === nextRoute.digest;

  if (!hasSameDigest) {
    currentRoute.href = nextRoute.href;
    currentRoute.state = nextRoute.state;
    currentRoute.transient = nextRoute.transient;
  }

  currentRoute.age = nextRoute.age;
  currentRoute.scroll = nextRoute.scroll;
  currentRoute.digest = nextRoute.digest || currentRoute.digest || getRouteDigestFromRoute(currentRoute);

  return store;
};

/**
 * @name addRoute
 * @description Creates a new route entry and returns its generated key.
 * @param store - Router store
 * @param partialRoute - Partial route payload
 * @returns Tuple of updated store and route key
 */
export const addRoute = function <const Store extends AppSharedRouterStore>(
  store: Store,
  partialRoute: Partial<AppRouterRoute>,
  routeKey: RouteKeyOf<Store> | null = null
): [Store, RouteKeyOf<Store>] {
  routeKey = routeKey || (generateRandomUUID(Object.keys(store.routes)) as RouteKeyOf<Store>);
  const route = getDefaultRouterRoute(partialRoute);
  route.digest = getRouteDigestFromRoute(route);
  store.routes[routeKey] = route;
  return [store, routeKey];
};

/**
 * @name addRouteToPanel
 * @description Creates a route and assigns it as the active temporary route of the target panel.
 * @param store - Router store
 * @param panelKey - Target panel index
 * @param partialRoute - Partial route payload
 * @returns Updated router store
 */
export const addRouteToPanel = function <const Store extends AppSharedRouterStore>(
  store: Store,
  panelKey: number,
  partialRoute: Partial<AppRouterRoute>
): Store {
  if (store.panels.length === 0 || panelKey < 0 || panelKey >= store?.panels?.length) return store;

  const newRouteKey = generateRandomUUID(Object.keys(store.routes));
  const route = getDefaultRouterRoute(partialRoute);
  route.digest = getRouteDigestFromRoute(route);
  store.routes[newRouteKey] = route;
  store.panels[panelKey].routeKey = newRouteKey;

  return store;
};

/**
 * @name upsertRoute
 * @description Updates route when key exists; otherwise creates a new route.
 * @param store - Router store
 * @param routeKey - Route key to update
 * @param partialRoute - Partial route payload
 * @returns Tuple of updated store and resolved route key
 */
export const upsertRoute = function <const Store extends AppSharedRouterStore>(
  store: Store,
  routeKey: RouteKeyOf<Store>,
  partialRoute: Partial<AppRouterRoute>
): [Store, RouteKeyOf<Store>] {
  if (routeKey in store.routes) store = updateRoute(store, routeKey, partialRoute);
  else [store, routeKey] = addRoute(store, partialRoute, routeKey);
  return [store, routeKey];
};

/**
 * @name refreshRouteAges
 * @description Recomputes route age ordering, prioritizing displayed routes.
 * @param store - Router store
 * @returns Updated router store
 */
export const refreshRouteAges = function <const Store extends AppSharedRouterStore>(store: Store): Store {
  const activeRouteKeys = new Set<string>();
  for (const panel of store.panels) {
    if (panel?.routeKey) activeRouteKeys.add(panel.routeKey);
  }

  const orderedEntries = Object.entries(store.routes).sort(([routeKeyA, routeA], [routeKeyB, routeB]) => {
    const aIsDisplayed = activeRouteKeys.has(routeKeyA);
    const bIsDisplayed = activeRouteKeys.has(routeKeyB);

    if (aIsDisplayed !== bIsDisplayed) return aIsDisplayed ? -1 : 1;
    if (routeA.age !== routeB.age) return routeA.age - routeB.age;
    return routeKeyA.localeCompare(routeKeyB);
  });

  orderedEntries.forEach(([routeKey], i) => {
    store.routes[routeKey].age = i;
  });

  return store;
};

/**
 * @name filterOrphanedRoutes
 * @description Collects all route keys currently referenced by panels and nodes, then removes unreferenced routes from the store.
 * @param store - Router store
 * @returns Updated router store with orphaned routes removed
 */
export const filterOrphanedRoutes = function <const Store extends AppSharedRouterStore>(store: Store): Store {
  const activeRoutes = new Set<string>();

  for (const panel of store.panels) {
    if (!panel) continue;

    if (panel.routeKey) activeRoutes.add(panel.routeKey);

    // if (panel.temporaryRouteKey) activeRoutes.add(panel.temporaryRouteKey);

    // if (panel.tabbedRouteKeys) {
    //   for (const route of panel.tabbedRouteKeys) activeRoutes.add(route);
    // }

    // if (panel.pinnedRouteKeys) {
    //   for (const route of panel.pinnedRouteKeys) activeRoutes.add(route);
    // }
  }

  for (const nodeKey in store.nodes) {
    if (store.nodes[nodeKey].routeKey) activeRoutes.add(store.nodes[nodeKey].routeKey);
  }

  for (const routeKey in store.routes) {
    if (!activeRoutes.has(routeKey)) {
      delete store.routes[routeKey];
    }
  }

  return store;
};

/**
 * @name sanitizeRoutes
 * @description Removes orphaned routes and then recomputes route ages.
 * @param store - Router store
 * @returns Updated router store
 */
export const sanitizeRoutes = function <const Store extends AppSharedRouterStore>(store: Store): Store {
  store = filterOrphanedRoutes(store);
  store = refreshRouteAges(store);
  return store;
};

//*****************************************************************************************
// Tabs
//*****************************************************************************************

// /**
//  * @name showPreviousTab
//  * @description Placeholder for moving to a previous tab in a panel.
//  * @param store - Router store
//  * @param panelKey - Panel key context
//  * @param source - Route source filter
//  * @returns Router store (currently unchanged)
//  */
// export const showPreviousTab = (
//   store: AppRouterStore,
//   _panelKey: keyof AppRouterStore['routes'],
//   _source: 'active' | 'temporary' | 'tabbed' | 'pinned' = null
// ): AppRouterStore => {
//   void _panelKey;
//   void _source;
//   return store;
// };

// /**
//  * @name removeTabFromPanel
//  * @description Removes a route key from a single panel active/temporary/tabbed/pinned entries.
//  * @param store - Router store
//  * @param panelKey - Target panel index
//  * @param routeKey - Route key to remove
//  * @returns Updated router store
//  */
// export const removeTabFromPanel = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   panelKey: number = null,
//   routeKey: RouteKeyOf<Store> | null = null
// ): Store {
//   if (panelKey === null || panelKey < 0 || panelKey >= store?.panels?.length) return store;
//   const panel = store.panels[panelKey];

//   if (panel.routeKey === routeKey) panel.routeKey = null;
//   if (panel.temporaryRouteKey === routeKey) panel.temporaryRouteKey = null;

//   if (routeKey !== null) {
//     const tabbedIndex = panel.tabbedRouteKeys.indexOf(routeKey);
//     if (tabbedIndex >= 0) panel.tabbedRouteKeys.splice(tabbedIndex, 1);
//   }

//   if (routeKey !== null) {
//     const pinnedIndex = panel.pinnedRouteKeys.indexOf(routeKey);
//     if (pinnedIndex >= 0) panel.pinnedRouteKeys.splice(pinnedIndex, 1);
//   }

//   return store;
// };

// /**
//  * @name removeTab
//  * @description Removes a route key from all panels' active/temporary/tabbed/pinned entries.
//  * @param store - Router store
//  * @param routeKey - Route key to remove
//  * @returns Updated router store
//  */
// export const removeTab = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   routeKey: RouteKeyOf<Store> | null = null
// ): Store {
//   for (let i = 0; i < store.panels.length; i++) {
//     store = removeTabFromPanel(store, i, routeKey);
//   }

//   return store;
// };

// /**
//  * @name addTab
//  * @description Adds/sets a route in the chosen tab source of a panel.
//  * @param store - Router store
//  * @param panelKey - Target panel index
//  * @param routeKey - Route key to add
//  * @param source - Destination collection
//  * @returns Updated router store
//  */
// export const addTab = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   panelKey: number = -1,
//   routeKey: RouteKeyOf<Store> | null = null,
//   source: 'temporary' | 'tabbed' | 'pinned' = 'temporary'
// ): Store {
//   if (panelKey < 0 || panelKey >= store?.panels?.length || !(routeKey in store.routes)) return store;

//   store.panels[panelKey].routeKey = routeKey;

//   switch (source) {
//     case 'temporary':
//       store.panels[panelKey].temporaryRouteKey = routeKey;
//       break;
//     case 'tabbed':
//       store.panels[panelKey].tabbedRouteKeys.push(routeKey);
//       break;
//     case 'pinned':
//       store.panels[panelKey].pinnedRouteKeys.push(routeKey);
//       break;
//   }

//   return store;
// };

// /**
//  * @name permanentTab
//  * @description Converts a temporary route to a tabbed route and keeps it active.
//  * @param store - Router store
//  * @param routeKey - Route key to convert
//  * @returns Updated router store
//  */
// export const permanentTab = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   routeKey: RouteKeyOf<Store>
// ): Store {
//   if (!(routeKey in store.routes)) return store;

//   const panelKey = findPanelKey(store, { temporaryRouteKey: routeKey });
//   if (panelKey < 0) return store;
//   store.panels[panelKey].routeKey = routeKey;
//   store.panels[panelKey].temporaryRouteKey = null;
//   store.panels[panelKey].tabbedRouteKeys.push(routeKey);

//   return store;
// };

// /**
//  * @name setPermanentRoute
//  * @description Marks a route as permanent in the store.
//  * @param store - Router store
//  * @param routeKey - Route key to mark as permanent
//  * @returns Updated router store with the route marked permanent
//  */
// export const setPermanentRoute = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   routeKey: RouteKeyOf<Store>
// ): Store {
//   if (!(routeKey in store.routes)) return store;

//   const panelIndex = findPanelKey(store, { temporaryRouteKey: routeKey });
//   if (panelIndex < 0) return store;
//   store.panels[panelIndex].tabbedRouteKeys.push(store.panels[panelIndex].temporaryRouteKey);
//   store.panels[panelIndex].temporaryRouteKey = null;

//   return store;
// };

// /**
//  * @name setPinnedRoute
//  * @description Pins a route by moving it from temporary/tabbed collections into the panel pinned collection.
//  * @param store - Router store
//  * @param routeKey - Route key to pin
//  * @returns Updated router store with the route pinned where found
//  */
// export const setPinnedRoute = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   routeKey: keyof Store['routes']
// ): Store {
//   if (!(routeKey in store.routes)) return store;

//   let panelIndex = findPanelKey(store, {
//     temporaryRouteKey: routeKey as Store['panels'][number]['temporaryRouteKey']
//   });
//   if (panelIndex >= 0) {
//     store.panels[panelIndex].pinnedRouteKeys.push(routeKey as AppRouterPanel['routeKey']);
//     store.panels[panelIndex].temporaryRouteKey = null;
//   }

//   panelIndex = findPanelKey(store, {
//     tabbedRouteKeys: [routeKey] as AppRouterPanel['tabbedRouteKeys']
//   });
//   if (panelIndex >= 0) {
//     store.panels[panelIndex].pinnedRouteKeys.push(routeKey as AppRouterPanel['routeKey']);
//     const index = store.panels[panelIndex].tabbedRouteKeys.findIndex(
//       k => k === (routeKey as AppRouterPanel['routeKey'])
//     );
//     store.panels[panelIndex].tabbedRouteKeys.splice(index, 1);
//   }

//   return store;
// };

// /**
//  * @name setUnpinnedRoute
//  * @description Unpins a route by removing it from pinned routes and inserting it at the start of tabbed routes.
//  * @param store - Router store
//  * @param routeKey - Route key to unpin
//  * @returns Updated router store with the route unpinned
//  */
// export const setUnpinnedRoute = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   routeKey: keyof Store['routes']
// ): Store {
//   if (!(routeKey in store.routes)) return store;

//   const panelIndex = findPanelKey(store, {
//     pinnedRouteKeys: [routeKey as AppRouterPanel['routeKey']]
//   });
//   if (panelIndex >= 0) {
//     store.panels[panelIndex].tabbedRouteKeys.unshift(routeKey as AppRouterPanel['routeKey']);
//     const index = store.panels[panelIndex].pinnedRouteKeys.findIndex(
//       k => k === (routeKey as AppRouterPanel['routeKey'])
//     );
//     store.panels[panelIndex].pinnedRouteKeys.splice(index, 1);
//   }

//   return store;
// };

// /**
//  * @name moveTabbedRouteKey
//  * @description Placeholder for moving a route key between tab/pinned collections in a destination panel.
//  * @param store - Router store
//  * @param routeKey - Route key to move
//  * @param panelKey - Destination panel index
//  * @param tabIndex - Destination tab index
//  * @param tab - Destination collection ('pinned' or 'tab')
//  * @returns Router store (currently unchanged)
//  */
// export const moveTabbedRouteKey = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   routeKey: keyof Store['routes'],
//   panelKey: number,
//   tabIndex: number,
//   tab: 'pinned' | 'tab'
// ): Store {
//   if (!(routeKey in store.routes) || panelKey < 0 || panelKey >= store?.panels?.length) return store;

//   for (const panel of store.panels) {
//     if (panel.temporaryRouteKey === routeKey) {
//       panel.temporaryRouteKey = null;
//     }

//     const tabbedIndex = panel.tabbedRouteKeys.indexOf(routeKey as AppRouterPanel['routeKey']);
//     if (tabbedIndex >= 0) {
//       panel.tabbedRouteKeys.splice(tabbedIndex, 1);
//     }

//     const pinnedIndex = panel.pinnedRouteKeys.indexOf(routeKey as AppRouterPanel['routeKey']);
//     if (pinnedIndex >= 0) {
//       panel.pinnedRouteKeys.splice(pinnedIndex, 1);
//     }
//   }

//   const destinationPanel = store.panels[panelKey];
//   destinationPanel.routeKey = routeKey as Store['panels'][number]['routeKey'];

//   if (tab === 'pinned') {
//     const insertionIndex = Math.min(Math.max(0, Math.trunc(tabIndex)), destinationPanel.pinnedRouteKeys.length);
//     destinationPanel.pinnedRouteKeys.splice(insertionIndex, 0, routeKey as AppRouterPanel['routeKey']);
//   } else {
//     const insertionIndex = Math.min(Math.max(0, Math.trunc(tabIndex)), destinationPanel.tabbedRouteKeys.length);
//     destinationPanel.tabbedRouteKeys.splice(insertionIndex, 0, routeKey as AppRouterPanel['routeKey']);
//   }

//   return store;
// };

//*****************************************************************************************
// Blocked Routes
//*****************************************************************************************

/**
 * @name addBlocker
 * @description Adds a blocker entry for a route key when the route exists and is not already blocked.
 * @param store - Router store
 * @param routeKey - Route key to block
 * @returns Updated router store
 */
export const addBlockedRoute = (
  store: AppNavigationStore,
  routeKey: keyof AppNavigationStore['routes']
): AppNavigationStore => {
  if (!routeKey || routeKey in store.blockedRoutes) return store;
  store.blockedRoutes[routeKey] = null;
  return store;
};

/**
 * @name removeBlocker
 * @description Removes a blocker entry for a route key when it exists.
 * @param store - Router store
 * @param routeKey - Route key to unblock
 * @returns Updated router store
 */
export const removeBlockedRoute = (
  store: AppNavigationStore,
  routeKey: keyof AppNavigationStore['routes']
): AppNavigationStore => {
  if (!(routeKey in store.blockedRoutes)) return store;
  delete store.blockedRoutes[routeKey];
  return store;
};

export const clearBlockedRoutes = (store: AppNavigationStore): AppNavigationStore => {
  store.blockedRoutes = {};
  return store;
};

/**
 * @name hasBlockers
 * @description Checks whether the router currently has any active blocker entries.
 * @param store - Router store
 * @returns True when at least one blocker exists, otherwise false
 */
export const hasBlockedRoutes = (store: AppNavigationStore): boolean => {
  return Object.keys(store?.blockedRoutes || {}).length > 0;
};

//*****************************************************************************************
// Navigation
//*****************************************************************************************

export type ExtractNavReturn<Origin extends AppRoute['route']> = {
  target: 'from' | 'here' | 'to' | 'at' | null;
  panelKey: number | null;
  operation: 'create' | 'update' | 'delete' | null;
  options: AppNavigateOptions;
  dispatch:
    | InferAppNavigationOperationMapFromPath<Origin>['create']
    | InferAppNavigationOperationMapFromPath<Origin>['update']
    | null;
};

export const getDefaultNavigateOptions = function (options: Partial<AppNavigateOptions> = null): AppNavigateOptions {
  return {
    hashScrollIntoView: false,
    href: '',
    ignoreBlocker: false,
    reloadDocument: false,
    replace: false,
    resetScroll: false,
    viewTransition: false,
    ...options
  };
};

export const resolveNavigationIntent = function <const Origin extends AppRoute['route']>(
  nextNav: InferAppNavigationPropsFromPath<Origin>['nav']
): ExtractNavReturn<Origin> {
  if (!nextNav) {
    return { target: null, panelKey: null, operation: null, options: getDefaultNavigateOptions(), dispatch: null };
  }

  let target: ExtractNavReturn<Origin>['target'] = null;
  let panelKey: number | null = null;
  let options: AppNavigateOptions = getDefaultNavigateOptions();
  let operation: ExtractNavReturn<Origin>['operation'] = null;
  let dispatch: ExtractNavReturn<Origin>['dispatch'] = null;

  const buildCaptureOperations = (
    key: 'from' | 'here' | 'to' | 'at',
    atPanelKey: number | null,
    operationOptions: AppNavigateOptions = getDefaultNavigateOptions()
  ) => ({
    create: (operationDispatch: InferAppNavigationOperationMapFromPath<Origin>['create']) => {
      target = key;
      panelKey = atPanelKey;
      options = operationOptions;
      operation = 'create';
      dispatch = operationDispatch;
    },
    update: (operationDispatch: InferAppNavigationOperationMapFromPath<Origin>['update']) => {
      target = key;
      panelKey = atPanelKey;
      options = operationOptions;
      operation = 'update';
      dispatch = operationDispatch;
    },
    delete: () => {
      target = key;
      panelKey = atPanelKey;
      options = operationOptions;
      operation = 'delete';
      dispatch = null;
    }
  });

  const navigationCapture: Parameters<NonNullable<InferAppNavigationPropsFromPath<Origin>['nav']>>[0] = {
    from: (operationOptions: AppNavigateOptions = getDefaultNavigateOptions()) =>
      buildCaptureOperations('from', null, operationOptions),
    here: (operationOptions: AppNavigateOptions = getDefaultNavigateOptions()) =>
      buildCaptureOperations('here', null, operationOptions),
    to: (operationOptions: AppNavigateOptions = getDefaultNavigateOptions()) =>
      buildCaptureOperations('to', null, operationOptions),
    at: (nextPanelKey: number, operationOptions: AppNavigateOptions = getDefaultNavigateOptions()) =>
      buildCaptureOperations('at', nextPanelKey, operationOptions)
  };

  nextNav(navigationCapture);

  return { target, panelKey, operation, options, dispatch };
};

export const applyNavigationDispatch = function <const Value>(
  dispatch: SetStateAction<Value>,
  prevValue: Value
): Value {
  return typeof dispatch === 'function' ? (dispatch as (prevState: Value) => Value)(prevValue) : dispatch;
};

//*****************************************************************************************
// Router Store
//*****************************************************************************************

export const getHashFragmentsFromRouter = function (store: AppNavigationStore): string[] {
  return store.panels
    .map(panel => {
      const route = store.routes[panel.routeKey];

      if (!route?.href) return null;

      try {
        const url = new URL(route.href, 'http://localhost');
        const pathname = url.pathname;
        const search = url.search;
        const hash = url.hash ? url.hash.slice(1) : '';

        return `${pathname}${search}${hash ? `#${encodeURIComponent(hash)}` : ''}`;
      } catch {
        return null;
      }
    })
    .filter((f): f is string => f !== null);
};

export const getNextTitleFromRoute = function (route: Pick<AppRouterRoute, 'href'>): string {
  if (!route?.href) return null;

  try {
    const url = new URL(route.href, 'http://localhost');
    const currentLocation = url.pathname.split('/').join(' ').trim();

    if (!currentLocation) return null;
    return `${currentLocation.charAt(0).toUpperCase()}${currentLocation.slice(1)}`;
  } catch {
    return null;
  }
};

// export const getAppNavigationStoreFromRouterStore = function (
//   navigation: AppNavigationStore,
//   router: AppRouterStore
// ): AppNavigationStore {
//   navigation.id = router.id;

//   for (let panelKey = 0; panelKey < router.panels.length; panelKey++) {
//     const currentPanel = navigation.panels[panelKey];
//     const nextPanel = router.panels[panelKey];

//     if (currentPanel && deepCompare(currentPanel, nextPanel)) continue;
//     navigation.panels[panelKey] = structuredClone(nextPanel);
//   }

//   for (let panelKey = navigation.panels.length - 1; panelKey >= router.panels.length; panelKey--) {
//     navigation.panels.splice(panelKey, 1);
//   }

//   for (const [routeKey, nextRoute] of Object.entries(router.routes)) {
//     const currentRoute = navigation.routes[routeKey];
//     if (currentRoute && deepCompare(currentRoute, nextRoute)) continue;
//     navigation.routes[routeKey] = structuredClone(nextRoute);
//   }

//   for (const routeKey of Object.keys(navigation.routes)) {
//     if (routeKey in router.routes) continue;
//     delete navigation.routes[routeKey];
//   }

//   for (const [nodeKey, node] of Object.entries(router.nodes)) {
//     const nextNode = {
//       routeKey: node.routeKey,
//       lastUsedAt: node.lastUsedAt
//     };

//     if (nodeKey in navigation.nodes && deepCompare(navigation.nodes[nodeKey], nextNode)) continue;
//     navigation.nodes[nodeKey] = nextNode;
//   }

//   for (const nodeKey of Object.keys(navigation.nodes)) {
//     if (nodeKey in router.nodes) continue;
//     delete navigation.nodes[nodeKey];
//   }

//   for (const routeKey of Object.keys(navigation.blockedRoutes)) {
//     if (routeKey in navigation.routes) continue;
//     navigation = removeBlockedRoute(navigation, routeKey);
//   }

//   return navigation;
// };

// export const getAppRouterStoreFromNavigationStore = function (
//   router: AppRouterStore,
//   navigation: AppNavigationStore
// ): AppRouterStore {
//   router.id = navigation.id;

//   for (const [routeKey, nextRoute] of Object.entries(navigation.routes)) {
//     const currentRoute = router.routes[routeKey];
//     if (currentRoute && deepCompare(currentRoute, nextRoute)) continue;
//     [router] = upsertRoute(router, routeKey, nextRoute);
//   }

//   for (const routeKey of Object.keys(router.routes)) {
//     if (routeKey in navigation.routes) continue;
//     router = removeRoute(router, routeKey);
//   }

//   for (let panelKey = 0; panelKey < navigation.panels.length; panelKey++) {
//     const currentPanel = router.panels[panelKey];
//     const nextPanel = navigation.panels[panelKey];

//     if (currentPanel && deepCompare(currentPanel, nextPanel)) continue;
//     router.panels[panelKey] = structuredClone(nextPanel);
//   }

//   for (let panelKey = router.panels.length - 1; panelKey >= navigation.panels.length; panelKey--) {
//     router = removePanel(router, panelKey);
//   }

//   for (const [nodeKey, nextNode] of Object.entries(navigation.nodes)) {
//     const currentNode = router.nodes[nodeKey];
//     const nextRouteKey = nextNode.routeKey;

//     if (currentNode && currentNode.routeKey === nextRouteKey && currentNode.lastUsedAt === nextNode.lastUsedAt) {
//       continue;
//     }

//     [router] = upsertNode(router, nodeKey, {
//       routeKey: nextRouteKey,
//       lastUsedAt: nextNode.lastUsedAt,
//       portal: currentNode?.portal || createReversePortalNode()
//     });
//   }

//   for (const nodeKey of Object.keys(router.nodes)) {
//     if (nodeKey in navigation.nodes) continue;
//     router = removeNode(router, nodeKey);
//   }

//   router = filterOrphanedNodes(router);

//   return router;
// };

// export const getAppLocationStateFromRouterStore = function (router: AppRouterStore): AppLocationState {
//   const routes: AppLocationState['routes'] = {};

//   for (const [routeKey, route] of Object.entries(router.routes)) {
//     routes[routeKey] = {
//       href: route.href,
//       state: route.state,
//       scroll: route.scroll
//     };
//   }

//   return {
//     id: router.id,
//     panels: structuredClone(router.panels),
//     routes
//   };
// };

export const getLocationStateFromRouter = function (store: AppNavigationStore): AppLocationState {
  return {
    id: store.id,
    panels: store.panels,
    routes: store.routes
  };
};

// export const areRouterStoreEqual = (current: AppRouterStore, next: AppRouterStore): boolean => {
//   const currentRouteKeys = Object.keys(current.routes);
//   const nextRouteKeys = Object.keys(next.routes);

//   if (currentRouteKeys.length !== nextRouteKeys.length) return false;

//   for (const routeKey of currentRouteKeys) {
//     if (!(routeKey in next.routes)) return false;

//     const currentRoute = current.routes[routeKey];
//     const nextRoute = next.routes[routeKey];

//     if (currentRoute?.age !== nextRoute?.age) return false;
//     if (currentRoute?.href !== nextRoute?.href) return false;
//     if (JSON.stringify(currentRoute?.state || {}) !== JSON.stringify(nextRoute?.state || {})) return false;
//   }

//   if (current.panels.length !== next.panels.length) return false;

//   for (let panelIndex = 0; panelIndex < current.panels.length; panelIndex++) {
//     const currentPanel = current.panels[panelIndex];
//     const nextPanel = next.panels[panelIndex];

//     if (currentPanel?.routeKey !== nextPanel?.routeKey) return false;
//   }

//   return true;
// };

// export const cloneLocationStore = function <const Store extends AppSharedRouterStore>(store: Store): Store {
//   return {
//     id: store.id,
//     panels: structuredClone(store.panels),
//     routes: structuredClone(store.routes)
//   } as Store;
// };

export const reconcileRouterFromNavigation = (
  router: AppRouterStore,
  navigation: AppNavigationStore
): AppRouterStore => {
  router.id = navigation.id;

  for (const [routeKey, route] of Object.entries(navigation.routes)) {
    router = updateRouteFromNavigationRoute(router, routeKey, route);
  }

  for (const routeKey of Object.keys(router.routes)) {
    if (routeKey in navigation.routes) continue;
    router = removeRoute(router, routeKey);
  }

  for (let i = 0; i < navigation.panels.length; i++) {
    router = setPanel(router, i, navigation.panels[i]);
  }

  for (let i = router.panels.length - 1; i >= navigation.panels.length; i--) {
    router = removePanel(router, i);
  }

  for (const [nodeKey, node] of Object.entries(navigation.nodes)) {
    router.nodes[nodeKey] = {
      routeKey: node.routeKey,
      lastUsedAt: node.lastUsedAt,
      portal: router.nodes[nodeKey]?.portal || createReversePortalNode()
    };
  }

  for (const nodeKey of Object.keys(router.nodes)) {
    if (nodeKey in navigation.nodes) continue;
    router = removeNode(router, nodeKey);
  }

  return router;
};

export const sanitizeRouterStore = function <const Store extends AppSharedRouterStore>(
  store: Store,
  preferences: AppPreferenceStore
): Store {
  store = sanitizePanels(store, preferences);
  store = sanitizeNodes(store, preferences);
  store = sanitizeRoutes(store);
  return store;
};

//*****************************************************************************************
// Navigation Store
//*****************************************************************************************

export const applyDefaultNavigationStore = (
  store: AppNavigationStore,
  preference: AppPreferenceStore
): AppNavigationStore => {
  if (store?.panels?.length > 0 && Object.entries(store?.routes || {}).length > 0) return store;

  const [store1, nextRouteKey] = addRoute(store, { href: '/submit' });
  [store] = upsertPanel(store1, 0, { routeKey: nextRouteKey }, preference);

  return store;
};

export const getNavigationStoreFromRouter = (store: AppNavigationStore, router: AppRouterStore): AppNavigationStore => {
  const cloneRoute = (route: AppRouterRoute): AppNavigationStore['routes'][string] => {
    const nextRoute = {
      ...route,
      state: route?.state == null ? route?.state : structuredClone(route.state),
      transient: route?.transient == null ? route?.transient : structuredClone(route.transient)
    };

    return nextRoute;
  };

  store.id = router.id;

  for (let i = 0; i < router.panels.length; i++) {
    store = setPanel(store, i, router.panels[i]);
  }

  for (let i = store.panels.length - 1; i >= router.panels.length; i--) {
    store = removePanel(store, i);
  }

  for (const [routeKey, route] of Object.entries(router.routes)) {
    const currentRoute = store.routes[routeKey];
    const nextDigest = route?.digest || getRouteDigestFromRoute(route);

    if (
      currentRoute?.digest === nextDigest &&
      currentRoute?.scroll === route?.scroll &&
      currentRoute?.age === route?.age
    ) {
      continue;
    }

    [store] = upsertRoute(store, routeKey, cloneRoute(route));
  }

  for (const routeKey of Object.keys(store.routes)) {
    if (routeKey in router.routes) continue;
    store = removeRoute(store, routeKey);
  }

  for (const [nodeKey, node] of Object.entries(router.nodes)) {
    const currentNode = store.nodes[nodeKey];

    if (currentNode?.routeKey === node.routeKey && currentNode?.lastUsedAt === node.lastUsedAt) {
      continue;
    }

    store.nodes[nodeKey] = { routeKey: node.routeKey, lastUsedAt: node.lastUsedAt };
  }

  for (const nodeKey of Object.keys(store.nodes)) {
    if (nodeKey in router.nodes) continue;
    store = removeNode(store, nodeKey);
  }

  return store;
};

// export const setPartialNavigationStore = (
//   store: AppNavigationStore,
//   next: Partial<AppNavigationStore>
// ): AppNavigationStore => {
//   const nextStore = getDefaultNavigationStore(next);

//   store.id = nextStore.id;
//   store.panels = structuredClone(nextStore.panels);
//   store.routes = structuredClone(nextStore.routes);
//   store.options.replace = nextStore.options.replace;
//   return store;
// };

export const clearNavigationStore = (store: AppNavigationStore): AppNavigationStore => {
  store.id = null;
  store.panels = [];
  store.nodes = {};
  store.routes = {};
  store.blockedRoutes = {};
  store.options = getDefaultNavigateOptions();

  return store;
};
