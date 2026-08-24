import React from 'react';
import { DispatchProvider, ReducerProvider, StoreProvider } from '..';

export type AppStoreProps = {
  children?: React.ReactNode;
};

const WrappedAppStore = ({ children }: AppStoreProps) => {
  return (
    <ReducerProvider>
      <DispatchProvider>
        <StoreProvider>{React.useMemo(() => children, [children])}</StoreProvider>
      </DispatchProvider>
    </ReducerProvider>
  );
};

export const AppStore = React.memo(WrappedAppStore);
export default AppStore;
