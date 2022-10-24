import React from 'react';
import {
  ActionsConfig,
  ActionStruct,
  DispatchContextConfig,
  ReducerAsyncConfig,
  ReducerConfig,
  StoreContextConfig
} from './config';
import { DispatchProvider } from './dispatchProvider';
import StoreProvider from './storeProvider';

type Props<Store extends object, Action extends ActionStruct, ActionAsync extends ActionStruct> = {
  children: React.ReactNode;
  dispatchContext: DispatchContextConfig<Store, Action, ActionAsync>;
  storeContext: StoreContextConfig<Store>;
  initialState: Store;
  actions: ActionsConfig<Action>;
  actionsAsync: ActionsConfig<ActionAsync>;
  reducer: ReducerConfig<Store, Action>;
  reducerAsync: ReducerAsyncConfig<Store, ActionAsync>;
};

export const WrappedAppStore = <Store extends object, Action extends ActionStruct, ActionAsync extends ActionStruct>({
  children,
  storeContext,
  dispatchContext,
  initialState,
  actions,
  actionsAsync,
  reducer,
  reducerAsync
}: Props<Store, Action, ActionAsync>) => (
  <DispatchProvider props={{ dispatchContext, actions, actionsAsync, reducer, reducerAsync }}>
    {({ setStoreRef }) => <StoreProvider props={{ initialState, storeContext, setStoreRef }}>{children}</StoreProvider>}
  </DispatchProvider>
);

export const AppStore = React.memo(WrappedAppStore);
export default AppStore;
