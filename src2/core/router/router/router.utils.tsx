import { createReversePortalNode } from 'features/portal';
import { deepCompare, generateRandomUUID } from 'lib/utils/app.utils';
import type { Location, NavigateOptions, To } from 'react-router';
import {
  DEFAULT_APP_ROUTER_NODE,
  DEFAULT_APP_ROUTER_PANEL,
  DEFAULT_APP_ROUTER_ROUTE,
  ROUTER_STORE_EXAMPLE
} from './router.defaults';
import { AppRouterState, AppRouterStore } from './router.models';

//*****************************************************************************************
// Panel
//*****************************************************************************************

/**
 * @name findPanelKey
 * @description Finds the first panel index matching the provided partial panel criteria.
 * @param store - Router store
 * @param partialPanel - Partial panel matcher
 * @returns Matching panel index, or -1 when not found
 */
export const findPanelKey = (
  store: AppRouterStore,
  partialPanel: Partial<AppRouterStore['panels'][number]>
): number => {
  for (let i = 0; i < store.panels.length; i++) {
    if (partialPanel?.routeKey && store.panels[i].routeKey === partialPanel?.routeKey) return i;
    else if (partialPanel?.temporaryRouteKey && store.panels[i].temporaryRouteKey === partialPanel?.temporaryRouteKey)
      return i;
    else if (
      Array.isArray(partialPanel?.tabbedRouteKeys) &&
      partialPanel?.tabbedRouteKeys.every(k => store.panels[i].tabbedRouteKeys.includes(k))
    )
      return i;
    else if (
      Array.isArray(partialPanel?.pinnedRouteKeys) &&
      partialPanel?.pinnedRouteKeys.every(k => store.panels[i].pinnedRouteKeys.includes(k))
    )
      return i;
  }

  return -1;
};

/**
 * @name findPanel
 * @description Returns the first panel matching the provided partial panel criteria.
 * @param store - Router store
 * @param partialPanel - Partial panel matcher
 * @returns Matching panel, or null when not found
 */
export const findPanel = (
  store: AppRouterStore,
  partialPanel: Partial<AppRouterStore['panels'][number]>
): AppRouterStore['panels'][number] => {
  const panelKey = findPanelKey(store, partialPanel);
  return panelKey >= 0 ? store.panels[panelKey] : null;
};

/**
 * @name removePanel
 * @description Removes a panel by index when it exists.
 * @param store - Router store
 * @param panelKey - Panel index to remove
 * @returns Updated router store
 */
