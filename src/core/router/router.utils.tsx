import type {
  AppLocationState,
  AppNavigateOptions,
  AppNavigationStore,
  AppRouterBlockedReason,
  AppRouterNode,
  AppRouterPage,
  AppRouterPanel,
  AppRouterStore,
  AppSharedRouterStore,
  ExtractNavReturn,
  InferAppNavigationOperationMapFromPath,
  InferAppNavigationPropsFromPath,
  NotFoundDetailItem,
  NotFoundDetailLabels,
  PageKeyOf
} from 'core/router';
import type { AppLocationParamStore } from 'core/routes';
import { findAppRouteFromPage, getRouteParamFromPage } from 'core/routes';
import { createReversePortalNode } from 'features/portal';
import type { TFunction } from 'i18next';
import type { SetStateAction } from 'react';
import { generateRandomUUID, hashObjectKeyOrderIndependent } from 'shared/utils/app.utils';

//*****************************************************************************************
// Panel
//*****************************************************************************************

export const getDefaultRouterPanel = function (panel: Partial<AppRouterPanel> = null): AppRouterPanel {
  return {
    pageKey: null,
    // pinnedPageKeys: [],
    // tabbedPageKeys: [],
    // temporaryPageKey: null,
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
    if (partialPanel?.pageKey && store.panels[i].pageKey === partialPanel?.pageKey) return i;
    // else if (partialPanel?.temporaryPageKey && store.panels[i].temporaryPageKey === partialPanel?.temporaryPageKey)
    //   return i;
    // else if (
    //   Array.isArray(partialPanel?.tabbedPageKeys) &&
    //   partialPanel?.tabbedPageKeys.every(k => store.panels[i].tabbedPageKeys.includes(k))
    // )
    //   return i;
    // else if (
    //   Array.isArray(partialPanel?.pinnedPageKeys) &&
    //   partialPanel?.pinnedPageKeys.every(k => store.panels[i].pinnedPageKeys.includes(k))
    // )
    //   return i;
  }

  return -1;
};

export const findPanelKeyFromPageKey = function <const Store extends AppSharedRouterStore>(
  store: Store,
  pageKey: PageKeyOf<Store>
): number {
  if (!pageKey) return -1;

  for (let i = 0; i < store.panels.length; i++) {
    const panel = store.panels[i];

    if (panel?.pageKey && panel.pageKey === pageKey) return i;
    // if (panel?.temporaryPageKey && panel.temporaryPageKey === pageKey) return i;
    // if (panel?.tabbedPageKeys?.includes(pageKey)) return i;
    // if (panel?.pinnedPageKeys?.includes(pageKey)) return i;
  }

  return -1;
};

/**
 * @name findPrevPanelKeyFromPageKey
 * @description Resolves the previous target panel index from the current page panel and navigation style.
 * When the page is outside all panels, defaults to the first panel.
 * @param store - Router store
 * @param pageKey - Current page key
 * @param preferences.router.navigation - Panel navigation strategy
 * @returns Previous target panel index
 */
export const findPrevPanelKeyFromPageKey = function <const Store extends AppSharedRouterStore>(
  store: Store,
  pageKey: PageKeyOf<Store>,
  preferences: AppPreferenceStore
): number {
  const currentPanelKey = findPanelKeyFromPageKey(store, pageKey);
  const originPanelKey = currentPanelKey < 0 ? 0 : currentPanelKey;

  if (preferences.router.navigation === 'push') return originPanelKey - 1;
  else if (preferences.router.navigation === 'loop')
    return originPanelKey - 1 < 0 ? preferences.router.maxPanels - 1 : originPanelKey - 1;
  else return preferences.router.maxPanels - 1;
};

/**
 * @name findNextPanelKeyFromPageKey
 * @description Resolves the next target panel index from the current page panel and navigation style.
 * When the page is outside all panels, defaults to the first panel.
 * @param store - Router store
 * @param pageKey - Current page key
 * @param preferences.router.navigation - Panel navigation strategy
 * @returns Next target panel index
 */
