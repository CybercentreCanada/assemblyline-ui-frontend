import { useCallback, useMemo } from 'react';
import { CellType, isAction, ReducerProps, Store, StoreRef } from '..';

export type CellState = {};

export type CellRef = {
  cell: {
    mouseEnterIndex: number;
    mouseLeaveIndex: number;
    mouseDownIndex: number;
    mouseUpIndex: number;
    isMouseDown: boolean;
    mouseOverType: CellType;
  };
};

export type CellPayload = {
  index: number;
  type: CellType;
};

export const useCellReducer = () => {
  const initialState = useMemo<CellState>(() => ({}), []);

  const initialRef = useMemo<CellRef>(
    () => ({
      cell: {
        mouseEnterIndex: null,
        mouseLeaveIndex: null,
        mouseDownIndex: null,
        mouseUpIndex: null,
        isMouseDown: false,
        mouseOverType: 'hex'
      }
    }),
    []
  );

  const cellMouseEnter = useCallback((refs: StoreRef, payload: CellPayload): void => {
    refs.current.cell = {
      ...refs.current.cell,
      mouseOverType: payload.type,
      mouseLeaveIndex: refs.current.cell.mouseEnterIndex,
      mouseEnterIndex: payload.index
    };
  }, []);

  const cellMouseDown = useCallback((refs: StoreRef, payload: CellPayload): void => {
    refs.current.cell.isMouseDown = true;
    refs.current.cell.mouseDownIndex = payload.index;
  }, []);

  const bodyMouseLeave = useCallback((refs: StoreRef, payload: CellPayload): void => {
    refs.current.cell = {
      ...refs.current.cell,
      mouseLeaveIndex: refs.current.cell.mouseEnterIndex,
      mouseEnterIndex: null
    };
  }, []);

  const bodyMouseUp = useCallback((refs: StoreRef, payload: CellPayload): void => {
    refs.current.cell.isMouseDown = false;
  }, []);

  const reducer = useCallback(
    ({ prevStore, nextStore, refs, action }: ReducerProps): Store => {
      if (isAction.cellMouseEnter(action)) cellMouseEnter(refs, action.payload);
      else if (isAction.cellMouseDown(action)) cellMouseDown(refs, action.payload);
      else if (isAction.bodyMouseLeave(action)) bodyMouseLeave(refs, action.payload);
      else if (isAction.bodyMouseUp(action)) bodyMouseUp(refs, action.payload);
      return { ...nextStore };
    },
    [bodyMouseLeave, bodyMouseUp, cellMouseDown, cellMouseEnter]
  );

  return { initialState, initialRef, reducer };
};
