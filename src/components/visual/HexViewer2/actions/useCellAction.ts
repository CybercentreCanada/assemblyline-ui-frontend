import { useCallback } from 'react';
import { ACTIONS, CellType, DispatchProp } from '..';

export type CellActions = {
  cellMouseEnter: 'CELL_MOUSE_ENTER_ACTION';
  cellMouseDown: 'CELL_MOUSE_DOWN_ACTION';
};

export const CELL_ACTIONS = {
  cellMouseEnter: 'CELL_MOUSE_ENTER_ACTION',
  cellMouseDown: 'CELL_MOUSE_DOWN_ACTION'
} as CellActions;

export type CellActionProps = {
  onCellMouseEnter: (index: number, type: CellType) => void;
  onCellMouseDown: (index: number, type: CellType) => void;
};

export const useCellAction = (dispatch: DispatchProp): CellActionProps => {
  const onCellMouseEnter = useCallback(
    (index: number, type: CellType) => dispatch(ACTIONS.cellMouseEnter, { index, type }, false),
    [dispatch]
  );

  const onCellMouseDown = useCallback(
    (index: number, type: CellType) => dispatch(ACTIONS.cellMouseDown, { index, type }),
    [dispatch]
  );

  return {
    onCellMouseEnter,
    onCellMouseDown
  };
};
