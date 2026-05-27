import { useAppNavigate, useAppRouterStore } from 'core/router';
import { useCallback } from 'react';

/**
 * @name useIsDrawerOpen
 * @description Returns whether the app drawer is currently open (more than one panel active).
 * @returns Boolean indicating drawer open state
 */
export const useIsDrawerOpen = (): boolean => {
  return useAppRouterStore(s => (s.panels?.length || 0) > 1);
};

/**
 * @name useAppDrawerClose
 * @description Returns a callback that closes the drawer by removing the panel and navigating.
 * @returns Callback to close the drawer
 */
export const useAppDrawerClose = (): (() => void) => {
  const navigate = useAppNavigate();

  return useCallback(() => {
    navigate.closePanel(1);
  }, [navigate]);
};
