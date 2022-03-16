import useClipboard from 'commons/components/hooks/useClipboard';
import { useCallback, useMemo } from 'react';
import { isAction, isCell, ReducerProps, Store, StoreRef } from '..';

export type CopyState = {};

export type CopyRef = {};

export type CopyPayload = {};

export const useCopyReducer = () => {
  const { copy } = useClipboard();

  const initialState = useMemo<CopyState>(() => ({}), []);

  const initialRef = useMemo<CopyRef>(() => ({}), []);

  const copyHexCursor = useCallback(
    (store: Store, refs: StoreRef) => copy(refs.current.hex.codes.get(store.cursor.index)),
    [copy]
  );

  const copyTextCursor = useCallback(
    (store: Store, refs: StoreRef) =>
      copy(Buffer.from(refs.current.hex.codes.get(store.cursor.index), 'hex').toString()),
    [copy]
  );

  const copyHexSelect = useCallback(
    (store: Store, refs: StoreRef) => {
      let value = '';
      const array = Array.from(Array(store.select.endIndex - store.select.startIndex + 1).keys()).map(
        i => i + store.select.startIndex
      );
      array.forEach(index => {
        value += refs.current.hex.codes.get(index) + ' ';
      });
      copy(value);
    },
    [copy]
  );

  const copyTextSelect = useCallback(
    (store: Store, refs: StoreRef) => {
      let value = '';
      const array = Array.from(Array(store.select.endIndex - store.select.startIndex + 1).keys()).map(
        i => i + store.select.startIndex
      );
      array.forEach(index => {
        value += Buffer.from(refs.current.hex.codes.get(index), 'hex').toString();
      });
      copy(value);
    },
    [copy]
  );

  const copyKeyDown = useCallback(
    (store: Store, refs: StoreRef): Store => {
      if (store.cursor.index !== null && isCell.hex(refs)) copyHexCursor(store, refs);
      else if (store.cursor.index !== null && isCell.text(refs)) copyTextCursor(store, refs);
      else if (store.select.startIndex !== -1 && store.select.endIndex !== -1 && isCell.hex(refs))
        copyHexSelect(store, refs);
      else if (store.select.startIndex !== -1 && store.select.endIndex !== -1 && isCell.text(refs))
        copyTextSelect(store, refs);
      return { ...store };
    },
    [copyHexCursor, copyHexSelect, copyTextCursor, copyTextSelect]
  );

  const reducer = useCallback(
    ({ prevStore, nextStore, refs, action }: ReducerProps): Store => {
      if (isAction.copyKeyDown(action)) return copyKeyDown(nextStore, refs);
      else return { ...nextStore };
    },
    [copyKeyDown]
  );

  return { initialState, initialRef, reducer };
};
