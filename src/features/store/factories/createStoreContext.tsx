import React, { createContext, useCallback, useContext, useEffect, useRef, useSyncExternalStore } from 'react';

export const createStoreContext = <Store extends object>(initialState: Store) => {
  const useStoreData = (
    data: Store
  ): {
    get: () => Store;
    set: (dispatch: Partial<Store> | ((value: Partial<Store>) => Partial<Store>)) => void;
    subscribe: (callback: () => void) => () => void;
  } => {
    const store = useRef<Store>(data);

    const get = useCallback(() => store.current, []);

    const subscribers = useRef<Set<() => void>>(new Set<() => void>());

    const reset = useCallback((data: Store) => {
      Object.keys(store.current).forEach(key => {
        if (!(key in data) && key in initialState) {
          delete store.current[key];
        }
      });

      store.current = { ...store.current, ...data };
      subscribers.current.forEach(callback => callback());
    }, []);

    const set = useCallback((dispatch: Partial<Store> | ((value: Partial<Store>) => Partial<Store>)) => {
      store.current =
        typeof dispatch === 'function'
          ? { ...store.current, ...dispatch(store.current) }
          : { ...store.current, ...dispatch };
      subscribers.current.forEach(callback => callback());
    }, []);

    const subscribe = useCallback((callback: () => void) => {
      subscribers.current.add(callback);
      return () => subscribers.current.delete(callback);
    }, []);

    useEffect(() => {
      reset(data);
    }, [data, reset]);

    return { get, set, subscribe };
  };

  type UseStoreDataReturnType = ReturnType<typeof useStoreData>;

  const StoreContext = createContext<UseStoreDataReturnType | null>(null);

  type ProviderProps = {
    children: React.ReactNode;
    data: Store;
  };

  const StoreProvider = ({ children, data }: ProviderProps) => (
    <StoreContext.Provider value={useStoreData(data)}>{children}</StoreContext.Provider>
  );

  const useStore = <SelectorOutput,>(
    selector: (store: Store) => SelectorOutput
  ): [SelectorOutput, (dispatch: Partial<Store> | ((value: Partial<Store>) => Partial<Store>)) => void] => {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error('Store not found');
    }

    const state = useSyncExternalStore(
      store.subscribe,
      () => selector(store.get()) ?? selector(initialState),
      () => selector(initialState)
    );

    return [state, store.set];
  };

  return {
    StoreProvider,
    useStore
  };
};
