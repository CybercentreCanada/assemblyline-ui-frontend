import type { AppRouterBlockedReason } from 'core/router';
import {
  isPageVisible,
  removeBlockedPage,
  setBlockedPage,
  useAppPageKey,
  useAppRouterStore,
  useAppSetNavigationStore
} from 'core/router';
import type { DependencyList } from 'react';
import { useEffect } from 'react';

/**
 * @name useAppBlocker
 * @description Registers or removes the current page's navigation blocker.
 * @param shouldBlock - Block reason or callback that returns a block reason.
 * @param dependencies - Values that should rerun blocker evaluation.
 * @returns No value; blocker state is synchronized with the navigation store.
 */
export function useAppBlocker(
  shouldBlock: AppRouterBlockedReason | (() => AppRouterBlockedReason),
  dependencies: DependencyList = null
) {
  const pageKey = useAppPageKey();
  const setNavigationStore = useAppSetNavigationStore();
  const isVisible = useAppRouterStore(s => isPageVisible(s, pageKey));

  useEffect(
    () =>
      setNavigationStore(store => {
        if (!pageKey || !isVisible) return removeBlockedPage(store, pageKey);
        const reason = typeof shouldBlock === 'function' ? shouldBlock() : shouldBlock;
        return setBlockedPage(store, pageKey, reason);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isVisible, pageKey, setNavigationStore, ...(dependencies ?? [shouldBlock])]
  );
}