export const findNextPanelKeyFromPageKey = function <const Store extends AppSharedRouterStore>(
  store: Store,
  pageKey: PageKeyOf<Store>,
  preferences: AppPreferenceStore
): number {
  const currentPanelKey = findPanelKeyFromPageKey(store, pageKey);

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
 * @description Removes a panel when it has no active, temporary, tabbed, or pinned pages.
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
  //   !store.panels[panelKey].pageKey &&
  //   !store.panels[panelKey].temporaryPageKey &&
  //   !store.panels[panelKey].tabbedPageKeys.length &&
  //   !store.panels[panelKey].pinnedPageKeys.length
  // )

  if (!store.panels[panelKey].pageKey) {
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

  if (partialPanel && 'pageKey' in partialPanel) {
    store.panels[panelKey].pageKey = partialPanel.pageKey;
  }

  // if (partialPanel && 'temporaryPageKey' in partialPanel) {
  //   store.panels[panelKey].temporaryPageKey = partialPanel.temporaryPageKey;
  // }

  // if (Array.isArray(partialPanel?.tabbedPageKeys)) {
  //   store.panels[panelKey].tabbedPageKeys = partialPanel.tabbedPageKeys;
  // }

  // if (Array.isArray(partialPanel?.pinnedPageKeys)) {
  //   store.panels[panelKey].pinnedPageKeys = partialPanel.pinnedPageKeys;
  // }

  return store;
};

/**
 * @name mergePanels
 * @description Merges tabbed and pinned pages from source panel into destination panel.
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

  if (!store.panels[panelKeyB].pageKey && store.panels[panelKeyA].pageKey) {
    store.panels[panelKeyB].pageKey = store.panels[panelKeyA].pageKey;
  }

  // for (let i = store.panels[panelKeyA].tabbedPageKeys.length - 1; i >= 0; i--) {
  //   store.panels[panelKeyB].tabbedPageKeys.unshift(store.panels[panelKeyA].tabbedPageKeys[i]);
  // }

  // for (let i = store.panels[panelKeyA].pinnedPageKeys.length - 1; i >= 0; i--) {
  //   store.panels[panelKeyB].pinnedPageKeys.unshift(store.panels[panelKeyA].pinnedPageKeys[i]);
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
 * @name filterPanelMissingPageKeys
 * @description Removes panel page references that no longer exist in the page store.
 * @param store - Router store
 * @param panelKey - Panel index to sanitize
 * @returns Updated router store
 */
export const filterPanelMissingPageKeys = function <const Store extends AppSharedRouterStore>(
  store: Store,
  panelKey: number
): Store {
  if (panelKey < 0 || panelKey >= store?.panels?.length) return store;

  if (!(store.panels[panelKey].pageKey in store.pages)) {
    store.panels[panelKey].pageKey = null;
  }

  // if (!(store.panels[panelKey].temporaryPageKey in store.pages)) {
  //   store.panels[panelKey].temporaryPageKey = null;
  // }

  // for (let i = store.panels[panelKey].tabbedPageKeys.length - 1; i >= 0; i--) {
  //   if (!(store.panels[panelKey].tabbedPageKeys[i] in store.pages)) {
  //     store.panels[panelKey].tabbedPageKeys.splice(i, 1);
  //   }
  // }

  // for (let i = store.panels[panelKey].pinnedPageKeys.length - 1; i >= 0; i--) {
  //   if (!(store.panels[panelKey].pinnedPageKeys[i] in store.pages)) {
  //     store.panels[panelKey].pinnedPageKeys.splice(i, 1);
  //   }
  // }

  return store;
};

/**
 * @name setPanelActivePage
 * @description Sets panel active page when missing by selecting the youngest associated page.
 * @param store - Router store
 * @param panelKey - Panel index to update
 * @returns Updated router store
 */
export const setPanelActivePage = function <const Store extends AppSharedRouterStore>(
  store: Store,
  panelKey: number
): Store {
  if (panelKey < 0 || panelKey >= store?.panels?.length || store.panels[panelKey].pageKey) return store;

  // const panel = store.panels[panelKey];
  // let youngestPageKey: AppRouterPanel['pageKey'] = null;
  // let youngestAge = Infinity;
  // const candidates = new Set([panel.temporaryPageKey, ...panel.tabbedPageKeys, ...panel.pinnedPageKeys]);

  // for (const candidate of candidates) {
  //   if (!candidate || !(candidate in store.pages)) continue;
  //   const age = store.pages[candidate].age;
  //   if (age < youngestAge) {
  //     youngestAge = age;
  //     youngestPageKey = candidate;
  //   }
  // }

  // if (!youngestPageKey) return store;
  // panel.pageKey = youngestPageKey;

  return store;
};

/**
 * @name sanitizePanels
 * @description Normalizes panel references, removes empty panels, enforces max panels, and resolves active page keys.
 * @param store - Router store
 * @returns Updated router store
 */
export const sanitizePanels = function <const Store extends AppSharedRouterStore>(
  store: Store,
  preferences: AppPreferenceStore
): Store {
  for (let i = store.panels.length - 1; i >= 0; i--) {
    store = filterPanelMissingPageKeys(store, i);
    store = removeEmptyPanel(store, i);
  }

  while (preferences.router.maxPanels > 1 && store.panels.length > preferences.router.maxPanels) {
    store = mergePanels(store, 0, 1);
  }

  for (let i = store.panels.length - 1; i >= 0; i--) {
    store = setPanelActivePage(store, i);
  }

  return store;
};

//*****************************************************************************************
// Node
//*****************************************************************************************

export const getDefaultRouterNode = function (node: Partial<AppRouterNode> = null): AppRouterNode {
  return {
    portal: createReversePortalNode(),
    pageKey: null,
    lastUsedAt: Infinity,
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
      store.nodes[nextNodeKey] = {
        pageKey: panel.pageKey,
        lastUsedAt: Infinity
      } as Store['nodes'][string];
    } else {
      store.nodes[nextNodeKey] = {
        pageKey: panel.pageKey,
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
// Page
//*****************************************************************************************

export const getDefaultRouterPage = function (page: Partial<AppRouterPage> = null): AppRouterPage {
  return {
    age: 0,
    digest: null,
    href: null,
    scroll: null,
    state: null,
    transient: null,
    ...page
  };
};

export const getPageDigestFromPage = function (
  page: Pick<AppRouterPage, 'href' | 'state' | 'transient'>
): AppRouterPage['digest'] {
  return hashObjectKeyOrderIndependent({
    href: page?.href || '',
    state: page?.state || {},
    transient: page?.transient || {}
  });
};

export const getPage = function <const Store extends AppSharedRouterStore>(
  store: Store,
  pageKey: PageKeyOf<Store>
): AppRouterPage {
  const pages: Store['pages'] = store.pages || {};
  if (!pageKey || !(pageKey in pages)) return getDefaultRouterPage();
  return pages[pageKey] ?? getDefaultRouterPage();
};

// export const setPageDigestFromKey = function (
//   store: AppRouterStore,
//   pageKey: keyof AppRouterStore['pages']
// ): AppRouterStore {
//   if (!(pageKey in store.pages)) return store;

//   const page = store.pages[pageKey];
//   store.pages[pageKey].digest = getPageDigestFromPage(page);

//   return store;
// };

export const shouldUpdatePage = function (
  store: AppRouterStore,
  pageKey: keyof AppRouterStore['pages'],
  page: AppRouterPage
): boolean {
  if (!page?.href) return false;

  const nextDigest = page.digest ?? getPageDigestFromPage(page);

  if (!(pageKey in (store?.pages || {}))) return true;

  const prevPage = store.pages[pageKey];
  const prevDigest = prevPage?.digest ?? getPageDigestFromPage(prevPage);

  return prevDigest !== nextDigest;
};

// /**
//  * @name findPageKey
//  * @description Finds the key of a page in the store by deep value comparison.
//  * @param store - Router store
//  * @param page - Page value to find
//  * @returns Matching page key, or null if none is found
//  */
// export const findPageKey = (store: AppRouterStore, page: AppRouterPage): keyof AppRouterStore['pages'] => {
//   for (const pageKey in store.pages) {
//     if (deepCompare(page, store.pages[pageKey])) return pageKey;
//   }
//   return null;
// };

/**
 * @name findPageKeyFromPanelKey
 * @description Finds the active page key associated with the provided panel index.
 * @param store - Router store
 * @param panelKey - Panel index whose active page key should be returned
 * @returns Active page key from the panel, or null when panel/page is missing
 */
export const findPageKeyFromPanelKey = (store: AppRouterStore, panelKey: number): keyof AppRouterStore['pages'] => {
  if (panelKey < 0 || panelKey >= store?.panels?.length) return null;
  const pageKey = store.panels[panelKey]?.pageKey;
  return pageKey ? pageKey : null;
};

/**
 * @name captureScrollPositions
 * @description Captures scroll positions for all active pages from their DOM elements.
 * Call this before navigation to preserve scroll state across page transitions.
 * @returns Object mapping pageKey to scrollTop value
 */
export const captureScrollPositions = (): number[] => {
  const positions: number[] = [null, null];

  const appRoot = document.getElementById('app-scrollct');
  if (appRoot) positions[0] = appRoot.scrollTop;

  const drawerRoot = document.getElementById('drawer-scrollct');
  if (drawerRoot) positions[1] = drawerRoot.scrollTop;

  return positions;
};

export const setPageScrollPositions = function <const Store extends AppSharedRouterStore>(store: Store): Store {
  const positions = captureScrollPositions();

  for (const [panelKey, scroll] of positions.entries()) {
    const pageKey = store.panels[panelKey]?.pageKey;
    if (!pageKey || scroll == null) continue;
    if (!(pageKey in store.pages)) continue;
    store.pages[pageKey].scroll = scroll;
  }

  return store;
};

// /**
//  * @name findPage
//  * @description Finds and returns a matching page object from the store by deep value comparison.
//  * @param store - Router store
//  * @param page - Page value to find
//  * @returns Matching page object, or null if none is found
//  */
// export const findPage = (store: AppRouterStore, page: AppRouterPage): AppRouterPage => {
//   const key = findPageKey(store, page);
//   return key !== null ? store.pages[key] : null;
// };

// /**
//  * @name findNextPageKey
//  * @description Finds the active page key from the next panel relative to the panel containing the provided page key.
//  * @param store - Router store
//  * @param pageKey - Current page key used as navigation origin
//  * @param preferences.router.navigation - Panel navigation strategy
//  * @returns Active page key from the next panel, or null when unavailable
//  */
// export const findNextPageKey = (
//   store: AppRouterStore,
//   pageKey: keyof AppRouterStore['pages'],
//   preferences: AppPreferenceStore
// ): keyof AppRouterStore['pages'] => {
//   const nextPanelKey = findNextPanelKeyFromPageKey(store, pageKey, preferences);

//   if (nextPanelKey < 0 || nextPanelKey >= store.panels.length) return null;

//   const nextPageKey = store.panels[nextPanelKey]?.pageKey;
//   if (!nextPageKey || !(nextPageKey in store.pages)) return null;

//   return nextPageKey;
// };

// export const getPageFromKey = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   pageKey: keyof Store['pages']
// ): AppRouterPage {
//   const page = pageKey in store.pages ? store.pages[pageKey as string] : getDefaultRouterPage();
//   return page;
// };

// UNUSED: no call-sites found outside index re-exports.

/**
 * @name getPageFromPanelKey
 * @description Returns the active page content associated with the provided panel index.
 * @param store - Router store
 * @param panelKey - Panel index whose active page should be returned
 * @returns Matching page object, or null when panel/page is missing
 */
export const getPageFromPanelKey = function <const Store extends AppSharedRouterStore>(
  store: Store,
  panelKey: number
): AppRouterPage {
  if (panelKey < 0 || panelKey >= store?.panels?.length) return getDefaultRouterPage();

  const pageKey = store.panels[panelKey]?.pageKey;
  if (!pageKey || !(pageKey in store.pages)) return getDefaultRouterPage();

  return store.pages[pageKey] ?? getDefaultRouterPage();
};

// export const getNextPageFromKey = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   pageKey: keyof Store['pages'],
//   preferences: AppPreferenceStore
// ): AppRouterPage {
//   const currentPanelKey = findPanelKey(store, { pageKey } as Partial<Store['panels'][number]>);
//   if (currentPanelKey < 0 || currentPanelKey >= store.panels.length) return getDefaultRouterPage();

//   let nextPanelKey: number | null = currentPanelKey;

//   if (preferences.router.navigation === 'push') {
//     nextPanelKey = currentPanelKey >= 0 ? currentPanelKey + 1 : 0;
//   } else if (preferences.router.navigation === 'loop') {
//     nextPanelKey = currentPanelKey >= 0 ? currentPanelKey + 1 : 0;
//     nextPanelKey = nextPanelKey >= store.panels.length ? 0 : nextPanelKey;
//   }

//   return getPageFromPanelKey(store, nextPanelKey);
// };

// /**
//  * @name getFirstPageKey
//  * @description Returns the active page key for the first panel when available.
//  * @param store - Router store
//  * @returns Active page key from panel index 0, or null when unavailable
//  */
// export const getFirstPageKey = function <const Store extends AppSharedRouterStore>(
//   store: Store
// ): keyof Store['pages'] {
//   const firstPageKey = store.panels?.[0]?.pageKey;
//   if (!firstPageKey || !(firstPageKey in store.pages)) return null;
//   return firstPageKey;
// };

export const hasPages = function <const Store extends AppSharedRouterStore>(store: Store): boolean {
  return Object.keys(store?.pages || {}).length > 0;
};

export const isPageVisible = function <const Store extends AppSharedRouterStore>(
  store: Store,
  pageKey: PageKeyOf<Store>
): boolean {
  if (!(pageKey in store.pages)) return false;

  for (const panel of store.panels) {
    if (panel?.pageKey === pageKey) return true;
  }

  return false;
};

/**
 * @name removePage
 * @description Removes a page by key when it exists.
 * @param store - Router store
 * @param pageKey - Page key to remove
 * @returns Updated router store
 */
export const removePage = function <const Store extends AppSharedRouterStore>(
  store: Store,
  pageKey: PageKeyOf<Store>
): Store {
  if (!(pageKey in store.pages)) return store;
  delete store.pages[pageKey];

  if ('blockedPages' in (store as Record<string, unknown>)) {
    delete (store as unknown as AppNavigationStore).blockedPages[pageKey as string];
  }

  return store;
};

/**
 * @name updatePage
 * @description Updates page fields by key.
 * @param store - Router store
 * @param pageKey - Page key to update
 * @param partialPage - Partial page payload
 * @returns Updated router store
 */
export const updatePage = function <const Store extends AppSharedRouterStore>(
  store: Store,
  pageKey: PageKeyOf<Store>,
  partialPage: Partial<AppRouterPage> = null
): Store {
  if (!(pageKey in store.pages)) return store;

  let shouldRefreshDigest = false;

  if (partialPage && 'href' in partialPage) {
    store.pages[pageKey].href = partialPage.href;
    shouldRefreshDigest = true;
  }

  if (partialPage && 'state' in partialPage) {
    store.pages[pageKey].state = partialPage.state;
    shouldRefreshDigest = true;
  }

  if (partialPage && 'transient' in partialPage) {
    store.pages[pageKey].transient = partialPage.transient;
    shouldRefreshDigest = true;
  }

  if (partialPage && 'scroll' in partialPage) {
    store.pages[pageKey].scroll = partialPage.scroll;
  }

  if (partialPage && 'age' in partialPage) {
    store.pages[pageKey].age = partialPage.age;
  }

  if (partialPage && 'digest' in partialPage) {
    store.pages[pageKey].digest = partialPage.digest;
  } else if (shouldRefreshDigest || !store.pages[pageKey].digest) {
    store.pages[pageKey].digest = getPageDigestFromPage(store.pages[pageKey]);
  }

  return store;
};

/**
 * @name setPage
 * @description Sets or replaces a page by key using page defaults plus the supplied partial values.
 * @param store - Router store
 * @param pageKey - Target page key
 * @param partialPage - Partial page payload
 * @returns Updated router store
 */
export const setPage = function <const Store extends AppSharedRouterStore>(
  store: Store,
  pageKey: PageKeyOf<Store>,
  partialPage: Partial<AppRouterPage>
): Store {
  const page = getDefaultRouterPage(partialPage);
  page.digest = getPageDigestFromPage(page);
  store.pages[pageKey] = page;
  return store;
};

/**
 * @name updatePageFromNavigationPage
 * @description Applies navigation page values into router page with digest-aware field updates.
 * If digests match, href/state/transient are preserved while other fields still update.
 */
export const updatePageFromNavigationPage = function (
  store: AppRouterStore,
  pageKey: keyof AppRouterStore['pages'],
  nextPage: AppNavigationStore['pages'][string]
): AppRouterStore {
  if (!(pageKey in store.pages)) {
    const page = getDefaultRouterPage(nextPage);
    page.digest = nextPage?.digest || getPageDigestFromPage(page);
    store.pages[pageKey] = page;
    return store;
  }

  const currentPage = store.pages[pageKey];
  const hasSameDigest = !!currentPage?.digest && !!nextPage?.digest && currentPage.digest === nextPage.digest;

  if (!hasSameDigest) {
    currentPage.href = nextPage.href;
    currentPage.state = nextPage.state;
    currentPage.transient = nextPage.transient;
  }

  currentPage.age = nextPage.age;
  currentPage.scroll = nextPage.scroll;
  currentPage.digest = nextPage.digest || currentPage.digest || getPageDigestFromPage(currentPage);

  return store;
};

/**
 * @name addPage
 * @description Creates a new page entry and returns its generated key.
 * @param store - Router store
 * @param partialPage - Partial page payload
 * @returns Tuple of updated store and page key
 */
export const addPage = function <const Store extends AppSharedRouterStore>(
  store: Store,
  partialPage: Partial<AppRouterPage>,
  pageKey: PageKeyOf<Store> | null = null
): [Store, PageKeyOf<Store>] {
  pageKey = pageKey || (generateRandomUUID(Object.keys(store.pages)) as PageKeyOf<Store>);
  const page = getDefaultRouterPage(partialPage);
  page.digest = getPageDigestFromPage(page);
  store.pages[pageKey] = page;
  return [store, pageKey];
};

/**
 * @name addPageToPanel
 * @description Creates a page and assigns it as the active temporary page of the target panel.
 * @param store - Router store
 * @param panelKey - Target panel index
 * @param partialPage - Partial page payload
 * @returns Updated router store
 */
export const addPageToPanel = function <const Store extends AppSharedRouterStore>(
  store: Store,
  panelKey: number,
  partialPage: Partial<AppRouterPage>
): Store {
  if (store.panels.length === 0 || panelKey < 0 || panelKey >= store?.panels?.length) return store;

  const newPageKey = generateRandomUUID(Object.keys(store.pages));
  const page = getDefaultRouterPage(partialPage);
  page.digest = getPageDigestFromPage(page);
  store.pages[newPageKey] = page;
  store.panels[panelKey].pageKey = newPageKey;

  return store;
};

/**
 * @name upsertPage
 * @description Updates page when key exists; otherwise creates a new page.
 * @param store - Router store
 * @param pageKey - Page key to update
 * @param partialPage - Partial page payload
 * @returns Tuple of updated store and resolved page key
 */
export const upsertPage = function <const Store extends AppSharedRouterStore>(
  store: Store,
  pageKey: PageKeyOf<Store>,
  partialPage: Partial<AppRouterPage>
): [Store, PageKeyOf<Store>] {
  if (pageKey in store.pages) store = updatePage(store, pageKey, partialPage);
  else [store, pageKey] = addPage(store, partialPage, pageKey);
  return [store, pageKey];
};

/**
 * @name refreshPageAges
 * @description Recomputes page age ordering, prioritizing displayed pages.
 * @param store - Router store
 * @returns Updated router store
 */
export const refreshPageAges = function <const Store extends AppSharedRouterStore>(store: Store): Store {
  const activePageKeys = new Set<string>();
  for (const panel of store.panels) {
    if (panel?.pageKey) activePageKeys.add(panel.pageKey);
  }

  const orderedEntries = Object.entries(store.pages).sort(([pageKeyA, pageA], [pageKeyB, pageB]) => {
    const aIsDisplayed = activePageKeys.has(pageKeyA);
    const bIsDisplayed = activePageKeys.has(pageKeyB);

    if (aIsDisplayed !== bIsDisplayed) return aIsDisplayed ? -1 : 1;
    if (pageA.age !== pageB.age) return pageA.age - pageB.age;
    return pageKeyA.localeCompare(pageKeyB);
  });

  orderedEntries.forEach(([pageKey], i) => {
    store.pages[pageKey].age = i;
  });

  return store;
};

/**
 * @name filterOrphanedPages
 * @description Collects all page keys currently referenced by panels and nodes, then removes unreferenced pages from the store.
 * @param store - Router store
 * @returns Updated router store with orphaned pages removed
 */
export const filterOrphanedPages = function <const Store extends AppSharedRouterStore>(store: Store): Store {
  const activePages = new Set<string>();

  for (const panel of store.panels) {
    if (!panel) continue;

    if (panel.pageKey) activePages.add(panel.pageKey);

    // if (panel.temporaryPageKey) activePages.add(panel.temporaryPageKey);

    // if (panel.tabbedPageKeys) {
    //   for (const page of panel.tabbedPageKeys) activePages.add(page);
    // }

    // if (panel.pinnedPageKeys) {
    //   for (const page of panel.pinnedPageKeys) activePages.add(page);
    // }
  }

  for (const nodeKey in store.nodes) {
    if (store.nodes[nodeKey].pageKey) activePages.add(store.nodes[nodeKey].pageKey);
  }

  for (const pageKey in store.pages) {
    if (!activePages.has(pageKey)) {
      delete store.pages[pageKey];
    }
  }

  return store;
};

/**
 * @name sanitizePages
 * @description Removes orphaned pages and then recomputes page ages.
 * @param store - Router store
 * @returns Updated router store
 */
export const sanitizePages = function <const Store extends AppSharedRouterStore>(store: Store): Store {
  store = filterOrphanedPages(store);
  store = refreshPageAges(store);
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
//  * @param source - Page source filter
//  * @returns Router store (currently unchanged)
//  */
// export const showPreviousTab = (
//   store: AppRouterStore,
//   _panelKey: keyof AppRouterStore['pages'],
//   _source: 'active' | 'temporary' | 'tabbed' | 'pinned' = null
// ): AppRouterStore => {
//   void _panelKey;
//   void _source;
//   return store;
// };

// /**
//  * @name removeTabFromPanel
//  * @description Removes a page key from a single panel active/temporary/tabbed/pinned entries.
//  * @param store - Router store
//  * @param panelKey - Target panel index
//  * @param pageKey - Page key to remove
//  * @returns Updated router store
//  */
// export const removeTabFromPanel = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   panelKey: number = null,
//   pageKey: PageKeyOf<Store> | null = null
// ): Store {
//   if (panelKey === null || panelKey < 0 || panelKey >= store?.panels?.length) return store;
//   const panel = store.panels[panelKey];

//   if (panel.pageKey === pageKey) panel.pageKey = null;
//   if (panel.temporaryPageKey === pageKey) panel.temporaryPageKey = null;

//   if (pageKey !== null) {
//     const tabbedIndex = panel.tabbedPageKeys.indexOf(pageKey);
//     if (tabbedIndex >= 0) panel.tabbedPageKeys.splice(tabbedIndex, 1);
//   }

//   if (pageKey !== null) {
//     const pinnedIndex = panel.pinnedPageKeys.indexOf(pageKey);
//     if (pinnedIndex >= 0) panel.pinnedPageKeys.splice(pinnedIndex, 1);
//   }

//   return store;
// };

// /**
//  * @name removeTab
//  * @description Removes a page key from all panels' active/temporary/tabbed/pinned entries.
//  * @param store - Router store
//  * @param pageKey - Page key to remove
//  * @returns Updated router store
//  */
// export const removeTab = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   pageKey: PageKeyOf<Store> | null = null
// ): Store {
//   for (let i = 0; i < store.panels.length; i++) {
//     store = removeTabFromPanel(store, i, pageKey);
//   }

//   return store;
// };

// /**
//  * @name addTab
//  * @description Adds/sets a page in the chosen tab source of a panel.
//  * @param store - Router store
//  * @param panelKey - Target panel index
//  * @param pageKey - Page key to add
//  * @param source - Destination collection
//  * @returns Updated router store
//  */
// export const addTab = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   panelKey: number = -1,
//   pageKey: PageKeyOf<Store> | null = null,
//   source: 'temporary' | 'tabbed' | 'pinned' = 'temporary'
// ): Store {
//   if (panelKey < 0 || panelKey >= store?.panels?.length || !(pageKey in store.pages)) return store;

//   store.panels[panelKey].pageKey = pageKey;

//   switch (source) {
//     case 'temporary':
//       store.panels[panelKey].temporaryPageKey = pageKey;
//       break;
//     case 'tabbed':
//       store.panels[panelKey].tabbedPageKeys.push(pageKey);
//       break;
//     case 'pinned':
//       store.panels[panelKey].pinnedPageKeys.push(pageKey);
//       break;
//   }

//   return store;
// };

// /**
//  * @name permanentTab
//  * @description Converts a temporary page to a tabbed page and keeps it active.
//  * @param store - Router store
//  * @param pageKey - Page key to convert
//  * @returns Updated router store
//  */
// export const permanentTab = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   pageKey: PageKeyOf<Store>
// ): Store {
//   if (!(pageKey in store.pages)) return store;

//   const panelKey = findPanelKey(store, { temporaryPageKey: pageKey });
//   if (panelKey < 0) return store;
//   store.panels[panelKey].pageKey = pageKey;
//   store.panels[panelKey].temporaryPageKey = null;
//   store.panels[panelKey].tabbedPageKeys.push(pageKey);

//   return store;
// };

// /**
//  * @name setPermanentPage
//  * @description Marks a page as permanent in the store.
//  * @param store - Router store
//  * @param pageKey - Page key to mark as permanent
//  * @returns Updated router store with the page marked permanent
//  */
// export const setPermanentPage = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   pageKey: PageKeyOf<Store>
// ): Store {
//   if (!(pageKey in store.pages)) return store;

//   const panelIndex = findPanelKey(store, { temporaryPageKey: pageKey });
//   if (panelIndex < 0) return store;
//   store.panels[panelIndex].tabbedPageKeys.push(store.panels[panelIndex].temporaryPageKey);
//   store.panels[panelIndex].temporaryPageKey = null;

//   return store;
// };

// /**
//  * @name setPinnedPage
//  * @description Pins a page by moving it from temporary/tabbed collections into the panel pinned collection.
//  * @param store - Router store
//  * @param pageKey - Page key to pin
//  * @returns Updated router store with the page pinned where found
//  */
// export const setPinnedPage = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   pageKey: keyof Store['pages']
// ): Store {
//   if (!(pageKey in store.pages)) return store;

//   let panelIndex = findPanelKey(store, {
//     temporaryPageKey: pageKey as Store['panels'][number]['temporaryPageKey']
//   });
//   if (panelIndex >= 0) {
//     store.panels[panelIndex].pinnedPageKeys.push(pageKey as AppRouterPanel['pageKey']);
//     store.panels[panelIndex].temporaryPageKey = null;
//   }

//   panelIndex = findPanelKey(store, {
//     tabbedPageKeys: [pageKey] as AppRouterPanel['tabbedPageKeys']
//   });
//   if (panelIndex >= 0) {
//     store.panels[panelIndex].pinnedPageKeys.push(pageKey as AppRouterPanel['pageKey']);
//     const index = store.panels[panelIndex].tabbedPageKeys.findIndex(
//       k => k === (pageKey as AppRouterPanel['pageKey'])
//     );
//     store.panels[panelIndex].tabbedPageKeys.splice(index, 1);
//   }

//   return store;
// };

// /**
//  * @name setUnpinnedPage
//  * @description Unpins a page by removing it from pinned pages and inserting it at the start of tabbed pages.
//  * @param store - Router store
//  * @param pageKey - Page key to unpin
//  * @returns Updated router store with the page unpinned
//  */
// export const setUnpinnedPage = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   pageKey: keyof Store['pages']
// ): Store {
//   if (!(pageKey in store.pages)) return store;

//   const panelIndex = findPanelKey(store, {
//     pinnedPageKeys: [pageKey as AppRouterPanel['pageKey']]
//   });
//   if (panelIndex >= 0) {
//     store.panels[panelIndex].tabbedPageKeys.unshift(pageKey as AppRouterPanel['pageKey']);
//     const index = store.panels[panelIndex].pinnedPageKeys.findIndex(
//       k => k === (pageKey as AppRouterPanel['pageKey'])
//     );
//     store.panels[panelIndex].pinnedPageKeys.splice(index, 1);
//   }

//   return store;
// };

// /**
//  * @name moveTabbedPageKey
//  * @description Placeholder for moving a page key between tab/pinned collections in a destination panel.
//  * @param store - Router store
//  * @param pageKey - Page key to move
//  * @param panelKey - Destination panel index
//  * @param tabIndex - Destination tab index
//  * @param tab - Destination collection ('pinned' or 'tab')
//  * @returns Router store (currently unchanged)
//  */
// export const moveTabbedPageKey = function <const Store extends AppSharedRouterStore>(
//   store: Store,
//   pageKey: keyof Store['pages'],
//   panelKey: number,
//   tabIndex: number,
//   tab: 'pinned' | 'tab'
// ): Store {
//   if (!(pageKey in store.pages) || panelKey < 0 || panelKey >= store?.panels?.length) return store;

//   for (const panel of store.panels) {
//     if (panel.temporaryPageKey === pageKey) {
//       panel.temporaryPageKey = null;
//     }

//     const tabbedIndex = panel.tabbedPageKeys.indexOf(pageKey as AppRouterPanel['pageKey']);
//     if (tabbedIndex >= 0) {
//       panel.tabbedPageKeys.splice(tabbedIndex, 1);
//     }

//     const pinnedIndex = panel.pinnedPageKeys.indexOf(pageKey as AppRouterPanel['pageKey']);
//     if (pinnedIndex >= 0) {
//       panel.pinnedPageKeys.splice(pinnedIndex, 1);
//     }
//   }

//   const destinationPanel = store.panels[panelKey];
//   destinationPanel.pageKey = pageKey as Store['panels'][number]['pageKey'];

//   if (tab === 'pinned') {
//     const insertionIndex = Math.min(Math.max(0, Math.trunc(tabIndex)), destinationPanel.pinnedPageKeys.length);
//     destinationPanel.pinnedPageKeys.splice(insertionIndex, 0, pageKey as AppRouterPanel['pageKey']);
//   } else {
//     const insertionIndex = Math.min(Math.max(0, Math.trunc(tabIndex)), destinationPanel.tabbedPageKeys.length);
//     destinationPanel.tabbedPageKeys.splice(insertionIndex, 0, pageKey as AppRouterPanel['pageKey']);
//   }

//   return store;
// };

//*****************************************************************************************
// Not Found Page
//*****************************************************************************************

const getAttemptedHrefFromInput = (input: unknown): AppRouterPage['href'] => {
  if (typeof input === 'string') {
    const next = input.trim();
    return next ? next : null;
  }

  if (!input || typeof input !== 'object') return null;

  if ('pathname' in input) {
    const locationLike = input as { pathname?: unknown; search?: unknown; hash?: unknown };
    if (typeof locationLike.pathname !== 'string' || !locationLike.pathname) return null;

    const search = typeof locationLike.search === 'string' ? locationLike.search : '';
    const hash = typeof locationLike.hash === 'string' ? locationLike.hash : '';
    return `${locationLike.pathname}${search}${hash}`;
  }

  if ('route' in input) {
    const routeLike = input as { route?: unknown };
    return typeof routeLike.route === 'string' && routeLike.route ? routeLike.route : null;
  }

  if ('href' in input) {
    const hrefLike = input as { href?: unknown };
    return typeof hrefLike.href === 'string' && hrefLike.href ? hrefLike.href : null;
  }

  return null;
};

export const isNotFoundRouterPage = function (page: Partial<AppRouterPage> = null): boolean {
  if (!page) return false;
  if (page.digest === 'not-found') return true;

  const transient = page.transient as { __notFound?: boolean } | null;
  return transient?.__notFound === true;
};

export const getNotFoundRouterPage = function (
  values: object = null,
  href: AppRouterPage['href'] = '/not-found'
): AppRouterPage {
  return {
    age: 0,
    digest: 'not-found',
    href,
    scroll: null,
    state: null,
    transient: {
      __notFound: true,
      values: { ...values }
    }
  };
};

export const resolveNotFoundPage = (
  page: AppRouterPage,
  attemptedInput: unknown,
  context: Record<string, unknown>
): AppRouterPage => {
  if (page?.href) return page;

  const attemptedHref = getAttemptedHrefFromInput(attemptedInput);
  return getNotFoundRouterPage(
    {
      ...context,
      attemptedHref,
      attemptedInput,
      attemptedPage: {
        age: page?.age ?? null,
        digest: page?.digest ?? null,
        href: page?.href ?? null,
        scroll: page?.scroll ?? null,
        state: page?.state ?? null,
        transient: page?.transient ?? null
      }
    },
    attemptedHref
  );
};

const getAttemptedPageFromDiagnostics = (
  diagnostics: Record<string, unknown> | null
): Record<string, unknown> | null => {
  if (!diagnostics?.attemptedPage || typeof diagnostics.attemptedPage !== 'object') return null;
  return diagnostics.attemptedPage as Record<string, unknown>;
};

export const formatNotFoundDiagnosticValue = (value: unknown, unserializableValue: string): string | null => {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return unserializableValue;
  }
};

export const getNotFoundPreviewHref = (diagnostics: Record<string, unknown> | null): AppRouterPage['href'] => {
  if (!diagnostics) return null;

  const attemptedHref = diagnostics.attemptedHref;
  if (typeof attemptedHref === 'string' && attemptedHref) return attemptedHref;

  const attemptedPage = getAttemptedPageFromDiagnostics(diagnostics);
  if (attemptedPage) {
    const attemptedPageHref = attemptedPage.href;
    if (typeof attemptedPageHref === 'string' && attemptedPageHref) return attemptedPageHref;
  }

  const attemptedInput = diagnostics.attemptedInput;
  if (typeof attemptedInput === 'string' && attemptedInput) return attemptedInput;
  if (attemptedInput && typeof attemptedInput === 'object') {
    const input = attemptedInput as { href?: unknown; pathname?: unknown; search?: unknown; hash?: unknown };

    if (typeof input.href === 'string' && input.href) return input.href;
    if (typeof input.pathname === 'string' && input.pathname) {
      const searchValue = typeof input.search === 'string' ? input.search : '';
      const hashValue = typeof input.hash === 'string' ? input.hash : '';
      return `${input.pathname}${searchValue}${hashValue}`;
    }
  }

  return null;
};

export const getNotFoundDetails = (
  diagnostics: Record<string, unknown> | null,
  labels: NotFoundDetailLabels,
  unserializableValue: string
): NotFoundDetailItem[] => {
  if (!diagnostics) return [];

  const items: NotFoundDetailItem[] = [];
  const attemptedPage = getAttemptedPageFromDiagnostics(diagnostics);

  const pushItem = (label: string, value: unknown, pre: boolean = false) => {
    const formatted = formatNotFoundDiagnosticValue(value, unserializableValue);
    if (!formatted) return;
    items.push({ label, value: formatted, pre });
  };

  pushItem(labels.operation, diagnostics.operation);
  pushItem(labels.targetPanelKey, diagnostics.targetPanelKey);
  pushItem(labels.panelKey, diagnostics.panelKey);
  pushItem(labels.originPageKey, diagnostics.originPageKey);
  pushItem(labels.pageKey, diagnostics.pageKey);
  pushItem(labels.attemptedHref, diagnostics.attemptedHref);
  pushItem(labels.pageDigest, attemptedPage?.digest);
  pushItem(labels.pageHref, attemptedPage?.href);
  pushItem(labels.pageAge, attemptedPage?.age);
  pushItem(labels.pageScroll, attemptedPage?.scroll);
  pushItem(labels.pageState, attemptedPage?.state, true);
  pushItem(labels.pageTransient, attemptedPage?.transient, true);

  return items;
};

//*****************************************************************************************
// Blocked Pages
//*****************************************************************************************

/**
 * @name addBlocker
 * @description Adds a blocker entry for a page key when the page exists and is not already blocked.
 * @param store - Router store
 * @param pageKey - Page key to block
 * @returns Updated router store
 */
export const addBlockedPage = (
  store: AppNavigationStore,
  pageKey: keyof AppNavigationStore['pages'],
  reason: AppRouterBlockedReason = 'unsaved_changes'
): AppNavigationStore => {
  if (!pageKey) return store;
  store.blockedPages[pageKey] = reason;
  return store;
};

/**
 * @name removeBlocker
 * @description Removes a blocker entry for a page key when it exists.
 * @param store - Router store
 * @param pageKey - Page key to unblock
 * @returns Updated router store
 */
export const removeBlockedPage = (
  store: AppNavigationStore,
  pageKey: keyof AppNavigationStore['pages']
): AppNavigationStore => {
  if (!(pageKey in store.blockedPages)) return store;
  delete store.blockedPages[pageKey];
  return store;
};

export const setBlockedPage = (
  store: AppNavigationStore,
  pageKey: keyof AppNavigationStore['pages'],
  reason: AppRouterBlockedReason
): AppNavigationStore => {
  if (reason) return addBlockedPage(store, pageKey, reason);
  else return removeBlockedPage(store, pageKey);
};

export const getBlockedPages = (store: AppNavigationStore) => {
  return !Object.keys(store.blockedPages || {}).length ? [] : Object.entries(store.blockedPages);
};

export const clearBlockedPages = (store: AppNavigationStore): AppNavigationStore => {
  store.blockedPages = {};
  return store;
};

/**
 * @name hasBlockers
 * @description Checks whether any blocked page has diverged between the navigation store and router store.
 * @param navigation - Navigation store
 * @param router - Router store
 * @returns True when at least one blocked page digest differs, otherwise false
 */
export const hasBlockedPages = (navigation: AppNavigationStore, router: AppRouterStore): boolean => {
  return Object.keys(navigation?.blockedPages || {}).some(pageKey => {
    const navigationPage = getPage(navigation, pageKey);
    const routerPage = getPage(router, pageKey);
    const navigationPanel = findPanelKeyFromPageKey(navigation, pageKey);
    const routerPanel = findPanelKeyFromPageKey(router, pageKey);

    return navigationPage?.digest !== routerPage?.digest || navigationPanel !== routerPanel;
  });
};

//*****************************************************************************************
// Navigation
//*****************************************************************************************

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

export const resolveNavigationIntent = function <const Origin extends AppRoute['path']>(
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
    search: (operationDispatch: InferAppNavigationOperationMapFromPath<Origin>['search']) => {
      target = key;
      panelKey = atPanelKey;
      options = operationOptions;
      operation = 'search';
      dispatch = operationDispatch;
    },
    only: (operationDispatch: InferAppNavigationOperationMapFromPath<Origin>['only']) => {
      target = key;
      panelKey = atPanelKey;
      options = operationOptions;
      operation = 'only';
      dispatch = operationDispatch;
    },
    closePanel: (operationDispatch: InferAppNavigationOperationMapFromPath<Origin>['closePanel']) => {
      target = key;
      panelKey = atPanelKey;
      options = operationOptions;
      operation = 'closePanel';
      dispatch = operationDispatch;
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
      const page = store.pages[panel.pageKey];

      if (!page?.href) return null;

      try {
        const url = new URL(page.href, 'http://localhost');
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

export const getTitlesFromNavigation = function (
  navigation: AppNavigationStore,
  locationParam: AppLocationParamStore,
  config: AppConfigStore,
  t: TFunction
): string[] {
  return navigation.panels
    .map(panel => {
      if (!panel?.pageKey) return null;

      const page = navigation.pages?.[panel.pageKey];
      if (!page?.href) return null;

      const route = findAppRouteFromPage(locationParam, page);
      if (!route?.path || typeof route.fullname !== 'function') return null;

      const location = getRouteParamFromPage(locationParam, page);
      if (!location?.route) return null;

      const name = route.fullname(location as never, config);
      if (!name) return null;

      const title = t(name?.[0], name?.[1]);
      if (typeof title !== 'string') return null;

      const trimmedTitle = title.trim();
      return trimmedTitle || null;
    })
    .filter((title): title is string => Boolean(title));
};

// export const getNextTitleFromPage = function (page: Pick<AppRouterPage, 'href'>): string {
//   if (!page?.href) return null;

//   try {
//     const url = new URL(page.href, 'http://localhost');
//     const currentLocation = url.pathname.split('/').join(' ').trim();

//     if (!currentLocation) return null;
//     return `${currentLocation.charAt(0).toUpperCase()}${currentLocation.slice(1)}`;
//   } catch {
//     return null;
//   }
// };

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

//   for (const [pageKey, nextPage] of Object.entries(router.pages)) {
//     const currentPage = navigation.pages[pageKey];
//     if (currentPage && deepCompare(currentPage, nextPage)) continue;
//     navigation.pages[pageKey] = structuredClone(nextPage);
//   }

//   for (const pageKey of Object.keys(navigation.pages)) {
//     if (pageKey in router.pages) continue;
//     delete navigation.pages[pageKey];
//   }

//   for (const [nodeKey, node] of Object.entries(router.nodes)) {
//     const nextNode = {
//       pageKey: node.pageKey,
//       lastUsedAt: node.lastUsedAt
//     };

//     if (nodeKey in navigation.nodes && deepCompare(navigation.nodes[nodeKey], nextNode)) continue;
//     navigation.nodes[nodeKey] = nextNode;
//   }

//   for (const nodeKey of Object.keys(navigation.nodes)) {
//     if (nodeKey in router.nodes) continue;
//     delete navigation.nodes[nodeKey];
//   }

//   for (const pageKey of Object.keys(navigation.blockedPages)) {
//     if (pageKey in navigation.pages) continue;
//     navigation = removeBlockedPage(navigation, pageKey);
//   }

//   return navigation;
// };

// export const getAppRouterStoreFromNavigationStore = function (
//   router: AppRouterStore,
//   navigation: AppNavigationStore
// ): AppRouterStore {
//   router.id = navigation.id;

//   for (const [pageKey, nextPage] of Object.entries(navigation.pages)) {
//     const currentPage = router.pages[pageKey];
//     if (currentPage && deepCompare(currentPage, nextPage)) continue;
//     [router] = upsertPage(router, pageKey, nextPage);
//   }

//   for (const pageKey of Object.keys(router.pages)) {
//     if (pageKey in navigation.pages) continue;
//     router = removePage(router, pageKey);
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
//     const nextPageKey = nextNode.pageKey;

//     if (currentNode && currentNode.pageKey === nextPageKey && currentNode.lastUsedAt === nextNode.lastUsedAt) {
//       continue;
//     }

//     [router] = upsertNode(router, nodeKey, {
//       pageKey: nextPageKey,
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
//   const pages: AppLocationState['pages'] = {};

//   for (const [pageKey, page] of Object.entries(router.pages)) {
//     pages[pageKey] = {
//       href: page.href,
//       state: page.state,
//       scroll: page.scroll
//     };
//   }

//   return {
//     id: router.id,
//     panels: structuredClone(router.panels),
//     pages
//   };
// };

//TODO: fix this so that it doesn't get the full content of the pages stored in the location
export const getLocationStateFromRouter = function (store: AppNavigationStore): AppLocationState {
  return {
    id: store.id,
    panels: store.panels,
    pages: store.pages
  };
};

// export const areRouterStoreEqual = (current: AppRouterStore, next: AppRouterStore): boolean => {
//   const currentPageKeys = Object.keys(current.pages);
//   const nextPageKeys = Object.keys(next.pages);

//   if (currentPageKeys.length !== nextPageKeys.length) return false;

//   for (const pageKey of currentPageKeys) {
//     if (!(pageKey in next.pages)) return false;

//     const currentPage = current.pages[pageKey];
//     const nextPage = next.pages[pageKey];

//     if (currentPage?.age !== nextPage?.age) return false;
//     if (currentPage?.href !== nextPage?.href) return false;
//     if (JSON.stringify(currentPage?.state || {}) !== JSON.stringify(nextPage?.state || {})) return false;
//   }

//   if (current.panels.length !== next.panels.length) return false;

//   for (let panelIndex = 0; panelIndex < current.panels.length; panelIndex++) {
//     const currentPanel = current.panels[panelIndex];
//     const nextPanel = next.panels[panelIndex];

//     if (currentPanel?.pageKey !== nextPanel?.pageKey) return false;
//   }

//   return true;
// };

// export const cloneLocationStore = function <const Store extends AppSharedRouterStore>(store: Store): Store {
//   return {
//     id: store.id,
//     panels: structuredClone(store.panels),
//     pages: structuredClone(store.pages)
//   } as Store;
// };

export const reconcileRouterFromNavigation = (
  router: AppRouterStore,
  navigation: AppNavigationStore
): AppRouterStore => {
  router.id = navigation.id;

  for (const [pageKey, page] of Object.entries(navigation.pages)) {
    router = updatePageFromNavigationPage(router, pageKey, page);
  }

  for (const pageKey of Object.keys(router.pages)) {
    if (pageKey in navigation.pages) continue;
    router = removePage(router, pageKey);
  }

  for (let i = 0; i < navigation.panels.length; i++) {
    router = setPanel(router, i, navigation.panels[i]);
  }

  for (let i = router.panels.length - 1; i >= navigation.panels.length; i--) {
    router = removePanel(router, i);
  }

  for (const [nodeKey, node] of Object.entries(navigation.nodes)) {
    router.nodes[nodeKey] = {
      pageKey: node.pageKey,
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
  store = sanitizePages(store);
  return store;
};

//*****************************************************************************************
// Navigation Store
//*****************************************************************************************

export const applyDefaultNavigationStore = (
  store: AppNavigationStore,
  preference: AppPreferenceStore
): AppNavigationStore => {
  if (store?.panels?.length > 0 && Object.entries(store?.pages || {}).length > 0) return store;

  const [store1, nextPageKey] = addPage(store, { href: '/submit' });
  [store] = upsertPanel(store1, 0, { pageKey: nextPageKey }, preference);

  return store;
};

export const getNavigationStoreFromRouter = (store: AppNavigationStore, router: AppRouterStore): AppNavigationStore => {
  const clonePage = (page: AppRouterPage): AppNavigationStore['pages'][string] => {
    const nextPage = {
      ...page,
      state: page?.state == null ? page?.state : structuredClone(page.state),
      transient: page?.transient == null ? page?.transient : structuredClone(page.transient)
    };

    return nextPage;
  };

  store.id = router.id;

  for (let i = 0; i < router.panels.length; i++) {
    store = setPanel(store, i, router.panels[i]);
  }

  for (let i = store.panels.length - 1; i >= router.panels.length; i--) {
    store = removePanel(store, i);
  }

  for (const [pageKey, page] of Object.entries(router.pages)) {
    const currentPage = store.pages[pageKey];
    const nextDigest = page?.digest || getPageDigestFromPage(page);

    if (currentPage?.digest === nextDigest && currentPage?.scroll === page?.scroll && currentPage?.age === page?.age) {
      continue;
    }

    [store] = upsertPage(store, pageKey, clonePage(page));
  }

  for (const pageKey of Object.keys(store.pages)) {
    if (pageKey in router.pages) continue;
    store = removePage(store, pageKey);
  }

  if ('blockedPages' in (store as Record<string, unknown>)) {
    const navigationStore = store as unknown as AppNavigationStore;
    for (const pageKey of Object.keys(navigationStore.blockedPages)) {
      if (pageKey in router.pages) continue;
      delete navigationStore.blockedPages[pageKey];
    }
  }

  for (const [nodeKey, node] of Object.entries(router.nodes)) {
    const currentNode = store.nodes[nodeKey];

    if (currentNode?.pageKey === node.pageKey && currentNode?.lastUsedAt === node.lastUsedAt) {
      continue;
    }

    store.nodes[nodeKey] = { pageKey: node.pageKey, lastUsedAt: node.lastUsedAt };
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
//   store.pages = structuredClone(nextStore.pages);
//   store.options.replace = nextStore.options.replace;
//   return store;
// };

export const clearNavigationStore = (store: AppNavigationStore): AppNavigationStore => {
  store.id = null;
  store.panels = [];
  store.nodes = {};
  store.pages = {};
  store.blockedPages = {};
  store.options = getDefaultNavigateOptions();

  return store;
};

//*****************************************************************************************
// Legacy Route
//*****************************************************************************************

type LegacyResolution = {
  /** New href for panel 1 (drawer), if present. */
  1?: string;
  /** New href for panel 0 (main). */
  0: string;
};

type LegacyRouteTemplate = {
  /** Hash template without the leading `#`. */
  hash?: string;
  /** Pathname template. */
  pathname: string;
};

type LegacyRule = {
  /** Legacy location templates to match. */
  from: LegacyRouteTemplate;
  /** New panel href templates to produce. */
  to: LegacyResolution;
};

const LEGACY_RULES: LegacyRule[] = [
  { from: { pathname: '/' }, to: { 0: '/' } },
  { from: { pathname: '/account' }, to: { 0: '/account' } },
  { from: { pathname: '/admin' }, to: { 0: '/admin' } },
  { from: { pathname: '/admin/actions' }, to: { 0: '/admin/actions' } },

  {
    from: { pathname: '/admin/apikeys', hash: ':id' },
    to: { 0: '/admin/apikeys', 1: '/admin/apikeys/:id' }
  },
  { from: { pathname: '/admin/apikeys' }, to: { 0: '/admin/apikeys' } },
  { from: { pathname: '/admin/apikeys/:id' }, to: { 0: '/admin/apikeys/:id' } },

  {
    from: { pathname: '/admin/errors', hash: ':key' },
    to: { 0: '/admin/errors', 1: '/admin/errors/:key' }
  },
  { from: { pathname: '/admin/errors' }, to: { 0: '/admin/errors' } },
  { from: { pathname: '/admin/errors/:key' }, to: { 0: '/admin/errors/:key' } },

  { from: { pathname: '/admin/identify' }, to: { 0: '/admin/identify' } },
  { from: { pathname: '/admin/service_review' }, to: { 0: '/admin/service_review' } },

  {
    from: { pathname: '/admin/services', hash: ':svc' },
    to: { 0: '/admin/services', 1: '/admin/services/:svc' }
  },
  { from: { pathname: '/admin/services' }, to: { 0: '/admin/services' } },
  { from: { pathname: '/admin/services/:svc' }, to: { 0: '/admin/services/:svc' } },

  { from: { pathname: '/admin/sitemap' }, to: { 0: '/admin/sitemap' } },
  { from: { pathname: '/admin/tag_safelist' }, to: { 0: '/admin/tag_safelist' } },

  {
    from: { pathname: '/admin/users', hash: ':id' },
    to: { 0: '/admin/users', 1: '/admin/users/:id' }
  },
  { from: { pathname: '/admin/users' }, to: { 0: '/admin/users' } },
  { from: { pathname: '/admin/users/:id' }, to: { 0: '/admin/users/:id' } },

  { from: { pathname: '/alerts_redirect' }, to: { 0: '/alerts-redirect' } },
  {
    from: { pathname: '/alerts', hash: '/alert/:id' },
    to: { 0: '/alerts', 1: '/alert/:id' }
  },
  {
    from: { pathname: '/alerts', hash: '/workflow' },
    to: { 0: '/alerts', 1: '/manage/workflow/create' }
  },
  { from: { pathname: '/alerts' }, to: { 0: '/alerts' } },
  { from: { pathname: '/alerts/:id' }, to: { 0: '/alert/:id' } },

  {
    from: { pathname: '/archive', hash: ':id' },
    to: { 0: '/archives', 1: '/archive/:id' }
  },
  { from: { pathname: '/archive' }, to: { 0: '/archives' } },
  { from: { pathname: '/archive/:id' }, to: { 0: '/archive/:id' } },
  { from: { pathname: '/archive/:id/:tab' }, to: { 0: '/archive/:id/:tab' } },

  { from: { pathname: '/authorize' }, to: { 0: '/authorize' } },
  { from: { pathname: '/crash' }, to: { 0: '/crash' } },
  { from: { pathname: '/dashboard' }, to: { 0: '/dashboard' } },
  { from: { pathname: '/development/api' }, to: { 0: '/development/api' } },
  { from: { pathname: '/development/customize' }, to: { 0: '/development/customize' } },
  { from: { pathname: '/development/library' }, to: { 0: '/development/library' } },
  { from: { pathname: '/development/theme' }, to: { 0: '/development/theme' } },
  { from: { pathname: '/file/detail/:id' }, to: { 0: '/file/detail/:id' } },
  { from: { pathname: '/file/viewer/:id' }, to: { 0: '/file/viewer/:id' } },
  { from: { pathname: '/file/viewer/:id/:tab' }, to: { 0: '/file/viewer/:id/:tab' } },
  { from: { pathname: '/forbidden' }, to: { 0: '/forbidden' } },
  { from: { pathname: '/help' }, to: { 0: '/help' } },
  { from: { pathname: '/help/api' }, to: { 0: '/help/api' } },
  { from: { pathname: '/help/classification' }, to: { 0: '/help/classification' } },
  { from: { pathname: '/help/configuration' }, to: { 0: '/help/configuration' } },
  { from: { pathname: '/help/search' }, to: { 0: '/help/search' } },
  { from: { pathname: '/help/services' }, to: { 0: '/help/services' } },
  { from: { pathname: '/logout' }, to: { 0: '/logout' } },
  { from: { pathname: '/manage' }, to: { 0: '/manage' } },

  {
    from: { pathname: '/manage/badlist', hash: 'new' },
    to: { 0: '/manage/badlists', 1: '/manage/badlist/add' }
  },
  {
    from: { pathname: '/manage/badlist', hash: ':id' },
    to: { 0: '/manage/badlists', 1: '/manage/badlist/detail/:id' }
  },
  { from: { pathname: '/manage/badlist' }, to: { 0: '/manage/badlists' } },
  { from: { pathname: '/manage/badlist/:id' }, to: { 0: '/manage/badlist/detail/:id' } },

  { from: { pathname: '/manage/heuristic/:id' }, to: { 0: '/manage/heuristic/detail/:id' } },
  {
    from: { pathname: '/manage/heuristics', hash: ':id' },
    to: { 0: '/manage/heuristics', 1: '/manage/heuristic/detail/:id' }
  },
  { from: { pathname: '/manage/heuristics' }, to: { 0: '/manage/heuristics' } },

  {
    from: { pathname: '/manage/safelist', hash: 'new' },
    to: { 0: '/manage/safelists', 1: '/manage/safelist/add' }
  },
  {
    from: { pathname: '/manage/safelist', hash: ':id' },
    to: { 0: '/manage/safelists', 1: '/manage/safelist/detail/:id' }
  },
  { from: { pathname: '/manage/safelist' }, to: { 0: '/manage/safelists' } },
  { from: { pathname: '/manage/safelist/:id' }, to: { 0: '/manage/safelist/detail/:id' } },

  { from: { pathname: '/manage/signature/:id' }, to: { 0: '/manage/signature/detail/:id' } },
  {
    from: { pathname: '/manage/signature/:type/:source/:name' },
    to: { 0: '/manage/signature/detail/:type/:source/:name' }
  },
  {
    from: { pathname: '/manage/signatures', hash: ':id' },
    to: { 0: '/manage/signatures', 1: '/manage/signature/detail/:id' }
  },
  { from: { pathname: '/manage/signatures' }, to: { 0: '/manage/signatures' } },
  { from: { pathname: '/manage/sources' }, to: { 0: '/manage/sources' } },

  { from: { pathname: '/manage/workflow/create/:id' }, to: { 0: '/manage/workflow/create/:id' } },
  { from: { pathname: '/manage/workflow/detail/:id' }, to: { 0: '/manage/workflow/detail/:id' } },
  {
    from: { pathname: '/manage/workflows', hash: '/detail/:id' },
    to: { 0: '/manage/workflows', 1: '/manage/workflow/detail/:id' }
  },
  {
    from: { pathname: '/manage/workflows', hash: '/create' },
    to: { 0: '/manage/workflows', 1: '/manage/workflow/create' }
  },
  {
    from: { pathname: '/manage/workflows', hash: '/create/:id' },
    to: { 0: '/manage/workflows', 1: '/manage/workflow/create/:id' }
  },
  { from: { pathname: '/manage/workflows' }, to: { 0: '/manage/workflows' } },

  { from: { pathname: '/notfound' }, to: { 0: '/not-found' } },
  {
    from: { pathname: '/retrohunt', hash: ':key' },
    to: { 0: '/retrohunt', 1: '/retrohunt/detail/:key' }
  },
  { from: { pathname: '/retrohunt' }, to: { 0: '/retrohunt' } },
  { from: { pathname: '/retrohunt/:key' }, to: { 0: '/retrohunt/detail/:key' } },
  { from: { pathname: '/search' }, to: { 0: '/search' } },
  { from: { pathname: '/search/:id' }, to: { 0: '/search/:id' } },
  { from: { pathname: '/settings' }, to: { 0: '/settings' } },
  { from: { pathname: '/settings/:tab' }, to: { 0: '/settings/:tab' } },
  { from: { pathname: '/submission/:id' }, to: { 0: '/submission/:id' } },
  { from: { pathname: '/submission/detail/:id' }, to: { 0: '/submission/detail/:id' } },
  {
    from: { pathname: '/submission/detail/:id/:fid' },
    to: { 0: '/submission/detail/:id', 1: '/file/detail/:fid' }
  },
  { from: { pathname: '/submission/report/:id' }, to: { 0: '/submission/report/:id' } },
  { from: { pathname: '/submissions' }, to: { 0: '/submissions' } },
  { from: { pathname: '/submit' }, to: { 0: '/submit' } },
  { from: { pathname: '/tos' }, to: { 0: '/tos' } }
];

const appendSearch = (href: string, search: string): string => `${href}${search || ''}`;

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const templateMatchCache = new Map<string, { pattern: RegExp; keys: string[] }>();

const getTemplateMatch = (template: string) => {
  const cached = templateMatchCache.get(template);
  if (cached) return cached;

  const normalizedTemplate = template === '/' ? '/' : template.replace(/\/+$/, '');
  const source = escapeRegExp(normalizedTemplate).replace(/:([A-Za-z][A-Za-z0-9_]*)/g, '(?<$1>[^/?#]+)');
  const pattern = new RegExp(normalizedTemplate === '/' ? '^/?$' : `^${source}/?$`);
  const keys = Array.from(normalizedTemplate.matchAll(/:([A-Za-z][A-Za-z0-9_]*)/g), match => match[1]);
  const next = { pattern, keys };
  templateMatchCache.set(template, next);
  return next;
};

const matchTemplate = (template: string, value: string): Record<string, string> | null => {
  const { pattern } = getTemplateMatch(template);
  const match = pattern.exec(value);
  return match ? (match.groups ?? {}) : null;
};

const interpolateTemplate = (template: string, params: Record<string, string>): string =>
  template.replace(/:([A-Za-z][A-Za-z0-9_]*)/g, (_, key: string) => params[key] ?? `:${key}`);

/**
 * Maps an old location to new panel hrefs. Search parameters remain on panel 0;
 * query strings embedded in the old hash remain on panel 1.
 */
export const resolveLegacyLocation = (pathname: string, search: string, hash: string): LegacyResolution | null => {
  const hashValue = hash.startsWith('#') ? hash.slice(1) : hash;
  const hashQueryIndex = hashValue.indexOf('?');
  const hashPath = hashQueryIndex < 0 ? hashValue : hashValue.slice(0, hashQueryIndex);
  const hashSearch = hashQueryIndex < 0 ? '' : hashValue.slice(hashQueryIndex);

  for (const rule of LEGACY_RULES) {
    const pathParams = matchTemplate(rule.from.pathname, pathname);
    if (!pathParams) continue;

    const hashParams = rule.from.hash ? matchTemplate(rule.from.hash, hashPath) : {};
    if (!hashParams && rule.from.hash) continue;

    const params = { ...pathParams, ...hashParams };
    const main = appendSearch(interpolateTemplate(rule.to[0], params), search);
    const drawer = !rule.to[1] ? undefined : appendSearch(interpolateTemplate(rule.to[1], params), hashSearch);

    return { 0: main, ...(drawer ? { 1: drawer } : {}) };
  }

  return null;
};
