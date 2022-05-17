import { useCallback, useMemo } from 'react';
import { CellType, isAction, ReducerProps, Store } from '..';

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

  const cellMouseEnter = useCallback((store: Store, payload: CellPayload): Store => {
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

  const cellMouseDown = useCallback((store: Store, payload: CellPayload): Store => {
    return {
      ...store,
      cell: {
        ...store.cell,
        isMouseDown: true,
        mouseDownIndex: payload.index
      }
    };
  }, []);

  const bodyMouseLeave = useCallback((store: Store, payload: CellPayload): Store => {
    return {
      ...store,
      cell: {
        ...store.cell,
        mouseLeaveIndex: store.cell.mouseEnterIndex,
        mouseEnterIndex: null
      }
    };
  }, []);

  const bodyMouseUp = useCallback((store: Store, payload: CellPayload): Store => {
    return {
      ...store,
      cell: {
        ...store.cell,
        isMouseDown: false
      }
    };
  }, []);

  const reducer = useCallback(
    ({ store, action }: ReducerProps): Store => {
      if (isAction.cellMouseEnter(action)) return cellMouseEnter(store, action.payload);
      else if (isAction.cellMouseDown(action)) return cellMouseDown(store, action.payload);
      else if (isAction.bodyMouseLeave(action)) return bodyMouseLeave(store, action.payload);
      else if (isAction.bodyMouseUp(action)) return bodyMouseUp(store, action.payload);
      else return { ...store };
    },
    [bodyMouseLeave, bodyMouseUp, cellMouseDown, cellMouseEnter]
  );

  return { initialState, initialRef, reducer };
};
