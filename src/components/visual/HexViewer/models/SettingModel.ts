import {
  CellState,
  CopyState,
  CursorState,
  HexState,
  HistoryState,
  HoverState,
  LayoutState,
  LoadingState,
  LocationState,
  ModeState,
  MyOmit,
  ScrollState,
  SearchState,
  SelectState,
  Store,
  TypesConfig
} from '..';

export type SettingPartials = Partial<
  CellState &
    CopyState &
    CursorState &
    HexState &
    HistoryState &
    HoverState &
    LayoutState &
    LocationState &
    LoadingState &
    ModeState &
    ScrollState &
    SearchState &
    SelectState &
    SettingState
>;

export type SettingTypes = never;

export type PartialStore = Partial<MyOmit<Store, 'setting'>>;

export type SettingState = {
  setting: PartialStore & {
    open: boolean;
    storage: {
      key: string;
      data: null | PartialStore;
    };
  };
};

export const SETTING_STATE: SettingState = {
  setting: {
    open: false,
    storage: {
      key: 'hexViewer.settings',
      data: null
    }
  }
};

export const SETTING_TYPES: TypesConfig<SettingState, SettingTypes> = null;
