import React, { useLayoutEffect } from 'react';
import { StoreContextConfig } from './config';

type Props<Store extends object> = {
  children?: React.ReactNode;
  props: {
    initialState: Store;
    storeContext: StoreContextConfig<Store>;
    setStoreRef: React.MutableRefObject<React.Dispatch<React.SetStateAction<Store>>>;
  };
};

export const WrappedStoreProvider = <Store extends object>({
  children,
  props: { initialState, storeContext, setStoreRef }
}: Props<Store>) => {
  const [store, setStore] = React.useState<Store>(initialState);

  useLayoutEffect(() => {
    setStoreRef.current = setStore;
  }, [setStoreRef]);

  return (
    <storeContext.Provider value={{ store, setStore }}>
      {React.useMemo(() => children, [children])}
    </storeContext.Provider>
  );
};

export const StoreProvider = React.memo(WrappedStoreProvider);
export default StoreProvider;
