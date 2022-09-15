import useClipboard from 'commons/components/hooks/useClipboard';
import { useCallback, useMemo } from 'react';
import {
  getCopyHexCharacter,
  isAction,
  isCell,
  NonPrintableCopyType,
  NON_PRINTABLE_COPY_TYPE_VALUES,
  ReducerHandler,
  Reducers,
  Store,
  UseReducer
} from '..';

export type CopyState = {
  copy: { nonPrintable: { type: NonPrintableCopyType; prefix: string } };
};

export const useCopyReducer: UseReducer<CopyState> = () => {
  const { copy } = useClipboard();

  const initialState = useMemo<CopyState>(
    () => ({
      copy: {
        nonPrintable: {
          type: 'parsed',
          prefix: '\\'
        }
      }
    }),
    []
  );

  const copyHexCursor: (store: Store) => void = useCallback(
    store => copy(store.hex.codes.get(store.cursor.index)),
    [copy]
  );

  const copyTextCursor: (store: Store) => void = useCallback(
    store => copy(getCopyHexCharacter(store, store.hex.codes.get(store.cursor.index))),
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
        value += getCopyHexCharacter(store, store.hex.codes.get(index));
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

  const settingLoad: Reducers['settingLoad'] = useCallback(store => {
    return {
      ...store,
      copy: {
        ...store.copy,
        nonPrintable: {
          ...store.copy.nonPrintable,
          type: NON_PRINTABLE_COPY_TYPE_VALUES.en[store.setting.copy.nonPrintable.type].type,
          prefix: store.setting.copy.nonPrintable.prefix
        }
      }
    };
  }, []);

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.copyKeyDown(type)) return copyKeyDown(store);
      else if (isAction.settingLoad(type)) return settingLoad(store, payload);
      else return { ...store };
    },
    [copyKeyDown, settingLoad]
  );

  return { initialState, reducer };
};
