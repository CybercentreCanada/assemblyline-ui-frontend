import { useCallback, useMemo } from 'react';
import {
  BodyType,
  BODY_TYPE_SETTING_VALUES,
  COLUMNS,
  EncodingType,
  handleLayoutColumnResize2,
  handleLayoutRowResize,
  HIGHER_ENCODING_SETTING_VALUES,
  isAction,
  NON_PRINTABLE_ENCODING_SETTING_VALUES,
  OFFSET_SETTING_VALUES,
  ReducerHandler,
  Reducers,
  SearchTextType,
  SEARCH_TEXT_TYPE_VALUES,
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
    layout: {
      column: {
        auto: boolean;
        max: number;
      };
      row: {
        auto: boolean;
        max: number;
      };
    };
    search: {
      textType: number;
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
        layout: {
          column: {
            auto: true,
            max: 128
          },
          row: {
            auto: true,
            max: 2000
          }
        },
        search: {
          textType: 0
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
          max: store.layout.column.max
        },
        row: {
          auto: store.layout.row.auto,
          max: store.layout.row.max
        },
        search: {
          textType: store.search.textType
        }
      })
    );
  }, []);

  const settingLoad: Reducers['settingLoad'] = useCallback(store => {
    const value = localStorage.getItem(store.setting.storageKey);
    const json = JSON.parse(value) as any;

    if (value === null || value === '' || Array.isArray(json)) return { ...store };

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

    const offsetBase = (json as any).offsetBase === undefined ? store.offset.base : (json as any).offsetBase;
    const searchTextType =
      (json as any).search.textType === undefined ? store.search.textType : (json as any).search.textType;
    const autoColumn = (json as any).column.auto === undefined ? store.layout.column.auto : (json as any).column.auto;
    const maxColumn = (json as any).column.max === undefined ? store.layout.column.max : (json as any).column.max;

    return {
      ...store,
      setting: {
        ...store.setting,
        hex: {
          ...store.hex,
          null: { char: nullChar.substr(-1) !== null ? nullChar.substr(-1) : ' ' },
          nonPrintable: {
            encoding: NON_PRINTABLE_ENCODING_SETTING_VALUES.en.map(c => c.type).includes(nonPrintableEncoding)
              ? NON_PRINTABLE_ENCODING_SETTING_VALUES.en.map(c => c.type).findIndex(c => c === nonPrintableEncoding)
              : 0,
            char: nonPrintableChar.substr(-1) !== null ? nonPrintableChar.substr(-1) : ' '
          },
          higher: {
            encoding: HIGHER_ENCODING_SETTING_VALUES.en.map(c => c.type).includes(higherEncoding)
              ? HIGHER_ENCODING_SETTING_VALUES.en.map(c => c.type).findIndex(c => c === higherEncoding)
              : 0,
            char: higherChar.substr(-1) !== null ? higherChar.substr(-1) : ' '
          }
        },
        offsetBase: OFFSET_SETTING_VALUES.en.map(c => c.value).includes(offsetBase) ? offsetBase : 16,
        layout: {
          ...store.layout,
          column: {
            ...store.layout.column,
            auto: typeof autoColumn === 'boolean' ? autoColumn : store.setting.layout.column.auto,
            max: COLUMNS.map(c => c.columns).includes(maxColumn) ? maxColumn : store.setting.layout.column.max
          }
        },
        search: {
          ...store.search,
          textType: SEARCH_TEXT_TYPE_VALUES.en.map(c => c.type).includes(searchTextType)
            ? SEARCH_TEXT_TYPE_VALUES.en.map(c => c.type).findIndex(c => c === searchTextType)
            : 0
        }
      }
    };
  }, []);

  const settingSave: Reducers['settingSave'] = useCallback(
    store => {
      const newBodyType: BodyType = BODY_TYPE_SETTING_VALUES.en.find(e => e.value === store.setting.bodyType).type;
      const newSearchTextType: SearchTextType = SEARCH_TEXT_TYPE_VALUES.en.find(
        e => e.value === store.setting.search.textType
      ).type;
      const newLowerEncoding: EncodingType = NON_PRINTABLE_ENCODING_SETTING_VALUES.en.find(
        e => e.value === store.setting.hex.nonPrintable.encoding
      ).type;

      const newHigherEncoding: EncodingType = HIGHER_ENCODING_SETTING_VALUES.en.find(
        e => e.value === store.setting.hex.higher.encoding
      ).type;

      const {
        column: { auto: columnAuto, max: maxColumns },
        row: { auto: rowAuto, max: maxRows }
      } = store.setting.layout;

      const { width = 1, height = 1 } = document.getElementById('hex-viewer')?.getBoundingClientRect();

      let newColumnSize = handleLayoutColumnResize2(store, width as number);
      let newRowSize = handleLayoutRowResize(height as number);
      newColumnSize = columnAuto ? newColumnSize : Math.min(newColumnSize, maxColumns);
      newRowSize = rowAuto ? newRowSize : Math.min(newRowSize, maxRows);

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
          column: {
            ...store.layout.column,
            auto: columnAuto,
            max: maxColumns,
            size: newColumnSize
          },
          row: { ...store.layout.row, auto: rowAuto, max: maxRows, size: newRowSize }
        },
        search: {
          ...store.search,
          textType: newSearchTextType
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
        column: {
          auto: store.layout.column.auto,
          max: store.layout.column.auto ? store.layout.column.size : store.layout.column.max
        },
        row: { auto: store.layout.row.auto, max: store.layout.row.auto ? store.layout.row.size : store.layout.row.max },
        search: {
          textType: SEARCH_TEXT_TYPE_VALUES.en.find(e => e.type === store.search.textType).value
        }
      }
    };
  }, []);

  const settingClose: Reducers['settingClose'] = useCallback(store => {
    return { ...store, setting: { ...store.setting, open: false } };
  }, []);

  const settingReset: Reducers['settingReset'] = useCallback(store => {
    const { width = 1 } = document.getElementById('hex-viewer')?.getBoundingClientRect();
    const newColumnSize = handleLayoutColumnResize2(store, width as number);
    return {
      ...store,
      setting: {
        ...store.setting,
        bodyType: 0,
        hex: {
          null: { char: '0' },
          nonPrintable: { encoding: 0, char: '.' },
          higher: { encoding: 0, char: '.' }
        },
        offsetBase: 16,
        layout: {
          column: { auto: true, max: newColumnSize },
          row: { auto: true, max: 2000 }
        },
        search: {
          textType: 0
        }
      }
    };
  }, []);

  const settingSearchTextTypeChange: Reducers['settingSearchTextTypeChange'] = useCallback((store, { event }) => {
    return {
      ...store,
      setting: { ...store.setting, search: { ...store.setting.search, textType: event.target.value as number } }
    };
  }, []);

  const settingOffsetBaseChange: Reducers['settingOffsetBaseChange'] = useCallback((store, { event }) => {
    return { ...store, setting: { ...store.setting, offsetBase: event.target.value as number } };
  }, []);

  const settingAutoColumnChange: Reducers['settingAutoColumnChange'] = useCallback(store => {
    const { width = 1 } = document.getElementById('hex-viewer')?.getBoundingClientRect();
    const newColumnSize = handleLayoutColumnResize2(store, width as number);
    return {
      ...store,
      setting: {
        ...store.setting,
        layout: {
          ...store.setting.layout,
          column: {
            ...store.setting.layout.column,
            auto: !store.setting.layout.column.auto,
            max: store.setting.layout.column.auto ? store.setting.layout.column.max : newColumnSize
          }
        }
      }
    };
  }, []);

  const settingColumnChange: Reducers['settingColumnChange'] = useCallback((store, { value }) => {
    return {
      ...store,
      setting: {
        ...store.setting,
        layout: { ...store.setting.layout, column: { ...store.setting.layout.column, max: value } }
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

  const settingBodyResize: Reducers['bodyResize'] = useCallback((store, { height, width }) => {
    const newColumnSize = handleLayoutColumnResize2(store, width as number);
    return {
      ...store,
      setting: {
        ...store.setting,
        layout: {
          ...store.setting.layout,
          column: {
            ...store.setting.layout.column,
            max: store.setting.layout.column.auto ? newColumnSize : store.setting.layout.column.max
          }
        }
      }
    };
  }, []);

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      // Load and Save only when open
      if (isAction.settingLoad(type)) return settingLoad(store, payload);
      else if (isAction.settingSave(type)) return settingSave(store, payload);
      else if (isAction.settingOpen(type)) return settingOpen(store, payload);
      else if (isAction.settingClose(type)) return settingClose(store, payload);
      else if (isAction.settingReset(type)) return settingReset(store, payload);
      else if (isAction.settingBodyTypeChange(type)) return settingBodyTypeChange(store, payload);
      else if (isAction.settingSearchTextTypeChange(type)) return settingSearchTextTypeChange(store, payload);
      else if (isAction.settingOffsetBaseChange(type)) return settingOffsetBaseChange(store, payload);
      else if (isAction.settingAutoColumnChange(type)) return settingAutoColumnChange(store, payload);
      else if (isAction.settingColumnChange(type)) return settingColumnChange(store, payload);
      else if (isAction.settingEncodingChange(type)) return settingEncodingChange(store, payload);
      else if (isAction.settingHexCharChange(type)) return settingHexCharChange(store, payload);
      else if (isAction.bodyResize(type)) return settingBodyResize(store, payload);
      else return { ...store };
    },
    [
      settingLoad,
      settingSave,
      settingOpen,
      settingClose,
      settingReset,
      settingBodyTypeChange,
      settingSearchTextTypeChange,
      settingOffsetBaseChange,
      settingAutoColumnChange,
      settingColumnChange,
      settingEncodingChange,
      settingHexCharChange,
      settingBodyResize
    ]
  );

  return { initialState, reducer };
};
