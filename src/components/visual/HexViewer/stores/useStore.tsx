import React, { useLayoutEffect } from 'react';
import {
  ActionTypes,
  CellState,
  CopyState,
  CursorState,
  HexState,
  HistoryState,
  HoverState,
  LayoutState,
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
  ModeState &
  ScrollState &
  SearchState &
  SelectState &
  SettingState;

export type ActionProps = {
  type: ActionTypes | string;
  payload: any;
  tracked?: boolean;
  repeat?: boolean;
};

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

export const storeContext = React.createContext<StoreContextProps>(null);
export const useStore = () => React.useContext(storeContext);

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const { dispatchRef } = useDispatch();
  const { initialState, reducer, render } = useReducer();

  const [store, dispatch] = useAdvanceReducer<Store, ActionTypes>(reducer, { ...initialState.current }, 15, render);

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
