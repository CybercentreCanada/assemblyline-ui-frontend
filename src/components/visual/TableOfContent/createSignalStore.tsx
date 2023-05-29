import React, { createContext, useCallback, useContext, useRef, useSyncExternalStore } from 'react';

export function createSignalStore<Store>(initialState: Store) {
  // type Primitives = boolean | number | bigint | string | symbol | null | undefined | Date | Buffer | RegExp;
  // type PartialR<T> = T extends Primitives ? T : { [P in keyof T]?: PartialR<T[P]> };

  type GetStore = () => Store;
  type SetStore = (value: Partial<Store> | ((store: Store) => Partial<Store>)) => void;
  type Subscribe = (callback: () => void) => () => void;

  function isObject(data: any): boolean {
    if (typeof data !== 'object') return false;
    else if ([null, undefined].includes(data)) return false;
    else if (Object.is({}, data)) return false;
    else if (Array.isArray(data)) return false;
    else if (Object.keys(data).length === 0) return false;
    else return true;
  }

  function update<DataStore>(store: DataStore, data: Partial<DataStore>): DataStore {
    return {
      ...store,
      ...Object.fromEntries(
        Object.keys(data).map(key => [key, isObject(data[key]) ? update(store[key], data[key]) : data[key]])
      )
    };
  }

  function useStoreData(): { get: GetStore; set: SetStore; subscribe: Subscribe } {
    const store = useRef(initialState);

    const get: GetStore = useCallback(() => store.current, []);

    const subscribers = useRef(new Set<() => void>());

    const set: SetStore = useCallback(value => {
      const newStore = typeof value === 'function' ? value(store.current) : value;
      store.current = update(store.current, newStore);
      subscribers.current.forEach(callback => callback());
    }, []);

    const subscribe: Subscribe = useCallback((callback: () => void) => {
      subscribers.current.add(callback);
      return () => subscribers.current.delete(callback);
    }, []);

    return { get, set, subscribe };
  }

  type UseStoreDataReturnType = ReturnType<typeof useStoreData>;

  const StoreContext = createContext<UseStoreDataReturnType | null>(null);

  function Provider({ children }: { children: React.ReactNode }) {
    return <StoreContext.Provider value={useStoreData()}>{children}</StoreContext.Provider>;
  }

  function useSignal<SelectorOutput>(selector: (store: Store) => SelectorOutput): SelectorOutput {
    const store = useContext(StoreContext);
    if (!store) throw new Error('Store not found');
    const state = useSyncExternalStore(
      store.subscribe,
      () => selector(store.get()),
      () => selector(initialState)
    );
    return state;
  }

  function useStore(): SetStore {
    const store = useContext(StoreContext);
    if (!store) throw new Error('Store not found');
    return store.set;
  }

  return { Provider, useSignal, useStore };
}

export default createSignalStore;
