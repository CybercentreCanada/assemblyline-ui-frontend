import { useCallback, useMemo } from 'react';
import {
  EncodingType,
  HIGHER_ENCODING_SETTING_VALUES,
  isAction,
  NON_PRINTABLE_ENCODING_SETTING_VALUES,
  parseDataToHexcodeMap,
  ReducerHandler,
  Reducers,
  UseReducer
} from '..';

export type HexState = {
  hex: {
    data: string;
    codes: Map<number, string>;
    null: {
      char: string;
    };
    nonPrintable: {
      encoding: EncodingType;
      char: string;
    };
    higher: {
      encoding: EncodingType;
      char: string;
    };
  };
  offset: {
    show: boolean;
    base: number;
    size: number;
  };
};

export const useHexReducer: UseReducer<HexState> = () => {
  const initialState = useMemo<HexState>(
    () => ({
      hex: {
        data: '',
        codes: new Map(),
        null: {
          char: '.'
        },
        nonPrintable: {
          encoding: 'hidden',
          char: '.'
        },
        higher: {
          encoding: 'hidden',
          char: '.'
        }
      },
      offset: {
        show: true,
        base: 16,
        size: 8
      }
    }),
    []
  );

  const hexDataChange: Reducers['appLoad'] = useCallback((store, { data }) => {
    if (data === undefined || data === null || data === '') return { ...store };
    const codes = parseDataToHexcodeMap(data);
    return { ...store, hex: { ...store.hex, data, codes } };
  }, []);

  const settingLoad: Reducers['settingLoad'] = useCallback(store => {
    return {
      ...store,
      hex: {
        ...store.hex,
        null: { char: store.setting.hex.null.char },
        nonPrintable: {
          encoding: NON_PRINTABLE_ENCODING_SETTING_VALUES.en[store.setting.hex.nonPrintable.encoding].type,
          char: store.setting.hex.nonPrintable.char
        },
        higher: {
          encoding: HIGHER_ENCODING_SETTING_VALUES.en[store.setting.hex.higher.encoding].type,
          char: store.setting.hex.higher.char
        }
      },
      offset: {
        ...store.offset,
        base: store.setting.offsetBase
      }
    };
  }, []);

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.appLoad(type)) return hexDataChange(store, payload);
      else if (isAction.settingLoad(type)) return settingLoad(store, payload);
      else return { ...store };
    },
    [hexDataChange, settingLoad]
  );

  return { initialState, reducer };
};
