import React, { createContext, useCallback, useContext, useRef, useSyncExternalStore } from 'react';

type UseStoreDataReturn<Store extends object> = {
  get: () => Store;
  set: (input: Store | ((prev: Store) => Store)) => void;
  subscribe: (callback: () => void) => () => void;
};

type ProviderProps = {
  children: React.ReactNode;
};

export const createStoreContext = <Store extends object>(initialState: Store) => {
  const useStoreData = (): UseStoreDataReturn<Store> => {
    const store = useRef(initialState);

    const get = useCallback(() => store.current, []);

    const subscribers = useRef(new Set<() => void>());

    const set = useCallback((input: Store | ((prev: Store) => Store)) => {
      store.current = typeof input === 'function' ? input(store.current) : input;
      subscribers.current.forEach(callback => callback());
    }, []);

    const subscribe = useCallback((callback: () => void) => {
      subscribers.current.add(callback);
      return () => subscribers.current.delete(callback);
    }, []);

    return {
      get,
      set,
      subscribe
    };
  };

  const StoreContext = createContext<UseStoreDataReturn<Store>>(null);

  const Provider = ({ children }: ProviderProps) => (
    <StoreContext.Provider value={useStoreData()}>{children}</StoreContext.Provider>
  );

  const useStore = <SelectorOutput extends unknown>(
    selector: (store: Store) => SelectorOutput
  ): [SelectorOutput, (input: Store | ((prev: Store) => Store)) => void] => {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error('Store not found');
    }

    const state = useSyncExternalStore(
      store.subscribe,
      () => selector(store.get()),
      () => selector(initialState)
    );

    return [state, store.set];
  };

  return { Provider, useStore };
};

export default createStoreContext;
