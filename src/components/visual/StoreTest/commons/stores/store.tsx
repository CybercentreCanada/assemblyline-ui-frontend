import React from 'react';
import { ActionsConfig, ActionStruct, DispatchContextConfig, ReducerConfig, StoreContextConfig } from './config';
import { DispatchProvider } from './dispatchProvider';
import StoreProvider from './storeProvider';

type Props<Store extends object, Action extends ActionStruct> = {
  children: React.ReactNode;
  DispatchContext: DispatchContextConfig<Store, Action>;
  StoreContext: StoreContextConfig<Store>;
  initialState: Store;
  actions: ActionsConfig<Action>;
  reducer: ReducerConfig<Store, Action>;
};

export const WrappedStore = <Store extends object, Action extends ActionStruct>({
  children,
  StoreContext,
  DispatchContext,
  initialState,
  actions,
  reducer
}: Props<Store, Action>) => (
  <DispatchProvider props={{ DispatchContext, reducer, actions }}>
    {({ dispatchRef }) => <StoreProvider props={{ initialState, StoreContext, dispatchRef }}>{children}</StoreProvider>}
  </DispatchProvider>
);

export const Store = React.memo(WrappedStore);
export default Store;
