import { useCallback, useMemo } from 'react';
import { EncodingType, isAction, parseDataToHexcodeMap, ReducerHandler, Reducers, UseReducer } from '..';

export type HexState = {
  hex: {
    data: string;
    codes: Map<number, string>;
    null: {
      char: string;
    };
    lower: {
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
        lower: {
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
    store.hex.data = data;
    store.hex.codes = parseDataToHexcodeMap(data);
    return { ...store };
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
