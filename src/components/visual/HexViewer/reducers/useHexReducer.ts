import { useCallback, useMemo } from 'react';
import { EncodingType, isAction, parseDataToHexcodeMap, ReducerHandler, Reducers, UseReducer } from '..';

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
          char: '0'
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

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.appLoad(type)) return hexDataChange(store, payload);
      else return { ...store };
    },
    [hexDataChange]
  );

  return { initialState, reducer };
};
