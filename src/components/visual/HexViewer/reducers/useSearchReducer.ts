import { useCallback } from 'react';
import {
  addPadToBytes,
  clampSelectedSearchIndex,
  countHexcode,
  DEFAULT_STORE,
  executeSearchHexRegex,
  executeSearchTextRegex,
  formatHexString,
  get16BitsDirectTextExpression,
  get8BitsDirectTextExpression,
  getSearchResultsIndexes,
  getSelectedSearchResultIndexes,
  getWideTextExpression,
  isAction,
  isType,
  nextSearchIndex,
  ReducerHandler,
  Reducers,
  renderArrayClass,
  RenderHandler,
  SEARCH_STATE,
  setStore,
  setStoreWithKeys,
  Store,
  useCellStyles,
  UseReducer
} from '..';

export const useSearchReducer: UseReducer = () => {
  const classes = useCellStyles();

  const searchRender = useCallback(
    (prevStore: Store, nextStore: Store): void => {
      const prev = getSearchResultsIndexes(prevStore);
      const next = getSearchResultsIndexes(nextStore);
      renderArrayClass(prev, next, classes.search, nextStore.cellsRendered);
    },
    [classes]
  );

  const selectedSearchRender = useCallback(
    (prevStore: Store, nextStore: Store): void => {
      const prev = getSelectedSearchResultIndexes(prevStore);
      const next = getSelectedSearchResultIndexes(nextStore);
      renderArrayClass(prev, next, classes.selectedSearch, nextStore.cellsRendered);
    },
    [classes]
  );

  const handleSearchInputValueChange = useCallback((store: Store, inputValue: string): Store => {
    let value = inputValue,
      length = 0;

    let results: Array<{ index: number; length: number }> = [];
    let selectedResult = null;

    if (isType.search.mode.type(store, 'hex')) {
      const expression = formatHexString(inputValue);
      if (expression !== null && expression !== '') {
        length = countHexcode(expression);
        results = executeSearchHexRegex(store.hex.data, expression, length);
        selectedResult = nextSearchIndex(results, store.cursor.index);
      }
    } else if (isType.search.mode.type(store, 'text')) {
      if (isType.search.mode.encoding(store, '8Bits') || isType.search.mode.encoding(store, 'both')) {
        if (isType.search.mode.textSpan(store, 'direct')) {
          const expression = get8BitsDirectTextExpression(inputValue);
          results = [...results, ...executeSearchTextRegex(store.hex.data, expression, inputValue.length)];
        } else {
          const expression = getWideTextExpression(store, inputValue);
          results = [...results, ...executeSearchTextRegex(store.hex.data, expression, inputValue.length)];
        }
      }
      if (isType.search.mode.encoding(store, '16Bits') || isType.search.mode.encoding(store, 'both')) {
        if (isType.search.mode.textSpan(store, 'direct')) {
          const expression = get16BitsDirectTextExpression(inputValue);
          results = [...results, ...executeSearchTextRegex(store.hex.data, expression, inputValue.length * 2)];
        } else {
          value = addPadToBytes(store, inputValue, 4);
          const expression = getWideTextExpression(store, value);
          results = [...results, ...executeSearchTextRegex(store.hex.data, expression, inputValue.length * 2)];
        }
      }
      results = results.sort((a, b) => a.index - b.index);
      selectedResult = nextSearchIndex(results, store.cursor.index);
    }
    return { ...store, search: { ...store.search, inputValue, results, selectedResult } };
  }, []);

  const selectedSearchIndexChange: Reducers['selectedSearchIndexChange'] = useCallback((store, { index }) => {
    return { ...store, search: { ...store.search, selectedResult: clampSelectedSearchIndex(store, index) } };
  }, []);

  const searchClear: Reducers['searchClear'] = useCallback(store => {
    return { ...store, search: { ...store.search, inputValue: '', results: [], selectedResult: null } };
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
      return { ...newStore, search: { ...newStore.search, mode: { ...newStore.search.mode, type } } };
    },
    [searchClear]
  );

  const searchEnterKeyDown: Reducers['searchBarEnterKeyDown'] = useCallback(
    (store, { event }) => {
      if (event.shiftKey === undefined || event.shiftKey === null) return { ...store };
      else if (event.shiftKey) return selectedSearchIndexChange(store, { index: store.search.selectedResult - 1 });
      else return selectedSearchIndexChange(store, { index: store.search.selectedResult + 1 });
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
      else if (event.deltaY > 0) return selectedSearchIndexChange(store, { index: store.search.selectedResult + 1 });
      else return selectedSearchIndexChange(store, { index: store.search.selectedResult - 1 });
    },
    [selectedSearchIndexChange]
  );

  const locationLoad: Reducers['locationLoad'] = useCallback(
    store => {
      let newStore = { ...store };
      if (store.location.search.mode.type === null) return newStore;
      newStore = setStore.store.search.mode.Type(newStore, store.location.search.mode.type);
      if (DEFAULT_STORE.search.inputValue === store.location.search.inputValue) return newStore;
      newStore = handleSearchInputValueChange(newStore, store.location.search.inputValue);
      if (DEFAULT_STORE.search.selectedResult === store.location.search.selectedResult) return newStore;
      newStore = selectedSearchIndexChange(newStore, { index: store.location.search.selectedResult });
      return newStore;
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

  const settingLoad: Reducers['settingLoad'] = useCallback(
    store => setStore.store.search.Mode(store, store.setting.storage.data?.search?.mode),
    []
  );

  const settingOpen: Reducers['settingOpen'] = useCallback(
    store => setStoreWithKeys.store.setting.search.Mode(store, store.search.mode, ['encoding', 'textSpan']),
    []
  );

  const settingSave: Reducers['settingSave'] = useCallback(
    store => setStoreWithKeys.store.search.Mode(store, store.setting.search.mode, ['encoding', 'textSpan']),
    []
  );

  const settingReset: Reducers['settingReset'] = useCallback(
    store => setStoreWithKeys.store.setting.search.Mode(store, SEARCH_STATE.search.mode, ['encoding', 'textSpan']),
    []
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
      else if (isAction.locationLoad(type)) return locationLoad(store, payload);
      else if (isAction.settingLoad(type)) return settingLoad(store, payload);
      else if (isAction.settingOpen(type)) return settingOpen(store, payload);
      else if (isAction.settingSave(type)) return settingSave(store, payload);
      else if (isAction.settingReset(type)) return settingReset(store, payload);
      else if (prevStore.search.inputValue !== store.search.inputValue)
        return searchInputValueChange(store, { inputValue: store.search.inputValue });
      else return { ...store };
    },
    [
      searchClear,
      searchEnterKeyDown,
      searchEscapeKeyDown,
      searchInputValueChange,
      locationLoad,
      searchTypeChange,
      searchValueChange,
      searchWheel,
      selectedSearchIndexChange,
      settingLoad,
      settingOpen,
      settingReset,
      settingSave
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

  return { reducer, render };
};
