import { default as React, useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, HexStoreContextProps, HexStoreDispatch } from '..';
import { BodyType, LayoutType } from '../models/Layout';
import { ModeLanguage, ModeTheme, ModeWidth } from '../models/Mode';

export const StoreContext = React.createContext<HexStoreContextProps>(null);

export const WrappedStoreProvider = ({ children }: HexProps) => {
  // Store
  const store = useRef<HexStoreDispatch>(null);
  const onStoreInit = useCallback((dispatch: HexStoreDispatch) => (store.current = dispatch), []);

  // Mode
  const setModeTheme = useCallback((value: ModeTheme) => store.current?.setModeTheme(value), []);
  const setModeLanguage = useCallback((value: ModeLanguage) => store.current?.setModeLanguage(value), []);
  const setModeWidth = useCallback((value: ModeWidth) => store.current?.setModeWidth(value), []);

  // App
  const setInitialized = useCallback((value: boolean) => store.current?.setInitialized(value), []);

  // Hex
  const setHexOffsetBase = useCallback((value: number) => store.current?.setHexOffsetBase(value), []);
  const setHexOffsetSize = useCallback((value: number) => store.current?.setHexOffsetSize(value), []);
  const setHexBaseValues = useCallback(
    (
      values: Array<{
        label: string;
        value: number;
      }>
    ) => store.current?.setHexBaseValues(values),
    []
  );

  // Layout
  const setLayoutRows = useCallback((value: number) => store.current?.setLayoutRows(value), []);
  const setLayoutColumns = useCallback((value: number) => store.current?.setLayoutColumns(value), []);
  const setLayoutAutoRows = useCallback((value: boolean) => store.current?.setLayoutAutoRows(value), []);
  const setLayoutAutoColumns = useCallback((value: boolean) => store.current?.setLayoutAutoColumns(value), []);
  const setLayoutType = useCallback((value: LayoutType) => store.current?.setLayoutType(value), []);
  const setBodyType = useCallback((value: BodyType) => store.current?.setBodyType(value), []);

  // Scroll
  const setScrollIndex = useCallback((value: number) => store.current?.setScrollIndex(value), []);
  const setScrollSpeed = useCallback((value: number) => store.current?.setScrollSpeed(value), []);
  const setIsSliding = useCallback((value: boolean) => store.current?.setIsSliding(value), []);

  // Cursor
  const setCursorIndex = useCallback((value: number) => store.current?.setCursorIndex(value), []);

  // Select
  const setSelectIndexes = useCallback(
    (value: { start: number; end: number }) => store.current?.setSelectIndexes(value),
    []
  );

  // Suggestion
  const setSuggestionOpen = useCallback((value: boolean) => store.current?.setSuggestionOpen(value), []);
  const setSuggestionLabels = useCallback((values: Array<string>) => store.current?.setSuggestionLabels(values), []);

  // Search
  const setSearchValue = useCallback((value: string) => store.current?.setSearchValue(value), []);
  const setSearchQuery = useCallback(
    (value: { key?: string; value?: string; length?: number }) => store.current?.setSearchQuery(value),
    []
  );
  const setSearchIndexes = useCallback((value: Array<number>) => store.current?.setSearchIndexes(value), []);
  const setSearchIndex = useCallback((value: number) => store.current?.setSearchIndex(value), []);
  const setSearchHexIndex = useCallback((value: number) => store.current?.setSearchHexIndex(value), []);

  // History
  const setHistoryValues = useCallback((value: Array<string>) => store.current?.setHistoryValues(value), []);
  const setHistoryIndex = useCallback((value: number) => store.current?.setHistoryIndex(value), []);

  // Settings
  const setSettingsOpen = useCallback((value: boolean) => store.current?.setSettingsOpen(value), []);

  return (
    <StoreContext.Provider
      value={{
        // Store
        onStoreInit,

        // Mode
        setModeTheme,
        setModeLanguage,
        setModeWidth,

        // App
        setInitialized,

        // Hex
        setHexOffsetBase,
        setHexOffsetSize,
        setHexBaseValues,

        // Layout
        setLayoutRows,
        setLayoutColumns,
        setLayoutAutoRows,
        setLayoutAutoColumns,
        setLayoutType,
        setBodyType,

        // Scroll
        setScrollIndex,
        setScrollSpeed,
        setIsSliding,

        // Cursor
        setCursorIndex,

        // Select
        setSelectIndexes,

        // Suggestion
        setSuggestionOpen,
        setSuggestionLabels,

        // Search
        setSearchValue,
        setSearchQuery,
        setSearchIndexes,
        setSearchIndex,
        setSearchHexIndex,

        // History
        setHistoryValues,
        setHistoryIndex,

        // Settings
        setSettingsOpen
      }}
    >
      {useMemo(() => children, [children])}
    </StoreContext.Provider>
  );
};

export const StoreProvider = React.memo(WrappedStoreProvider);
export const useStore = (): HexStoreContextProps => useContext(StoreContext) as HexStoreContextProps;
