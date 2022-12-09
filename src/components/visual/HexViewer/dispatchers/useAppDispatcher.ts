import {
  ACTIONS,
  ActionTypesConfig,
  Dispatch,
  DispatchersConfig,
  ModeBody,
  ModeLanguage,
  ModeLayout,
  ModeTheme,
  ModeToolbar,
  ModeWidth,
  Store
} from '..';

export type AppAction =
  | { type: 'storeDefault'; payload: any; tracked: boolean; repeat: boolean }
  | { type: 'appLoad'; payload: { data: string }; guard: { store: Store }; tracked: false; repeat: true }
  | { type: 'appSave'; payload: void }
  | { type: 'appInit'; payload: null }
  | { type: 'appDataChange'; payload: { data: string } }
  | { type: 'appModeThemeChange'; payload: { theme: ModeTheme } }
  | { type: 'appModeLanguageChange'; payload: { language: ModeLanguage } }
  | { type: 'appModeWidthChange'; payload: { width: ModeWidth } }
  | { type: 'appModeLayoutChange'; payload: { layout: ModeLayout } }
  | { type: 'appModeToolbarChange'; payload: { toolbar: ModeToolbar } }
  | { type: 'appModeBodyChange'; payload: { body: ModeBody } }
  | { type: 'appHistoryLoad'; payload: null }
  | { type: 'appHistorySave'; payload: null }
  | { type: 'locationFetch'; payload: void }
  | { type: 'locationLoad'; payload: void }
  | { type: 'appClickAway'; payload: void; tracked: true; repeat: true };

export type AppActionTypes = ActionTypesConfig<AppAction>;
export type AppDispatchers = DispatchersConfig<AppAction>;

export const APP_ACTION_TYPES: AppActionTypes = {
  storeDefault: 'StoreDefault_Action',
  appLoad: 'AppLoad_Action',
  appSave: 'AppSave_Action',
  appInit: 'AppInit_Action',
  appDataChange: 'AppDataChange_Action',
  appModeThemeChange: 'AppModeThemeChange_Action',
  appModeLanguageChange: 'AppModeLanguageChange_Action',
  appModeWidthChange: 'AppModeWidthChange_Action',
  appModeLayoutChange: 'AppModeLayoutChange_Action',
  appModeToolbarChange: 'AppModeToolbarChange_Action',
  appModeBodyChange: 'AppModeBodyChange_Action',
  appHistoryLoad: 'AppHistoryLoad_Action',
  appHistorySave: 'AppHistorySave_Action',
  locationFetch: 'LocationFetch_Action',
  locationLoad: 'LocationLoad_Action',
  appClickAway: 'AppClickAway_Action'
} as AppActionTypes;

export const useAppDispatcher = (dispatch: Dispatch): AppDispatchers => {
  return {
    onStoreDefault: () => null,
    onAppLoad: payload => dispatch({ type: ACTIONS.appLoad, payload, tracked: false, repeat: true }),
    onAppSave: payload => dispatch({ type: ACTIONS.appSave, payload }),
    onAppInit: payload => dispatch({ type: ACTIONS.appInit, payload }),
    onAppDataChange: payload => dispatch({ type: ACTIONS.appDataChange, payload }),
    onAppModeThemeChange: payload => dispatch({ type: ACTIONS.appModeThemeChange, payload }),
    onAppModeLanguageChange: payload => dispatch({ type: ACTIONS.appModeLanguageChange, payload }),
    onAppModeWidthChange: payload => dispatch({ type: ACTIONS.appModeWidthChange, payload }),
    onAppModeLayoutChange: payload => dispatch({ type: ACTIONS.appModeLayoutChange, payload }),
    onAppModeToolbarChange: payload => dispatch({ type: ACTIONS.appModeToolbarChange, payload }),
    onAppModeBodyChange: payload => dispatch({ type: ACTIONS.appModeBodyChange, payload }),
    onAppHistoryLoad: payload => dispatch({ type: ACTIONS.appHistoryLoad, payload }),
    onAppHistorySave: payload => dispatch({ type: ACTIONS.appHistorySave, payload }),
    onLocationFetch: payload => dispatch({ type: ACTIONS.locationFetch, payload }),
    onLocationLoad: payload => dispatch({ type: ACTIONS.locationLoad, payload }),
    onAppClickAway: payload => dispatch({ type: ACTIONS.appClickAway, payload, tracked: true, repeat: true })
  };
};
