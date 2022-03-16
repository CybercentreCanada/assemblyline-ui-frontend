import React from 'react';
import { LayoutActions, useLayoutAction } from '../actions/useLayoutAction';
import {
  ActionProps,
  HexDispatchContextProps,
  HexReducerContextProps,
  HexStoreContextProps,
  HexStoreProviderProps,
  Ref,
  Store
} from '../models/NewStore';
import { useHexReducer } from '../reducers/useHexReducer';
import { useLayoutReducer } from '../reducers/useLayoutReducer';

const reducerContext = React.createContext<HexReducerContextProps>(null);
const dispatchContext = React.createContext<HexDispatchContextProps>(null);
const storeContext = React.createContext<HexStoreContextProps>(null);

export const useReducer = () => React.useContext(reducerContext);
export const useDispatch = () => React.useContext(dispatchContext);
export const useStore = () => React.useContext(storeContext);

// Reducer Provider
export const ReducerProvider = ({ children }: HexStoreProviderProps) => {
  const bodyRef = React.useRef<HTMLDivElement | HTMLTableElement>(null);

  const hex = useHexReducer();
  const layout = useLayoutReducer();

  const initialState = React.useMemo<any>(
    () => ({
      ...hex.initialState,
      ...layout.initialState
    }),
    [hex.initialState, layout.initialState]
  );

  const refs = React.useRef<Ref>({ ...hex.initialRef, ...layout.initialRef });

  const reducer = React.useCallback(
    (prevState: Store, action: ActionProps) => {
      let nextState = { ...prevState };
      nextState = hex.reducer(prevState, nextState, refs, action);
      nextState = layout.reducer(prevState, nextState, refs, action);
      // nextState = Hover.reducer(prevState, nextState, refs, action);
      return nextState;
    },
    [hex, layout]
  );

  return (
    <reducerContext.Provider value={{ initialState, refs, reducer }}>
      {React.useMemo(() => children, [children])}
    </reducerContext.Provider>
  );
};

// Dispatch Provider
export const DispatchProvider = ({ children }: HexStoreProviderProps) => {
  const dispatchRef = React.useRef<React.Dispatch<ActionProps>>(null);
  const layoutActions: LayoutActions = useLayoutAction(dispatchRef);

  return <dispatchContext.Provider value={{ dispatchRef, ...layoutActions }}>{children}</dispatchContext.Provider>;
};

// Store Provider
export const StoreProvider = ({ children }: HexStoreProviderProps) => {
  const { dispatchRef } = useDispatch();
  const { initialState, reducer } = useReducer();
  const [store, dispatch] = React.useReducer<(state: Store, action: ActionProps) => Store>(reducer, initialState);
  dispatchRef.current = dispatch;
  return <storeContext.Provider value={{ store }}>{React.useMemo(() => children, [children])}</storeContext.Provider>;
};
