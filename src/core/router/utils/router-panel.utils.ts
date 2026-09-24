import type { AppRouterPanel, AppSharedRouterStore, PageKeyOf } from 'core/router';

//*****************************************************************************************
// Panel
//*****************************************************************************************

/**
 * @name getDefaultRouterPanel
 * @description Creates a router panel populated with default values.
 * @param panel - Optional panel fields that override the defaults.
 * @returns A complete router panel.
 */
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

/**
 * @name findPanelKeyFromPageKey
 * @description Finds the panel containing a page key.
 * @param store - Router-compatible store to inspect.
 * @param pageKey - Page key to locate.
 * @returns Matching panel index, or -1 when not found.
 */
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
/**
 * @name getPanel
 * @description Returns a panel by index or a default panel when the index is missing.
 * @param store - Router-compatible store to inspect.
 * @param panelKey - Panel index to resolve.
 * @returns Matching panel or default router panel.
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

  const panelIndex =
    store.panels.length === 0 ? 0 : Math.min(Math.max(0, Math.trunc(panelKey)), store.panels.length - 1);
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
