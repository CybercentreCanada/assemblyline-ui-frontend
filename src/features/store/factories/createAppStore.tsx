import type { PropsWithChildren } from 'react';
import { createContext, memo, useCallback, useContext, useEffect, useRef } from 'react';
import { useStore as useZustandStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { StoreApi } from 'zustand/vanilla';
import { createStore } from 'zustand/vanilla';

export const createAppStore = <Store extends object>(initialState: Store) => {
  // A partial state, or an updater that receives the current state and returns a partial state.
  type StorePatch = Partial<Store> | ((state: Store) => Partial<Store>);

  // Each `StoreProvider` owns its own store; the hooks below only work inside one.
  const StoreContext = createContext<StoreApi<Store> | null>(null);
  StoreContext.displayName = 'StoreContext';

  const StoreProvider = memo(({ children, data = null }: PropsWithChildren<{ data?: StorePatch }>) => {
    const storeRef = useRef<StoreApi<Store> | null>(null);

    // Created once per provider, with `data` applied so the first render already includes it.
    if (!storeRef.current) {
      const patch = typeof data === 'function' ? data(initialState) : (data ?? {});

      storeRef.current = createStore(() => ({ ...initialState, ...patch }));
    }

    useEffect(() => {
      // Re-applies `data` whenever it changes; the initial value is already in the store.
      if (!storeRef.current || !data) return;

      // Spreading `prev` gives the root a new reference so subscribers are notified.
      storeRef.current.setState(prev => ({ ...prev, ...(typeof data === 'function' ? data(prev) : data) }));
    }, [data]);

    return <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>;
  });

  // Throws instead of falling back, so a missing provider is caught as a setup error.
  const useStoreContext = (hook: string): StoreApi<Store> => {
    const store = useContext(StoreContext);
    if (!store) throw new Error(`[createAppStore] \`${hook}\` must be used within a StoreProvider.`);

    return store;
  };

  const useStore = <T,>(selector: (state: Store) => T): T => {
    const store = useStoreContext('useStore');

    // `useShallow` stops selectors that return new arrays or objects from re-rendering on every update.
    return useZustandStore(store, useShallow(selector));
  };

  const useSetStore = () => {
    const store = useStoreContext('useSetStore');

    return useCallback(
      (patch: StorePatch) => {
        // The root is always copied so subscribers are notified, even when the updater only mutated in place.
        store.setState(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
      },
      [store]
    );
  };

  // Gives direct access to the store, for reading or subscribing outside of React renders.
  const useStoreApi = (): StoreApi<Store> => useStoreContext('useStoreApi');

  return {
    StoreProvider,
    useStore,
    useSetStore,
    useStoreApi
  };
};
