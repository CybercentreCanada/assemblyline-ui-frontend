import { useCallback, useMemo } from 'react';
import { CellType, isAction, ReducerHandler, Reducers, UseReducer } from '..';

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

export const useCellReducer: UseReducer<CellState> = () => {
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

  const cellMouseEnter: Reducers['cellMouseEnter'] = useCallback((store, { type, index }) => {
    return { ...store, cell: { ...store.cell, mouseOverType: type, mouseLeaveIndex: index, mouseEnterIndex: index } };
  }, []);

  const cellMouseDown: Reducers['cellMouseDown'] = useCallback((store, { type, index }) => {
    return { ...store, cell: { ...store.cell, isMouseDown: true, mouseDownIndex: index } };
  }, []);

  const bodyMouseLeave: Reducers['bodyMouseLeave'] = useCallback((store, payload) => {
    return { ...store, cell: { ...store.cell, mouseLeaveIndex: store.cell.mouseEnterIndex, mouseEnterIndex: null } };
  }, []);

  const bodyMouseUp: Reducers['bodyMouseUp'] = useCallback((store, payload) => {
    return { ...store, cell: { ...store.cell, isMouseDown: false } };
  }, []);

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.cellMouseEnter(type)) return cellMouseEnter(store, payload);
      else if (isAction.cellMouseDown(type)) return cellMouseDown(store, payload);
      else if (isAction.bodyMouseLeave(type)) return bodyMouseLeave(store, payload);
      else if (isAction.bodyMouseUp(type)) return bodyMouseUp(store, payload);
      else return { ...store };
    },
    [bodyMouseLeave, bodyMouseUp, cellMouseDown, cellMouseEnter]
  );

  return { initialState, reducer };
};
