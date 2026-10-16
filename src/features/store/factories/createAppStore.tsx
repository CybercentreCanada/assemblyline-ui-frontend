import type { PropsWithChildren } from 'react';
import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { useStore as useZustandStore } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { StoreApi } from 'zustand/vanilla';
import { createStore } from 'zustand/vanilla';

// Empty stand-in so hooks can run outside a provider; reads are redirected to `initialState` below.
const FALLBACK_STORE = createStore(() => ({}));

export const createAppStore = <Store extends object>(initialState: Store) => {
  // A partial state, or an updater that receives the current state and returns a partial state.
  type StorePatch = Partial<Store> | ((state: Store) => Partial<Store>);

  const StoreContext = createContext<StoreApi<Store> | null>(null);
  StoreContext.displayName = 'StoreContext';

  const StoreProvider = React.memo(({ children, data = null }: PropsWithChildren<{ data?: StorePatch }>) => {
    const storeRef = useRef<StoreApi<Store> | null>(null);
    // Last `data` seen, so the mount effect doesn't re-apply the data the store was created with.
    const previousDataRef = useRef(data);

    // Created once per provider, with `data` applied so the first render already includes it.
    if (!storeRef.current) {
      const patch = typeof data === 'function' ? data(initialState) : (data ?? {});

      // `devtools` mirrors every state change into the Redux DevTools extension.
      storeRef.current = createStore(devtools(() => ({ ...initialState, ...patch })));
    }

    useEffect(() => {
      if (!storeRef.current) return;

      const previousData = previousDataRef.current;
      previousDataRef.current = data;
      // Skip an empty `data` and the mount run, where `data` is the value the store was created with.
      if (!data || Object.is(previousData, data)) return;

      // Spreading `prev` gives the root a new reference so subscribers are notified.
      storeRef.current.setState(prev => ({ ...prev, ...(typeof data === 'function' ? data(prev) : data) }));
    }, [data]);

    return <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>;
  });

  const useStore = <T,>(selector: (state: Store) => T): T => {
    const store = useContext(StoreContext);

    if (!store && import.meta.env.DEV) {
      console.error('[createAppStore] `useStore` called outside of StoreProvider.');
    }

    // Outside a provider, read from the fallback store and run the selector on `initialState` instead.
    // `useShallow` keeps selectors that return new arrays or objects from re-rendering in a loop.
    return useZustandStore(
      (store ?? FALLBACK_STORE) as StoreApi<Store>,
      useShallow((state: Store) => selector(store ? state : initialState))
    );
  };

  const useSetStore = () => {
    const store = useContext(StoreContext);

    return useCallback(
      (patch: StorePatch) => {
        // Without a provider there is no store to update, so the update is dropped.
        if (!store) {
          if (import.meta.env.DEV) console.error('[createAppStore] `useSetStore` called outside of StoreProvider.');
          return;
        }

        // The root is always copied so subscribers are notified, even when the updater only mutated in place.
        store.setState(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
      },
      [store]
    );
  };

  // `null` outside a provider.
  const useStoreApi = (): StoreApi<Store> => useContext(StoreContext);

  return {
    StoreProvider,
    useStore,
    useSetStore,
    useStoreApi
  };
};
