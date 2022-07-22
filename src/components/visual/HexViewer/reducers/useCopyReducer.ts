import useClipboard from 'commons/components/hooks/useClipboard';
import { useCallback, useMemo } from 'react';
import { isAction, isCell, ReducerHandler, Reducers, Store, toHexChar2, UseReducer } from '..';

export type CopyState = {};

export const useCopyReducer: UseReducer<CopyState> = () => {
  const { copy } = useClipboard();

  const initialState = useMemo<CopyState>(() => ({}), []);

  const copyHexCursor: (store: Store) => void = useCallback(
    store => copy(store.hex.codes.get(store.cursor.index)),
    [copy]
  );

  const copyTextCursor: (store: Store) => void = useCallback(
    store => copy(toHexChar2(store, store.hex.codes.get(store.cursor.index), true)),
    [copy]
  );

  const copyHexSelect: (store: Store) => void = useCallback(
    store => {
      let value = '';
      const array = Array.from(Array(store.select.endIndex - store.select.startIndex + 1).keys()).map(
        i => i + store.select.startIndex
      );
      array.forEach(index => {
        value += store.hex.codes.get(index) + ' ';
      });
      copy(value);
    },
    [copy]
  );

  const copyTextSelect: (store: Store) => void = useCallback(
    store => {
      let value = '';
      const array = Array.from(Array(store.select.endIndex - store.select.startIndex + 1).keys()).map(
        i => i + store.select.startIndex
      );
      array.forEach(index => {
        value += toHexChar2(store, store.hex.codes.get(index), true);
      });
      copy(value);
    },
    [copy]
  );

  const copyKeyDown: Reducers['copyKeyDown'] = useCallback(
    store => {
      if (store.cursor.index !== null && isCell.hex(store)) copyHexCursor(store);
      else if (store.cursor.index !== null && isCell.text(store)) copyTextCursor(store);
      else if (store.select.startIndex !== -1 && store.select.endIndex !== -1 && isCell.hex(store))
        copyHexSelect(store);
      else if (store.select.startIndex !== -1 && store.select.endIndex !== -1 && isCell.text(store))
        copyTextSelect(store);
      return { ...store };
    },
    [copyHexCursor, copyHexSelect, copyTextCursor, copyTextSelect]
  );

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type } }) => {
      if (isAction.copyKeyDown(type)) return copyKeyDown(store);
      else return { ...store };
    },
    [copyKeyDown]
  );

  return { initialState, reducer };
};
