import { useCallback, useMemo } from 'react';
import {
  ActionProps,
  BodyType,
  isAction,
  LanguageType,
  LayoutType,
  ReducerProps,
  Store,
  ThemeType,
  ToolbarType,
  WidthType
} from '..';

export type ModeState = {
  initialized: boolean;
  mode: {
    theme: ThemeType;
    language: LanguageType;
    width: WidthType;
    layoutType: LayoutType;
    toolbarType: ToolbarType;
    bodyType: BodyType;
  };
};

export const useModeReducer = () => {
  const initialState = useMemo<ModeState>(
    () => ({
      initialized: false,
      mode: {
        theme: 'light',
        language: 'en',
        width: 'md',
        layoutType: 'page',
        toolbarType: 'desktop',
        bodyType: 'window'
      }
    }),
    []
  );

  const bodyInitialized = useCallback((store: Store, { type, payload }: ActionProps): Store => {
    return { ...store, initialized: payload.value };
  }, []);

  const themeChange = useCallback((store: Store, { type, payload }: ActionProps): Store => {
    if (!payload.hasOwnProperty('theme')) return { ...store, mode: { ...store.mode, theme: payload.theme } };
    else return { ...store };
  }, []);

  const languageChange = useCallback((store: Store, { type, payload }: ActionProps): Store => {
    if (payload.hasOwnProperty('language')) return { ...store, mode: { ...store.mode, language: payload.language } };
    else return { ...store };
  }, []);

  const widthChange = useCallback((store: Store, { type, payload }: ActionProps): Store => {
    if (payload.hasOwnProperty('width')) return { ...store, mode: { ...store.mode, width: payload.width } };
    else return { ...store };
  }, []);

  const layoutTypeChange = useCallback((store: Store, { type, payload }: ActionProps): Store => {
    if (payload.hasOwnProperty('layoutType'))
      return { ...store, mode: { ...store.mode, layoutType: payload.layoutType } };
    else return { ...store };
  }, []);

  const toolbarTypeChange = useCallback((store: Store, { type, payload }: ActionProps): Store => {
    if (payload.hasOwnProperty('toolbarType'))
      return { ...store, mode: { ...store.mode, toolbarType: payload.toolbarType } };
    else return { ...store };
  }, []);

  const bodyTypeChange = useCallback((store: Store, { type, payload }: ActionProps): Store => {
    if (payload.hasOwnProperty('bodyType')) return { ...store, mode: { ...store.mode, bodyType: payload.bodyType } };
    else return { ...store };
  }, []);

  const layoutTypeToggle = useCallback((store: Store, { type, payload }: ActionProps): Store => {
    return { ...store, mode: { ...store.mode, layoutType: store.mode.layoutType === 'page' ? 'fullscreen' : 'page' } };
  }, []);

  const reducer = useCallback(
    ({ store, action }: ReducerProps): Store => {
      if (isAction.bodyInit(action)) return bodyInitialized(store, action);
      else if (isAction.appThemeChange(action)) return themeChange(store, action);
      else if (isAction.appLanguageChange(action)) return languageChange(store, action);
      else if (isAction.appWidthChange(action)) return widthChange(store, action);
      else if (isAction.appLayoutTypeChange(action)) return layoutTypeChange(store, action);
      else if (isAction.appToolbarTypeChange(action)) return toolbarTypeChange(store, action);
      else if (isAction.appBodyTypeChange(action)) return bodyTypeChange(store, action);
      else if (isAction.fullscreenToggle(action)) return layoutTypeToggle(store, action);
      else return { ...store };
    },
    [
      bodyInitialized,
      bodyTypeChange,
      languageChange,
      layoutTypeChange,
      layoutTypeToggle,
      themeChange,
      toolbarTypeChange,
      widthChange
    ]
  );

  return { initialState, reducer };
};
