import type { AppNavigationStore, AppRouterBlockedReason, AppRouterStore } from 'core/router';
import { findPanelKeyFromPageKey, getPage } from 'core/router';

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

/**
 * @name setBlockedPage
 * @description Sets or removes a page navigation block according to the supplied reason.
 * @param store - Navigation store to update.
 * @param pageKey - Page key whose block should change.
 * @param reason - Block reason, or a falsy value to remove the block.
 * @returns The updated navigation store.
 */
export const setBlockedPage = (
  store: AppNavigationStore,
  pageKey: keyof AppNavigationStore['pages'],
  reason: AppRouterBlockedReason
): AppNavigationStore => {
  if (reason) return addBlockedPage(store, pageKey, reason);
  else return removeBlockedPage(store, pageKey);
};

/**
 * @name getBlockedPages
 * @description Returns all page keys and reasons currently recorded as blocked.
 * @param store - Navigation store to inspect.
 * @returns Blocked page entries as key-reason tuples.
 */
export const getBlockedPages = (store: AppNavigationStore): [string, AppRouterBlockedReason][] => {
  return !Object.keys(store.blockedPages || {}).length ? [] : Object.entries(store.blockedPages);
};

/**
 * @name clearBlockedPages
 * @description Removes every navigation block from the store.
 * @param store - Navigation store to update.
 * @returns The updated navigation store.
 */
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
