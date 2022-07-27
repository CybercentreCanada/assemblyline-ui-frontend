import React from 'react';
import {
  Action,
  ReducerConfig,
  ReducersConfig,
  Store,
  StoreAction,
  StoreProviderProps,
  useCellReducer,
  useCopyReducer,
  useCursorReducer,
  useHexReducer,
  useHistoryReducer,
  useHoverReducer,
  useLayoutReducer,
  useLoadingReducer,
  useLocationReducer,
  useModeReducer,
  useScrollReducer,
  useSearchReducer,
  useSelectReducer,
  useSettingReducer
} from '..';

export type Reducer = ReducerConfig<StoreAction>;
export type Reducers = ReducersConfig<StoreAction>;
export type ReducerHandler = (arg: { store: Store; action: Action; prevStore?: Store }) => Store;
export type RenderHandler = (arg: { prevStore: Store; nextStore: Store }) => void;
export type UseReducer<State> = () => { initialState: State; reducer: ReducerHandler; render?: RenderHandler };

export type ReducerContextProps = {
  initialState: React.MutableRefObject<Store>;
  reducer: (store: Store, action: Action) => Store;
  render: (prevStore: Store, nextStore: Store) => void;
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
  const loading = useLoadingReducer();
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
    ...loading.initialState,
    ...mode.initialState,
    ...scroll.initialState,
    ...search.initialState,
    ...select.initialState,
    ...setting.initialState
  });

  const reducer = React.useCallback(
    (store: Store, action: Action) => {
      const prevStore = { ...store };

      store = loading.reducer({ store, action });
      store = setting.reducer({ store, action });
      store = mode.reducer({ store, action });
      store = hex.reducer({ store, action });
      store = layout.reducer({ store, action });

      store = location.reducer({ store, action });
      store = history.reducer({ store, action });

      store = cell.reducer({ store, action });
      store = hover.reducer({ store, action });
      store = cursor.reducer({ store, action });
      store = select.reducer({ store, action });
      store = search.reducer({ store, action, prevStore });

      store = scroll.reducer({ store, action, prevStore });

      store = copy.reducer({ store, action });

      return store;
    },
    [cell, copy, cursor, hex, history, hover, layout, loading, location, mode, scroll, search, select, setting]
  );

  const render = React.useCallback(
    (prevStore: Store, nextStore: Store) => {
      if (!nextStore.loading.initialized) return;

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
