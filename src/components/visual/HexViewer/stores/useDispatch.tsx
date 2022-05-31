import React from 'react';
import {
  AppDispatchers,
  BodyDispatchers,
  CellDispatchers,
  DispatchersConfig,
  DispatchPropsConfig,
  ScrollDispatchers,
  SettingDispatchers,
  StoreAction,
  StoreProviderProps,
  ToolbarDispatchers,
  useAppDispatcher,
  useBodyDispatcher,
  useCellDispatcher,
  useScrollDispatcher,
  useSettingDispatcher,
  useToolbarDispatcher
} from '..';

export type Dispatchers = DispatchersConfig<StoreAction>;
export type DispatchProps = DispatchPropsConfig<StoreAction>;

export type Dispatch = (props: DispatchProps) => void;
export type DispatchRef = React.MutableRefObject<React.Dispatch<DispatchProps>>;
export type DispatchContextProps = Dispatchers & {
  dispatchRef?: React.MutableRefObject<React.Dispatch<DispatchProps>>;
};

export const dispatchContext = React.createContext<DispatchContextProps>(null);
export const useDispatch = () => React.useContext(dispatchContext);

export const DispatchProvider = ({ children }: StoreProviderProps) => {
  const dispatchRef: DispatchRef = React.useRef<React.Dispatch<DispatchProps>>(null);
  const dispatch: Dispatch = React.useCallback((props: DispatchProps) => dispatchRef.current(props), []);

  const appDispatchers: AppDispatchers = useAppDispatcher(dispatch);
  const bodyDispatchers: BodyDispatchers = useBodyDispatcher(dispatch);
  const cellDispatchers: CellDispatchers = useCellDispatcher(dispatch);
  const scrollDispatchers: ScrollDispatchers = useScrollDispatcher(dispatch);
  const settingDispatchers: SettingDispatchers = useSettingDispatcher(dispatch);
  const toolbarDispatchers: ToolbarDispatchers = useToolbarDispatcher(dispatch);

  return (
    <dispatchContext.Provider
      value={{
        dispatchRef,
        ...appDispatchers,
        ...bodyDispatchers,
        ...cellDispatchers,
        ...scrollDispatchers,
        ...settingDispatchers,
        ...toolbarDispatchers
      }}
    >
      {children}
    </dispatchContext.Provider>
  );
};
