import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useLayout, useSearch, useStore } from '..';

export type SuggestionType = {
  label: string;
  value: string;
};

export type SuggestionContextProps = {
  nextSuggestionOpen?: React.MutableRefObject<boolean>;
  suggestionLabels?: React.MutableRefObject<string[]>;
  suggestionValues?: React.MutableRefObject<string[]>;
  onSuggestionFocus?: () => void;
  onSuggestionBlur?: () => void;
  onSuggestionChange?: (value: string | null) => void;
  onSuggestionInputChange?: (inputValue: string | null) => void;
};

export const SuggestionContext = React.createContext<SuggestionContextProps>(null);

export const WrappedSuggestionProvider = ({ children }: HexProps) => {
  const { nextLayoutColumns } = useLayout();
  const { setSuggestionOpen } = useStore();
  const { nextSearchValue, onSearchValueChange } = useSearch();

  const nextSuggestionOpen = useRef<boolean>(false);
  const suggestionLabels = useRef<Array<string>>([
    'hexes (Search in hexadecimal values)',
    'texts (Search in texts values)'
  ]);
  const suggestionValues = useRef<Array<string>>(['hexes:', 'texts:']);

  const handleSuggestionLabelsIndex = useCallback((value: string) => {
    let i = 0;
    while (i < suggestionLabels.current.length) {
      if (suggestionLabels.current[i].includes(value)) return i;
      i++;
    }
    return -1;
  }, []);

  const handleSuggestionOpen = useCallback(
    (value: string) => {
      if (handleSuggestionLabelsIndex(value) >= 0 && nextLayoutColumns.current > 8) nextSuggestionOpen.current = true;
      else nextSuggestionOpen.current = false;
      setSuggestionOpen(nextSuggestionOpen.current);
    },
    [handleSuggestionLabelsIndex, nextLayoutColumns, setSuggestionOpen]
  );

  const onSuggestionFocus = useCallback(() => {
    handleSuggestionOpen(nextSearchValue.current);
  }, [handleSuggestionOpen, nextSearchValue]);

  const onSuggestionBlur = useCallback(() => {
    nextSuggestionOpen.current = false;
    setSuggestionOpen(nextSuggestionOpen.current);
  }, [setSuggestionOpen]);

  const onSuggestionChange = useCallback(
    (value: string | null) => {
      const index = handleSuggestionLabelsIndex(value);
      if (index >= 0) {
        onSearchValueChange(suggestionValues.current[index]);
        nextSuggestionOpen.current = false;
        setSuggestionOpen(nextSuggestionOpen.current);
      }
    },
    [handleSuggestionLabelsIndex, onSearchValueChange, setSuggestionOpen]
  );

  const onSuggestionInputChange = useCallback(
    (inputValue: string | null) => {
      handleSuggestionOpen(inputValue);
    },
    [handleSuggestionOpen]
  );

  return (
    <SuggestionContext.Provider
      value={{
        nextSuggestionOpen,
        suggestionLabels,
        suggestionValues,
        onSuggestionFocus,
        onSuggestionBlur,
        onSuggestionChange,
        onSuggestionInputChange
      }}
    >
      {useMemo(() => children, [children])}
    </SuggestionContext.Provider>
  );
};

export const SuggestionProvider = React.memo(WrappedSuggestionProvider);
export const useSuggestion = (): SuggestionContextProps => useContext(SuggestionContext) as SuggestionContextProps;
