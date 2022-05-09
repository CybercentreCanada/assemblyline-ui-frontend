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

export type CellMouseEnterProps = {
  index: number;
  type: CellType;
  bodyRef: HTMLDivElement;
  listRef: HTMLDivElement;
};

export type CellMouseDownProps = {
  index: number;
  type: CellType;
  bodyRef: HTMLDivElement;
  listRef: HTMLDivElement;
};

export type CellActionProps = {
  onCellMouseEnter: (props: CellMouseEnterProps) => void;
  onCellMouseDown: (props: CellMouseDownProps) => void;
};

export const useCellAction = (dispatch: DispatchProp): CellActionProps => {
  const onCellMouseEnter = useCallback(
    (props: CellMouseEnterProps) => dispatch(ACTIONS.cellMouseEnter, { ...props }, false),
    [dispatch]
  );

  const onCellMouseDown = useCallback(
    (props: CellMouseDownProps) => dispatch(ACTIONS.cellMouseDown, { ...props }),
    [dispatch]
  );

  return {
    onCellMouseEnter,
    onCellMouseDown
  };
};
