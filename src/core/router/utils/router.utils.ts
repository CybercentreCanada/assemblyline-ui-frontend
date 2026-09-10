import type {
  AppLocationParamStore,
  AppLocationState,
  AppNavigationStore,
  AppRouterStore,
  AppSharedRouterStore
} from 'core/router';
import {
  findAppRouteFromPage,
  getRouteParamFromPage,
  removeNode,
  removePage,
  removePanel,
  sanitizeNodes,
  sanitizePages,
  sanitizePanels,
  setPanel,
  updatePageFromNavigationPage
} from 'core/router';
import { createReversePortalNode } from 'features/portal';
import type { TFunction } from 'i18next';

//*****************************************************************************************
// Router Store
//*****************************************************************************************

/**
 * @name getHashFragmentsFromRouter
 * @description Collects route hash fragments from the active navigation panels.
 * @param store - Navigation store to inspect.
 * @returns Active hash fragments in panel order.
 */
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

/**
 * @name getTitlesFromNavigation
 * @description Resolves document titles for the active navigation pages.
 * @param store - Navigation store to inspect.
 * @param locationStore - Location parameter store used for route metadata.
 * @param config - Application configuration used by title callbacks.
 * @param translate - Translation function used by route labels.
 * @returns Document title values in panel order.
 */
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

/**
 * @name setDocumentTitleFromNavigation
 * @description Sets the document title from the active navigation pages.
 * @param store - Navigation store to inspect.
 * @param locationStore - Location parameter store used for route metadata.
 * @param config - Application configuration used by title callbacks.
 * @param translate - Translation function used by route labels.
 * @returns No value; updates the browser document title.
 */
export const setDocumentTitleFromNavigation = function (
  navigation: AppNavigationStore,
  locationParam: AppLocationParamStore,
  config: AppConfigStore,
  t: TFunction
) {
  const titles = getTitlesFromNavigation(navigation, locationParam, config, t);
  const nextTitle = navigation?.options?.nextTitle?.trim();
  const trimmedTitles = titles.map(title => (title.length > 33 ? `${title.slice(0, 30)}...` : title));
  document.title = nextTitle ? nextTitle : trimmedTitles?.length > 0 ? trimmedTitles.join(' | ') : 'Assemblyline 4';
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
/**
 * @name getLocationStateFromRouter
 * @description Converts navigation state into the browser location state payload.
 * @param store - Navigation store to serialize.
 * @returns Location state containing router identity, panels, and page data.
 */
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

/**
 * @name reconcileRouterFromNavigation
 * @description Applies navigation pages and panels to the router store.
 * @param store - Router store to update.
 * @param navigation - Navigation state to reconcile.
 * @returns The updated router store.
 */
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
      portal: router.nodes[nodeKey]?.portal || createReversePortalNode()
    };
  }

  for (const nodeKey of Object.keys(router.nodes)) {
    if (nodeKey in navigation.nodes) continue;
    router = removeNode(router, nodeKey);
  }

  return router;
};

/**
 * @name sanitizeRouterStore
 * @description Normalizes router panels, pages, and nodes using application preferences.
 * @param store - Router store to sanitize.
 * @param preferences - Preferences controlling router limits.
 * @returns The sanitized router store.
 */
export const sanitizeRouterStore = function <const Store extends AppSharedRouterStore>(
  store: Store,
  preferences: AppPreferenceStore
): Store {
  store = sanitizePanels(store, preferences);
  store = sanitizePages(store);
  store = sanitizeNodes(store, preferences);
  store = sanitizePages(store);
  return store;
};
