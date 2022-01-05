import { isArrowDown, isArrowUp, isEnter, isEscape } from 'commons/addons/elements/utils/keyboard';
import { default as React, useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useLayout, useSearch, useStore, useSuggestion } from '..';

export type HistoryContextProps = {
  nextHistoryShowLastValue?: React.MutableRefObject<boolean>;
  onHistoryChange?: () => boolean;
  onHistoryKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
  onHistorySave?: () => void;
  onHistoryLoad: () => void;
};

export const HistoryContext = React.createContext<HistoryContextProps>(null);

export const WrappedHistoryProvider = ({ children }: HexProps) => {
  const { setIsLoaded } = useStore();
  const { isContainerFocused } = useLayout();
  const { nextSearchValue, onSearchValueChange, onSearchLoad } = useSearch();
  const { nextSuggestionOpen } = useSuggestion();

  const inputChanged = useRef<boolean>(false);
  const nextHistoryValues = useRef<Array<string>>([]);
  const nextHistoryIndex = useRef<number>(0);
  const nextHistoryShowLastValue = useRef<boolean>(false);

  const clampHistoryIndex = useCallback(() => {
    if (nextHistoryIndex.current < 0) nextHistoryIndex.current = 0;
    else if (nextHistoryIndex.current >= nextHistoryValues.current.length)
      nextHistoryIndex.current = nextHistoryValues.current.length - 1;
  }, []);

  const handleHistoryIndexChange = useCallback(
    (keyCode: string) => {
      if (nextHistoryValues.current.length === 0) return;

      const prevHistoryIndex = nextHistoryIndex.current;
      if (isArrowDown(keyCode)) nextHistoryIndex.current = nextHistoryIndex.current - 1;
      else if (isArrowUp(keyCode)) nextHistoryIndex.current = nextHistoryIndex.current + 1;
      clampHistoryIndex();
      if (nextHistoryIndex.current === prevHistoryIndex) return;

      onSearchValueChange(nextHistoryValues.current[nextHistoryIndex.current]);
    },
    [clampHistoryIndex, onSearchValueChange]
  );

  const handleHistoryAddValue = useCallback(() => {
    if (
      !inputChanged.current ||
      nextSearchValue.current === '' ||
      nextSearchValue.current === nextHistoryValues.current[nextHistoryValues.current.length - 1]
    )
      return;
    nextHistoryValues.current.unshift(nextSearchValue.current);
    nextHistoryIndex.current = 0;
    inputChanged.current = false;
  }, [nextSearchValue]);

  const onHistoryKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const { key: keyCode } = event;

      if (
        nextSuggestionOpen.current ||
        isContainerFocused.current ||
        (!isArrowDown(keyCode) && !isArrowUp(keyCode) && !isEnter(keyCode) && !isEscape(keyCode))
      )
        return;
      event.preventDefault();

      if (isEnter(keyCode) || isArrowDown(keyCode) || isArrowUp(keyCode)) handleHistoryAddValue();
      if (isArrowDown(keyCode) || isArrowUp(keyCode)) handleHistoryIndexChange(keyCode);
    },
    [handleHistoryAddValue, handleHistoryIndexChange, isContainerFocused, nextSuggestionOpen]
  );

  const onHistoryLoad = useCallback(() => {
    const value = localStorage.getItem('hexViewer.history');
    const json = value !== null && value !== '' ? JSON.parse(value) : null;
    nextHistoryValues.current = Array.isArray(json) ? json : [];
    nextHistoryIndex.current = 0;

    if (nextHistoryShowLastValue.current)
      onSearchLoad(nextHistoryValues.current.length > 0 ? nextHistoryValues.current[nextHistoryIndex.current] : '');

    setIsLoaded(true);
  }, [onSearchLoad, setIsLoaded]);

  const onHistorySave = useCallback(
    () => localStorage.setItem('hexViewer.history', JSON.stringify(nextHistoryValues.current.slice(0, 10))),
    []
  );

  const onHistoryChange = useCallback(() => (inputChanged.current = true), []);

  return (
    <HistoryContext.Provider
      value={{
        nextHistoryShowLastValue,
        onHistoryChange,
        onHistoryKeyDown,
        onHistoryLoad,
        onHistorySave
      }}
    >
      {useMemo(() => children, [children])}
    </HistoryContext.Provider>
  );
};

export const HistoryProvider = React.memo(WrappedHistoryProvider);
export const useHistory = (): HistoryContextProps => useContext(HistoryContext) as HistoryContextProps;
