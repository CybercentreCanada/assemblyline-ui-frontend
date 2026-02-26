import { createContext, useCallback, useContext, useEffect, useRef, useSyncExternalStore } from 'react';

type DeepPartial<T> =
  T extends Array<infer U> ? Array<DeepPartial<U>> : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

const isObject = (value: unknown): value is Record<string, unknown> =>
  value != null && typeof value === 'object' && !Array.isArray(value);

const deepPatch = <T extends object>(base: T, patch?: DeepPartial<T>): T => {
  if (patch == null) return base;
  if (!isObject(base) || !isObject(patch)) {
    return (patch as T) ?? base;
  }

  let changed = false;
  const next: Record<string, unknown> = { ...(base as Record<string, unknown>) };

  for (const key of Object.keys(patch as object)) {
    const patchValue = (patch as Record<string, unknown>)[key];
    const baseValue = (base as Record<string, unknown>)[key];

    if (patchValue === undefined) continue;

    const nextValue =
      isObject(baseValue) && isObject(patchValue)
        ? deepPatch(baseValue as Record<string, unknown>, patchValue as Record<string, unknown>)
        : (patchValue as unknown);

    if (!Object.is(baseValue, nextValue)) {
      changed = true;
      next[key] = nextValue;
    }
  }

  return (changed ? (next as T) : base) as T;
};

export const createStoreContext = <Store extends object>(initialState: Store) => {
  const useStoreData = (
    data: DeepPartial<Store>
  ): {
    get: () => Store;
    set: (dispatch: DeepPartial<Store> | ((value: Store) => DeepPartial<Store>)) => void;
    subscribe: (callback: () => void) => () => void;
  } => {
    const store = useRef<Store>(deepPatch(initialState, data));

    const get = useCallback(() => store.current, []);

    const subscribers = useRef<Set<() => void>>(new Set<() => void>());

    const reset = useCallback((patch: DeepPartial<Store>) => {
      const next = deepPatch(initialState, patch);
      if (Object.is(next, store.current)) return;
      store.current = next;
      subscribers.current.forEach(callback => callback());
    }, []);

    const set = useCallback((dispatch: DeepPartial<Store> | ((value: Store) => DeepPartial<Store>)) => {
      const patch = typeof dispatch === 'function' ? dispatch(store.current) : dispatch;
      const next = deepPatch(store.current, patch);
      if (Object.is(next, store.current)) return;
      store.current = next;
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
    data: DeepPartial<Store>;
  };

  const StoreProvider = ({ children, data }: ProviderProps) => (
    <StoreContext.Provider value={useStoreData(data)}>{children}</StoreContext.Provider>
  );

  const useStore = <SelectorOutput,>(
    selector: (store: Store) => SelectorOutput
  ): [SelectorOutput, (dispatch: DeepPartial<Store> | ((value: Store) => DeepPartial<Store>)) => void] => {
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
