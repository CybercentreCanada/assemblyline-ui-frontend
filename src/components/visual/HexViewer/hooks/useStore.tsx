import { default as React, useCallback, useContext, useMemo, useRef, useState } from 'react';

export type HexProps = {
  children?: React.ReactNode;
};

export type StoreState = {
  isLoaded?: boolean;

  // Hex
  hexBase?: number;
  hexOffsetBase?: number;

  // Layout
  layoutRows?: number;
  layoutColumns?: number;
  settingsOpen?: boolean;

  // Scroll
  scrollIndex?: number;
  scrollSpeed?: number;
  isSliding?: boolean;

  // Cursor
  cursorIndex?: number;

  // Select
  selectIndexes?: { start: number; end: number };

  // Suggestion
  suggestionOpen?: boolean;

  // Search
  searchValue?: string;
  searchQuery?: { key?: string; value?: string; length?: number };
  searchIndexes?: Array<number>;
  searchIndex?: number;
  searchHexIndex?: number;

  // History
  historyValues?: Array<string>;
  historyIndex?: number;
};

export type StoreSetState = {
  setIsLoaded?: React.Dispatch<React.SetStateAction<boolean>>;

  // Hex
  setHexBase?: React.Dispatch<React.SetStateAction<number>>;
  setHexOffsetSize?: React.Dispatch<React.SetStateAction<number>>;

  // Layout
  setLayoutRows?: React.Dispatch<React.SetStateAction<number>>;
  setLayoutColumns?: React.Dispatch<React.SetStateAction<number>>;
  setSettingsOpen?: React.Dispatch<React.SetStateAction<boolean>>;

  // Scroll
  setScrollIndex?: React.Dispatch<React.SetStateAction<number>>;
  setScrollSpeed?: React.Dispatch<React.SetStateAction<number>>;
  setIsSliding?: React.Dispatch<React.SetStateAction<boolean>>;

  // Cursor
  setCursorIndex?: React.Dispatch<React.SetStateAction<number>>;

  // Select
  setSelectIndexes?: React.Dispatch<React.SetStateAction<{ start: number; end: number }>>;

  // Suggestion
  setSuggestionOpen?: React.Dispatch<React.SetStateAction<boolean>>;

  // Search
  setSearchValue?: React.Dispatch<React.SetStateAction<string>>;
  setSearchQuery?: React.Dispatch<React.SetStateAction<{ key?: string; value?: string; length?: number }>>;
  setSearchIndexes?: React.Dispatch<React.SetStateAction<Array<number>>>;
  setSearchIndex?: React.Dispatch<React.SetStateAction<number>>;
  setSearchHexIndex?: React.Dispatch<React.SetStateAction<number>>;

  // History
  setHistoryValues?: React.Dispatch<React.SetStateAction<Array<string>>>;
  setHistoryIndex?: React.Dispatch<React.SetStateAction<number>>;
};

export type StateStoreContext = {
  states?: StoreState;
  setStates: StoreSetState;
};

export type StoreContextProps = {
  setLayoutRows?: (value: number) => void;
  setLayoutColumns?: (value: number) => void;
  setHexBase?: (value: number) => void;
  setHexOffsetSize?: (value: number) => void;
  setScrollIndex?: (value: number) => void;
  setSettingsOpen?: (value: boolean) => void;
  setScrollSpeed?: (value: number) => void;
  setIsSliding?: (value: boolean) => void;
  setCursorIndex?: (value: number) => void;
  setSelectIndexes?: (value: { start: number; end: number }) => void;
  setSearchValue?: (value: string) => void;
  setSearchQuery?: (value: { key?: string; value?: string; length?: number }) => void;
  setSearchIndexes?: (value: Array<number>) => void;
  setSearchIndex?: (value: number) => void;
  setSearchHexIndex?: (value: number) => void;
  setHistoryValues?: (value: Array<string>) => void;
  setHistoryIndex?: (value: number) => void;
  setIsLoaded?: (value: boolean) => void;
  setSuggestionOpen?: (value: boolean) => void;
  onStoreInit?: (setStates: StoreSetState) => void;
};

