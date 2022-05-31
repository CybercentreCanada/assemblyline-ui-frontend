import { useCallback, useMemo } from 'react';
import {
  BodyType,
  isAction,
  LanguageType,
  LayoutType,
  ReducerHandler,
  Reducers,
  ThemeType,
  ToolbarType,
  UseReducer,
  WidthType
} from '..';

export type ModeState = {
  initialized: boolean;
  mode: {
    themeType: ThemeType;
    languageType: LanguageType;
    widthType: WidthType;
    layoutType: LayoutType;
    toolbarType: ToolbarType;
    bodyType: BodyType;
  };
};

export const useModeReducer: UseReducer<ModeState> = () => {
  const initialState = useMemo<ModeState>(
    () => ({
      initialized: false,
      mode: {
        themeType: 'light',
        languageType: 'en',
        widthType: 'md',
        layoutType: 'page',
        toolbarType: 'desktop',
        bodyType: 'window'
      }
    }),
    []
  );

  const bodyInitialized: Reducers['bodyInit'] = useCallback((store, { initialized }) => {
    return { ...store, initialized };
  }, []);

  const themeTypeChange: Reducers['appThemeTypeChange'] = useCallback(
    (store, { themeType }) => ({ ...store, mode: { ...store.mode, themeType } }),
    []
  );

  const languageTypeChange: Reducers['appLanguageTypeChange'] = useCallback(
    (store, { languageType }) => ({ ...store, mode: { ...store.mode, languageType } }),
    []
  );

  const widthTypeChange: Reducers['appWidthTypeChange'] = useCallback(
    (store, { widthType }) => ({ ...store, mode: { ...store.mode, widthType } }),
    []
  );

  const layoutTypeChange: Reducers['appLayoutTypeChange'] = useCallback(
    (store, { layoutType }) => ({ ...store, mode: { ...store.mode, layoutType } }),
    []
  );

  const toolbarTypeChange: Reducers['appToolbarTypeChange'] = useCallback(
    (store, { toolbarType }) => ({ ...store, mode: { ...store.mode, toolbarType } }),
    []
  );

  const bodyTypeChange: Reducers['appBodyTypeChange'] = useCallback(
    (store, { bodyType }) => ({ ...store, mode: { ...store.mode, bodyType } }),
    []
  );

  const layoutTypeToggle: Reducers['fullscreenToggle'] = useCallback((store, payload) => {
    return { ...store, mode: { ...store.mode, layoutType: store.mode.layoutType === 'page' ? 'fullscreen' : 'page' } };
  }, []);

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.bodyInit(type)) return bodyInitialized(store, payload);
      else if (isAction.appThemeTypeChange(type)) return themeTypeChange(store, payload);
      else if (isAction.appLanguageTypeChange(type)) return languageTypeChange(store, payload);
      else if (isAction.appWidthTypeChange(type)) return widthTypeChange(store, payload);
      else if (isAction.appLayoutTypeChange(type)) return layoutTypeChange(store, payload);
      else if (isAction.appToolbarTypeChange(type)) return toolbarTypeChange(store, payload);
      else if (isAction.appBodyTypeChange(type)) return bodyTypeChange(store, payload);
      else if (isAction.fullscreenToggle(type)) return layoutTypeToggle(store, payload);
      else return { ...store };
    },
    [
      bodyInitialized,
      bodyTypeChange,
      languageTypeChange,
      layoutTypeChange,
      layoutTypeToggle,
      themeTypeChange,
      toolbarTypeChange,
      widthTypeChange
    ]
  );

  return { initialState, reducer };
};
