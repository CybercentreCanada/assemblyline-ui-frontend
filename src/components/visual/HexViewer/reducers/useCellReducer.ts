import { useCallback, useMemo } from 'react';
import { CellType, isAction, ReducerProps, Store, StoreRef } from '..';

export type CellState = {
  cell: {
    mouseEnterIndex: number;
    mouseLeaveIndex: number;
    mouseDownIndex: number;
    mouseUpIndex: number;
    isMouseDown: boolean;
    mouseOverType: CellType;
  };
};

export type CellRef = {};

export type CellPayload = {
  index: number;
  type: CellType;
};

export const useCellReducer = () => {
  const initialState = useMemo<CellState>(
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

  const initialRef = useMemo<CellRef>(() => ({}), []);

  const cellMouseEnter = useCallback((store: Store, refs: StoreRef, payload: CellPayload): Store => {
    return {
      ...store,
      cell: {
        ...store.cell,
        mouseOverType: payload.type,
        mouseLeaveIndex: store.cell.mouseEnterIndex,
        mouseEnterIndex: payload.index
      }
    };
  }, []);

  const cellMouseDown = useCallback((store: Store, refs: StoreRef, payload: CellPayload): Store => {
    return {
      ...store,
      cell: {
        ...store.cell,
        isMouseDown: true,
        mouseDownIndex: payload.index
      }
    };
  }, []);

  const bodyMouseLeave = useCallback((store: Store, refs: StoreRef, payload: CellPayload): Store => {
    return {
      ...store,
      cell: {
        ...store.cell,
        mouseLeaveIndex: store.cell.mouseEnterIndex,
        mouseEnterIndex: null
      }
    };
  }, []);

  const bodyMouseUp = useCallback((store: Store, refs: StoreRef, payload: CellPayload): Store => {
    return {
      ...store,
      cell: {
        ...store.cell,
        isMouseDown: false
      }
    };
  }, []);

  const reducer = useCallback(
    ({ prevStore, nextStore, refs, action }: ReducerProps): Store => {
      if (isAction.cellMouseEnter(action)) return cellMouseEnter(nextStore, refs, action.payload);
      else if (isAction.cellMouseDown(action)) return cellMouseDown(nextStore, refs, action.payload);
      else if (isAction.bodyMouseLeave(action)) return bodyMouseLeave(nextStore, refs, action.payload);
      else if (isAction.bodyMouseUp(action)) return bodyMouseUp(nextStore, refs, action.payload);
      return { ...nextStore };
    },
    [bodyMouseLeave, bodyMouseUp, cellMouseDown, cellMouseEnter]
  );

  return { initialState, initialRef, reducer };
};
