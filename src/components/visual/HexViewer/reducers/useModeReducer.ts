import { useCallback } from 'react';
import { getType, isAction, MODE_STATE, ReducerHandler, Reducers, setStore, setStoreWithKeys, UseReducer } from '..';

export const useModeReducer: UseReducer = () => {
  const appModeThemeChange: Reducers['appModeThemeChange'] = useCallback(
    (store, { theme }) => ({ ...store, mode: { ...store.mode, theme } }),
    []
  );

  const appModeLanguageChange: Reducers['appModeLanguageChange'] = useCallback(
    (store, { language }) => ({ ...store, mode: { ...store.mode, language } }),
    []
  );

  const appModeWidthChange: Reducers['appModeWidthChange'] = useCallback(
    (store, { width }) => ({ ...store, mode: { ...store.mode, width } }),
    []
  );

  const appModeLayoutChange: Reducers['appModeLayoutChange'] = useCallback(
    (store, { layout }) => ({ ...store, mode: { ...store.mode, layout } }),
    []
  );

  const appModeToolbarChange: Reducers['appModeToolbarChange'] = useCallback(
    (store, { toolbar }) => ({ ...store, mode: { ...store.mode, toolbar } }),
    []
  );

  const appModeBodyChange: Reducers['appModeBodyChange'] = useCallback(
    (store, { body }) => ({ ...store, mode: { ...store.mode, body } }),
    []
  );

  const layoutTypeToggle: Reducers['fullscreenToggle'] = useCallback((store, payload) => {
    return { ...store, mode: { ...store.mode, layout: store.mode.layout === 'page' ? 'fullscreen' : 'page' } };
  }, []);

  const settingBodyTypeChange: Reducers['settingBodyTypeChange'] = useCallback((store, { event }) => {
    const body = getType.mode.body(event.target.value as number);
    return { ...store, setting: { ...store.setting, body } };
  }, []);

  const settingLoad: Reducers['settingLoad'] = useCallback(store => {
    return setStore.store.mode.Body(store, store.setting.storage.data?.mode?.body);
  }, []);

  const settingOpen: Reducers['settingOpen'] = useCallback(store => {
    return setStoreWithKeys.store.setting.Mode(store, store.mode, ['body']);
  }, []);

  const settingSave: Reducers['settingSave'] = useCallback(store => {
    return setStoreWithKeys.store.Mode(store, store.setting.mode, ['body']);
  }, []);

  const settingReset: Reducers['settingReset'] = useCallback(store => {
    return setStoreWithKeys.store.setting.Mode(store, MODE_STATE.mode, ['body']);
  }, []);

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.appModeThemeChange(type)) return appModeThemeChange(store, payload);
      else if (isAction.appModeLanguageChange(type)) return appModeLanguageChange(store, payload);
      else if (isAction.appModeWidthChange(type)) return appModeWidthChange(store, payload);
      else if (isAction.appModeLayoutChange(type)) return appModeLayoutChange(store, payload);
      else if (isAction.appModeToolbarChange(type)) return appModeToolbarChange(store, payload);
      else if (isAction.appModeBodyChange(type)) return appModeBodyChange(store, payload);
      else if (isAction.fullscreenToggle(type)) return layoutTypeToggle(store, payload);
      else if (isAction.settingBodyTypeChange(type)) return settingBodyTypeChange(store, payload);
      else if (isAction.settingLoad(type)) return settingLoad(store, payload);
      else if (isAction.settingOpen(type)) return settingOpen(store, payload);
      else if (isAction.settingSave(type)) return settingSave(store, payload);
      else if (isAction.settingReset(type)) return settingReset(store, payload);
      else return { ...store };
    },
    [
      appModeBodyChange,
      appModeLanguageChange,
      appModeLayoutChange,
      appModeThemeChange,
      appModeToolbarChange,
      appModeWidthChange,
      layoutTypeToggle,
      settingBodyTypeChange,
      settingLoad,
      settingOpen,
      settingReset,
      settingSave
    ]
  );

  return { reducer };
};
