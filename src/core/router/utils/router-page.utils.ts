import type { AppNavigationStore, AppRouterPage, AppRouterStore, AppSharedRouterStore, PageKeyOf } from 'core/router';
import { generateRandomUUID, hashObjectKeyOrderIndependent } from 'shared/utils/app.utils';

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