export const useStateStore = (): StateStoreContext => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isSliding, setIsSliding] = useState<boolean>(false);
  const [layoutRows, setLayoutRows] = useState<number>(50);
  const [layoutColumns, setLayoutColumns] = useState<number>(16);
  const [hexBase, setHexBase] = useState<number>(10);
  const [hexOffsetBase, setHexOffsetSize] = useState<number>(8);
  const [scrollIndex, setScrollIndex] = useState<number>(0);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1);
  const [cursorIndex, setCursorIndex] = useState<number>(null);
  const [selectIndexes, setSelectIndexes] = useState<{ start: number; end: number }>({ start: -1, end: -1 });
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<{ key?: string; value?: string; length?: number }>({
    key: '',
    value: '',
    length: 0
  });
  const [searchIndexes, setSearchIndexes] = useState<Array<number>>([]);
  const [searchIndex, setSearchIndex] = useState<number>(null);
  const [searchHexIndex, setSearchHexIndex] = useState<number>(null);
  const [historyValues, setHistoryValues] = useState<Array<string>>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(null);
  const [suggestionOpen, setSuggestionOpen] = useState<boolean>(false);

  return {
    states: {
      isLoaded: isLoaded,

      // Hex
      hexBase: hexBase,
      hexOffsetBase: hexOffsetBase,

      // Layout
      layoutRows: layoutRows,
      layoutColumns: layoutColumns,
      settingsOpen: settingsOpen,

      // Scroll
      scrollIndex: scrollIndex,
      scrollSpeed: scrollSpeed,
      isSliding: isSliding,

      // Cursor
      cursorIndex: cursorIndex,

      // Select
      selectIndexes: selectIndexes,

      // Suggestion
      suggestionOpen: suggestionOpen,

      // Search
      searchValue: searchValue,
      searchQuery: searchQuery,
      searchIndexes: searchIndexes,
      searchIndex: searchIndex,
      searchHexIndex: searchHexIndex,

      // History
      historyValues: historyValues,
      historyIndex: historyIndex
    },
    setStates: {
      setIsLoaded: setIsLoaded,

      // Hex
      setHexBase: setHexBase,
      setHexOffsetSize: setHexOffsetSize,

      // Layout
      setLayoutRows: setLayoutRows,
      setLayoutColumns: setLayoutColumns,
      setSettingsOpen: setSettingsOpen,

      // Scroll
      setScrollIndex: setScrollIndex,
      setScrollSpeed: setScrollSpeed,
      setIsSliding: setIsSliding,

      // Cursor
      setCursorIndex: setCursorIndex,

      // Select
      setSelectIndexes: setSelectIndexes,

      // Suggestion
      setSuggestionOpen: setSuggestionOpen,

      // Search
      setSearchValue: setSearchValue,
      setSearchQuery: setSearchQuery,
      setSearchIndexes: setSearchIndexes,
      setSearchIndex: setSearchIndex,
      setSearchHexIndex: setSearchHexIndex,

      // History
      setHistoryValues: setHistoryValues,
      setHistoryIndex: setHistoryIndex
    }
  };
};

export const StoreContext = React.createContext<StoreContextProps>(null);

export const WrappedStoreProvider = ({ children }: HexProps) => {
  const store = useRef<StoreSetState>(null);

  const onStoreInit = useCallback((setStates: StoreSetState) => (store.current = setStates), []);

  // Hex
  const setHexBase = useCallback((value: number) => store.current?.setHexBase(value), []);
  const setHexOffsetSize = useCallback((value: number) => store.current?.setHexOffsetSize(value), []);

  // Layout
  const setLayoutRows = useCallback((value: number) => store.current?.setLayoutRows(value), []);
  const setLayoutColumns = useCallback((value: number) => store.current?.setLayoutColumns(value), []);
  const setSettingsOpen = useCallback((value: boolean) => store.current?.setSettingsOpen(value), []);

  const setScrollIndex = useCallback((value: number) => store.current?.setScrollIndex(value), []);
  const setScrollSpeed = useCallback((value: number) => store.current?.setScrollSpeed(value), []);
  const setIsSliding = useCallback((value: boolean) => store.current?.setIsSliding(value), []);
  const setCursorIndex = useCallback((value: number) => store.current?.setCursorIndex(value), []);
  const setSelectIndexes = useCallback(
    (value: { start: number; end: number }) => store.current?.setSelectIndexes(value),
    []
  );
  const setSearchValue = useCallback((value: string) => store.current?.setSearchValue(value), []);
  const setSearchQuery = useCallback(
    (value: { key?: string; value?: string; length?: number }) => store.current?.setSearchQuery(value),
    []
  );
  const setSearchIndexes = useCallback((value: Array<number>) => store.current?.setSearchIndexes(value), []);
  const setSearchIndex = useCallback((value: number) => store.current?.setSearchIndex(value), []);
  const setSearchHexIndex = useCallback((value: number) => store.current?.setSearchHexIndex(value), []);
  const setHistoryValues = useCallback((value: Array<string>) => store.current?.setHistoryValues(value), []);
  const setHistoryIndex = useCallback((value: number) => store.current?.setHistoryIndex(value), []);
  const setIsLoaded = useCallback((value: boolean) => store.current?.setIsLoaded(value), []);
  const setSuggestionOpen = useCallback((value: boolean) => store.current?.setSuggestionOpen(value), []);

  return (
    <StoreContext.Provider
      value={{
        onStoreInit,
        setLayoutRows,
        setLayoutColumns,
        setHexBase,
        setHexOffsetSize,
        setScrollIndex,
        setSettingsOpen,
        setScrollSpeed,
        setIsSliding,
        setCursorIndex,
        setSelectIndexes,
        setSearchValue,
        setSearchQuery,
        setSearchIndexes,
        setSearchIndex,
        setSearchHexIndex,
        setHistoryValues,
        setHistoryIndex,
        setIsLoaded,
        setSuggestionOpen
      }}
    >
      {useMemo(() => children, [children])}
    </StoreContext.Provider>
  );
};

export const StoreProvider = React.memo(WrappedStoreProvider);
export const useStore = (): StoreContextProps => useContext(StoreContext) as StoreContextProps;
