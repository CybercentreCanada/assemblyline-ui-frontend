import { useCallback, useMemo } from 'react';
import {
  BodyType,
  BODY_TYPE_SETTING_VALUES,
  EncodingType,
  HIGHER_ENCODING_SETTING_VALUES,
  isAction,
  NON_PRINTABLE_ENCODING_SETTING_VALUES,
  ReducerHandler,
  Reducers,
  Store,
  UseReducer
} from '..';

export type SettingState = {
  setting: {
    storageKey: string;
    open: boolean;
    bodyType: number;
    hex: {
      null: {
        char: string;
      };
      nonPrintable: {
        encoding: number;
        char: string;
      };
      higher: {
        encoding: number;
        char: string;
      };
    };
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

export const useSettingReducer: UseReducer<SettingState> = () => {
  const initialState = useMemo<SettingState>(
    () => ({
      setting: {
        storageKey: 'hexViewer.settings',
        open: false,
        bodyType: 0,
        hex: {
          null: {
            char: '0'
          },
          nonPrintable: {
            encoding: 0,
            char: '.'
          },
          higher: {
            encoding: 0,
            char: '.'
          }
        },
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

  const handleSaveLocalStorage = useCallback((store: Store): void => {
    localStorage.setItem(
      store.setting.storageKey,
      JSON.stringify({
        hex: {
          null: { char: store.hex.null.char },
          nonPrintable: { encoding: store.hex.nonPrintable.encoding, char: store.hex.nonPrintable.char },
          higher: { encoding: store.hex.higher.encoding, char: store.hex.higher.char }
        },
        offsetBase: store.offset.base,
        column: {
          auto: store.layout.column.auto,
          size: store.layout.column.size
        },
        row: {
          auto: store.layout.row.auto,
          size: store.layout.row.size
        }
      })
    );
  }, []);

  const settingLoad: Reducers['settingLoad'] = useCallback(store => {
    const value = localStorage.getItem(store.setting.storageKey);
    const json = JSON.parse(value) as any;

    if (value === null || value === '' || !Array.isArray(json)) return { ...store };

    const nullChar = (json as any).hex.null.char === undefined ? store.hex.null.char : (json as any).hex.null.char;
    const nonPrintableEncoding =
      (json as any).hex.nonPrintable.encoding === undefined
        ? store.hex.nonPrintable.encoding
        : (json as any).hex.nonPrintable.encoding;
    const nonPrintableChar =
      (json as any).hex.nonPrintable.char === undefined
        ? store.hex.nonPrintable.char
        : (json as any).hex.nonPrintable.char;
    const higherEncoding =
      (json as any).hex.higher.encoding === undefined ? store.hex.higher.encoding : (json as any).hex.higher.encoding;
    const higherChar =
      (json as any).hex.higher.char === undefined ? store.hex.higher.char : (json as any).hex.higher.char;

    return {
      ...store,
      setting: {
        ...store.setting,
        hex: {
          ...store.hex,
          null: { char: nullChar.substr(-1) !== null ? nullChar.substr(-1) : ' ' },
          nonPrintable: {
            encoding: nonPrintableEncoding,
            char: nonPrintableChar.substr(-1) !== null ? nonPrintableChar.substr(-1) : ' '
          },
          higher: { encoding: higherEncoding, char: higherChar.substr(-1) !== null ? higherChar.substr(-1) : ' ' }
        }
      }
    };
  }, []);

  const appLoad: Reducers['appLoad'] = useCallback((store, payload) => settingLoad(store), [settingLoad]);

  const settingSave: Reducers['settingSave'] = useCallback(
    store => {
      const newBodyType: BodyType = BODY_TYPE_SETTING_VALUES.en.find(e => e.value === store.setting.bodyType).type;
      const newLowerEncoding: EncodingType = NON_PRINTABLE_ENCODING_SETTING_VALUES.en.find(
        e => e.value === store.setting.hex.nonPrintable.encoding
      ).type;

      const newHigherEncoding: EncodingType = HIGHER_ENCODING_SETTING_VALUES.en.find(
        e => e.value === store.setting.hex.higher.encoding
      ).type;

      const newStore = {
        ...store,
        initialized: store.mode.bodyType === newBodyType ? true : false,
        setting: { ...store.setting, open: false },
        mode: { ...store.mode, bodyType: newBodyType },
        hex: {
          ...store.hex,
          null: { char: store.setting.hex.null.char },
          nonPrintable: { encoding: newLowerEncoding, char: store.setting.hex.nonPrintable.char },
          higher: { encoding: newHigherEncoding, char: store.setting.hex.higher.char }
        },
        offset: { ...store.offset, base: store.setting.offsetBase },
        layout: {
          ...store.layout,
          column: { auto: store.setting.column.auto, size: store.setting.column.size },
          row: { auto: store.setting.row.auto, size: store.setting.row.size }
        }
      };

      handleSaveLocalStorage(newStore);
      return newStore;
    },
    [handleSaveLocalStorage]
  );

  const settingOpen: Reducers['settingOpen'] = useCallback(store => {
    return {
      ...store,
      setting: {
        ...store.setting,
        open: true,
        offsetBase: store.offset.base,
        hex: {
          null: {
            char: store.hex.null.char
          },
          nonPrintable: {
            encoding: NON_PRINTABLE_ENCODING_SETTING_VALUES.en.find(e => e.type === store.hex.nonPrintable.encoding)
              .value,
            char: store.hex.nonPrintable.char
          },
          higher: {
            encoding: HIGHER_ENCODING_SETTING_VALUES.en.find(e => e.type === store.hex.higher.encoding).value,
            char: store.hex.higher.char
          }
        },
        column: { auto: store.layout.column.auto, size: store.layout.column.size },
        row: { auto: store.layout.row.auto, size: store.layout.row.size }
      }
    };
  }, []);

  const settingClose: Reducers['settingClose'] = useCallback(store => {
    return { ...store, setting: { ...store.setting, open: false } };
  }, []);

  const settingOffsetBaseChange: Reducers['settingOffsetBaseChange'] = useCallback((store, { event }) => {
    return { ...store, setting: { ...store.setting, offsetBase: event.target.value as number } };
  }, []);

  const settingAutoColumnChange: Reducers['settingAutoColumnChange'] = useCallback(store => {
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

  const settingColumnChange: Reducers['settingColumnChange'] = useCallback((store, { value }) => {
    return {
      ...store,
      setting: {
        ...store.setting,
        column: { ...store.setting.column, size: value }
      }
    };
  }, []);

  const settingBodyTypeChange: Reducers['settingBodyTypeChange'] = useCallback((store, { event }) => {
    return { ...store, setting: { ...store.setting, bodyType: event.target.value as number } };
  }, []);

  const settingEncodingChange: Reducers['settingEncodingChange'] = useCallback((store, { key, value }) => {
    return {
      ...store,
      setting: {
        ...store.setting,
        hex: {
          ...store.setting.hex,
          nonPrintable: {
            ...store.setting.hex.nonPrintable,
            encoding: key === 'nonPrintable' ? value : store.setting.hex.nonPrintable.encoding
          },
          higher: {
            ...store.setting.hex.higher,
            encoding: key === 'higher' ? value : store.setting.hex.higher.encoding
          }
        }
      }
    };
  }, []);

  const settingHexCharChange: Reducers['settingHexCharChange'] = useCallback((store, { key, value }) => {
    return {
      ...store,
      setting: {
        ...store.setting,
        hex: {
          ...store.setting.hex,
          null: {
            char: key === 'null' ? (value.substr(-1) !== null ? value.substr(-1) : ' ') : store.setting.hex.null.char
          },
          nonPrintable: {
            ...store.setting.hex.nonPrintable,
            char:
              key === 'nonPrintable'
                ? value.substr(-1) !== null
                  ? value.substr(-1)
                  : ' '
                : store.setting.hex.nonPrintable.char
          },
          higher: {
            ...store.setting.hex.higher,
            char:
              key === 'higher' ? (value.substr(-1) !== null ? value.substr(-1) : ' ') : store.setting.hex.higher.char
          }
        }
      }
    };
  }, []);

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      // Load and Save only when open
      if (isAction.appLoad(type)) return appLoad(store, payload);
      else if (isAction.settingLoad(type)) return settingLoad(store, payload);
      else if (isAction.settingSave(type)) return settingSave(store, payload);
      else if (isAction.settingOpen(type)) return settingOpen(store, payload);
      else if (isAction.settingClose(type)) return settingClose(store, payload);
      else if (isAction.settingBodyTypeChange(type)) return settingBodyTypeChange(store, payload);
      else if (isAction.settingOffsetBaseChange(type)) return settingOffsetBaseChange(store, payload);
      else if (isAction.settingAutoColumnChange(type)) return settingAutoColumnChange(store, payload);
      else if (isAction.settingColumnChange(type)) return settingColumnChange(store, payload);
      else if (isAction.settingEncodingChange(type)) return settingEncodingChange(store, payload);
      else if (isAction.settingHexCharChange(type)) return settingHexCharChange(store, payload);
      else return { ...store };
    },
    [
      appLoad,
      settingAutoColumnChange,
      settingBodyTypeChange,
      settingClose,
      settingColumnChange,
      settingEncodingChange,
      settingHexCharChange,
      settingLoad,
      settingOffsetBaseChange,
      settingOpen,
      settingSave
    ]
  );

  return { initialState, reducer };
};
