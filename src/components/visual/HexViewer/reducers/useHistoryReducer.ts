import { isArrowDown, isArrowUp } from 'commons/addons/elements/utils/keyboard';
import { useCallback, useMemo } from 'react';
import { ActionProps, isAction, ReducerHandler, Reducers, SearchType, Store, UseReducer } from '..';

export type HistoryType = {
  type: SearchType;
  value: string | number;
};

export type HistoryState = {
  history: {
    values: Array<HistoryType>;
    index: number;
    maxSize: number;
    storageKey: string;
  };
};

export const useHistoryReducer: UseReducer<HistoryState> = () => {
  const initialState = useMemo<HistoryState>(
    () => ({
      history: {
        values: [],
        index: 0,
        maxSize: 10,
        storageKey: 'hexViewer.history'
      }
    }),
    []
  );

  const historyLoad: Reducers['appLoad'] = useCallback((store, { data }) => {
    const value = localStorage.getItem(store.history.storageKey);
    const json = JSON.parse(value) as HistoryType[];

    if (value === null || value === '' || !Array.isArray(json)) {
      return { ...store, history: { ...store.history, values: [], index: 0 } };
    } else {
      return {
        ...store,
        history: {
          ...store.history,
          values: [
            { type: store.search.type, value: '' },
            ...json.filter(e => e.value !== null && e.value !== undefined && e.value !== '')
          ],
          index: 0
        }
      };
    }
  }, []);

  const historySave: Reducers['appSave'] = useCallback((store, payload) => {
    localStorage.setItem(
      store.history.storageKey,
      JSON.stringify(
        store.history.values.filter(v => v.value !== null && v.value !== '' && v.value !== undefined).slice(0, 10)
      )
    );
    return { ...store };
  }, []);

  const historyAddValue: Reducers['searchBarEnterKeyDown'] = useCallback((store, { event }) => {
    const { value: inputValue } = event.target;
    const {
      cursor: { index: cursorIndex },
      search: { type: searchType },
      history: { values: historyValues }
    } = store;

    if (
      inputValue === null ||
      inputValue === '' ||
      historyValues.findIndex(h => h.type === searchType && h.value === inputValue) !== -1
    ) {
      return { ...store };
    } else if (searchType === 'cursor') {
      return {
        ...store,
        history: {
          ...store.history,
          index: 1,
          values: [
            { type: store.search.type, value: '' },
            ...[{ type: searchType, value: cursorIndex }, ...store.history.values]
              .filter(v => v.value !== null && v.value !== '' && v.value !== undefined)
              .slice(0, store.history.maxSize)
          ]
        }
      };
    } else if (searchType === 'hex' || searchType === 'text') {
      return {
        ...store,
        history: {
          ...store.history,
          index: 1,
          values: [
            { type: store.search.type, value: '' },
            ...[{ type: searchType, value: inputValue }, ...store.history.values]
              .filter(v => v.value !== null && v.value !== '' && v.value !== undefined)
              .slice(0, store.history.maxSize)
          ]
        }
      };
    } else {
      return { ...store };
    }
  }, []);

  const historyIndexChange: Reducers['searchBarArrowKeyDown'] = useCallback((store, { event }) => {
    const { key: keyCode } = event;

    let newHistoryIndex = store.history.index;
    if (isArrowUp(keyCode)) newHistoryIndex += 1;
    else if (isArrowDown(keyCode)) newHistoryIndex -= 1;
    newHistoryIndex = Math.min(Math.max(newHistoryIndex, 0), store.history.values.length - 1);

    const newType = store.history.values[newHistoryIndex].type;
    const newValue = store.history.values[newHistoryIndex].value;

    if (newType === 'cursor') {
      return {
        ...store,
        cursor: { index: newValue as number },
        search: { ...store.search, type: newType, inputValue: '', value: '' },
        history: { ...store.history, index: newHistoryIndex }
      };
    } else if (newType === 'hex' || newType === 'text') {
      return {
        ...store,
        search: { ...store.search, type: newType, inputValue: newValue as string },
        history: { ...store.history, index: newHistoryIndex }
      };
    } else {
      return { ...store };
    }
  }, []);

  const historyEscapeKeyDown: Reducers['searchBarEscapeKeyDown'] = useCallback((store, { event }) => {
    return { ...store, history: { ...store.history, index: 0 } };
  }, []);

  const historyTypeChange: Reducers['searchTypeChange'] = useCallback((store, { type }) => {
    const {
      cursor: { index: cursorIndex },
      search: { type: searchType, inputValue },
      history: { values: historyValues }
    } = store;

    if (
      inputValue === null ||
      inputValue === '' ||
      historyValues.findIndex(h => h.type === searchType && h.value === inputValue) !== -1
    ) {
      return { ...store, history: { ...store.history, index: 0 } };
    } else if (searchType === 'cursor') {
      return {
        ...store,
        history: {
          ...store.history,
          index: 0,
          values: [
            { type: store.search.type, value: '' },
            ...[{ type: searchType, value: cursorIndex }, ...store.history.values]
              .filter(v => v.value !== null && v.value !== '' && v.value !== undefined)
              .slice(0, store.history.maxSize)
          ]
        }
      };
    } else if (searchType === 'hex' || searchType === 'text') {
      return {
        ...store,
        history: {
          ...store.history,
          index: 0,
          values: [
            { type: store.search.type, value: '' },
            ...[{ type: searchType, value: inputValue }, ...store.history.values]
              .filter(v => v.value !== null && v.value !== '' && v.value !== undefined)
              .slice(0, store.history.maxSize)
          ]
        }
      };
    } else {
      return { ...store };
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const historyClear = useCallback((store: Store, { type, payload }: ActionProps): Store => {
    return { ...store, history: { ...store.history, index: 0, values: [{ type: store.search.type, value: '' }] } };
  }, []);

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.appLoad(type)) return historyLoad(store, payload);
      else if (isAction.appSave(type)) return historySave(store, payload);
      else if (isAction.searchBarEnterKeyDown(type)) return historyAddValue(store, payload);
      else if (isAction.searchBarArrowKeyDown(type)) return historyIndexChange(store, payload);
      else if (isAction.searchBarEscapeKeyDown(type)) return historyEscapeKeyDown(store, payload);
      else if (isAction.searchTypeChange(type)) return historyTypeChange(store, payload);
      else return { ...store };
    },
    [historyAddValue, historyEscapeKeyDown, historyIndexChange, historyLoad, historySave, historyTypeChange]
  );

  return { initialState, reducer };
};
