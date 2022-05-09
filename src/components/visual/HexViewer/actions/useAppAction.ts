import { useCallback } from 'react';
import { ACTIONS, DispatchProp } from '..';

export type AppActions = {
  appLoad: 'APP_LOAD_ACTION';
  appSave: 'APP_SAVE_ACTION';
  appInit: 'APP_INIT_ACTION';
  appDataChange: 'APP_DATA_CHANGE_ACTION';
  appThemeChange: 'APP_THEME_CHANGE_ACTION';
  appLanguageChange: 'APP_LANGUAGE_CHANGE_ACTION';
  appWidthChange: 'APP_WIDTH_CHANGE_ACTION';
  appLayoutTypeChange: 'APP_LAYOUT_TYPE_CHANGE_ACTION';
  appToolbarTypeChange: 'APP_TOOLBAR_TYPE_CHANGE_ACTION';
  appBodyTypeChange: 'APP_BODY_TYPE_CHANGE_ACTION';
  appHistoryLoad: 'APP_HISTORY_LOAD_ACTION';
  appHistorySave: 'APP_HISTORY_SAVE_ACTION';
  appLocationInit: 'APP_LOCATION_INIT_ACTION';
  appClickAway: 'APP_CLICK_AWAY_ACTION';
};

export const APP_ACTIONS: AppActions = {
  appLoad: 'APP_LOAD_ACTION',
  appSave: 'APP_SAVE_ACTION',
  appInit: 'APP_INIT_ACTION',
  appDataChange: 'APP_DATA_CHANGE_ACTION',
  appThemeChange: 'APP_THEME_CHANGE_ACTION',
  appLanguageChange: 'APP_LANGUAGE_CHANGE_ACTION',
  appWidthChange: 'APP_WIDTH_CHANGE_ACTION',
  appLayoutTypeChange: 'APP_LAYOUT_TYPE_CHANGE_ACTION',
  appToolbarTypeChange: 'APP_TOOLBAR_TYPE_CHANGE_ACTION',
  appBodyTypeChange: 'APP_BODY_TYPE_CHANGE_ACTION',
  appHistoryLoad: 'APP_HISTORY_LOAD_ACTION',
  appHistorySave: 'APP_HISTORY_SAVE_ACTION',
  appLocationInit: 'APP_LOCATION_INIT_ACTION',
  appClickAway: 'APP_CLICK_AWAY_ACTION'
} as AppActions;

export type AppActionProps = {
  onAppClickAway: () => void;
};

export const useAppAction = (dispatch: DispatchProp): AppActionProps => {
  const onAppClickAway = useCallback(() => dispatch(ACTIONS.appClickAway, null), [dispatch]);

  return {
    onAppClickAway
  };
};
