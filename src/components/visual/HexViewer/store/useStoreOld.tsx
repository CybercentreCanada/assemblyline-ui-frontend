import React, { useMemo, useState } from 'react';

export type HexProps = {
  children?: React.ReactNode;
};

export type StoreProps = {
  data: string;
  parseHexDataToHexMap?: (data: string) => Map<number, string>;
};

export type StoreState = {
  data?: string;
  hexes?: Map<number, string>;

  rows?: number;
  columns?: number;
  base?: number;
  setRows?: React.Dispatch<React.SetStateAction<number>>;
  setColumns?: React.Dispatch<React.SetStateAction<number>>;
  setBase?: React.Dispatch<React.SetStateAction<number>>;

  offsetSize?: number;
  setOffsetSize?: React.Dispatch<React.SetStateAction<number>>;

  scrollIndex?: number;
  setScrollIndex?: React.Dispatch<React.SetStateAction<number>>;

  openSettings?: boolean;
  setOpenSettings?: React.Dispatch<React.SetStateAction<boolean>>;

  scrollSpeed?: number;
  setScrollSpeed?: React.Dispatch<React.SetStateAction<number>>;
  scrollMaxIndex?: number;

  isSliding?: boolean;
  setIsSliding?: React.Dispatch<React.SetStateAction<boolean>>;

  cursorIndex?: number;
  setCursorIndex?: React.Dispatch<React.SetStateAction<number>>;

  selectIndexes?: { start: number; end: number };
  setSelectIndexes?: React.Dispatch<React.SetStateAction<{ start: number; end: number }>>;

  searchValue?: string;
  setSearchValue?: React.Dispatch<React.SetStateAction<string>>;

  searchQuery?: { key?: string; value?: string; length?: number };
  setSearchQuery?: React.Dispatch<React.SetStateAction<{ key?: string; value?: string; length?: number }>>;

  searchIndexes?: Array<number>;
  setSearchIndexes?: React.Dispatch<React.SetStateAction<Array<number>>>;

  searchIndex?: number;
  setSearchIndex?: React.Dispatch<React.SetStateAction<number>>;

  searchHexIndex?: number;
  setSearchHexIndex?: React.Dispatch<React.SetStateAction<number>>;

  historyValues?: Array<string>;
  setHistoryValues?: React.Dispatch<React.SetStateAction<Array<string>>>;

  historyIndex?: number;
  setHistoryIndex?: React.Dispatch<React.SetStateAction<number>>;

  isLoaded?: boolean;
  setIsLoaded?: React.Dispatch<React.SetStateAction<boolean>>;

  suggestionOpen?: boolean;
  setSuggestionOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useStore = ({ data, parseHexDataToHexMap }: StoreProps): StoreState => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const hexes = useMemo<Map<number, string>>(() => parseHexDataToHexMap(data), [data, parseHexDataToHexMap]);

  const [rows, setRows] = useState<number>(50);
  const [columns, setColumns] = useState<number>(16);
  const [base, setBase] = useState<number>(10);
  const [offsetSize, setOffsetSize] = useState<number>(8);

  const [scrollIndex, setScrollIndex] = useState<number>(0);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1);
  const scrollMaxIndex = useMemo<number>(() => Math.ceil(hexes.size / columns - rows + 1), [hexes.size, columns, rows]);
  const [isSliding, setIsSliding] = useState<boolean>(false);

  const [cursorIndex, setCursorIndex] = useState<number>(null);

  const [selectIndexes, setSelectIndexes] = useState<{ start: number; end: number }>({ start: -1, end: -1 });

  const [openSettings, setOpenSettings] = useState<boolean>(false);

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
    data: data,
    hexes: hexes,

    isLoaded: isLoaded,
    setIsLoaded: setIsLoaded,

    rows: rows,
    setRows: setRows,

    columns: columns,
    setColumns: setColumns,

    base: base,
    setBase: setBase,

    offsetSize: offsetSize,
    setOffsetSize: setOffsetSize,

    cursorIndex: cursorIndex,
    setCursorIndex: setCursorIndex,

    openSettings: openSettings,
    setOpenSettings: setOpenSettings,

    scrollIndex: scrollIndex,
    setScrollIndex: setScrollIndex,

    scrollSpeed: scrollSpeed,
    setScrollSpeed: setScrollSpeed,

    scrollMaxIndex: scrollMaxIndex,

    isSliding: isSliding,
    setIsSliding: setIsSliding,

    selectIndexes: selectIndexes,
    setSelectIndexes: setSelectIndexes,

    searchValue: searchValue,
    setSearchValue: setSearchValue,

    searchQuery: searchQuery,
    setSearchQuery: setSearchQuery,

    searchIndexes: searchIndexes,
    setSearchIndexes: setSearchIndexes,

    searchIndex: searchIndex,
    setSearchIndex: setSearchIndex,

    searchHexIndex: searchHexIndex,
    setSearchHexIndex: setSearchHexIndex,

    historyValues: historyValues,
    setHistoryValues: setHistoryValues,

    historyIndex: historyIndex,
    setHistoryIndex: setHistoryIndex,

    suggestionOpen: suggestionOpen,
    setSuggestionOpen: setSuggestionOpen
  };
};

export default useStore;
