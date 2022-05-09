import { useCallback, useMemo } from 'react';
import { ActionProps, EncodingType, isAction, parseDataToHexcodeMap, ReducerProps, Store, StoreRef } from '..';

export type HexState = {
  hex: {
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

export type HexRef = {
  hex: {
    data: string;
    codes: Map<number, string>;
  };
};

export type HexPayload = any;

export const useHexReducer = () => {
  const initialState = useMemo<HexState>(
    () => ({
      hex: {
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

  const initialRef = useMemo<HexRef>(
    () => ({
      hex: {
        data: '',
        codes: new Map()
      }
    }),
    []
  );

  const hexDataChange = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    refs.current.hex.data = payload.data;
    refs.current.hex.codes = parseDataToHexcodeMap(payload.data);
    return { ...store };
  }, []);

  const reducer = useCallback(
    ({ prevStore, nextStore, refs, action }: ReducerProps): Store => {
      if (isAction.appLoad(action)) return hexDataChange(nextStore, refs, action);
      else return { ...nextStore };
    },
    [hexDataChange]
  );

  return { initialState, initialRef, reducer };
};
