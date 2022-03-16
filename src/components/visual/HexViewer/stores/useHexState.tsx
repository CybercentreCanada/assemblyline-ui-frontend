import { useState } from 'react';
import { HexStore, HexStoreDispatch } from '..';
import { DEFAULT } from '../configs/default';
import { BodyType, LayoutType } from '../models/Layout';
import { ModeLanguage, ModeTheme, ModeWidth } from '../models/Mode';

export type UseHexState = () => {
  store?: HexStore;
  dispatch?: HexStoreDispatch;
};

export const useHexState: UseHexState = () => {
  // App
  const [initialized, setInitialized] = useState<boolean>(false);

  // Mode
  const [modeTheme, setModeTheme] = useState<ModeTheme>(DEFAULT.modeTheme);
  const [modeLanguage, setModeLanguage] = useState<ModeLanguage>(DEFAULT.modeLanguage);
  const [modeWidth, setModeWidth] = useState<ModeWidth>(DEFAULT.modeWidth);

  // Hex
  const [hexOffsetBase, setHexOffsetBase] = useState<number>(16);
  const [hexOffsetSize, setHexOffsetSize] = useState<number>(8);
  const [hexBaseValues, setHexBaseValues] = useState<
    Array<{
      label: string;
      value: number;
    }>
  >([
    { label: 'Octal', value: 8 },
    { label: 'Decimal', value: 10 },
    { label: 'Hexadecimal', value: 16 }
  ]);

  // Layout
  const [layoutRows, setLayoutRows] = useState<number>(DEFAULT.layoutRows);
  const [layoutColumns, setLayoutColumns] = useState<number>(DEFAULT.layoutColumns);
  const [layoutAutoRows, setLayoutAutoRows] = useState<boolean>(DEFAULT.layoutAutoRows);
  const [layoutAutoColumns, setLayoutAutoColumns] = useState<boolean>(DEFAULT.layoutAutoColumns);
  const [layoutType, setLayoutType] = useState<LayoutType>(DEFAULT.layoutType);
  const [bodyType, setBodyType] = useState<BodyType>(DEFAULT.bodyType);

  // Scroll
  const [scrollIndex, setScrollIndex] = useState<number>(0);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1);
  const [isSliding, setIsSliding] = useState<boolean>(false);

  // Cursor
  const [cursorIndex, setCursorIndex] = useState<number>(null);

  // Select
  const [selectIndexes, setSelectIndexes] = useState<{ start: number; end: number }>({ start: -1, end: -1 });

  // Suggestion
  const [suggestionOpen, setSuggestionOpen] = useState<boolean>(false);
  const [suggestionLabels, setSuggestionLabels] = useState<Array<string>>([]);

  // Search
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<{ key?: string; value?: string; length?: number }>({
    key: '',
    value: '',
    length: 0
  });
  const [searchIndexes, setSearchIndexes] = useState<Array<number>>([]);
  const [searchIndex, setSearchIndex] = useState<number>(null);
  const [searchHexIndex, setSearchHexIndex] = useState<number>(null);

  // History
  const [historyValues, setHistoryValues] = useState<Array<string>>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(null);

  // Settings
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  return {
    store: {
      // App
      initialized: initialized,

      // Mode
      modeTheme: modeTheme,
      modeLanguage: modeLanguage,
      modeWidth: modeWidth,

      // Hex
      hexOffsetBase: hexOffsetBase,
      hexOffsetSize: hexOffsetSize,
      hexBaseValues: hexBaseValues,

      // Layout
      layoutRows: layoutRows,
      layoutColumns: layoutColumns,
      layoutAutoRows: layoutAutoRows,
      layoutAutoColumns: layoutAutoColumns,
      layoutType: layoutType,
      bodyType: bodyType,

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
      suggestionLabels: suggestionLabels,

      // Search
      searchValue: searchValue,
      searchQuery: searchQuery,
      searchIndexes: searchIndexes,
      searchIndex: searchIndex,
      searchHexIndex: searchHexIndex,

      // History
      historyValues: historyValues,
      historyIndex: historyIndex,

      // Settings
      settingsOpen: settingsOpen
    },
    dispatch: {
      // App
      setInitialized: setInitialized,

      // Mode
      setModeTheme: setModeTheme,
      setModeLanguage: setModeLanguage,
      setModeWidth: setModeWidth,

      // Hex
      setHexOffsetBase: setHexOffsetBase,
      setHexOffsetSize: setHexOffsetSize,
      setHexBaseValues: setHexBaseValues,

      // Layout
      setLayoutRows: setLayoutRows,
      setLayoutColumns: setLayoutColumns,
      setLayoutAutoRows: setLayoutAutoRows,
      setLayoutAutoColumns: setLayoutAutoColumns,
      setLayoutType: setLayoutType,
      setBodyType: setBodyType,

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
      setSuggestionLabels: setSuggestionLabels,

      // Search
      setSearchValue: setSearchValue,
      setSearchQuery: setSearchQuery,
      setSearchIndexes: setSearchIndexes,
      setSearchIndex: setSearchIndex,
      setSearchHexIndex: setSearchHexIndex,

      // History
      setHistoryValues: setHistoryValues,
      setHistoryIndex: setHistoryIndex,

      // Settings
      setSettingsOpen: setSettingsOpen
    }
  };
};
