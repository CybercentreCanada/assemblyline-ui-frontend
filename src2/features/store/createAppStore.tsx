import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef } from 'react';
import { useStore as useZustandStore } from 'zustand';
import { createStore, StoreApi } from 'zustand/vanilla';
import { devtools } from 'zustand/middleware';

export const createAppStore = <Store extends object>(initialState: Store) => {
  type StorePatch = Partial<Store> | ((state: Store) => Partial<Store>);

  const StoreContext = createContext<StoreApi<Store> | null>(null);
  StoreContext.displayName = 'StoreContext';

  const StoreProvider = React.memo(({ children, data = null }: PropsWithChildren<{ data?: StorePatch }>) => {
    const storeRef = useRef<StoreApi<Store> | null>(null);

    if (!storeRef.current) {
      const patch = typeof data === 'function' ? data(initialState) : (data ?? {});

      storeRef.current = createStore(devtools(() => ({ ...initialState, ...patch })));
    }

    useEffect(() => {
      if (!storeRef.current || !data) return;

      storeRef.current.setState(prev => ({ ...prev, ...(typeof data === 'function' ? data(prev) : data) }));
    }, [data]);

    return <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>;
  });

  const useStore = <T,>(selector: (state: Store) => T): T => {
    const store = useContext(StoreContext);

    return !store ? selector(initialState) : useZustandStore(store, selector);
  };

  const useSetStore = () => {
    const store = useContext(StoreContext);

    return useCallback(
      (patch: StorePatch) => {
        if (!store) return;

        store.setState(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
      },
      [store]
    );
  };

  return {
    StoreProvider,
    useStore,
    useSetStore
  };
};
