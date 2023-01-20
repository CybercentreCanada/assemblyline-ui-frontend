import useClipboard from 'commons_deprecated/components/hooks/useClipboard';
import { useCallback } from 'react';
import {
  COPY_STATE,
  getCopyHexCharacter,
  isAction,
  isType,
  ReducerHandler,
  Reducers,
  setStore,
  setStoreWithKeys,
  singleCharacterString,
  Store,
  UseReducer
} from '..';

export const useCopyReducer: UseReducer = () => {
  const { copy } = useClipboard();

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
      if (store.cursor.index !== null && isType.cell.mouseOverType(store, 'hex')) copyHexCursor(store);
      else if (store.cursor.index !== null && isType.cell.mouseOverType(store, 'text')) copyTextCursor(store);
      else if (
        store.select.startIndex !== -1 &&
        store.select.endIndex !== -1 &&
        isType.cell.mouseOverType(store, 'hex')
      )
        copyHexSelect(store);
      else if (
        store.select.startIndex !== -1 &&
        store.select.endIndex !== -1 &&
        isType.cell.mouseOverType(store, 'text')
      )
        copyTextSelect(store);
      return { ...store };
    },
    [copyHexCursor, copyHexSelect, copyTextCursor, copyTextSelect]
  );

  const settingLoad: Reducers['settingLoad'] = useCallback(
    store =>
      setStore.store.copy.NonPrintable(store, store.setting.storage.data?.copy?.nonPrintable, data => ({
        mode: data?.mode,
        prefix: singleCharacterString(data?.prefix)
      })),
    []
  );

  const settingOpen: Reducers['settingOpen'] = useCallback(
    store => setStoreWithKeys.store.setting.copy.NonPrintable(store, store.copy.nonPrintable, ['mode', 'prefix']),
    []
  );

  const settingSave: Reducers['settingSave'] = useCallback(store => {
    return setStoreWithKeys.store.copy.NonPrintable(store, store.setting.copy.nonPrintable, ['mode', 'prefix']);
  }, []);

  const settingReset: Reducers['settingReset'] = useCallback(
    store => setStoreWithKeys.store.setting.copy.NonPrintable(store, COPY_STATE.copy.nonPrintable, ['mode', 'prefix']),
    []
  );

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.copyKeyDown(type)) return copyKeyDown(store);
      else if (isAction.settingLoad(type)) return settingLoad(store, payload);
      else if (isAction.settingOpen(type)) return settingOpen(store, payload);
      else if (isAction.settingSave(type)) return settingSave(store, payload);
      else if (isAction.settingReset(type)) return settingReset(store, payload);
      else return { ...store };
    },
    [copyKeyDown, settingLoad, settingOpen, settingReset, settingSave]
  );

  return { reducer };
};
