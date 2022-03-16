import { useCallback, useMemo } from 'react';
import { ActionProps, BodyType, BODY_TYPE_SETTING_VALUES, isAction, ReducerProps, Store, StoreRef } from '..';

export type SettingState = {
  setting: {
    open: boolean;
    bodyType: number;
    offsetBase: number;
    column: {
      auto: boolean;
      size: number;
    };
    row: {
      auto: boolean;
      size: number;
    };
    showHistoryLastValue: boolean;
  };
};

export type SettingRef = {
  setting: {
    storageKey: string;
  };
};

export type SettingPayload = {};

export const useSettingReducer = () => {
  const initialState = useMemo<SettingState>(
    () => ({
      setting: {
        open: false,
        bodyType: 0,
        offsetBase: 16,
        column: {
          auto: true,
          size: 48
        },
        row: {
          auto: true,
          size: 48
        },
        showHistoryLastValue: false
      }
    }),
    []
  );

  const initialRef = useMemo<SettingRef>(
    () => ({
      setting: {
        storageKey: 'hexViewer.settings'
      }
    }),
    []
  );

  const settingLoad = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    // const value = localStorage.getItem(refs.current.setting.storageKey);
    // const json = JSON.parse(value);
    // if (value === null || value === '' || !Array.isArray(json)) {
    //   return { ...store, history: { ...store.history, values: [], index: 0 } };
    // } else return { ...store, history: { ...store.history, values: json, index: 0 } };
    return {
      ...store,
      setting: {
        ...store.setting,
        bodyType: BODY_TYPE_SETTING_VALUES.en.find(e => e.type === store.mode.bodyType).value
      }
    };
  }, []);

  const settingSave = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    const newBodyType: BodyType = BODY_TYPE_SETTING_VALUES.en.find(e => e.value === store.setting.bodyType).type;

    return {
      ...store,
      initialized: store.mode.bodyType === newBodyType ? true : false,
      setting: { ...store.setting, open: false },
      mode: { ...store.mode, bodyType: newBodyType },
      offset: { ...store.offset, base: store.setting.offsetBase },
      layout: {
        ...store.layout,
        column: { auto: store.setting.column.auto, size: store.setting.column.size },
        row: { auto: store.setting.row.auto, size: store.setting.row.size }
      }
    };
  }, []);

  const settingOpen = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    return {
      ...store,
      setting: {
        ...store.setting,
        open: true,
        offsetBase: store.offset.base,
        column: { auto: store.layout.column.auto, size: store.layout.column.size },
        row: { auto: store.layout.row.auto, size: store.layout.row.size }
      }
    };
  }, []);

  const settingClose = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    return { ...store, setting: { ...store.setting, open: false } };
  }, []);

  const settingOffsetBaseChange = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    return {
      ...store,
      setting: { ...store.setting, offsetBase: payload.event.target.value }
    };
  }, []);

  const settingAutoColumnChange = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    return {
      ...store,
      setting: {
        ...store.setting,
        column: {
          ...store.setting.column,
          auto: !store.setting.column.auto,
          size: !store.setting.column.auto ? store.layout.column.size : store.setting.column.size
        }
      }
    };
  }, []);

  const settingColumnChange = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    return {
      ...store,
      setting: {
        ...store.setting,
        column: { ...store.setting.column, size: payload.value }
      }
    };
  }, []);

  const settingBodyChange = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    return {
      ...store,
      setting: {
        ...store.setting,
        bodyType: payload.event.target.value
      }
    };
  }, []);

  const reducer = useCallback(
    ({ prevStore, nextStore, refs, action }: ReducerProps): Store => {
      // Load and Save only when open
      if (isAction.appLoad(action)) return settingLoad(nextStore, refs, action);
      else if (isAction.settingLoad(action)) return settingLoad(nextStore, refs, action);
      else if (isAction.settingSave(action)) return settingSave(nextStore, refs, action);
      else if (isAction.settingOpen(action)) return settingOpen(nextStore, refs, action);
      else if (isAction.settingClose(action)) return settingClose(nextStore, refs, action);
      else if (isAction.settingBodyTypeChange(action)) return settingBodyChange(nextStore, refs, action);
      else if (isAction.settingOffsetBaseChange(action)) return settingOffsetBaseChange(nextStore, refs, action);
      else if (isAction.settingAutoColumnChange(action)) return settingAutoColumnChange(nextStore, refs, action);
      else if (isAction.settingColumnChange(action)) return settingColumnChange(nextStore, refs, action);
      else return { ...nextStore };
    },
    [
      settingAutoColumnChange,
      settingBodyChange,
      settingClose,
      settingColumnChange,
      settingLoad,
      settingOffsetBaseChange,
      settingOpen,
      settingSave
    ]
  );

  return { initialState, initialRef, reducer };
};
