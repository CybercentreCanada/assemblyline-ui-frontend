import {
  ACTIONS,
  ActionTypesConfig,
  BodyType,
  Dispatch,
  DispatchersConfig,
  LanguageType,
  LayoutType,
  Store,
  ThemeType,
  ToolbarType,
  WidthType
} from '..';

export type AppAction =
  | { type: 'storeDefault'; payload: any; tracked: boolean; repeat: boolean }
  | { type: 'appLoad'; payload: { data: string }; guard: { store: Store }; tracked: false; repeat: true }
  | { type: 'appSave'; payload: void }
  | { type: 'appInit'; payload: null }
  | { type: 'appDataChange'; payload: { data: string } }
  | { type: 'appThemeTypeChange'; payload: { themeType: ThemeType } }
  | { type: 'appLanguageTypeChange'; payload: { languageType: LanguageType } }
  | { type: 'appWidthTypeChange'; payload: { widthType: WidthType } }
  | { type: 'appLayoutTypeChange'; payload: { layoutType: LayoutType } }
  | { type: 'appToolbarTypeChange'; payload: { toolbarType: ToolbarType } }
  | { type: 'appBodyTypeChange'; payload: { bodyType: BodyType } }
  | { type: 'appHistoryLoad'; payload: null }
  | { type: 'appHistorySave'; payload: null }
  | { type: 'appLocationInit'; payload: void }
  | { type: 'appClickAway'; payload: void; tracked: true; repeat: true };

export type AppActionTypes = ActionTypesConfig<AppAction>;
export type AppDispatchers = DispatchersConfig<AppAction>;

export const APP_ACTION_TYPES: AppActionTypes = {
  storeDefault: 'StoreDefault_Action',
  appLoad: 'AppLoad_Action',
  appSave: 'AppSave_Action',
  appInit: 'AppInit_Action',
  appDataChange: 'AppDataChange_Action',
  appThemeTypeChange: 'AppThemeTypeChange_Action',
  appLanguageTypeChange: 'AppLanguageTypeChange_Action',
  appWidthTypeChange: 'AppWidthTypeChange_Action',
  appLayoutTypeChange: 'AppLayoutTypeChange_Action',
  appToolbarTypeChange: 'AppToolbarTypeChange_Action',
  appBodyTypeChange: 'AppBodyTypeChange_Action',
  appHistoryLoad: 'AppHistoryLoad_Action',
  appHistorySave: 'AppHistorySave_Action',
  appLocationInit: 'AppLocationInit_Action',
  appClickAway: 'AppClickAway_Action'
} as AppActionTypes;

export const useAppDispatcher = (dispatch: Dispatch): AppDispatchers => {
  return {
    onStoreDefault: () => null,
    onAppLoad: payload => dispatch({ type: ACTIONS.appLoad, payload, tracked: false, repeat: true }),
    onAppSave: payload => dispatch({ type: ACTIONS.appSave, payload }),
    onAppInit: payload => dispatch({ type: ACTIONS.appInit, payload }),
    onAppDataChange: payload => dispatch({ type: ACTIONS.appDataChange, payload }),
    onAppThemeTypeChange: payload => dispatch({ type: ACTIONS.appThemeTypeChange, payload }),
    onAppLanguageTypeChange: payload => dispatch({ type: ACTIONS.appLanguageTypeChange, payload }),
    onAppWidthTypeChange: payload => dispatch({ type: ACTIONS.appWidthTypeChange, payload }),
    onAppLayoutTypeChange: payload => dispatch({ type: ACTIONS.appLayoutTypeChange, payload }),
    onAppToolbarTypeChange: payload => dispatch({ type: ACTIONS.appToolbarTypeChange, payload }),
    onAppBodyTypeChange: payload => dispatch({ type: ACTIONS.appBodyTypeChange, payload }),
    onAppHistoryLoad: payload => dispatch({ type: ACTIONS.appHistoryLoad, payload }),
    onAppHistorySave: payload => dispatch({ type: ACTIONS.appHistorySave, payload }),
    onAppLocationInit: payload => dispatch({ type: ACTIONS.appLocationInit, payload }),
    onAppClickAway: payload => dispatch({ type: ACTIONS.appClickAway, payload, tracked: true, repeat: true })
  };
};
