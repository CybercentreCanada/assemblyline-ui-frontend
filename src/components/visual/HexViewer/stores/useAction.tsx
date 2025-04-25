import type {
  ActionConfig,
  ActionPayloadConfig,
  ActionPayloadsConfig,
  ActionPropConfig,
  ActionPropsConfig,
  ActionsConfig,
  ActionTypeConfig,
  ActionTypesConfig,
  AppAction,
  BodyAction,
  CellAction,
  IsActionsConfig,
  ScrollAction,
  SettingAction,
  ToolbarAction
} from '..';
import {
  APP_ACTION_TYPES,
  BODY_ACTION_TYPES,
  CELL_ACTION_TYPES,
  SCROLL_ACTION_TYPES,
  SETTING_ACTION_TYPES,
  TOOLBAR_ACTION_TYPES
} from '..';

export type StoreAction = AppAction | BodyAction | CellAction | ScrollAction | SettingAction | ToolbarAction;

export type Action = ActionConfig<StoreAction>;
export type Actions = ActionsConfig<StoreAction>;

export type ActionType = ActionTypeConfig<StoreAction>;
export type ActionTypes = ActionTypesConfig<StoreAction>;

export type ActionPayload = ActionPayloadConfig<StoreAction>;
export type ActionPayloads = ActionPayloadsConfig<StoreAction>;

export type ActionProp = ActionPropConfig<StoreAction>;
export type ActionProps = ActionPropsConfig<StoreAction>;

export type IsActions = IsActionsConfig<StoreAction>;

export const ACTIONS: ActionTypes = {
  ...APP_ACTION_TYPES,
  ...BODY_ACTION_TYPES,
  ...CELL_ACTION_TYPES,
  ...SCROLL_ACTION_TYPES,
  ...SETTING_ACTION_TYPES,
  ...TOOLBAR_ACTION_TYPES
};

export const isAction: IsActions = Object.fromEntries(
  Object.keys(ACTIONS).map(key => [key, (type: ActionType) => type === ACTIONS[key]])
) as IsActions;
