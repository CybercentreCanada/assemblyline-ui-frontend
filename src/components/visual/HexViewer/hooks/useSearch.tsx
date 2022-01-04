import { isArrowDown, isArrowUp, isEnter, isEscape } from 'commons/addons/elements/utils/keyboard';
import { default as React, useCallback, useContext, useMemo, useRef } from 'react';
import { HexProps, useCursor, useHex, useLayout, useScroll, useStore, useStyles } from '..';

export type SearchContextProps = {
  nextSearchValue?: React.MutableRefObject<string>;
  nextSearchQuery?: React.MutableRefObject<{
    key?: string;
    value?: string;
    length?: number;
  }>;
  nextSearchIndexes?: React.MutableRefObject<number[]>;
  nextSearchIndex?: React.MutableRefObject<number>;
  onSearchValueChange?: (value: string) => void;
  onSearchClear?: () => void;
  onSearchLoad?: (value: string) => void;
  onSearchChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSearchInputChange?: (inputValue: string) => void;
  onSearchKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
  onSearchMouseDown?: (index: number) => void;
  onSearchClick?: (value: 'previous' | 'next') => void;
  onSearchIndexChange?: (index: number) => void;
};

export const SearchContext = React.createContext<SearchContextProps>(null);

export const WrappedSearchProvider = ({ children }: HexProps) => {
  const { setSearchValue, setSearchQuery, setSearchIndexes, setSearchIndex, setSearchHexIndex } = useStore();
  const { hexData } = useHex();
  const { nextLayoutColumns, nextLayoutRow } = useLayout();
  const { parseStringToHexString } = useHex();
  const { nextScrollIndex, onScrollToSearchIndex } = useScroll();
  const { nextCursorIndex } = useCursor();
  const {
    itemClasses,
    addContainerClassToRange,
    removeContainerClassToRange,
    addContainerClassToIndexArray,
    removeContainerClassToIndexArray
  } = useStyles();

  const nextSearchValue = useRef<string>('');
  const nextSearchQuery = useRef<{ key?: string; value?: string; length?: number }>({
    key: '',
    value: '',
    length: 0
  });
  const prevSearchQuery = useRef<{ key?: string; value?: string; length?: number }>({
    key: '',
    value: '',
    length: 0
  });
  const nextSearchIndexes = useRef<Array<number>>([]);
  const prevSearchIndexes = useRef<Array<number>>([]);

  const nextSearchIndex = useRef<number>(null);
  const prevSearchIndex = useRef<number>(null);
  const nextSearchHexIndex = useRef<number>(null);

  const handleAddSearchClass = useCallback(() => {
    const start: number = nextScrollIndex.current * nextLayoutColumns.current;
    const end: number = (nextScrollIndex.current + nextLayoutRow.current) * nextLayoutColumns.current;
    const indexes: Array<number> = nextSearchIndexes.current.filter(
      (index: number, i: number) => start <= index && index <= end && nextSearchIndex.current !== i
    );
    addContainerClassToIndexArray(indexes, nextSearchQuery.current.length, itemClasses.search);
  }, [addContainerClassToIndexArray, itemClasses.search, nextLayoutColumns, nextLayoutRow, nextScrollIndex]);

  const handleRemoveSearchClass = useCallback(() => {
    const start: number = nextScrollIndex.current * nextLayoutColumns.current;
    const end: number = (nextScrollIndex.current + nextLayoutRow.current) * nextLayoutColumns.current;
    const indexes: Array<number> = prevSearchIndexes.current.filter((index: number) => start <= index && index <= end);
    removeContainerClassToIndexArray(indexes, prevSearchQuery.current.length, itemClasses.search);
  }, [itemClasses.search, nextLayoutColumns, nextLayoutRow, nextScrollIndex, removeContainerClassToIndexArray]);

  const handleAddSelectedSearchClass = useCallback(() => {
    const start = nextSearchIndexes.current[nextSearchIndex.current];
    const end = nextSearchIndexes.current[nextSearchIndex.current] + nextSearchQuery.current.length - 1;
    removeContainerClassToRange(start, end, itemClasses.search);
    addContainerClassToRange(start, end, itemClasses.selectedSearch);
  }, [addContainerClassToRange, itemClasses.search, itemClasses.selectedSearch, removeContainerClassToRange]);

  const handleRemoveSelectedSearchClass = useCallback(() => {
    const start = prevSearchIndexes.current[prevSearchIndex.current];
    const end = prevSearchIndexes.current[prevSearchIndex.current] + prevSearchQuery.current.length - 1;
    removeContainerClassToRange(start, end, itemClasses.selectedSearch);
    addContainerClassToRange(start, end, itemClasses.search);
  }, [addContainerClassToRange, itemClasses.search, itemClasses.selectedSearch, removeContainerClassToRange]);

  const handleSearchQueryChange = useCallback((searchValue: string) => {
    let key = searchValue.substring(0, searchValue.indexOf(':'));
    let value = searchValue.substring(searchValue.indexOf(':') + 1);
    let firstChar = value.charAt(0);
    let lastChar = value.charAt(value.length - 1);
    value =
      (firstChar === '"' && lastChar === '"') ||
      (firstChar === "'" && lastChar === "'") ||
      (firstChar === '`' && lastChar === '`')
        ? value.substring(1, value.length - 1)
        : value;
    nextSearchQuery.current = { key: key, value: value };
  }, []);

  const getSearchPatternInTexts = useCallback((data: string, value: string) => {
    nextSearchQuery.current.length = Math.floor((value.length + 1) / 3);
    nextSearchIndexes.current = [];
    const regex = RegExp(value, 'g');
    while (regex.exec(data) !== null) nextSearchIndexes.current.push((regex.lastIndex - value.length) / 3);
  }, []);

  const getSearchPatternInHexes = useCallback((data: string, value: string) => {
    nextSearchQuery.current.length = Math.floor((value.length + 1) / 3);
    nextSearchIndexes.current = [];
    const regex = RegExp(value, 'g');
    while (regex.exec(data) !== null) nextSearchIndexes.current.push((regex.lastIndex - value.length) / 3);
  }, []);

  const handleSearchIndexesChange = useCallback(() => {
    const { key, value } = nextSearchQuery.current;
    if (!value || value === '') return [];

    if (key === '') getSearchPatternInTexts(hexData.current, parseStringToHexString(value));
    else if (key === 'texts') getSearchPatternInTexts(hexData.current, parseStringToHexString(value));
    else if (key === 'hexes') getSearchPatternInHexes(hexData.current, value.toLowerCase());
  }, [getSearchPatternInHexes, getSearchPatternInTexts, hexData, parseStringToHexString]);

  const getPreviousSearchIndex = useCallback(() => {
    if (!nextSearchIndexes.current || nextSearchIndexes.current.length === 0) return null;
    else if (!nextSearchHexIndex.current || nextSearchHexIndex.current < 0) return nextSearchIndexes.current.length - 1;
    else {
      let i = nextSearchIndexes.current.length - 1;
      while (i >= 0) {
        if (nextSearchIndexes.current[i] < nextSearchHexIndex.current) return i;
        i--;
      }
      return nextSearchIndexes.current.length - 1;
    }
  }, []);

  const getNextSearchIndex = useCallback(() => {
    if (!nextSearchIndexes.current || nextSearchIndexes.current.length === 0) return null;
    else if (!nextSearchHexIndex.current || nextSearchHexIndex.current < 0) return 0;
    else {
      let i = 0;
      while (i < nextSearchIndexes.current.length) {
        if (nextSearchIndexes.current[i] > nextSearchHexIndex.current) return i;
        i++;
      }
      return 0;
    }
  }, []);

  const handleSearchIndexChange = useCallback(
    (action: 'previous' | 'next') => {
      nextSearchIndex.current = action === 'previous' ? getPreviousSearchIndex() : getNextSearchIndex();
      nextSearchHexIndex.current = nextSearchIndexes.current[nextSearchIndex.current];
    },
    [getNextSearchIndex, getPreviousSearchIndex]
  );

  const handleSearchUpdate = useCallback(() => {
    prevSearchQuery.current = nextSearchQuery.current;
    prevSearchIndexes.current = nextSearchIndexes.current;
    prevSearchIndex.current = nextSearchIndex.current;
    setSearchValue(nextSearchValue.current);
    setSearchQuery(nextSearchQuery.current);
    setSearchIndexes(nextSearchIndexes.current);
    setSearchIndex(nextSearchIndex.current);
    setSearchHexIndex(nextSearchHexIndex.current);
  }, [setSearchHexIndex, setSearchIndex, setSearchIndexes, setSearchQuery, setSearchValue]);

  const handleSearchClear = useCallback(() => {
    nextSearchValue.current = '';
    nextSearchQuery.current = { key: '', value: '', length: 0 };
    nextSearchIndexes.current = [];
    nextSearchIndex.current = null;
    nextSearchHexIndex.current = 0;
    prevSearchQuery.current = { key: '', value: '', length: 0 };
    prevSearchIndexes.current = [];
    prevSearchIndex.current = null;

    setSearchValue('');
    setSearchQuery({ key: '', value: '', length: 0 });
    setSearchIndexes([]);
    setSearchIndex(null);
    setSearchHexIndex(null);
  }, [setSearchHexIndex, setSearchIndex, setSearchIndexes, setSearchQuery, setSearchValue]);

  const handleSearchKeyDown = useCallback(
    (searchIndex: 'previous' | 'next') => {
      handleSearchIndexChange(searchIndex);
      handleRemoveSelectedSearchClass();
      handleAddSelectedSearchClass();
      onScrollToSearchIndex(nextSearchIndexes.current[nextSearchIndex.current]);
      handleSearchUpdate();
    },
    [
      handleAddSelectedSearchClass,
      handleRemoveSelectedSearchClass,
      handleSearchIndexChange,
      handleSearchUpdate,
      onScrollToSearchIndex
    ]
  );

  const onSearchLoad = useCallback(
    (value: string) => {
      nextSearchValue.current = value;
      handleSearchQueryChange(value);
      handleSearchIndexesChange();
      nextSearchHexIndex.current = 0;
      handleSearchIndexChange('next');

      handleAddSelectedSearchClass();
      handleAddSearchClass();

      handleSearchUpdate();

      // query.set('query', filterValue.current);
      // history.push(`${location.pathname}?${query.toString()}`);
    },
    [
      handleAddSearchClass,
      handleAddSelectedSearchClass,
      handleSearchIndexChange,
      handleSearchIndexesChange,
      handleSearchQueryChange,
      handleSearchUpdate
    ]
  );

  const onSearchValueChange = useCallback(
    (value: string) => {
      nextSearchValue.current = value;
      handleSearchQueryChange(value);
      handleSearchIndexesChange();
      nextSearchHexIndex.current = nextCursorIndex.current;
      handleSearchIndexChange('next');

      handleRemoveSelectedSearchClass();
      handleAddSelectedSearchClass();
      handleRemoveSearchClass();
      handleAddSearchClass();

      handleSearchUpdate();

      // query.set('query', filterValue.current);
      // history.push(`${location.pathname}?${query.toString()}`);
    },
    [
      handleAddSearchClass,
      handleAddSelectedSearchClass,
      handleRemoveSearchClass,
      handleRemoveSelectedSearchClass,
      handleSearchIndexChange,
      handleSearchIndexesChange,
      handleSearchQueryChange,
      handleSearchUpdate,
      nextCursorIndex
    ]
  );

  const onSearchClear = useCallback(() => {
    handleRemoveSelectedSearchClass();
    handleRemoveSearchClass();
    handleSearchClear();
  }, [handleRemoveSearchClass, handleRemoveSelectedSearchClass, handleSearchClear]);

  const onSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const {
        target: { value: newSearchValue }
      } = event;

      if (newSearchValue === '') onSearchClear();
      else onSearchValueChange(newSearchValue);
    },
    [onSearchClear, onSearchValueChange]
  );

  const onSearchInputChange = useCallback(
    (inputValue: string) => {
      if (inputValue === '') onSearchClear();
      else onSearchValueChange(inputValue);
    },
    [onSearchClear, onSearchValueChange]
  );

  const onSearchClick = useCallback(
    (value: 'previous' | 'next') => {
      handleSearchIndexChange(value);
      handleRemoveSelectedSearchClass();
      handleAddSelectedSearchClass();
      onScrollToSearchIndex(nextSearchIndexes.current[nextSearchIndex.current]);
      handleSearchUpdate();
    },
    [
      handleAddSelectedSearchClass,
      handleRemoveSelectedSearchClass,
      handleSearchIndexChange,
      handleSearchUpdate,
      onScrollToSearchIndex
    ]
  );

  const onSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const { key: keyCode, shiftKey } = event;

      if (
        !nextSearchIndexes.current ||
        nextSearchIndexes.current.length === 0 ||
        (!isArrowDown(keyCode) && !isArrowUp(keyCode) && !isEnter(keyCode) && !isEscape(keyCode))
      )
        return;
      event.preventDefault();

      if (isEscape(keyCode)) onSearchClear();
      else if (isEnter(keyCode) && shiftKey) handleSearchKeyDown('previous');
      else if (isEnter(keyCode)) handleSearchKeyDown('next');
    },
    [handleSearchKeyDown, onSearchClear]
  );

  const onSearchMouseDown = useCallback(
    (index: number) => {
      nextSearchIndex.current = null;
      nextSearchHexIndex.current = index;

      handleRemoveSelectedSearchClass();
      handleAddSelectedSearchClass();
      handleRemoveSearchClass();
      handleAddSearchClass();

      handleSearchUpdate();
    },
    [
      handleAddSearchClass,
      handleAddSelectedSearchClass,
      handleRemoveSearchClass,
      handleRemoveSelectedSearchClass,
      handleSearchUpdate
    ]
  );

  const onSearchIndexChange = useCallback(
    (index: number) => {
      if (isNaN(index) || index < 1 || index > nextSearchIndexes.current.length) return;
      nextSearchIndex.current = index - 1;
      nextSearchHexIndex.current = nextSearchIndexes.current[nextSearchIndex.current];

      // handleRemoveSelectedSearchClass();
      // handleAddSelectedSearchClass();
      // handleRemoveSearchClass();
      // handleAddSearchClass();
      handleRemoveSelectedSearchClass();
      handleAddSelectedSearchClass();
      onScrollToSearchIndex(nextSearchIndexes.current[nextSearchIndex.current]);
      handleSearchUpdate();
    },
    [handleAddSelectedSearchClass, handleRemoveSelectedSearchClass, handleSearchUpdate, onScrollToSearchIndex]
  );

  return (
    <SearchContext.Provider
      value={{
        nextSearchValue,
        nextSearchQuery,
        nextSearchIndexes,
        nextSearchIndex,
        onSearchChange,
        onSearchLoad,
        onSearchClick,
        onSearchKeyDown,
        onSearchMouseDown,
        onSearchValueChange,
        onSearchIndexChange,
        onSearchInputChange,
        onSearchClear
      }}
    >
      {useMemo(() => children, [children])}
    </SearchContext.Provider>
  );
};

export const SearchProvider = React.memo(WrappedSearchProvider);
export const useSearch = (): SearchContextProps => useContext(SearchContext) as SearchContextProps;
