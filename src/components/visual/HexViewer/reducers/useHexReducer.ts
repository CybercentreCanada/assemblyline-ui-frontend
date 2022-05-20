import { useCallback, useMemo } from 'react';
import { ActionProps, EncodingType, isAction, parseDataToHexcodeMap, ReducerProps, Store } from '..';

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
    base: number;
    size: number;
  };
};

export type HexPayload = any;

export const useHexReducer = () => {
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
        base: 16,
        size: 8
      }
    }),
    []
  );

  const hexDataChange = useCallback((store: Store, { type, payload }: ActionProps): Store => {
    store.hex.data = payload.data;
    store.hex.codes = parseDataToHexcodeMap(payload.data);
    return { ...store };
  }, []);

  const reducer = useCallback(
    ({ store, action }: ReducerProps): Store => {
      if (isAction.appLoad(action)) return hexDataChange(store, action);
      else return { ...store };
    },
    [hexDataChange]
  );

  return { initialState, reducer };
};
