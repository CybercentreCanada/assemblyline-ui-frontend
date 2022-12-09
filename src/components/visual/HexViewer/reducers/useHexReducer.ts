import { useCallback } from 'react';
import {
  HEX_STATE,
  isAction,
  parseDataToHexcodeMap,
  ReducerHandler,
  Reducers,
  setStore,
  setStoreWithKeys,
  singleCharacterString,
  UseReducer
} from '..';

export const useHexReducer: UseReducer = () => {
  const hexDataChange: Reducers['appLoad'] = useCallback((store, { data }) => {
    if (data === undefined || data === null || data === '') return { ...store };
    const codes = parseDataToHexcodeMap(data);
    return { ...store, hex: { ...store.hex, data, codes } };
  }, []);

  const settingLoad: Reducers['settingLoad'] = useCallback(store => {
    let newStore = setStore.store.Hex(store, store.setting.storage.data?.hex, data => ({
      encoding: data?.encoding,
      null: { char: singleCharacterString(data?.null?.char) },
      nonPrintable: { set: data?.nonPrintable?.set, char: singleCharacterString(data?.nonPrintable?.char) },
      higher: { set: data?.higher?.set, char: singleCharacterString(data?.higher?.char) }
    }));
    newStore = setStore.store.Offset(newStore, store.setting.storage.data?.offset);
    return newStore;
  }, []);

  const settingOpen: Reducers['settingOpen'] = useCallback(store => {
    let newStore = setStoreWithKeys.store.setting.Hex(store, store.hex, ['encoding', 'null', 'nonPrintable', 'higher']);
    newStore = setStoreWithKeys.store.setting.Offset(newStore, store.offset, ['base']);
    return newStore;
  }, []);

  const settingSave: Reducers['settingSave'] = useCallback(store => {
    let newStore = setStoreWithKeys.store.Hex(store, store.setting.hex, ['encoding', 'null', 'nonPrintable', 'higher']);
    newStore = setStoreWithKeys.store.Offset(newStore, store.setting.offset, ['base']);
    return newStore;
  }, []);

  const settingReset: Reducers['settingReset'] = useCallback(store => {
    let newStore = setStoreWithKeys.store.setting.Hex(store, HEX_STATE.hex, [
      'encoding',
      'null',
      'nonPrintable',
      'higher'
    ]);
    newStore = setStoreWithKeys.store.setting.Offset(newStore, HEX_STATE.offset, ['base']);
    return newStore;
  }, []);

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.appLoad(type)) return hexDataChange(store, payload);
      else if (isAction.settingLoad(type)) return settingLoad(store, payload);
      else if (isAction.settingOpen(type)) return settingOpen(store, payload);
      else if (isAction.settingSave(type)) return settingSave(store, payload);
      else if (isAction.settingReset(type)) return settingReset(store, payload);
      else return { ...store };
    },
    [hexDataChange, settingLoad, settingOpen, settingReset, settingSave]
  );

  return { reducer };
};
