import React, { createContext, useCallback, useContext, useEffect, useRef, useSyncExternalStore } from 'react';

export const createStoreContext = <Store extends object>(initialState: Store) => {
  type StorePatch = Partial<Store> | ((value: Store) => Partial<Store>);

  const useStoreData = (
    patch: StorePatch
  ): {
    get: () => Store;
    set: (dispatch: StorePatch) => void;
    subscribe: (callback: () => void) => () => void;
  } => {
    const resolvePatch = useCallback(
      (dispatch: StorePatch, current: Store): Partial<Store> =>
        typeof dispatch === 'function' ? dispatch(current) : dispatch,
      []
    );

    const store = useRef<Store>({ ...initialState, ...resolvePatch(patch, initialState) });

    const get = useCallback(() => store.current, []);

    const subscribers = useRef<Set<() => void>>(new Set<() => void>());

    const reset = useCallback(
      (dispatch: StorePatch) => {
        const nextPatch = resolvePatch(dispatch, store.current);
        const nextState = { ...initialState, ...nextPatch };
        if (Object.is(store.current, nextState)) return;
        store.current = nextState;
        subscribers.current.forEach(callback => callback());
      },
      [initialState, resolvePatch]
    );

    const set = useCallback(
      (dispatch: StorePatch) => {
        const nextPatch = resolvePatch(dispatch, store.current);
        const nextState = { ...store.current, ...nextPatch };
        if (Object.is(store.current, nextState)) return;
        store.current = nextState;
        subscribers.current.forEach(callback => callback());
      },
      [resolvePatch]
    );

    const subscribe = useCallback((callback: () => void) => {
      subscribers.current.add(callback);
      return () => subscribers.current.delete(callback);
    }, []);

    useEffect(() => {
      reset(patch);
    }, [patch, reset]);

    return { get, set, subscribe };
  };

  type UseStoreDataReturnType = ReturnType<typeof useStoreData>;

  const StoreContext = createContext<UseStoreDataReturnType | null>(null);

  StoreContext.displayName = 'StoreContext';

  type ProviderProps = {
    children: React.ReactNode;
    data: StorePatch;
  };

  const StoreProvider = ({ children, data }: ProviderProps) => (
    <StoreContext.Provider value={useStoreData(data)}>{children}</StoreContext.Provider>
  );

  StoreProvider.displayName = 'StoreProvider';

  const useStore = <SelectorOutput,>(
    selector: (store: Store) => SelectorOutput
  ): [SelectorOutput, (dispatch: StorePatch) => void] => {
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
