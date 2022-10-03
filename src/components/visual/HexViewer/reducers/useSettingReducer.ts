import { useCallback } from 'react';
import { isAction, parseJSON, ReducerHandler, Reducers, removeStoreKeys, UseReducer } from '..';

export const useSettingReducer: UseReducer = () => {
  const appLoad: Reducers['appLoad'] = useCallback(store => {
    const setting = (({ hex, offset, layout, copy, mode, search }) => ({ hex, offset, layout, copy, mode, search }))(
      store
    );
    return { ...store, setting: { ...store.setting, ...setting } };
  }, []);

  const settingFetch: Reducers['settingFetch'] = useCallback(store => {
    const value = localStorage.getItem(store.setting.storage.key) as string;
    const json = parseJSON(
      value,
      "Invalid setting data ! Reset and save the HexViewer's settings in the Setting Menu."
    ) as any;
    if (value === null || value === '' || Array.isArray(json)) return { ...store };
    else return { ...store, setting: { ...store.setting, storage: { ...store.setting.storage, data: json } } };
  }, []);

  const settingLoad: Reducers['settingLoad'] = useCallback(
    store => ({ ...store, setting: { ...store.setting, storage: { ...store.setting.storage, data: null } } }),
    []
  );

  const settingSave: Reducers['settingSave'] = useCallback(store => {
    let newStore = removeStoreKeys.store.Setting(store, ['cell', 'cursor', 'history', 'hover', 'loading', 'location']);
    newStore = removeStoreKeys.store.Setting(newStore, ['mode', 'scroll', 'select', 'cellsRendered']);
    newStore = removeStoreKeys.store.setting.Hex(newStore, ['codes', 'data']);
    newStore = removeStoreKeys.store.setting.Offset(newStore, ['data', 'show', 'size']);
    newStore = removeStoreKeys.store.setting.layout.Column(newStore, ['size']);
    newStore = removeStoreKeys.store.setting.layout.Row(newStore, ['size']);
    newStore = removeStoreKeys.store.setting.layout.Folding(newStore, ['rows']);
    newStore = removeStoreKeys.store.setting.Layout(newStore, ['display', 'isFocusing']);
    newStore = removeStoreKeys.store.setting.Search(newStore, ['inputValue', 'results', 'selectedResult']);
    newStore = removeStoreKeys.store.Setting(newStore, ['open', 'storage']);

    localStorage.setItem(store.setting.storage.key, JSON.stringify({ ...newStore.setting }));
    return { ...store, setting: { ...store.setting, open: false } };
  }, []);

  const settingOpen: Reducers['settingOpen'] = useCallback(store => {
    return { ...store, setting: { ...store.setting, open: true } };
  }, []);

  const settingClose: Reducers['settingClose'] = useCallback(store => {
    return { ...store, setting: { ...store.setting, open: false } };
  }, []);

  const settingReset: Reducers['settingReset'] = useCallback(store => {
    return { ...store };
  }, []);

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.appLoad(type)) return appLoad(store, payload);
      else if (isAction.settingFetch(type)) return settingFetch(store, payload);
      else if (isAction.settingLoad(type)) return settingLoad(store, payload);
      else if (isAction.settingSave(type)) return settingSave(store, payload);
      else if (isAction.settingOpen(type)) return settingOpen(store, payload);
      else if (isAction.settingClose(type)) return settingClose(store, payload);
      else if (isAction.settingReset(type)) return settingReset(store, payload);
      else return { ...store };
    },
    [appLoad, settingClose, settingFetch, settingLoad, settingOpen, settingReset, settingSave]
  );

  return { reducer };
};
