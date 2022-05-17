import React from 'react';
import {
  ActionProps,
  Store,
  StoreProviderProps,
  useCellReducer,
  useCopyReducer,
  useCursorReducer,
  useHexReducer,
  useHistoryReducer,
  useHoverReducer,
  useLayoutReducer,
  useLocationReducer,
  useModeReducer,
  useScrollReducer,
  useSearchReducer,
  useSelectReducer,
  useSettingReducer
} from '..';

export type ReducerProps = {
  prevStore?: Store;
  store: Store;
  action: ActionProps;
};

export type RenderProps = {
  prevStore: Store;
  nextStore: Store;
};

export type ReducerContextProps = {
  initialState?: React.MutableRefObject<Store>;
  reducer?: (store: Store, action: ActionProps) => Store;
  render?: (prevStore: Store, nextStore: Store) => void;
};

export const reducerContext = React.createContext<ReducerContextProps>(null);
export const useReducer = () => React.useContext(reducerContext);

export const ReducerProvider = ({ children }: StoreProviderProps) => {
  const cell = useCellReducer();
  const copy = useCopyReducer();
  const cursor = useCursorReducer();
  const hex = useHexReducer();
  const history = useHistoryReducer();
  const hover = useHoverReducer();
  const layout = useLayoutReducer();
  const location = useLocationReducer();
  const mode = useModeReducer();
  const scroll = useScrollReducer();
  const search = useSearchReducer();
  const select = useSelectReducer();
  const setting = useSettingReducer();

  const initialState = React.useRef<Store>({
    ...cell.initialState,
    ...copy.initialState,
    ...cursor.initialState,
    ...hex.initialState,
    ...history.initialState,
    ...hover.initialState,
    ...layout.initialState,
    ...location.initialState,
    ...mode.initialState,
    ...scroll.initialState,
    ...search.initialState,
    ...select.initialState,
    ...setting.initialState
  });

  const reducer = React.useCallback(
    (store: Store, action: ActionProps) => {
      const prevStore = { ...store };

      store = mode.reducer({ store, action });
      store = hex.reducer({ store, action });
      store = setting.reducer({ store, action });
      store = layout.reducer({ store, action });

      store = location.reducer({ store, action });
      store = history.reducer({ store, action });

      store = cell.reducer({ store, action });
      store = hover.reducer({ store, action });
      store = cursor.reducer({ store, action });
      store = select.reducer({ store, action });
      store = search.reducer({ prevStore, store, action });

      store = scroll.reducer({ prevStore, store, action });

      store = copy.reducer({ store, action });

      return store;
    },
    [cell, copy, cursor, hex, history, hover, layout, location, mode, scroll, search, select, setting]
  );

  const render = React.useCallback(
    (prevStore: Store, nextStore: Store) => {
      if (!nextStore.initialized) return;

      hover.render({ prevStore, nextStore });
      cursor.render({ prevStore, nextStore });
      select.render({ prevStore, nextStore });
      search.render({ prevStore, nextStore });
    },
    [cursor, hover, search, select]
  );

  return (
    <reducerContext.Provider value={{ initialState, reducer, render }}>
      {React.useMemo(() => children, [children])}
    </reducerContext.Provider>
  );
};
