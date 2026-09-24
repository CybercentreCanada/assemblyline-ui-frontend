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
