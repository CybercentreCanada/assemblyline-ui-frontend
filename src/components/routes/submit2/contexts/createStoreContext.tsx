import React, { createContext, useCallback, useContext, useRef, useSyncExternalStore } from 'react';

type UseStoreDataReturn<Store extends object> = {
  get: () => Store;
  set: <Value extends unknown>(next: Value, mutator: (value: Value, store: Store) => Store) => void;
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

    const set = useCallback(<Value extends unknown>(next: Value, mutator: (value: Value, store: Store) => Store) => {
      store.current = JSON.parse(JSON.stringify(mutator(next, store.current)));
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

  const useStore = <Value extends unknown>(
    selector: (store: Store) => Value,
    mutator: (value: Value, store: Store) => Store
    // ): [Value, (input: Value | ((prev: Value) => Value)) => void] => {
  ): [Value, React.Dispatch<React.SetStateAction<Value>>] => {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error('Store not found');
    }

    const state = useSyncExternalStore(
      store.subscribe,
      () => selector(store.get()),
      () => selector(initialState)
    );

    const is = useCallback(
      (input: Value | ((prev: Value) => Value)): input is (prev: Value) => Value => typeof input === 'function',
      []
    );

    const mutate = useCallback(
      (s: Value, set: (next: Value, mutator: (value: Value, store: Store) => Store) => void) =>
        (input: Value | ((prev: Value) => Value)): void => {
          const value = is(input) ? input(s) : input;
          set(value, mutator);
        },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    return [state, mutate(state, store.set)];
  };

  // const useMutate = <SelectorOutput extends unknown>(mutator: (store: Store, value: SelectorOutput) => Store) => {
  //   const store = useContext(StoreContext);
  //   if (!store) {
  //     throw new Error('Store not found');
  //   }

  //   return store.set;
  // };

  return { Provider, useStore };
};

export default createStoreContext;
