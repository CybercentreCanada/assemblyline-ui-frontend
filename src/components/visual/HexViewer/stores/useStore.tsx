import React, { useLayoutEffect } from 'react';
import {
  ActionProps,
  ACTIONS,
  ActionType,
  CellState,
  CopyState,
  CursorState,
  HexState,
  HistoryState,
  HoverState,
  LayoutState,
  LoadingState,
  LocationState,
  ModeState,
  ScrollState,
  SearchState,
  SelectState,
  SettingState,
  useDispatch,
  useReducer
} from '..';
import useAdvanceReducer from '../commons/hooks/useAdvanceReducer';

export type Store = CellState &
  CopyState &
  CursorState &
  HexState &
  HistoryState &
  HoverState &
  LayoutState &
  LocationState &
  LoadingState &
  ModeState &
  ScrollState &
  SearchState &
  SelectState &
  SettingState;

export type StoreContextProps = {
  store?: Store;
  dispatch?: React.Dispatch<ActionProps>;
};

export type StoreProviderProps = {
  children?: React.ReactNode;
};

export type StoreProps = {
  store?: Store;
};

export type AT = typeof ACTIONS[keyof typeof ACTIONS];

export const storeContext = React.createContext<StoreContextProps>(null);
export const useStore = () => React.useContext(storeContext);

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const { dispatchRef } = useDispatch();
  const { initialState, reducer, render } = useReducer();

  const [store, dispatch] = useAdvanceReducer<Store, ActionType>({ ...initialState.current }, reducer, render, 15);

  useLayoutEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch, dispatchRef]);

  return (
    <div id="hex-viewer">
      <storeContext.Provider value={{ store, dispatch }}>
        {React.useMemo(() => children, [children])}
      </storeContext.Provider>
    </div>
  );
};
