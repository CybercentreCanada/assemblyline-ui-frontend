import { useCallback } from 'react';
import { ACTIONS, ActionTypesConfig, CellType, Dispatch, DispatchersConfig } from '..';

export type CellAction =
  | { type: 'cellMouseEnter'; payload: { index: number; type: CellType }; tracked: false }
  | {
      type: 'cellMouseDown';
      payload: { index: number; type: CellType };
      guard: { event: React.MouseEvent<HTMLTableDataCellElement, MouseEvent> };
    };

export type CellActionTypes = ActionTypesConfig<CellAction>;
export type CellDispatchers = DispatchersConfig<CellAction>;

export const CELL_ACTION_TYPES: CellActionTypes = {
  cellMouseEnter: 'CellMouseEnter_Action',
  cellMouseDown: 'CellMouseDown_Action'
} as CellActionTypes;

export const useCellDispatcher = (dispatch: Dispatch): CellDispatchers => {
  const onCellMouseDown: CellDispatchers['onCellMouseDown'] = useCallback(
    (payload, { event }) => {
      if (event.button !== 0) return;
      dispatch({ type: ACTIONS.cellMouseDown, payload });
    },
    [dispatch]
  );

  return {
    onCellMouseEnter: payload => dispatch({ type: ACTIONS.cellMouseEnter, payload, tracked: false }),
    onCellMouseDown
  };
};
