import { useCallback, useMemo } from 'react';
import {
  ActionProps,
  BodyType,
  BODY_TYPE_SETTING_VALUES,
  EncodingType,
  HIGHER_ENCODING_SETTING_VALUES,
  isAction,
  LOWER_ENCODING_SETTING_VALUES,
  ReducerProps,
  Store,
  StoreRef
} from '..';

export type SettingState = {
  setting: {
    open: boolean;
    bodyType: number;
    // hex: {
    //   encoding: number;
    //   nullChar: string;
    //   lowerASCIIChar: string;
    //   higherASCIIChar: string;
    // };
    hex: {
      null: {
        char: string;
      };
      lower: {
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
        // hex: {
        //   encoding: 0,
        //   nullChar: '0',
        //   lowerASCIIChar: '.',
        //   higherASCIIChar: '.'
        // },
        hex: {
          null: {
            char: '0'
          },
          lower: {
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

  const initialRef = useMemo<SettingRef>(
    () => ({
      setting: {
        storageKey: 'hexViewer.settings'
      }
    }),
    []
  );

  const handleSaveLocalStorage = useCallback((store: Store, refs: StoreRef): void => {
    localStorage.setItem(
      refs.current.setting.storageKey,
      JSON.stringify({
        hex: {
          null: { char: store.hex.null.char },
          lower: { encoding: store.hex.lower.encoding, char: store.hex.lower.char },
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

  const settingLoad = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    const value = localStorage.getItem(refs.current.setting.storageKey);
    const json = JSON.parse(value) as any;

    if (value === null || value === '' || !Array.isArray(json)) return { ...store };

    const nullChar = (json as any).hex.null.char === undefined ? store.hex.null.char : (json as any).hex.null.char;
    const lowerEncoding =
      (json as any).hex.lower.encoding === undefined ? store.hex.lower.encoding : (json as any).hex.lower.encoding;
    const lowerChar = (json as any).hex.lower.char === undefined ? store.hex.lower.char : (json as any).hex.lower.char;
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
          lower: { encoding: lowerEncoding, char: lowerChar.substr(-1) !== null ? lowerChar.substr(-1) : ' ' },
          higher: { encoding: higherEncoding, char: higherChar.substr(-1) !== null ? higherChar.substr(-1) : ' ' }
        }
      }
    };
  }, []);

  const settingSave = useCallback(
    (store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
      const newBodyType: BodyType = BODY_TYPE_SETTING_VALUES.en.find(e => e.value === store.setting.bodyType).type;
      const newLowerEncoding: EncodingType = LOWER_ENCODING_SETTING_VALUES.en.find(
        e => e.value === store.setting.hex.lower.encoding
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
          lower: { encoding: newLowerEncoding, char: store.setting.hex.lower.char },
          higher: { encoding: newHigherEncoding, char: store.setting.hex.higher.char }
        },
        offset: { ...store.offset, base: store.setting.offsetBase },
        layout: {
          ...store.layout,
          column: { auto: store.setting.column.auto, size: store.setting.column.size },
          row: { auto: store.setting.row.auto, size: store.setting.row.size }
        }
      };

      handleSaveLocalStorage(newStore, refs);

      return newStore;
    },
    [handleSaveLocalStorage]
  );

  const settingOpen = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
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
          lower: {
            encoding: LOWER_ENCODING_SETTING_VALUES.en.find(e => e.type === store.hex.lower.encoding).value,
            char: store.hex.lower.char
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

  const settingEncodingChange = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    return {
      ...store,
      setting: {
        ...store.setting,
        hex: {
          ...store.setting.hex,
          lower: {
            ...store.setting.hex.lower,
            encoding: payload.key === 'lower' ? payload.value : store.setting.hex.lower.encoding
          },
          higher: {
            ...store.setting.hex.higher,
            encoding: payload.key === 'higher' ? payload.value : store.setting.hex.higher.encoding
          }
        }
      }
    };
  }, []);

  const settingHexCharChange = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    // let newStore = Object.assign({ ...store });
    // if (payload.key === 'null') {
    //   newStore.setting.hex.null.char = payload.value.substr(-1) !== null ? payload.value.substr(-1) : ' ';
    // }
    // if (payload.key === 'lower') {
    //   newStore.setting.hex.lower.char = payload.value.substr(-1) !== null ? payload.value.substr(-1) : ' ';
    // }
    // if (payload.key === 'higher') {
    //   newStore.setting.hex.higher.char = payload.value.substr(-1) !== null ? payload.value.substr(-1) : ' ';
    // }
    // return { ...newStore };

    return {
      ...store,
      setting: {
        ...store.setting,
        hex: {
          ...store.setting.hex,
          null: {
            char:
              payload.key === 'null'
                ? payload.value.substr(-1) !== null
                  ? payload.value.substr(-1)
                  : ' '
                : store.setting.hex.null.char
          },
          lower: {
            ...store.setting.hex.lower,
            char:
              payload.key === 'lower'
                ? payload.value.substr(-1) !== null
                  ? payload.value.substr(-1)
                  : ' '
                : store.setting.hex.lower.char
          },
          higher: {
            ...store.setting.hex.higher,
            char:
              payload.key === 'higher'
                ? payload.value.substr(-1) !== null
                  ? payload.value.substr(-1)
                  : ' '
                : store.setting.hex.higher.char
          }
        }
      }
    };

    // return {
    //   ...store,
    //   setting: {
    //     ...store.setting,
    //     hex: {
    //       ...store.setting.hex,
    //       [payload.key]: payload.value.substr(-1) !== null ? payload.value.substr(-1) : ' '
    //     }
    //   }
    // };
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
      else if (isAction.settingEncodingChange(action)) return settingEncodingChange(nextStore, refs, action);
      else if (isAction.settingHexCharChange(action)) return settingHexCharChange(nextStore, refs, action);
      else return { ...nextStore };
    },
    [
      settingAutoColumnChange,
      settingBodyChange,
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

  return { initialState, initialRef, reducer };
};
