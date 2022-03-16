import React from 'react';
import {
  ActionProps,
  AppActionProps,
  AppActions,
  APP_ACTIONS,
  BodyActionProps,
  BodyActions,
  BODY_ACTIONS,
  CellActionProps,
  CellActions,
  CELL_ACTIONS,
  ScrollActionProps,
  ScrollActions,
  SCROLL_ACTIONS,
  SettingActionProps,
  SettingActions,
  SETTING_ACTIONS,
  StoreProviderProps,
  ToolbarActionProps,
  ToolbarActions,
  TOOLBAR_ACTIONS,
  useAppAction,
  useBodyAction,
  useCellAction,
  useScrollAction,
  useSettingAction,
  useToolbarAction
} from '..';

export type Actions = AppActions & BodyActions & CellActions & ScrollActions & ToolbarActions & SettingActions;

export const ACTIONS: Actions = {
  ...APP_ACTIONS,
  ...BODY_ACTIONS,
  ...CELL_ACTIONS,
  ...SCROLL_ACTIONS,
  ...TOOLBAR_ACTIONS,
  ...SETTING_ACTIONS
};

export type ActionTypes = typeof ACTIONS[keyof typeof ACTIONS];

export type IsAction = {
  [Property in keyof Actions]: (action: ActionProps) => boolean;
};

export const isAction = Object.fromEntries(
  Object.keys(ACTIONS).map(key => [key, (action: ActionProps) => action?.type === ACTIONS[key]])
) as IsAction;

export type StoreActions = {
  dispatchRef?: React.MutableRefObject<React.Dispatch<ActionProps>>;
};

export type DispatchContextProps = StoreActions &
  AppActionProps &
  BodyActionProps &
  CellActionProps &
  ScrollActionProps &
  ToolbarActionProps &
  SettingActionProps;

export type DispatchProp = (type: ActionTypes, payload: object, tracked?: boolean, repeat?: boolean) => void;

export const dispatchContext = React.createContext<DispatchContextProps>(null);
export const useDispatch = () => React.useContext(dispatchContext);

export const DispatchProvider = ({ children }: StoreProviderProps) => {
  const dispatchRef = React.useRef<React.Dispatch<ActionProps>>(null);

  const dispatch = React.useCallback(
    (type: ActionTypes, payload: object, tracked: boolean = true, repeat: boolean = true) => {
      dispatchRef.current({ type, payload, tracked, repeat });
    },
    []
  );

  const appActions: AppActionProps = useAppAction(dispatch);
  const bodyActions: BodyActionProps = useBodyAction(dispatch);
  const cellActions: CellActionProps = useCellAction(dispatch);
  const scrollActions: ScrollActionProps = useScrollAction(dispatch);
  const toolbarActions: ToolbarActionProps = useToolbarAction(dispatch);
  const settingActions: SettingActionProps = useSettingAction(dispatch);

  return (
    <dispatchContext.Provider
      value={{
        dispatchRef,
        ...appActions,
        ...bodyActions,
        ...cellActions,
        ...scrollActions,
        ...toolbarActions,
        ...settingActions
      }}
    >
      {children}
    </dispatchContext.Provider>
  );
};
