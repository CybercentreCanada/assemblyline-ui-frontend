import {
  getAppNavigationStateFromApi,
  getAppRouterStateFromApi,
  hasBlockedPages,
  useAppNavigationStoreApi,
  useAppRouterStoreApi
} from 'core/router';
import { useCallback, useEffect } from 'react';

/**
 * @name useBlockUnloadEvent
 * @description Warns before the document unloads while navigation contains blocked pages.
 * @returns No value; installs the browser beforeunload handler.
 */
export function useBlockUnloadEvent() {
  const navigationStoreApi = useAppNavigationStoreApi();
  const routerStoreApi = useAppRouterStoreApi();

  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      const navigationState = getAppNavigationStateFromApi(navigationStoreApi);
      const routerState = getAppRouterStateFromApi(routerStoreApi);
      if (!hasBlockedPages(navigationState, routerState)) return;
      event.preventDefault();
      event.returnValue = '';
    },
    [navigationStoreApi, routerStoreApi]
  );

  useEffect(() => {
    if (!navigationStoreApi) return;
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [handleBeforeUnload, navigationStoreApi]);

  return null;
}
