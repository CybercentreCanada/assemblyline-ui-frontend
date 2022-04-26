import { ChangeEvent, useCallback } from 'react';
import { ACTIONS, DispatchProp } from '..';

export type SettingActions = {
  settingLoad: 'SETTING_LOAD_ACTION';
  settingSave: 'SETTING_SAVE_ACTION';
  settingOpen: 'SETTING_OPEN_ACTION';
  settingClose: 'SETTING_CLOSE_ACTION';
  settingBodyTypeChange: 'SETTING_BODY_TYPE_CHANGE_ACTION';
  settingOffsetBaseChange: 'SETTING_OFFSET_BASE_CHANGE_ACTION';
  settingAutoColumnChange: 'SETTING_AUTO_COLUMN_CHANGE_ACTION';
  settingColumnChange: 'SETTING_COLUMN_CHANGE_ACTION';
  settingEncodingChange: 'SETTING_ENCODING_CHANGE_ACTION';
  settingHexCharChange: 'SETTING_HEX_CHAR_CHANGE_ACTION';
};

export const SETTING_ACTIONS: SettingActions = {
  settingLoad: 'SETTING_LOAD_ACTION',
  settingSave: 'SETTING_SAVE_ACTION',
  settingOpen: 'SETTING_OPEN_ACTION',
  settingClose: 'SETTING_CLOSE_ACTION',
  settingBodyTypeChange: 'SETTING_BODY_TYPE_CHANGE_ACTION',
  settingOffsetBaseChange: 'SETTING_OFFSET_BASE_CHANGE_ACTION',
  settingAutoColumnChange: 'SETTING_AUTO_COLUMN_CHANGE_ACTION',
  settingColumnChange: 'SETTING_COLUMN_CHANGE_ACTION',
  settingEncodingChange: 'SETTING_ENCODING_CHANGE_ACTION',
  settingHexCharChange: 'SETTING_HEX_CHAR_CHANGE_ACTION'
} as SettingActions;

export type SettingActionProps = {
  onSettingLoad: () => void;
  onSettingSave: () => void;
  onSettingOpen: () => void;
  onSettingClose: () => void;
  onSettingBodyTypeChange: (event: ChangeEvent<{ name?: string; value: unknown }>) => void;
  onSettingOffsetBaseChange: (event: ChangeEvent<{ name?: string; value: unknown }>) => void;
  onSettingAutoColumnsChange: () => void;
  onSettingColumnsChange: (value: number) => void;
  onSettingEncodingChange: (key: string, value: number) => void;
  onSettingHexCharChange: (key: string, value: string) => void;
};

export const useSettingAction = (dispatch: DispatchProp): SettingActionProps => {
  const onSettingLoad = useCallback(() => dispatch(ACTIONS.settingLoad, null), [dispatch]);

  const onSettingSave = useCallback(() => dispatch(ACTIONS.settingSave, null), [dispatch]);

  const onSettingOpen = useCallback(() => dispatch(ACTIONS.settingOpen, null), [dispatch]);

  const onSettingClose = useCallback(() => dispatch(ACTIONS.settingClose, null), [dispatch]);

  const onSettingBodyTypeChange = useCallback(
    (event: ChangeEvent<{ name?: string; value: unknown }>) => dispatch(ACTIONS.settingBodyTypeChange, { event }),
    [dispatch]
  );

  const onSettingOffsetBaseChange = useCallback(
    (event: ChangeEvent<{ name?: string; value: unknown }>) => dispatch(ACTIONS.settingOffsetBaseChange, { event }),
    [dispatch]
  );

  const onSettingAutoColumnsChange = useCallback(() => dispatch(ACTIONS.settingAutoColumnChange, null), [dispatch]);

  const onSettingColumnsChange = useCallback(
    (value: number) => dispatch(ACTIONS.settingColumnChange, { value }),
    [dispatch]
  );

  const onSettingEncodingChange = useCallback(
    (key: string, value: number) => dispatch(ACTIONS.settingEncodingChange, { key, value }),
    [dispatch]
  );

  const onSettingHexCharChange = useCallback(
    (key: string, value: string) => dispatch(ACTIONS.settingHexCharChange, { key, value }),
    [dispatch]
  );

  return {
    onSettingLoad,
    onSettingSave,
    onSettingOpen,
    onSettingClose,
    onSettingBodyTypeChange,
    onSettingEncodingChange,
    onSettingOffsetBaseChange,
    onSettingAutoColumnsChange,
    onSettingColumnsChange,
    onSettingHexCharChange
  };
};
