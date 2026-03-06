import React, { createContext, useCallback, useContext, useEffect, useRef, useSyncExternalStore } from 'react';

export const createStoreContext = <Store extends object>(initialState: Store) => {
  type StorePatch = Partial<Store> | ((value: Store) => Partial<Store>);
  type EqualityFn<T> = (a: T, b: T) => boolean;

  const shallowEqual = <T extends object>(a: T, b: T): boolean => {
    if (Object.is(a, b)) return true;
    const aKeys = Object.keys(a) as Array<keyof T>;
    const bKeys = Object.keys(b) as Array<keyof T>;
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every(key => Object.is(a[key], b[key]));
  };

  type useStoreDataReturn = {
    get: () => Store;
    set: (dispatch: StorePatch) => void;
    subscribe: (callback: () => void) => () => void;
  };

  const useStoreData = (patch: StorePatch): useStoreDataReturn => {
    const resolvePatch = useCallback(
      (dispatch: StorePatch, current: Store): Partial<Store> =>
        typeof dispatch === 'function' ? dispatch(current) : dispatch,
      []
    );

    const store = useRef<Store>({ ...initialState, ...resolvePatch(patch, initialState) });
    const apiRef = useRef<useStoreDataReturn>(null);

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
        if (shallowEqual(store.current, nextState)) return;
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

    if (!apiRef.current) apiRef.current = { get, set, subscribe };
    return apiRef.current;
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
    selector: (store: Store) => SelectorOutput,
    isEqual: EqualityFn<SelectorOutput> = Object.is
  ): [SelectorOutput, (dispatch: StorePatch) => void] => {
    const store = useContext(StoreContext);
    if (!store) {
      return [null, () => null];
    }

    const lastSelectionRef = useRef<SelectorOutput>(selector(store.get()) ?? selector(initialState));

    const getSnapshot = useCallback(() => {
      const nextSelection = selector(store.get()) ?? selector(initialState);
      if (!isEqual(lastSelectionRef.current, nextSelection)) {
        lastSelectionRef.current = nextSelection;
      }
      return lastSelectionRef.current;
    }, [initialState, isEqual, selector, store]);

    const state = useSyncExternalStore(store.subscribe, getSnapshot, () => selector(initialState));

    return [state, store.set];
  };

  return {
    StoreProvider,
    useStore
  };
};
