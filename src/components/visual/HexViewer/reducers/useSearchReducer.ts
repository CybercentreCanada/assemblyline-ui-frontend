import { useCallback } from 'react';
import {
  addPadToBytes,
  clampSelectedSearchIndex,
  countHexcode,
  executeSearchRegex,
  findSearchPattern,
  formatHexString,
  formatTextString,
  getSearchIndexes,
  getSelectedSearchIndexes,
  getTextExpression,
  isAction,
  isSearchType,
  nextSearchIndex,
  ReducerHandler,
  Reducers,
  renderArrayClass,
  RenderHandler,
  SearchType,
  Store,
  useCellStyles,
  UseReducer
} from '..';

export type SearchState = {
  search: {
    type: SearchType;
    inputValue: string;
    value: string;
    length: number;
    indexes: Array<number>;
    selectedIndex: number;
  };
};

export const useSearchReducer: UseReducer<SearchState> = () => {
  const classes = useCellStyles();

  const initialState: SearchState = {
    search: {
      type: 'text',
      inputValue: '',
      value: '',
      length: 0,
      indexes: [],
      selectedIndex: null
    }
  };

  const searchRender = useCallback(
    (prevStore: Store, nextStore: Store): void => {
      const prev = getSearchIndexes(prevStore);
      const next = getSearchIndexes(nextStore);
      renderArrayClass(prev, next, classes.search, nextStore.cellsRendered);
    },
    [classes]
  );

  const selectedSearchRender = useCallback(
    (prevStore: Store, nextStore: Store): void => {
      const prev = getSelectedSearchIndexes(prevStore);
      const next = getSelectedSearchIndexes(nextStore);
      renderArrayClass(prev, next, classes.selectedSearch, nextStore.cellsRendered);
    },
    [classes]
  );

  const handleSearchInputValueChange = useCallback((store: Store, inputValue: string): Store => {
    let value = inputValue,
      length = 0,
      indexes = [],
      selectedIndex = null;

    if (isSearchType.hex(store)) {
      value = formatHexString(inputValue);
      const expression = value;
      if (value !== null && value !== '') {
        length = countHexcode(value);
        indexes = findSearchPattern(store.hex.data, expression, length);
        selectedIndex = nextSearchIndex(indexes, store.cursor.index);
      }
    } else if (isSearchType.text(store)) {
      value = formatTextString(inputValue);
      if (inputValue !== null && inputValue !== '') {
        const expression: RegExp = getTextExpression(store, inputValue);
        length = addPadToBytes(store, inputValue).length;
        indexes = executeSearchRegex(store.hex.data, expression, length);
        selectedIndex = nextSearchIndex(indexes, store.cursor.index);
      }
    }

    return {
      ...store,
      search: {
        ...store.search,
        value: value,
        inputValue: inputValue,
        length: length,
        indexes: indexes,
        selectedIndex: selectedIndex
      }
    };
  }, []);

  const selectedSearchIndexChange: Reducers['selectedSearchIndexChange'] = useCallback((store, { index }) => {
    return { ...store, search: { ...store.search, selectedIndex: clampSelectedSearchIndex(store, index) } };
  }, []);

  const searchClear: Reducers['searchClear'] = useCallback(store => {
    return { ...store, search: { ...store.search, value: '', inputValue: '', indexes: [], selectedIndex: null } };
  }, []);

  const searchValueChange: Reducers['searchBarValueChange'] = useCallback(
    (store, { value }) => {
      if (value === null || value === '') return searchClear(store);
      else return handleSearchInputValueChange(store, value);
    },
    [handleSearchInputValueChange, searchClear]
  );

  const searchTypeChange: Reducers['searchTypeChange'] = useCallback(
    (store, { type }) => {
      const newStore = searchClear(store);
      return { ...newStore, search: { ...newStore.search, type } };
    },
    [searchClear]
  );

  const searchEnterKeyDown: Reducers['searchBarEnterKeyDown'] = useCallback(
    (store, { event }) => {
      if (event.shiftKey === undefined || event.shiftKey === null) return { ...store };
      else if (event.shiftKey) return selectedSearchIndexChange(store, { index: store.search.selectedIndex - 1 });
      else return selectedSearchIndexChange(store, { index: store.search.selectedIndex + 1 });
    },
    [selectedSearchIndexChange]
  );

  const searchEscapeKeyDown: Reducers['searchBarEscapeKeyDown'] = useCallback(
    (store, payload) => searchClear(store),
    [searchClear]
  );

  const searchWheel: Reducers['searchBarWheel'] = useCallback(
    (store, { event }) => {
      if (event.deltaY === undefined || event.deltaY === null) return { ...store };
      else if (event.deltaY > 0) return selectedSearchIndexChange(store, { index: store.search.selectedIndex + 1 });
      else return selectedSearchIndexChange(store, { index: store.search.selectedIndex - 1 });
    },
    [selectedSearchIndexChange]
  );

  const searchLocation: Reducers['appLocationInit'] = useCallback(
    store => {
      if (store.location.searchType === null) return { ...store };
      store = { ...store, search: { ...store.search, type: store.location.searchType } };
      if (store.location.searchValue === null) return { ...store };
      store = handleSearchInputValueChange(store, store.location.searchValue);
      if (store.location.searchIndex === null) return { ...store };
      store = selectedSearchIndexChange(store, { index: store.location.searchIndex });
      return { ...store };
    },
    [handleSearchInputValueChange, selectedSearchIndexChange]
  );

  const searchInputValueChange: Reducers['searchBarInputChange'] = useCallback(
    (store, { inputValue }) => {
      if (inputValue === null || inputValue === '') return searchClear(store);
      else return handleSearchInputValueChange(store, inputValue);
    },
    [handleSearchInputValueChange, searchClear]
  );

  const reducer: ReducerHandler = useCallback(
    ({ prevStore, store, action: { type, payload } }) => {
      if (isAction.selectedSearchIndexChange(type)) return selectedSearchIndexChange(store, payload);
      else if (isAction.searchClear(type)) return searchClear(store);
      else if (isAction.searchBarValueChange(type)) return searchValueChange(store, payload);
      else if (isAction.searchTypeChange(type)) return searchTypeChange(store, payload);
      else if (isAction.searchBarEnterKeyDown(type)) return searchEnterKeyDown(store, payload);
      else if (isAction.searchBarEscapeKeyDown(type)) return searchEscapeKeyDown(store, payload);
      else if (isAction.searchBarWheel(type)) return searchWheel(store, payload);
      else if (isAction.appLocationInit(type)) return searchLocation(store, payload);
      else if (prevStore.search.inputValue !== store.search.inputValue)
        return searchInputValueChange(store, { inputValue: store.search.inputValue });
      else return { ...store };
    },
    [
      searchClear,
      searchEnterKeyDown,
      searchEscapeKeyDown,
      searchInputValueChange,
      searchLocation,
      searchTypeChange,
      searchValueChange,
      searchWheel,
      selectedSearchIndexChange
    ]
  );

  const render: RenderHandler = useCallback(
    ({ prevStore, nextStore }) => {
      if (!Object.is(prevStore.search, nextStore.search)) {
        searchRender(prevStore, nextStore);
        selectedSearchRender(prevStore, nextStore);
      }
    },
    [searchRender, selectedSearchRender]
  );

  return { initialState, reducer, render };
};
