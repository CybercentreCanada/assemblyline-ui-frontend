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
  StoreRef,
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

export type SearchRef = {};

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

  const initialRef: SearchRef = {};

  const searchRender = useCallback(
    (prevStore: Store, nextStore: Store, refs: StoreRef): void => {
      const prev = getSearchIndexes(prevStore, refs);
      const next = getSearchIndexes(nextStore, refs);
      renderArrayClass(prev, next, classes.search, nextStore.cellsRendered);
    },
    [classes]
  );

  const selectedSearchRender = useCallback(
    (prevStore: Store, nextStore: Store, refs: StoreRef): void => {
      const prev = getSelectedSearchIndexes(prevStore, refs);
      const next = getSelectedSearchIndexes(nextStore, refs);
      renderArrayClass(prev, next, classes.selectedSearch, nextStore.cellsRendered);
    },
    [classes]
  );

  const handleSearchInputValueChange = useCallback((store: Store, refs: StoreRef, inputValue: string): Store => {
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

  const searchClear = useCallback((store: Store, refs: StoreRef): Store => {
    return { ...store, search: { ...store.search, value: '', inputValue: '', indexes: [], selectedIndex: null } };
  }, []);

  const searchTypeChange = useCallback(
    (store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
      const newStore = searchClear(store, refs);
      return { ...newStore, search: { ...newStore.search, type: payload.type } };
    },
    [searchClear]
  );

  const searchInputValueChange = useCallback(
    (store: Store, refs: StoreRef, { type, payload: { inputValue } }: ActionProps): Store => {
      if (inputValue === null || inputValue === '') return searchClear(store, refs);
      else return handleSearchInputValueChange(store, refs, inputValue);
    },
    [handleSearchInputValueChange, searchClear]
  );

  const selectedSearchIndexChange = useCallback((store: Store, refs: StoreRef, index: number): Store => {
    return { ...store, search: { ...store.search, selectedIndex: clampSelectedSearchIndex(store, index) } };
  }, []);

  const searchEnterKeyDown = useCallback(
    (store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
      if (payload.event.shiftKey === undefined || payload.event.shiftKey === null) return { ...store };
      else if (payload.event.shiftKey) return selectedSearchIndexChange(store, refs, store.search.selectedIndex - 1);
      else return selectedSearchIndexChange(store, refs, store.search.selectedIndex + 1);
    },
    [selectedSearchIndexChange]
  );

  const searchWheel = useCallback(
    (store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
      if (payload.event.deltaY === undefined || payload.event.deltaY === null) return { ...store };
      else if (payload.event.deltaY > 0) return selectedSearchIndexChange(store, refs, store.search.selectedIndex + 1);
      else return selectedSearchIndexChange(store, refs, store.search.selectedIndex - 1);
    },
    [selectedSearchIndexChange]
  );

  const searchLocation = useCallback(
    (store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
      if (store.location.searchType === null) return { ...store };
      store = { ...store, search: { ...store.search, type: store.location.searchType } };
      if (store.location.searchValue === null) return { ...store };
      store = handleSearchInputValueChange(store, refs, store.location.searchValue);
      if (store.location.searchIndex === null) return { ...store };
      store = selectedSearchIndexChange(store, refs, store.location.searchIndex);
      return { ...store };
    },
    [handleSearchInputValueChange, selectedSearchIndexChange]
  );

  const reducer = useCallback(
    ({ prevStore, nextStore, refs, action }: ReducerProps): Store => {
      if (isAction.searchBarValueChange(action)) return searchInputValueChange(nextStore, refs, action);
      else if (isAction.searchTypeChange(action)) return searchTypeChange(nextStore, refs, action);
      else if (isAction.searchBarEnterKeyDown(action)) return searchEnterKeyDown(nextStore, refs, action);
      else if (isAction.searchBarEscapeKeyDown(action)) return searchClear(nextStore, refs);
      else if (isAction.searchClear(action)) return searchClear(nextStore, refs);
      else if (isAction.selectedSearchIndexChange(action))
        return selectedSearchIndexChange(nextStore, refs, action.payload.index);
      else if (isAction.searchBarWheel(action)) return searchWheel(nextStore, refs, action);
      else if (prevStore.search.inputValue !== nextStore.search.inputValue)
        return searchInputValueChange(nextStore, refs, {
          type: action.type,
          payload: { inputValue: nextStore.search.inputValue }
        });
      else if (isAction.appLocationInit(action)) return searchLocation(nextStore, refs, action);
      else return { ...nextStore };
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
    ({ prevStore, nextStore, refs }: RenderProps): void => {
      if (!Object.is(prevStore.search, nextStore.search)) {
        searchRender(prevStore, nextStore, refs);
        selectedSearchRender(prevStore, nextStore, refs);
      }
    },
    [searchRender, selectedSearchRender]
  );

  return { initialState, initialRef, reducer, render };
};
