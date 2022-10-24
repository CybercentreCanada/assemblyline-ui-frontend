import React from 'react';
import {
  Action,
  ActionAsync,
  AppStore,
  DispatchContextPropsConfig,
  NotificationProvider,
  NotificationRoot,
  Store,
  StoreContextPropsConfig,
  useNotificationInitialState,
  useNotificationReducer,
  useNotificationReducerAsync
} from '..';

type DispatchContextProps = DispatchContextPropsConfig<Store, Action, ActionAsync>;
type StoreContextProps = StoreContextPropsConfig<Store>;

const dispatchContext = React.createContext<DispatchContextProps>(null);
const storeContext = React.createContext<StoreContextProps>(null);

export const useNotificationDispatch = () => React.useContext(dispatchContext);
export const useNotificationStore = () => React.useContext(storeContext);

type Props = {
  children?: React.ReactNode;
};

export const WrappedNotificationApp = ({ children }: Props) => {
  const { initialState } = useNotificationInitialState();
  const { actions, reducer } = useNotificationReducer();
  const { actionsAsync, reducerAsync } = useNotificationReducerAsync();

  return (
    <NotificationProvider>
      <AppStore
        dispatchContext={dispatchContext}
        storeContext={storeContext}
        initialState={initialState}
        actions={actions}
        actionsAsync={actionsAsync}
        reducer={reducer}
        reducerAsync={reducerAsync}
      >
        <NotificationRoot> {React.useMemo(() => children, [children])}</NotificationRoot>
      </AppStore>
    </NotificationProvider>
  );
};

export const NotificationApp = React.memo(WrappedNotificationApp);
export default NotificationApp;
