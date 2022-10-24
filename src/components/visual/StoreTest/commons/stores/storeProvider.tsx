import React, { useLayoutEffect } from 'react';
import { StoreContextConfig } from './config';

type Props<Store extends object> = {
  children?: React.ReactNode;
  props: {
    initialState: Store;
    StoreContext: StoreContextConfig<Store>;
    dispatchRef: React.MutableRefObject<React.Dispatch<React.SetStateAction<Store>>>;
  };
};

export const WrappedStoreProvider = <Store extends object>({
  children,
  props: { initialState, StoreContext, dispatchRef }
}: Props<Store>) => {
  const [store, dispatch] = React.useState<Store>(initialState);

  useLayoutEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatchRef]);

  return <StoreContext.Provider value={{ store }}>{React.useMemo(() => children, [children])}</StoreContext.Provider>;
};

export const StoreProvider = React.memo(WrappedStoreProvider);
export default StoreProvider;
