import { removePanel, sanitizeAppRouterStore, storeToNavigate, useAppRouterStore } from 'core/router';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';

export const useIsDrawerOpen = () => {
  return useAppRouterStore(s => (s.panels?.length || 0) > 1);
};

export const useAppDrawerClose = () => {
  const routerNavigate = useNavigate();

  const store = useAppRouterStore(s => s);

  return useCallback(() => {
    let nextStore = removePanel(store, 1);
    nextStore = sanitizeAppRouterStore(nextStore);
    const nextLocation = storeToNavigate(nextStore);
    if (nextLocation) {
      routerNavigate(nextLocation.to, nextLocation.options);
    }
  }, [routerNavigate, store]);
};