export const removePanel = (store: AppRouterStore, panelKey: number): AppRouterStore => {
  if (panelKey < 0 || panelKey >= store.panels.length) return store;
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
export const removeEmptyPanel = (store: AppRouterStore, panelKey: number): AppRouterStore => {
  if (panelKey < 0 || panelKey >= store.panels.length) return store;

  if (
    !store.panels[panelKey].routeKey &&
    !store.panels[panelKey].temporaryRouteKey &&
    !store.panels[panelKey].tabbedRouteKeys.length &&
    !store.panels[panelKey].pinnedRouteKeys.length
  ) {
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
export const updatePanel = (
  store: AppRouterStore,
  panelKey: number,
  partialPanel: Partial<AppRouterStore['panels'][number]> = null
): AppRouterStore => {
  if (panelKey < 0 || panelKey >= store.panels.length) return store;

  if (partialPanel && 'routeKey' in partialPanel) {
    store.panels[panelKey].routeKey = partialPanel.routeKey;
  }

  if (partialPanel && 'temporaryRouteKey' in partialPanel) {
    store.panels[panelKey].temporaryRouteKey = partialPanel.temporaryRouteKey;
  }

  if (Array.isArray(partialPanel?.tabbedRouteKeys)) {
    store.panels[panelKey].tabbedRouteKeys = partialPanel.tabbedRouteKeys;
  }

  if (Array.isArray(partialPanel?.pinnedRouteKeys)) {
    store.panels[panelKey].pinnedRouteKeys = partialPanel.pinnedRouteKeys;
  }

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
export const mergePanels = (store: AppRouterStore, panelKeyA: number, panelKeyB: number): AppRouterStore => {
  if (panelKeyA < 0 || panelKeyB < 0 || panelKeyA >= store.panels.length || panelKeyB >= store.panels.length) {
    return store;
  }

  for (let i = store.panels[panelKeyA].tabbedRouteKeys.length - 1; i >= 0; i--) {
    store.panels[panelKeyB].tabbedRouteKeys.unshift(store.panels[panelKeyA].tabbedRouteKeys[i]);
  }

  for (let i = store.panels[panelKeyA].pinnedRouteKeys.length - 1; i >= 0; i--) {
    store.panels[panelKeyB].pinnedRouteKeys.unshift(store.panels[panelKeyA].pinnedRouteKeys[i]);
  }

  store.panels.splice(panelKeyA, 1);

  return store;
};

/**
 * @name setPanel
 * @description Creates a new route entry and returns its generated key.
 * @param store - Router store
 * @param partialRoute - Partial route payload
 * @returns Tuple of updated store and route key
 */
export const setPanel = (
  store: AppRouterStore,
  panelKey: number,
  partialPanel: Partial<AppRouterStore['panels'][number]>
): AppRouterStore => {
  store.panels[panelKey] = { ...DEFAULT_APP_ROUTER_PANEL, ...partialPanel };
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
export const insertLeftPanel = (
  store: AppRouterStore,
  panelKey: number = 0,
  partialPanel: Partial<AppRouterStore['panels'][number]> = null
): [AppRouterStore, number] => {
  if (store.maxPanels <= 0) return [store, null];

  const panelIndex = Math.min(Math.max(0, Math.trunc(panelKey)), store.panels.length - 1);
  store.panels.splice(panelIndex, 0, { ...DEFAULT_APP_ROUTER_PANEL, ...partialPanel });
  if (store.panels.length > store.maxPanels) store.panels.splice(-1, 1);
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
export const insertRightPanel = (
  store: AppRouterStore,
  sourcePanelKey: number = store.panels.length - 1,
  partialPanel: Partial<AppRouterStore['panels'][number]> = null
): [AppRouterStore, number] => {
  if (store.maxPanels <= 0) return [store, null];

  const panelIndex = Math.min(Math.max(0, Math.trunc(sourcePanelKey)), store.panels.length - 1);
  store.panels.splice(panelIndex + 1, 0, { ...DEFAULT_APP_ROUTER_PANEL, ...partialPanel });

  if (store.panels.length > store.maxPanels) {
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
export const upsertPanel = (
  store: AppRouterStore,
  panelKey: number = store.panels.length - 1,
  partialPanel: Partial<AppRouterStore['panels'][number]> = null
): [AppRouterStore, number] => {
  if (panelKey >= 0 && panelKey < store.panels.length) store = updatePanel(store, panelKey, partialPanel);
  else [store, panelKey] = insertRightPanel(store, panelKey, partialPanel);
  return [store, panelKey];
};

/**
 * @name filterPanelMissingRouteKeys
 * @description Removes panel route references that no longer exist in the route store.
 * @param store - Router store
 * @param panelKey - Panel index to sanitize
 * @returns Updated router store
 */
export const filterPanelMissingRouteKeys = (store: AppRouterStore, panelKey: number): AppRouterStore => {
  if (panelKey < 0 || panelKey >= store.panels.length) return store;

  if (!(store.panels[panelKey].routeKey in store.routes)) {
    store.panels[panelKey].routeKey = null;
  }

  if (!(store.panels[panelKey].temporaryRouteKey in store.routes)) {
    store.panels[panelKey].temporaryRouteKey = null;
  }

  for (let i = store.panels[panelKey].tabbedRouteKeys.length - 1; i >= 0; i--) {
    if (!(store.panels[panelKey].tabbedRouteKeys[i] in store.routes)) {
      store.panels[panelKey].tabbedRouteKeys.splice(i, 1);
    }
  }

  for (let i = store.panels[panelKey].pinnedRouteKeys.length - 1; i >= 0; i--) {
    if (!(store.panels[panelKey].pinnedRouteKeys[i] in store.routes)) {
      store.panels[panelKey].pinnedRouteKeys.splice(i, 1);
    }
  }

  return store;
};

/**
 * @name setPanelActiveRoute
 * @description Sets panel active route when missing by selecting the youngest associated route.
 * @param store - Router store
 * @param panelKey - Panel index to update
 * @returns Updated router store
 */
export const setPanelActiveRoute = (store: AppRouterStore, panelKey: number): AppRouterStore => {
  if (panelKey < 0 || panelKey >= store.panels.length || store.panels[panelKey].routeKey) return store;

  const panel = store.panels[panelKey];
  let youngestRouteKey: keyof AppRouterStore['routes'] = null;
  let youngestAge = Infinity;
  const candidates = new Set([panel.temporaryRouteKey, ...panel.tabbedRouteKeys, ...panel.pinnedRouteKeys]);

  for (let i = 0; i < candidates.size; i++) {
    const candidate = candidates[i];
    if (!candidate || !(candidate in store.routes)) continue;
    const age = store.routes[candidate].age;
    if (age < youngestAge) {
      youngestAge = age;
      youngestRouteKey = candidate;
    }
  }

  if (!youngestRouteKey) return store;
  panel.routeKey = youngestRouteKey;

  return store;
};

/**
 * @name sanitizePanels
 * @description Normalizes panel references, removes empty panels, enforces max panels, and resolves active route keys.
 * @param store - Router store
 * @returns Updated router store
 */
export const sanitizePanels = (store: AppRouterStore): AppRouterStore => {
  for (let i = store.panels.length - 1; i >= 0; i--) {
    store = filterPanelMissingRouteKeys(store, i);
    store = removeEmptyPanel(store, i);
  }

  while (store.maxPanels > 1 && store.panels.length > store.maxPanels) {
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

/**
 * @name findOldestNodeKey
 * @description Finds the node whose associated route has the highest age value.
 * @param store - Router store
 * @returns Oldest node key, or null
 */
export const findOldestNodeKey = (store: AppRouterStore): keyof AppRouterStore['nodes'] => {
  let oldestNodeKey: keyof AppRouterStore['nodes'] = null;
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
export const findNodeKey = (
  store: AppRouterStore,
  partialNode: Partial<AppRouterStore['nodes']['string']>
): keyof AppRouterStore['nodes'] => {
  const node = Object.entries(store.nodes).find(
    ([key, node]) => partialNode?.routeKey && node?.routeKey === partialNode?.routeKey
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
export const findNode = (
  store: AppRouterStore,
  partialNode: Partial<AppRouterStore['nodes']['string']>
): AppRouterStore['nodes'][string] => {
  const nodeKey = findNodeKey(store, partialNode);
  return store.nodes?.[nodeKey] ?? null;
};

/**
 * @name removeNode
 * @description Removes a node from the store.
 * @param store - Router store
 * @returns Updated router store with one node removed when available
 */
export const removeNode = (store: AppRouterStore, nodeKey: keyof AppRouterStore['nodes']): AppRouterStore => {
  if (!(nodeKey in store.nodes)) return store;
  delete store.nodes[nodeKey];
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
  partialNode: Partial<AppRouterStore['nodes'][number]> = null
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
 * @description Creates a new route entry and returns its generated key.
 * @param store - Router store
 * @param partialRoute - Partial route payload
 * @returns Tuple of updated store and route key
 */
export const setNode = (
  store: AppRouterStore,
  nodeKey: keyof AppRouterStore['nodes'],
  partialNode: Partial<AppRouterStore['nodes'][string]>
): AppRouterStore => {
  store.nodes[nodeKey] = { ...DEFAULT_APP_ROUTER_NODE, ...partialNode };
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
  partialNode: Partial<AppRouterStore['nodes']['string']> = null
): [AppRouterStore, keyof AppRouterStore['nodes']] => {
  const nodeKey = generateRandomUUID(Object.keys(store.nodes));
  store.nodes[nodeKey] = { ...DEFAULT_APP_ROUTER_NODE, ...partialNode, portal: createReversePortalNode() };
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
  partialNode: Partial<AppRouterStore['nodes']['string']> = null
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
export const filterOrphanedNodes = (store: AppRouterStore): AppRouterStore => {
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
export const addMissingNodes = (store: AppRouterStore): AppRouterStore => {
  for (const [, panel] of store.panels.entries()) {
    if (!panel.routeKey) continue;
    const nodeKey = findNodeKey(store, { routeKey: panel.routeKey });
    if (nodeKey === null) [store] = addNode(store, { routeKey: panel.routeKey });
  }

  return store;
};

/**
 * @name removeOldestNodes
 * @description Trims node count to `maxPanels + maxNodes` by removing oldest nodes.
 * @param store - Router store
 * @returns Updated router store
 */
export const removeOldestNodes = (store: AppRouterStore): AppRouterStore => {
  while (Object.keys(store.nodes).length > store.maxPanels + store.maxNodes) {
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
export const sanitizeNodes = (store: AppRouterStore): AppRouterStore => {
  store = filterOrphanedNodes(store);
  store = addMissingNodes(store);
  store = removeOldestNodes(store);
  return store;
};

//*****************************************************************************************
// Route
//*****************************************************************************************

/**
 * @name findRouteKey
 * @description Finds the key of a route in the store by deep value comparison.
 * @param store - Router store
 * @param route - Route value to find
 * @returns Matching route key, or null if none is found
 */
export const findRouteKey = (
  store: AppRouterStore,
  route: AppRouterStore['routes'][string]
): keyof AppRouterStore['routes'] => {
  for (const routeKey in store.routes) {
    if (deepCompare(route, store.routes[routeKey])) return routeKey;
  }
  return null;
};

/**
 * @name findRoute
 * @description Finds and returns a matching route object from the store by deep value comparison.
 * @param store - Router store
 * @param route - Route value to find
 * @returns Matching route object, or null if none is found
 */
export const findRoute = (
  store: AppRouterStore,
  route: AppRouterStore['routes'][string]
): AppRouterStore['routes'][string] => {
  const key = findRouteKey(store, route);
  return key !== null ? store.routes[key] : null;
};

/**
 * @name removeRoute
 * @description Removes a route by key when it exists.
 * @param store - Router store
 * @param routeKey - Route key to remove
 * @returns Updated router store
 */
export const removeRoute = (store: AppRouterStore, routeKey: keyof AppRouterStore['routes']): AppRouterStore => {
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
export const updateRoute = (
  store: AppRouterStore,
  routeKey: keyof AppRouterStore['routes'],
  partialRoute: Partial<AppRouterStore['routes'][string]> = null
): AppRouterStore => {
  if (!(routeKey in store.routes)) return store;

  if (partialRoute && 'href' in partialRoute) {
    store.routes[routeKey].href = partialRoute.href;
  }

  if (partialRoute && 'state' in partialRoute) {
    store.routes[routeKey].state = partialRoute.state;
  }

  if (partialRoute && 'age' in partialRoute) {
    store.routes[routeKey].age = partialRoute.age;
  }

  return store;
};

/**
 * @name setRoute
 * @description Creates a new route entry and returns its generated key.
 * @param store - Router store
 * @param partialRoute - Partial route payload
 * @returns Tuple of updated store and route key
 */
export const setRoute = (
  store: AppRouterStore,
  routeKey: keyof AppRouterStore['routes'],
  partialRoute: Partial<AppRouterStore['routes'][string]>
): AppRouterStore => {
  store.routes[routeKey] = { ...DEFAULT_APP_ROUTER_ROUTE, ...partialRoute };
  return store;
};

/**
 * @name addRoute
 * @description Creates a new route entry and returns its generated key.
 * @param store - Router store
 * @param partialRoute - Partial route payload
 * @returns Tuple of updated store and route key
 */
export const addRoute = (
  store: AppRouterStore,
  partialRoute: Partial<AppRouterStore['routes'][string]>
): [AppRouterStore, keyof AppRouterStore['routes']] => {
  const routeKey = generateRandomUUID(Object.keys(store.routes));
  store.routes[routeKey] = { ...DEFAULT_APP_ROUTER_ROUTE, ...partialRoute };
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
export const addRouteToPanel = (
  store: AppRouterStore,
  panelKey: number,
  partialRoute: Partial<AppRouterStore['routes'][string]>
): AppRouterStore => {
  if (store.panels.length === 0 || panelKey < 0 || panelKey >= store.panels.length) return store;

  const newRouteKey = generateRandomUUID(Object.keys(store.routes));
  store.routes[newRouteKey] = { ...DEFAULT_APP_ROUTER_ROUTE, ...partialRoute };
  store.panels[panelKey].routeKey = newRouteKey;
  store.panels[panelKey].temporaryRouteKey = newRouteKey;

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
export const upsertRoute = (
  store: AppRouterStore,
  routeKey: keyof AppRouterStore['routes'],
  partialRoute: Partial<AppRouterStore['routes'][string]>
): [AppRouterStore, keyof AppRouterStore['routes']] => {
  if (routeKey in store.routes) store = updateRoute(store, routeKey, partialRoute);
  else [store, routeKey] = addRoute(store, partialRoute);
  return [store, routeKey];
};

/**
 * @name refreshRouteAges
 * @description Recomputes route age ordering, prioritizing displayed routes.
 * @param store - Router store
 * @returns Updated router store
 */
export const refreshRouteAges = (store: AppRouterStore): AppRouterStore => {
  const orderedEntries = Object.entries(store.routes).sort(([routeKeyA, routeA], [routeKeyB, routeB]) => {
    const aIsDisplayed = findPanelKey(store, { routeKey: routeKeyA }) >= 0;
    const bIsDisplayed = findPanelKey(store, { routeKey: routeKeyB }) >= 0;

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
export const filterOrphanedRoutes = (store: AppRouterStore) => {
  const activeRoutes = new Set<string>();

  for (const panel of store.panels) {
    if (!panel) continue;

    if (panel.routeKey) activeRoutes.add(panel.routeKey);

    if (panel.temporaryRouteKey) activeRoutes.add(panel.temporaryRouteKey);

    if (panel.tabbedRouteKeys) {
      for (const route of panel.tabbedRouteKeys) activeRoutes.add(route);
    }

    if (panel.pinnedRouteKeys) {
      for (const route of panel.pinnedRouteKeys) activeRoutes.add(route);
    }
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
 * @description Collects all route keys currently referenced by panels and nodes, then removes unreferenced routes from the store.
 * @param store - Router store
 * @returns Updated router store with orphaned routes removed
 */
export const sanitizeRoutes = (store: AppRouterStore): AppRouterStore => {
  store = filterOrphanedRoutes(store);
  store = refreshRouteAges(store);
  return store;
};

//*****************************************************************************************
// Tabs
//*****************************************************************************************

/**
 * @name showPreviousTab
 * @description Placeholder for moving to a previous tab in a panel.
 * @param store - Router store
 * @param panelKey - Panel key context
 * @param source - Route source filter
 * @returns Router store (currently unchanged)
 */
export const showPreviousTab = (
  store: AppRouterStore,
  panelKey: keyof AppRouterStore['routes'],
  source: 'active' | 'temporary' | 'tabbed' | 'pinned' = null
): AppRouterStore => {
  return store;
};

/**
 * @name removeTabFromPanel
 * @description Removes a route key from a single panel active/temporary/tabbed/pinned entries.
 * @param store - Router store
 * @param panelKey - Target panel index
 * @param routeKey - Route key to remove
 * @returns Updated router store
 */
export const removeTabFromPanel = (
  store: AppRouterStore,
  panelKey: number = null,
  routeKey: keyof AppRouterStore['routes'] = null
): AppRouterStore => {
  if (panelKey === null || panelKey < 0 || panelKey >= store.panels.length) return store;
  const panel = store.panels[panelKey];

  if (panel.routeKey === routeKey) panel.routeKey = null;
  if (panel.temporaryRouteKey === routeKey) panel.temporaryRouteKey = null;

  const tabbedIndex = panel.tabbedRouteKeys.indexOf(routeKey);
  if (tabbedIndex >= 0) panel.tabbedRouteKeys.splice(tabbedIndex, 1);

  const pinnedIndex = panel.pinnedRouteKeys.indexOf(routeKey);
  if (pinnedIndex >= 0) panel.pinnedRouteKeys.splice(pinnedIndex, 1);

  return store;
};

/**
 * @name removeTab
 * @description Removes a route key from all panels' active/temporary/tabbed/pinned entries.
 * @param store - Router store
 * @param routeKey - Route key to remove
 * @returns Updated router store
 */
export const removeTab = (store: AppRouterStore, routeKey: keyof AppRouterStore['routes'] = null): AppRouterStore => {
  for (let i = 0; i < store.panels.length; i++) {
    store = removeTabFromPanel(store, i, routeKey);
  }

  return store;
};

/**
 * @name addTab
 * @description Adds/sets a route in the chosen tab source of a panel.
 * @param store - Router store
 * @param panelKey - Target panel index
 * @param routeKey - Route key to add
 * @param source - Destination collection
 * @returns Updated router store
 */
export const addTab = (
  store: AppRouterStore,
  panelKey: number = -1,
  routeKey: keyof AppRouterStore['routes'] = null,
  source: 'temporary' | 'tabbed' | 'pinned' = 'temporary'
): AppRouterStore => {
  if (panelKey < 0 || panelKey >= store.panels.length || !(routeKey in store.routes)) return store;

  store.panels[panelKey].routeKey = routeKey;

  switch (source) {
    case 'temporary':
      store.panels[panelKey].temporaryRouteKey = routeKey;
      break;
    case 'tabbed':
      store.panels[panelKey].tabbedRouteKeys.push(routeKey);
      break;
    case 'pinned':
      store.panels[panelKey].pinnedRouteKeys.push(routeKey);
      break;
  }

  return store;
};

/**
 * @name permanentTab
 * @description Converts a temporary route to a tabbed route and keeps it active.
 * @param store - Router store
 * @param routeKey - Route key to convert
 * @returns Updated router store
 */
export const permanentTab = (store: AppRouterStore, routeKey: keyof AppRouterStore['routes']): AppRouterStore => {
  if (!(routeKey in store.routes)) return store;

  const panelKey = findPanelKey(store, routeKey, 'temporary');
  if (panelKey < 0) return store;
  store.panels[panelKey].routeKey = routeKey;
  store.panels[panelKey].temporaryRouteKey = null;
  store.panels[panelKey].tabbedRouteKeys.push(routeKey);

  return store;
};

/**
 * @name setPermanentRoute
 * @description Marks a route as permanent in the store.
 * @param store - Router store
 * @param routeKey - Route key to mark as permanent
 * @returns Updated router store with the route marked permanent
 */
export const setPermanentRoute = (store: AppRouterStore, routeKey: keyof AppRouterStore['routes']): AppRouterStore => {
  if (!(routeKey in store.routes)) return store;

  const panelIndex = findPanelKey(store, routeKey, 'temporary');
  if (panelIndex < 0) return store;
  store.panels[panelIndex].tabbedRouteKeys.push(store.panels[panelIndex].temporaryRouteKey);
  store.panels[panelIndex].temporaryRouteKey = null;

  return store;
};

/**
 * @name setPinnedRoute
 * @description Pins a route by moving it from temporary/tabbed collections into the panel pinned collection.
 * @param store - Router store
 * @param routeKey - Route key to pin
 * @returns Updated router store with the route pinned where found
 */
export const setPinnedRoute = (store: AppRouterStore, routeKey: keyof AppRouterStore['routes']): AppRouterStore => {
  if (!(routeKey in store.routes)) return store;

  let panelIndex = findPanelKey(store, routeKey, 'temporary');
  if (panelIndex >= 0) {
    store.panels[panelIndex].pinnedRouteKeys.push(routeKey);
    store.panels[panelIndex].temporaryRouteKey = null;
  }

  panelIndex = findPanelKey(store, routeKey, 'tabbed');
  if (panelIndex >= 0) {
    store.panels[panelIndex].pinnedRouteKeys.push(routeKey);
    const index = store.panels[panelIndex].tabbedRouteKeys.findIndex(k => k === routeKey);
    store.panels[panelIndex].tabbedRouteKeys.splice(index, 1);
  }

  return store;
};

/**
 * @name setUnpinnedRoute
 * @description Unpins a route by removing it from pinned routes and inserting it at the start of tabbed routes.
 * @param store - Router store
 * @param routeKey - Route key to unpin
 * @returns Updated router store with the route unpinned
 */
export const setUnpinnedRoute = (store: AppRouterStore, routeKey: keyof AppRouterStore['routes']): AppRouterStore => {
  if (!(routeKey in store.routes)) return store;

  const panelIndex = findPanelKey(store, routeKey, 'pinned');
  if (panelIndex >= 0) {
    store.panels[panelIndex].tabbedRouteKeys.unshift(routeKey);
    const index = store.panels[panelIndex].pinnedRouteKeys.findIndex(k => k === routeKey);
    store.panels[panelIndex].pinnedRouteKeys.splice(index, 1);
  }

  return store;
};

/**
 * @name moveTabbedRouteKey
 * @description Placeholder for moving a route key between tab/pinned collections in a destination panel.
 * @param store - Router store
 * @param routeKey - Route key to move
 * @param panelKey - Destination panel index
 * @param tabIndex - Destination tab index
 * @param tab - Destination collection ('pinned' or 'tab')
 * @returns Router store (currently unchanged)
 */
export const moveTabbedRouteKey = (
  store: AppRouterStore,
  routeKey: keyof AppRouterStore['routes'],
  panelKey: number,
  tabIndex: number,
  tab: 'pinned' | 'tab'
): AppRouterStore => {
  if (
    !(routeKey in store.routes) ||
    panelKey < 0 ||
    panelKey >= store.panels.length ||
    (tab === 'tab' && (tabIndex < 0 || tabIndex >= store.panels[panelKey].tabbedRouteKeys.length))
  )
    return store;

  // Remove source

  // Add destination
  if (tab === 'pinned') {
  } else {
  }

  // Set it permanent

  // Set it in the panel

  return store;
};

//*****************************************************************************************
// Location
//*****************************************************************************************

/**
 * @name sanitizeAppRouterStore
 * @description Runs panel, route, and node sanitizers in sequence.
 * @param store - Router store
 * @returns Updated router store
 */
export const sanitizeAppRouterStore = (store: AppRouterStore): AppRouterStore => {
  store = sanitizePanels(store);
  store = sanitizeNodes(store);
  store = sanitizeRoutes(store);
  return store;
};

/**
 * @name parseLocationSearch
 * @description Builds routes/panels/nodes from `p` query params in location.search.
 * @param store - Current router store
 * @param location - React Router location
 * @returns Updated router store
 */
export const parseLocationSearch = (store: AppRouterStore, location: Location<AppRouterState>): AppRouterStore => {
  const searchParams = new URLSearchParams(location.search ?? '');
  const hrefValues = searchParams.getAll('p');

  for (let i = 0; i < hrefValues.length; i++) {
    const value = hrefValues[i];
    if (!value) continue;

    try {
      const decoded = decodeURIComponent(value);
      const url = new URL(decoded, window.location.origin);
      const href = `${url.pathname}${url.search}${url.hash}`;
      let newRouteKey = null;

      [store, newRouteKey] = addRoute(store, { href });
      [store] = addNode(store, { routeKey: newRouteKey });
      [store] = insertRightPanel(store, null, { routeKey: newRouteKey, tabbedRouteKeys: [newRouteKey] });
    } catch {}
  }

  return sanitizeAppRouterStore(store);
};

/**
 * @name parseLocationState
 * @description Merges location.state routes and panels into the store using upsert helpers.
 * @param store - Current router store
 * @param location - React Router location
 * @returns Updated router store
 */
export const parseLocationState = (store: AppRouterStore, location: Location<AppRouterState>): AppRouterStore => {
  for (const [rawRouteKey, route] of Object.entries(location?.state?.routes || {})) {
    let routeKey = rawRouteKey;
    store = setRoute(store, routeKey, route);
  }

  const panels = location?.state?.panels || [];
  for (let panelKey = 0; panelKey < panels.length; panelKey++) {
    const panel = panels[panelKey];
    store = setPanel(store, panelKey, panel);
  }

  return sanitizeAppRouterStore(store);
};

/**
 * @name locationToStore
 * @description Hydrates router store state from navigation state or query-string panel hrefs.
 * @param store - Current router store
 * @param location - React Router location containing state/search
 * @returns Updated router store parsed from location, or a safe default on parse failure
 */
export const locationToStore = (store: AppRouterStore, location: Location<AppRouterState>): AppRouterStore => {
  try {
    if (!!location.state) return parseLocationState(store, location);
    else if (!!location.search) return parseLocationSearch(store, location);
  } catch (e) {
    console.error('error parsing the location', e);
  }

  return { ...ROUTER_STORE_EXAMPLE, maxPanels: store.maxPanels, maxNodes: store.maxNodes };
};

export type storeToNavigateReturnType = {
  to: To;
  options: NavigateOptions;
};

/**
 * @name storeToNavigate
 * @description Converts router store state into React Router navigation arguments.
 * @param store - Router store
 * @returns Navigate target (`to`) and options (`state`) representing current panels/routes
 */
export const storeToNavigate = (store: AppRouterStore): storeToNavigateReturnType => {
  const searchParams = new URLSearchParams();

  store.panels.forEach((panel, i) => {
    searchParams.append('p', store.routes[panel.routeKey].href);
  });

  return {
    // to: { search: `/?${searchParams.toString()}` },
    to: `/?${searchParams.toString()}`,
    options: { state: { panels: store.panels, routes: store.routes } }
  };
};

//*****************************************************************************************
// Navigate
//*****************************************************************************************

/**
 * @name openRoute
 * @description Opens a route in the panel to the right of the panel currently displaying `routeKey`.
 * @param store - Router store
 * @param route - Route data to open
 * @param routeKey - Currently active route key used to find source panel
 * @returns Navigation payload for the updated store
 */
export const openRoute = (
  store: AppRouterStore,
  route: AppRouterStore['routes'][string],
  routeKey: string
): storeToNavigateReturnType => {
  const currentPanelKey = findPanelKey(store, { routeKey });

  if (currentPanelKey >= 0) {
    const nextPanelKey = currentPanelKey + 1;
    if (nextPanelKey < store.maxPanels) {
      if (nextPanelKey < store.panels.length) {
        store = addRouteToPanel(store, nextPanelKey, route);
      } else {
        let insertedPanelKey = null;
        [store, insertedPanelKey] = insertRightPanel(store, currentPanelKey);
        if (insertedPanelKey !== null) {
          store = addRouteToPanel(store, insertedPanelKey, route);
        }
      }
    }
    store = sanitizePanels(store);
    store = sanitizeNodes(store);
    store = sanitizeRoutes(store);
  }

  return storeToNavigate(store);
};

/**
 * @name replaceRoute2
 * @description Replaces fields of an existing route entry and returns navigation args.
 * @param store - Router store
 * @param route - Partial route data to merge into the target route
 * @param routeKey - Route key to update
 * @returns Navigation payload for the updated store
 */
export const replaceRoute2 = (
  store: AppRouterStore,
  route: AppRouterStore['routes'][string],
  routeKey: string
): storeToNavigateReturnType => {
  if (routeKey in store.routes) {
    store = updateRoute(store, route, routeKey);
  }

  return storeToNavigate(store);
};

/**
 * @name openRouteAtPanelKey
 * @description Opens a route at a specific panel index, creating/shifting panels as needed within bounds.
 * @param store - Router store
 * @param route - Route data to open
 * @param panelKey - Target panel index
 * @returns Navigation payload for the updated store
 */
export const openRouteAtPanelKey = (
  store: AppRouterStore,
  route: AppRouterStore['routes'][string],
  panelKey: number
): storeToNavigateReturnType => {
  if (panelKey >= 0 && panelKey < store.maxPanels) {
    if (panelKey >= store.panels.length) {
      let insertedPanelKey = null;
      [store, insertedPanelKey] = insertRightPanel(store, store.panels.length - 1);
      if (insertedPanelKey !== null) {
        store = addRouteToPanel(store, insertedPanelKey, route);
      }
    } else {
      store = addRouteToPanel(store, panelKey, route);
    }

    store = sanitizePanels(store);
    store = sanitizeNodes(store);
    store = sanitizeRoutes(store);
  }

  return storeToNavigate(store);
};

/**
 * @name moveRouteToPanelKey
 * @description Placeholder for moving an existing route to a target panel key.
 * @param store - Router store
 * @param route - Route data to move
 * @param panelKey - Target panel index
 * @returns Navigation payload (currently unimplemented)
 */
export const moveRouteToPanelKey = (
  store: AppRouterStore,
  route: AppRouterStore['routes'][string],
  panelKey: number
): storeToNavigateReturnType => {
  // if (panelKey >= 0 && panelKey < store.maxPanels) {
  //   if (panelKey >= store.panels.length) store = pushNewRoute(store, route, panelKey);
  //   else store = openNewRouteAtPanelKey(store, route, panelKey);
  //   store = sanitizePanels(store);
  //   store = sanitizeNodes(store);
  //   store = sanitizeRoutes(store);
  // }
  // return storeToNavigate(store);

  return null;
};

//*****************************************************************************************
// Path
//*****************************************************************************************

// export const buildPath = <Path extends string>(path: Path, params: Record<string, PathParamValue>) => {
//   return path.replace(/:([^/]+)/g, (_, key: string) => {
//     const value = params[key];
//     return encodeURIComponent(String(value));
//   });
// };

//*****************************************************************************************
// Params
//*****************************************************************************************

// export const PARAM_PARSERS = {
//   string: (defaultValue = ''): ParamsBlueprint<string> => ({
//     type: '',
//     parse: value => (value === undefined ? defaultValue : value),
//     stringify: value => String(value)
//   }),
//   number: (defaultValue = 0): ParamsBlueprint<number> => ({
//     type: 0,
//     parse: value => {
//       if (value === undefined) return defaultValue;
//       const parsed = Number(value);
//       return Number.isNaN(parsed) ? defaultValue : parsed;
//     },
//     stringify: value => String(value)
//   }),
//   boolean: (defaultValue = false): ParamsBlueprint<boolean> => ({
//     type: false,
//     parse: value => {
//       if (value === undefined) return defaultValue;
//       if (value === 'true' || value === '1') return true;
//       if (value === 'false' || value === '0') return false;
//       return defaultValue;
//     },
//     stringify: value => String(value)
//   })
// };

// export const createParamsParser = <Blueprints extends ParamsBlueprints>(
//   input: (parsers: typeof PARAM_PARSERS) => Blueprints
// ) => {
//   const blueprints = input(PARAM_PARSERS);

//   return {
//     type: Object.keys(blueprints).reduce((acc, key) => {
//       const parser = blueprints[key];
//       return { ...acc, [key]: parser.type };
//     }, {} as ParamsValues<Blueprints>),
//     blueprints,
//     parse: (raw: Record<string, string | undefined>) => {
//       return Object.keys(blueprints).reduce((acc, key) => {
//         const parser = blueprints[key];
//         return { ...acc, [key]: parser.parse(raw[key]) };
//       }, {} as ParamsValues<Blueprints>);
//     },
//     stringify: (params: Partial<ParamsValues<Blueprints>>) => {
//       return Object.keys(params).reduce(
//         (acc, key) => {
//           const parser = blueprints[key];
//           const value = params[key as keyof typeof params];
//           if (value === undefined || value === null || !parser) return acc;
//           return { ...acc, [key]: parser.stringify(value as never) };
//         },
//         {} as Record<string, string>
//       );
//     }
//   };
// };

//*****************************************************************************************
// Component
//*****************************************************************************************

//*****************************************************************************************
// Other
//*****************************************************************************************

// export type Params<Path extends string> = null;

// export const buildParams = <Path extends string>(path: Path) => {};

//*****************************************************************************************
// Router
//*****************************************************************************************

// export const getTargetPanel = (fromPanel: RoutePanel | null = 'panel-0', panel?: RoutePanel): RoutePanel => {
//   if (panel) return panel;
//   if (!fromPanel || fromPanel === 'panel-0') return 'panel-1';
//   if (fromPanel === 'panel-1') return 'panel-2';
//   if (fromPanel === 'panel-2') return 'panel-1';
//   return 'panel-1';
// };

// export const withParams = (path: string, params?: Record<string, string | number | boolean>) => {
//   if (!params) return path;
//   return Object.entries(params).reduce(
//     (acc, [key, value]) => acc.replace(`:${key}`, encodeURIComponent(String(value))),
//     path
//   );
// };

// export const toSearchString = (search?: Record<string, unknown>) => {
//   if (!search) return '';
//   const searchParams = new URLSearchParams();
//   Object.entries(search).forEach(([key, value]) => {
//     if (value === null || value === undefined) return;
//     if (Array.isArray(value)) {
//       value.forEach(item => searchParams.append(key, String(item)));
//       return;
//     }
//     searchParams.set(key, String(value));
//   });
//   const value = searchParams.toString();
//   return value ? `?${value}` : '';
// };

// export const upsertRouteInStore = (state: AppRouterStore, href: string, path: string): AppRouterStore => {
//   const routeId = href;
//   const routeKeys = state.routes.keys.includes(routeId) ? state.routes.keys : [...state.routes.keys, routeId];
//   const routeEntries = {
//     ...state.routes.entries,
//     [routeId]: {
//       href,
//       state: state.routes.entries[routeId]?.state ?? null
//     }
//   };

//   return {
//     ...state,
//     routes: {
//       keys: routeKeys,
//       entries: routeEntries
//     }
//   };
// };

// export const assignRouteToPanel = (state: AppRouterStore, panelId: string, routeId: string): AppRouterStore => {
//   const panel = state.panels.entries[panelId];
//   if (!panel) return state;

//   let nodeKey = panel.nodeKey;
//   if (!nodeKey) {
//     const freeNodeKey = state.nodes.keys.find(key => !state.nodes.entries[key]?.routeKey);
//     if (freeNodeKey) {
//       nodeKey = freeNodeKey;
//     } else {
//       const leastUsedNodeKey =
//         state.nodes.keys.reduce((oldestKey, currentKey) => {
//           const oldest = state.nodes.entries[oldestKey];
//           const current = state.nodes.entries[currentKey];
//           return current.lastUsedAt < oldest.lastUsedAt ? currentKey : oldestKey;
//         }, state.nodes.keys[0]) ?? null;
//       nodeKey = leastUsedNodeKey;
//     }
//   }

//   if (!nodeKey) return state;

//   const node = state.nodes.entries[nodeKey];
//   if (!node) return state;

//   const nodesEntries = {
//     ...state.nodes.entries,
//     [nodeKey]: {
//       ...node,
//       routeKey: routeId,
//       lastUsedAt: Date.now()
//     }
//   };

//   const panelsEntries = {
//     ...state.panels.entries,
//     [panelId]: {
//       ...panel,
//       nodeKey,
//       tabbedRoutes: panel.tabbedRouteKeys.includes(routeId) ? panel.tabbedRouteKeys : [...panel.tabbedRouteKeys, routeId]
//     }
//   };

//   return {
//     ...state,
//     nodes: { ...state.nodes, entries: nodesEntries },
//     panels: { ...state.panels, entries: panelsEntries }
//   };
// };
