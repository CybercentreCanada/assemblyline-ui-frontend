import type { PropsWithChildren } from 'react';
import { createContext, memo, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useStore as useZustandStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { StoreApi } from 'zustand/vanilla';
import { createStore } from 'zustand/vanilla';

type SubscriberCounter = {
  getCount: () => number;
  subscribe: (listener: () => void) => () => void;
};

const NO_COUNTER: SubscriberCounter = { getCount: () => 0, subscribe: () => () => undefined };

const subscriberCounters = new WeakMap<object, SubscriberCounter>();

// Development only: zustand exposes no listener count, so count `subscribe` calls and their unsubscribes.
const trackSubscribers = <T,>(store: StoreApi<T>): StoreApi<T> => {
  if (!import.meta.env.DEV) return store;

  let count = 0;
  const countListeners = new Set<() => void>();
  const subscribe = store.subscribe;

  const update = (delta: number) => {
    count += delta;
    countListeners.forEach(listener => listener());
  };

  store.subscribe = listener => {
    const unsubscribe = subscribe(listener);
    let active = true;
    update(1);

    return () => {
      if (!active) return;

      active = false;
      unsubscribe();
      update(-1);
    };
  };

  // The count hook listens here instead of on the store, so it never counts itself.
  subscriberCounters.set(store, {
    getCount: () => count,
    subscribe: listener => {
      countListeners.add(listener);
      return () => {
        countListeners.delete(listener);
      };
    }
  });

  return store;
};

export const createAppStore = <Store extends object>(initialState: Store) => {
  type StorePatch = Partial<Store> | ((state: Store) => Partial<Store> | undefined);

  // Read-only stand-in used outside a provider; reads resolve to `initialState`.
  const fallbackStore = trackSubscribers(createStore<Store>()(() => initialState));

  const applyPatch = (store: StoreApi<Store> | null, patch: StorePatch | null) => {
    // Only `useSetStore` can reach this without a store.
    if (!store) {
      if (import.meta.env.DEV) console.warn('[createAppStore] `useSetStore` called outside of StoreProvider.');
      return;
    }

    // The provider passes `data` that can legitimately be empty.
    if (!patch) return;

    try {
      store.setState(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
    } catch (error) {
      console.error('[createAppStore] Failed to apply the store update.', error);
    }
  };

  const StoreContext = createContext<StoreApi<Store> | null>(null);
  StoreContext.displayName = 'StoreContext';

  const StoreProvider = memo(({ children, data = null }: PropsWithChildren<{ data?: StorePatch }>) => {
    // One store per provider, created lazily with `data` so the first render already includes it.
    const [store] = useState<StoreApi<Store>>(() =>
      trackSubscribers(
        createStore<Store>()(() => ({ ...initialState, ...(typeof data === 'function' ? data(initialState) : data) }))
      )
    );
    // Last applied `data`, so the mount effect doesn't apply the initial `data` a second time.
    const appliedDataRef = useRef<StorePatch | null>(data);

    useEffect(() => {
      if (Object.is(appliedDataRef.current, data)) return;

      appliedDataRef.current = data;
      applyPatch(store, data);
    }, [data, store]);

    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
  });

  StoreProvider.displayName = 'StoreProvider';

  // Shallow comparison keeps selectors that return new arrays or objects from re-rendering in a loop.
  const useStore = <T,>(selector: (state: Store) => T): T =>
    useZustandStore(useContext(StoreContext) ?? fallbackStore, useShallow(selector));

  const useSetStore = () => {
    const store = useContext(StoreContext);

    return useCallback((patch: StorePatch) => applyPatch(store, patch), [store]);
  };

  const useStoreApi = (): StoreApi<Store> => useContext(StoreContext);

  // Active `subscribe` calls on this store; always 0 outside development.
  const useSubscriberCount = (): number => {
    const counter = subscriberCounters.get(useContext(StoreContext) ?? fallbackStore) ?? NO_COUNTER;

    return useSyncExternalStore(counter.subscribe, counter.getCount);
  };

  return {
    StoreProvider,
    useStore,
    useSetStore,
    useStoreApi,
    useSubscriberCount
  };
};
