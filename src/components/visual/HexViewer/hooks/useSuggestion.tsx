import { isEscape } from 'commons/addons/elements/utils/keyboard';
import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useLayout, useSearch, useStore } from '..';

export type SuggestionType = {
  label: string;
  value: string;
};

export type SuggestionContextProps = {
  nextSuggestionOpen?: React.MutableRefObject<boolean>;
  nextSuggestionLabels?: React.MutableRefObject<string[]>;
  suggestionValues?: React.MutableRefObject<string[]>;
  onSuggestionFocus?: () => void;
  onSuggestionBlur?: () => void;
  onSuggestionChange?: (value: string | null) => void;
  onSuggestionInputChange?: (inputValue: string | null) => void;
  onSuggestionKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
  onSuggestionLanguageChange?: (language: string) => void;
};

export const SuggestionContext = React.createContext<SuggestionContextProps>(null);

export const WrappedSuggestionProvider = ({ children }: HexProps) => {
  const { nextLayoutColumns, isContainerFocused } = useLayout();
  const { setSuggestionOpen, setSuggestionLabels } = useStore();
  const { nextSearchValue, onSearchValueChange } = useSearch();

  const nextSuggestionOpen = useRef<boolean>(false);
  const nextSuggestionLabels = useRef<Array<string>>([
    'hex (Search using hexadecimal values)',
    'text (Search using ASCII values)'
  ]);
  const suggestionValues = useRef<Array<string>>(['hex:', 'text:']);
  const suggestionTranslations = useMemo<{
    en: Array<string>;
    fr: Array<string>;
  }>(
    () => ({
      en: ['hex (Search using hexadecimal values)', 'text (Search using ASCII values)'],
      fr: ['hex (Recherche utilisant des valeurs hexadécimales)', 'text (Recherche utilisant des valeurs ASCII)']
    }),
    []
  );

  const handleSuggestionLabelsIndex = useCallback((value: string) => {
    let i = 0;
    while (i < nextSuggestionLabels.current.length) {
      if (nextSuggestionLabels.current[i].includes(value)) return i;
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
    nextSuggestionOpen.current = true;
    handleSuggestionOpen(nextSearchValue.current);
  }, [handleSuggestionOpen, nextSearchValue]);

  const onSuggestionBlur = useCallback(() => {
    nextSuggestionOpen.current = false;
    setSuggestionOpen(false);
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

  const onSuggestionKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const { key: keyCode } = event;

      if (isContainerFocused.current || !isEscape(keyCode)) return;
      event.preventDefault();

      if (isEscape(keyCode)) onSuggestionBlur();
    },
    [isContainerFocused, onSuggestionBlur]
  );

  const onSuggestionLanguageChange = useCallback(
    (language: string) => {
      if (language === 'en') {
        nextSuggestionLabels.current = suggestionTranslations.en;
        setSuggestionLabels(suggestionTranslations.en);
      } else if (language === 'fr') {
        nextSuggestionLabels.current = suggestionTranslations.fr;
        setSuggestionLabels(suggestionTranslations.fr);
      }
    },
    [setSuggestionLabels, suggestionTranslations.en, suggestionTranslations.fr]
  );

  return (
    <SuggestionContext.Provider
      value={{
        nextSuggestionOpen,
        nextSuggestionLabels,
        suggestionValues,
        onSuggestionFocus,
        onSuggestionBlur,
        onSuggestionChange,
        onSuggestionInputChange,
        onSuggestionKeyDown,
        onSuggestionLanguageChange
      }}
    >
      {useMemo(() => children, [children])}
    </SuggestionContext.Provider>
  );
};

export const SuggestionProvider = React.memo(WrappedSuggestionProvider);
export const useSuggestion = (): SuggestionContextProps => useContext(SuggestionContext) as SuggestionContextProps;
