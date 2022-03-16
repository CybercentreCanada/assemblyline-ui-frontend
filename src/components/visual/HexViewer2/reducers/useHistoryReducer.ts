import { isArrowDown, isArrowUp } from 'commons/addons/elements/utils/keyboard';
import { useCallback, useMemo } from 'react';
import { ActionProps, isAction, ReducerProps, SearchType, Store, StoreRef } from '..';

export type HistoryType = {
  type: SearchType;
  value: string | number;
};

export type HistoryState = {
  history: {
    values: Array<HistoryType>;
    index: number;
    maxSize: number;
  };
};

export type HistoryRef = {
  history: {
    storageKey: string;
  };
};

export type HistoryPayload = {};

export const useHistoryReducer = () => {
  const initialState = useMemo<HistoryState>(
    () => ({
      history: {
        values: [],
        index: 0,
        maxSize: 10
      }
    }),
    []
  );

  const initialRef = useMemo<HistoryRef>(
    () => ({
      history: {
        storageKey: 'hexViewer.history'
      }
    }),
    []
  );

  const historyLoad = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    const value = localStorage.getItem(refs.current.history.storageKey);
    const json = JSON.parse(value) as HistoryType[];

    if (value === null || value === '' || !Array.isArray(json)) {
      return { ...store, history: { ...store.history, values: [], index: 0 } };
    } else {
      return {
        ...store,
        history: {
          ...store.history,
          values: [...json],
          index: 0
        }
      };
    }
  }, []);

  const historySave = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    localStorage.setItem(
      refs.current.history.storageKey,
      JSON.stringify(
        store.history.values.filter(v => v.value !== null && v.value !== '' && v.value !== undefined).slice(0, 10)
      )
    );
    return { ...store };
  }, []);

  const historyAddValue = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    const { value: inputValue } = payload.event.target;
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

  const historyIndexChange = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    const { key: keyCode } = payload.event;

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

  const historyReset = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    return { ...store, history: { ...store.history, index: 0 } };
  }, []);

  const historyClear = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    return { ...store, history: { ...store.history, index: 0, values: [{ type: store.search.type, value: '' }] } };
  }, []);

  const reducer = useCallback(
    ({ prevStore, nextStore, refs, action }: ReducerProps): Store => {
      if (isAction.appLoad(action)) return historyLoad(nextStore, refs, action);
      else if (isAction.appSave(action)) return historySave(nextStore, refs, action);
      else if (isAction.searchBarEnterKeyDown(action)) return historyAddValue(nextStore, refs, action);
      else if (isAction.searchBarArrowKeyDown(action)) return historyIndexChange(nextStore, refs, action);
      else if (isAction.searchBarEscapeKeyDown(action)) return historyReset(nextStore, refs, action);
      else if (isAction.searchTypeChange(action)) return historyReset(nextStore, refs, action);
      else return { ...nextStore };
    },
    [historyAddValue, historyIndexChange, historyLoad, historyReset, historySave]
  );

  return { initialState, initialRef, reducer };
};
