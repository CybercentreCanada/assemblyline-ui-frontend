import { useCallback } from 'react';
import {
  ActionProps,
  clampSelectedSearchIndex,
  countHexcode,
  findSearchPattern,
  formatHexString,
  formatTextString,
  getSearchIndexes,
  getSelectedSearchIndexes,
  isAction,
  isSearchType,
  nextSearchIndex,
  ReducerProps,
  renderArrayClass,
  RenderProps,
  SearchType,
  Store,
  useCellStyles
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

export const useSearchReducer = () => {
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

    if (isSearchType.hex(store)) value = formatHexString(inputValue);
    else if (isSearchType.text(store)) value = formatTextString(inputValue);

    if (value !== null && value !== '') {
      length = countHexcode(value);
      indexes = findSearchPattern(store.hex.data, value);
      selectedIndex = nextSearchIndex(indexes, store.cursor.index);
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

  const searchClear = useCallback((store: Store): Store => {
    return { ...store, search: { ...store.search, value: '', inputValue: '', indexes: [], selectedIndex: null } };
  }, []);

  const searchTypeChange = useCallback(
    (store: Store, { type, payload }: ActionProps): Store => {
      const newStore = searchClear(store);
      return { ...newStore, search: { ...newStore.search, type: payload.type } };
    },
    [searchClear]
  );

  const searchInputValueChange = useCallback(
    (store: Store, { type, payload: { inputValue } }: ActionProps): Store => {
      if (inputValue === null || inputValue === '') return searchClear(store);
      else return handleSearchInputValueChange(store, inputValue);
    },
    [handleSearchInputValueChange, searchClear]
  );

  const selectedSearchIndexChange = useCallback((store: Store, index: number): Store => {
    return { ...store, search: { ...store.search, selectedIndex: clampSelectedSearchIndex(store, index) } };
  }, []);

  const searchEnterKeyDown = useCallback(
    (store: Store, { type, payload }: ActionProps): Store => {
      if (payload.event.shiftKey === undefined || payload.event.shiftKey === null) return { ...store };
      else if (payload.event.shiftKey) return selectedSearchIndexChange(store, store.search.selectedIndex - 1);
      else return selectedSearchIndexChange(store, store.search.selectedIndex + 1);
    },
    [selectedSearchIndexChange]
  );

  const searchWheel = useCallback(
    (store: Store, { type, payload }: ActionProps): Store => {
      if (payload.event.deltaY === undefined || payload.event.deltaY === null) return { ...store };
      else if (payload.event.deltaY > 0) return selectedSearchIndexChange(store, store.search.selectedIndex + 1);
      else return selectedSearchIndexChange(store, store.search.selectedIndex - 1);
    },
    [selectedSearchIndexChange]
  );

  const searchLocation = useCallback(
    (store: Store, { type, payload }: ActionProps): Store => {
      if (store.location.searchType === null) return { ...store };
      store = { ...store, search: { ...store.search, type: store.location.searchType } };
      if (store.location.searchValue === null) return { ...store };
      store = handleSearchInputValueChange(store, store.location.searchValue);
      if (store.location.searchIndex === null) return { ...store };
      store = selectedSearchIndexChange(store, store.location.searchIndex);
      return { ...store };
    },
    [handleSearchInputValueChange, selectedSearchIndexChange]
  );

  const reducer = useCallback(
    ({ prevStore, store, action }: ReducerProps): Store => {
      if (isAction.searchBarValueChange(action)) return searchInputValueChange(store, action);
      else if (isAction.searchTypeChange(action)) return searchTypeChange(store, action);
      else if (isAction.searchBarEnterKeyDown(action)) return searchEnterKeyDown(store, action);
      else if (isAction.searchBarEscapeKeyDown(action)) return searchClear(store);
      else if (isAction.searchClear(action)) return searchClear(store);
      else if (isAction.selectedSearchIndexChange(action))
        return selectedSearchIndexChange(store, action.payload.index);
      else if (isAction.searchBarWheel(action)) return searchWheel(store, action);
      else if (prevStore.search.inputValue !== store.search.inputValue)
        return searchInputValueChange(store, {
          type: action.type,
          payload: { inputValue: store.search.inputValue }
        });
      else if (isAction.appLocationInit(action)) return searchLocation(store, action);
      else return { ...store };
    },
    [
      searchClear,
      searchEnterKeyDown,
      searchInputValueChange,
      searchLocation,
      searchTypeChange,
      searchWheel,
      selectedSearchIndexChange
    ]
  );

  const render = useCallback(
    ({ prevStore, nextStore }: RenderProps): void => {
      if (!Object.is(prevStore.search, nextStore.search)) {
        searchRender(prevStore, nextStore);
        selectedSearchRender(prevStore, nextStore);
      }
    },
    [searchRender, selectedSearchRender]
  );

  return { initialState, reducer, render };
};
