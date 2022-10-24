import React from 'react';
import { DispatchContextPropsConfig, StoreContextPropsConfig } from '../commons/stores/config';
import ALStore from '../commons/stores/store';
import App from './app';
import { Action, Store, useTestStore } from './reducer';

export type DispatchContextProps = DispatchContextPropsConfig<Store, Action>;
export type StoreContextProps = StoreContextPropsConfig<Store>;

export const dispatchContext = React.createContext<DispatchContextProps>(null);
export const useDispatch = () => React.useContext(dispatchContext);

export const storeContext = React.createContext<StoreContextProps>(null);
export const useStore = () => React.useContext(storeContext);

export const WrappedRoot = () => {
  const { initialState, actions, reducer } = useTestStore();

  return (
    <ALStore
      DispatchContext={dispatchContext}
      StoreContext={storeContext}
      initialState={initialState}
      actions={actions}
      reducer={reducer}
    >
      <App />
    </ALStore>
  );
};

export const TestRoot = React.memo(WrappedRoot);
export default TestRoot;
