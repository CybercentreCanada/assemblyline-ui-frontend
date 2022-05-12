import React from 'react';
import {
  ActionProps,
  CellRef,
  CopyRef,
  CursorRef,
  HexRef,
  HistoryRef,
  HoverRef,
  LayoutRef,
  LocationRef,
  ModeRef,
  ScrollRef,
  SearchRef,
  SelectRef,
  SettingRef,
  Store,
  StoreProviderProps,
  StyleRef,
  SuggestionRef,
  TranslationRef,
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
  useSettingReducer,
  useStyleReducer,
  useSuggestionReducer,
  useTranslationReducer
} from '..';

export type StoreRefType = CellRef &
  CopyRef &
  CursorRef &
  HexRef &
  HistoryRef &
  HoverRef &
  LayoutRef &
  LocationRef &
  ModeRef &
  ScrollRef &
  SearchRef &
  SelectRef &
  SettingRef &
  StyleRef &
  SuggestionRef &
  TranslationRef;

export type StoreRef = React.MutableRefObject<StoreRefType>;

export type ReducerProps = {
  prevStore: Store;
  nextStore: Store;
  refs: StoreRef;
  action: ActionProps;
};

export type RenderProps = {
  prevStore: Store;
  nextStore: Store;
  refs: StoreRef;
};

export type ReducerContextProps = {
  initialState?: React.MutableRefObject<Store>;
  refs?: StoreRef;
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
  const style = useStyleReducer();
  const suggestion = useSuggestionReducer();
  const translation = useTranslationReducer();

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
    ...setting.initialState,
    ...style.initialState,
    ...suggestion.initialState,
    ...translation.initialState
  });

  const refs = React.useRef<StoreRefType>({
    ...cell.initialRef,
    ...copy.initialRef,
    ...cursor.initialRef,
    ...hex.initialRef,
    ...history.initialRef,
    ...hover.initialRef,
    ...layout.initialRef,
    ...location.initialRef,
    ...mode.initialRef,
    ...scroll.initialRef,
    ...search.initialRef,
    ...select.initialRef,
    ...setting.initialRef,
    ...style.initialRef,
    ...suggestion.initialRef,
    ...translation.initialRef
  });

  const reducer = React.useCallback(
    (prevStore: Store, action: ActionProps) => {
      let nextStore = { ...prevStore };

      nextStore = mode.reducer({ prevStore, nextStore, refs, action });
      nextStore = hex.reducer({ prevStore, nextStore, refs, action });
      nextStore = translation.reducer({ prevStore, nextStore, refs, action });
      nextStore = setting.reducer({ prevStore, nextStore, refs, action });
      nextStore = layout.reducer({ prevStore, nextStore, refs, action });
      nextStore = style.reducer({ prevStore, nextStore, refs, action });

      nextStore = location.reducer({ prevStore, nextStore, refs, action });
      nextStore = history.reducer({ prevStore, nextStore, refs, action });
      nextStore = suggestion.reducer({ prevStore, nextStore, refs, action });

      nextStore = cell.reducer({ prevStore, nextStore, refs, action });
      nextStore = hover.reducer({ prevStore, nextStore, refs, action });
      nextStore = cursor.reducer({ prevStore, nextStore, refs, action });
      nextStore = select.reducer({ prevStore, nextStore, refs, action });
      nextStore = search.reducer({ prevStore, nextStore, refs, action });

      nextStore = scroll.reducer({ prevStore, nextStore, refs, action });

      nextStore = copy.reducer({ prevStore, nextStore, refs, action });

      console.log(action.type, nextStore.select.isHighlighting, nextStore.layout.isFocusing);

      return nextStore;
    },
    [
      cell,
      copy,
      cursor,
      hex,
      history,
      hover,
      layout,
      location,
      mode,
      scroll,
      search,
      select,
      setting,
      style,
      suggestion,
      translation
    ]
  );

  const render = React.useCallback(
    (prevStore: Store, nextStore: Store) => {
      if (!nextStore.initialized) return;

      hover.render({ prevStore, nextStore, refs });
      cursor.render({ prevStore, nextStore, refs });
      select.render({ prevStore, nextStore, refs });
      search.render({ prevStore, nextStore, refs });
    },
    [cursor, hover, search, select]
  );

  return (
    <reducerContext.Provider value={{ initialState, refs, reducer, render }}>
      {React.useMemo(() => children, [children])}
    </reducerContext.Provider>
  );
};
