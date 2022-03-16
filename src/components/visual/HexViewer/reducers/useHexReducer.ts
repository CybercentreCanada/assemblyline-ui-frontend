import { useCallback, useMemo } from 'react';
import { isDataInitAction } from '../actions/useLayoutAction';
import { HexRef, HexState } from '../models/Hex';
import { ActionProps, Store } from '../models/NewStore';
// import { addClass } from '../actions/StyleActions';

export const useHexReducer = () => {
  const initialState = useMemo<HexState>(
    () => ({
      hexBaseValues: [],
      hexOffsetBase: 16,
      hexOffsetSize: 8
    }),
    []
  );

  const initialRef = useMemo<HexRef>(() => ({}), []);

  const dataInit = useCallback(
    (state: Store, { type, refs, payload }: ActionProps): Store => ({
      ...state
    }),
    []
  );

  const reducer = useCallback(
    (prevState: Store, nextState: Store, refs: React.MutableRefObject<HexRef>, action: ActionProps): Store => {
      if (isDataInitAction(action)) return dataInit(nextState, action);
      else return { ...nextState };
    },
    [dataInit]
  );

  return { initialState, initialRef, reducer };
};
