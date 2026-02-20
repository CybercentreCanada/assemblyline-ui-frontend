import React, { createContext, useCallback, useContext, useEffect, useRef, useSyncExternalStore } from 'react';
import { RoutePanel } from './PanelProvider';

export type RouterStore = {
  pathname: string;
  hashPath: string;
  registeredPaths: string[];
};

export const DEFAULT_ROUTER_STORE: RouterStore = {
  pathname: null,
  hashPath: null,
  registeredPaths: []
};

const useRouterData = (
  data: RouterStore
): {
  get: () => RouterStore;
  set: (dispatch: Partial<RouterStore> | ((value: Partial<RouterStore>) => Partial<RouterStore>)) => void;
  subscribe: (callback: () => void) => () => void;
} => {
  const store = useRef<RouterStore>(data);

  const get = useCallback(() => store.current, []);

  const subscribers = useRef<Set<() => void>>(new Set<() => void>());

  const reset = useCallback((data: RouterStore) => {
    Object.keys(store.current || {}).forEach(key => {
      if (!(key in data) && key in DEFAULT_ROUTER_STORE) {
        delete store.current[key];
      }
    });

    store.current = { ...store.current, ...data };
    subscribers.current.forEach(callback => callback());
  }, []);

  const set = useCallback(
    (dispatch: Partial<RouterStore> | ((value: Partial<RouterStore>) => Partial<RouterStore>)) => {
      store.current =
        typeof dispatch === 'function'
          ? { ...store.current, ...dispatch(store.current) }
          : { ...store.current, ...dispatch };
      subscribers.current.forEach(callback => callback());
    },
    []
  );

  const subscribe = useCallback((callback: () => void) => {
    subscribers.current.add(callback);
    return () => subscribers.current.delete(callback);
  }, []);

  useEffect(() => {
    reset(data);
  }, [data, reset]);

  return { get, set, subscribe };
};

export type UseRouterDataReturnType = ReturnType<typeof useRouterData>;

export const RouterContext = createContext<UseRouterDataReturnType | null>(null);

export type RouterProviderProps = {
  children: React.ReactNode;
  // data: RouterStore;
};

export const RouterProvider = ({ children }: RouterProviderProps) => (
  <RouterContext.Provider value={useRouterData(DEFAULT_ROUTER_STORE)}>{children}</RouterContext.Provider>
);

export const useRouter = <SelectorOutput,>() =>
  // selector: (store: Store) => SelectorOutput
  // ): [SelectorOutput, (dispatch: Partial<Store> | ((value: Partial<Store>) => Partial<Store>)) => void] => {
  {
    const store = useContext(RouterContext);
    if (!store) {
      throw new Error('Store not found');
    }

    const selector = (store: RouterStore) => null;

    const state = useSyncExternalStore(
      store.subscribe,
      () => selector(store.get()) ?? selector(DEFAULT_ROUTER_STORE),
      () => selector(DEFAULT_ROUTER_STORE)
    );

    const navigateTo = useCallback(
      (to: string, options?: { fromPanel?: RoutePanel; panel?: RoutePanel; replace?: boolean }) => {},
      []
    );

    const resolveHref = useCallback((to: string, options?: { fromPanel?: RoutePanel; panel?: RoutePanel }): string => {
      return '';
    }, []);

    return { navigateTo, resolveHref };
    // return [state, store.set];
  };

// export type RouterStoreState = {
//   pathname: string;
//   hashPath: string;
//   registeredPaths: string[];
// };

// type RouterStore = {
//   getState: () => RouterStoreState;
//   subscribe: (listener: () => void) => () => void;
//   setState: (updater: (prev: RouterStoreState) => RouterStoreState) => void;
// };

// const createRouterStore = (initialState: RouterStoreState): RouterStore => {
//   let state = initialState;
//   const listeners = new Set<() => void>();

//   return {
//     getState: () => state,
//     subscribe: listener => {
//       listeners.add(listener);
//       return () => listeners.delete(listener);
//     },
//     setState: updater => {
//       state = updater(state);
//       listeners.forEach(listener => listener());
//     }
//   };
// };

// export type RouterContextValue = {
//   store: RouterStore;
//   navigateTo: (to: string, options?: { fromPanel?: RoutePanel; panel?: RoutePanel; replace?: boolean }) => void;
//   resolveHref: (to: string, options?: { fromPanel?: RoutePanel; panel?: RoutePanel }) => string;
// };

// const RouterContext = createContext<RouterContextValue | null>(null);

// export type RouterProviderProps = {
//   children: React.ReactNode;
// };

// export const RouterProvider = ({ children }: RouterProviderProps) => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const store = useMemo(
//     () =>
//       createRouterStore({
//         pathname: location.pathname,
//         hashPath: location.hash.startsWith('#') ? location.hash.slice(1) : '',
//         registeredPaths: getRegisteredRoutes().map(route => route.path)
//       }),
//     []
//   );

//   const getTargetPanel = (fromPanel: RoutePanel = 0, panel?: RoutePanel): RoutePanel => {
//     if (typeof panel === 'number') return panel;

//     switch (fromPanel) {
//       case 0:
//         return 1;
//       case 1:
//         return 2;
//       case 2:
//         return 1;
//       default:
//         return 1;
//     }
//   };

//   const value = useMemo<RouterContextValue>(
//     () => ({
//       store,
//       resolveHref: (to, options) => {
//         const targetPanel = getTargetPanel(options?.fromPanel ?? 0, options?.panel);
//         if (targetPanel > 1) return `${location.pathname}#${to}`;
//         else return `${to}${location.hash}`;
//       },
//       navigateTo: (to, options) => {
//         const targetPanel = getTargetPanel(options?.fromPanel ?? 0, options?.panel);
//         const target = targetPanel > 1 ? `${location.pathname}#${to}` : `${to}${location.hash}`;
//         navigate(target, { replace: options?.replace });
//       }
//     }),
//     [location.pathname, navigate, store]
//   );

//   useEffect(() => {
//     store.setState(prev => ({
//       ...prev,
//       pathname: location.pathname,
//       hashPath: location.hash.startsWith('#') ? location.hash.slice(1) : '',
//       registeredPaths: getRegisteredRoutes().map(route => route.path)
//     }));
//   }, [location.hash, location.pathname, store]);

//   return <RouterContext.Provider value={{ store }}>{children}</RouterContext.Provider>;
// };

// export const useRouterContext = () => {
//   const context = useContext(RouterContext);
//   if (!context) {
//     throw new Error('useRouterContext must be used inside RouterProvider');
//   }
//   return context;
// };

// export const useRouterStore = <T,>(selector: (state: RouterStoreState) => T) => {
//   const { store } = useRouterContext();
//   return useSyncExternalStore(
//     store.subscribe,
//     () => selector(store.getState()),
//     () => selector(store.getState())
//   );
// };
