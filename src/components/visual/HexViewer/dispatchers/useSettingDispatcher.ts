import { ChangeEvent } from 'react';
import { ACTIONS, ActionTypesConfig, Dispatch, DispatchersConfig } from '..';

export type SettingAction =
  | { type: 'settingLoad'; payload: void }
  | { type: 'settingSave'; payload: void }
  | { type: 'settingOpen'; payload: void }
  | { type: 'settingClose'; payload: void }
  | { type: 'settingBodyTypeChange'; payload: { event: ChangeEvent<{ name?: string; value: unknown }> } }
  | { type: 'settingOffsetBaseChange'; payload: { event: ChangeEvent<{ name?: string; value: unknown }> } }
  | { type: 'settingAutoColumnChange'; payload: void }
  | { type: 'settingColumnChange'; payload: { value: number } }
  | { type: 'settingEncodingChange'; payload: { key: string; value: number } }
  | { type: 'settingHexCharChange'; payload: { key: string; value: string } };

export type SettingActionTypes = ActionTypesConfig<SettingAction>;
export type SettingDispatchers = DispatchersConfig<SettingAction>;

export const SETTING_ACTION_TYPES: SettingActionTypes = {
  settingLoad: 'SettingLoad_Action',
  settingSave: 'SettingSave_Action',
  settingOpen: 'SettingOpen_Action',
  settingClose: 'SettingClose_Action',
  settingBodyTypeChange: 'SettingBodyTypeChange_Action',
  settingOffsetBaseChange: 'SettingOffsetBaseChange_Action',
  settingAutoColumnChange: 'SettingAutoColumnChange_Action',
  settingColumnChange: 'SettingColumnChange_Action',
  settingEncodingChange: 'SettingEncodingChange_Action',
  settingHexCharChange: 'SettingHexCharChange_Action'
} as SettingActionTypes;

export const useSettingDispatcher = (dispatch: Dispatch): SettingDispatchers => {
  return {
    onSettingLoad: payload => dispatch({ type: ACTIONS.settingLoad, payload }),
    onSettingSave: payload => dispatch({ type: ACTIONS.settingSave, payload }),
    onSettingOpen: payload => dispatch({ type: ACTIONS.settingOpen, payload }),
    onSettingClose: payload => dispatch({ type: ACTIONS.settingClose, payload }),
    onSettingBodyTypeChange: payload => dispatch({ type: ACTIONS.settingBodyTypeChange, payload }),
    onSettingEncodingChange: payload => dispatch({ type: ACTIONS.settingEncodingChange, payload }),
    onSettingOffsetBaseChange: payload => dispatch({ type: ACTIONS.settingOffsetBaseChange, payload }),
    onSettingAutoColumnChange: payload => dispatch({ type: ACTIONS.settingAutoColumnChange, payload }),
    onSettingColumnChange: payload => dispatch({ type: ACTIONS.settingColumnChange, payload }),
    onSettingHexCharChange: payload => dispatch({ type: ACTIONS.settingHexCharChange, payload })
  };
};
