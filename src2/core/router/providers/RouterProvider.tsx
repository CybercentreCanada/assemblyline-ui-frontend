import React, { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { getRegisteredRoutes } from '../store/router.store';
import { RoutePanel } from './PanelProvider';

export type RouterStoreState = {
  pathname: string;
  hashPath: string;
  registeredPaths: string[];
};

type RouterStore = {
  getState: () => RouterStoreState;
  subscribe: (listener: () => void) => () => void;
  setState: (updater: (prev: RouterStoreState) => RouterStoreState) => void;
};

const createRouterStore = (initialState: RouterStoreState): RouterStore => {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    subscribe: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setState: updater => {
      state = updater(state);
      listeners.forEach(listener => listener());
    }
  };
};

export type RouterContextValue = {
  store: RouterStore;
  navigateTo: (to: string, options?: { panel?: RoutePanel; replace?: boolean }) => void;
  resolveHref: (to: string, panel?: RoutePanel) => string;
};

const RouterContext = createContext<RouterContextValue | null>(null);

export type RouterProviderProps = {
  children: React.ReactNode;
};

export const RouterProvider = ({ children }: RouterProviderProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const store = useMemo(
    () =>
      createRouterStore({
        pathname: location.pathname,
        hashPath: location.hash.startsWith('#') ? location.hash.slice(1) : '',
        registeredPaths: getRegisteredRoutes().map(route => route.path)
      }),
    []
  );

  useEffect(() => {
    store.setState(prev => ({
      ...prev,
      pathname: location.pathname,
      hashPath: location.hash.startsWith('#') ? location.hash.slice(1) : '',
      registeredPaths: getRegisteredRoutes().map(route => route.path)
    }));
  }, [location.hash, location.pathname, store]);

  const value = useMemo<RouterContextValue>(
    () => ({
      store,
      resolveHref: (to, panel = 'main') => {
        if (panel === 'drawer') {
          return `${location.pathname}#${to}`;
        }
        return to;
      },
      navigateTo: (to, options) => {
        const target = options?.panel === 'drawer' ? `${location.pathname}#${to}` : to;
        navigate(target, { replace: options?.replace });
      }
    }),
    [location.pathname, navigate, store]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

export const useRouterContext = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouterContext must be used inside RouterProvider');
  }
  return context;
};

export const useRouterStore = <T,>(selector: (state: RouterStoreState) => T) => {
  const { store } = useRouterContext();
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState())
  );
};
