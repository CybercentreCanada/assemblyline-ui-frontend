import React from 'react';
import { LayoutState } from '../models/Layout';
import { ActionHookProps, ActionProps } from '../models/NewStore';

export const DATA_INIT_ACTION = 'DATA_INIT_ACTION';
export const LAYOUT_RESIZE_ACTION = 'LAYOUT_RESIZE_ACTION';
export const LAYOUT_CHANGE_ACTION = 'LAYOUT_CHANGE_ACTION';
export const LAYOUT_COLUMNS_CHANGE_ACTION = 'LAYOUT_COLUMNS_CHANGE_ACTION';
export const LAYOUT_COLUMNS_AUTO_CHANGE_ACTION = 'LAYOUT_COLUMNS_AUTO_CHANGE_ACTION';
export const LAYOUT_ROWS_CHANGE_ACTION = 'LAYOUT_ROWS_CHANGE_ACTION';
export const LAYOUT_ROWS_AUTO_CHANGE_ACTION = 'LAYOUT_ROWS_AUTO_CHANGE_ACTION';
export const LAYOUT_CONTAINER_MOUSE_DOWN = 'LAYOUT_CONTAINER_MOUSE_DOWN';

export type LayoutActionTypes =
  | typeof DATA_INIT_ACTION
  | typeof LAYOUT_RESIZE_ACTION
  | typeof LAYOUT_CHANGE_ACTION
  | typeof LAYOUT_COLUMNS_CHANGE_ACTION
  | typeof LAYOUT_COLUMNS_AUTO_CHANGE_ACTION
  | typeof LAYOUT_ROWS_CHANGE_ACTION
  | typeof LAYOUT_ROWS_AUTO_CHANGE_ACTION
  | typeof LAYOUT_CONTAINER_MOUSE_DOWN;

export const isDataInitAction = (action: ActionProps) => action?.type === DATA_INIT_ACTION;
export const isLayoutResizeAction = (action: ActionProps) => action?.type === LAYOUT_RESIZE_ACTION;
export const isLayoutChangeAction = (action: ActionProps) => action?.type === LAYOUT_CHANGE_ACTION;
export const isLayoutColumnsChangeAction = (action: ActionProps) => action?.type === LAYOUT_COLUMNS_CHANGE_ACTION;
export const isLayoutColumnsAutoChangeAction = (action: ActionProps) =>
  action?.type === LAYOUT_COLUMNS_AUTO_CHANGE_ACTION;
export const isLayoutRowsChangeAction = (action: ActionProps) => action?.type === LAYOUT_ROWS_CHANGE_ACTION;
export const isLayoutRowsAutoChangeAction = (action: ActionProps) => action?.type === LAYOUT_ROWS_AUTO_CHANGE_ACTION;
export const isLayoutContainerMouseDown = (action: ActionProps) => action?.type === LAYOUT_CONTAINER_MOUSE_DOWN;

export type LayoutActions = {
  onDataInit: (data: string) => void;
  onLayoutResize?: () => void;
  onLayoutChange?: (newState: LayoutState) => void;
  onLayoutColumnsChange?: (columns: number) => void;
  onLayoutRowsChange?: (rows: number) => void;
  onLayoutAutoColumnsChange?: (auto: boolean) => void;
  onLayoutAutoRowsChange?: (auto: boolean) => void;
  onContainerMouseDown?: (event: MouseEvent) => void;
};

export const useLayoutAction = (dispatch: ActionHookProps): LayoutActions => {
  const onDataInit = React.useCallback(
    (data: string) => dispatch.current({ type: DATA_INIT_ACTION, payload: { data } }),
    [dispatch]
  );

  const onLayoutResize = React.useCallback(
    () => dispatch.current({ type: LAYOUT_RESIZE_ACTION, payload: null }),
    [dispatch]
  );

  const onLayoutChange = React.useCallback(
    (newState: LayoutState) => dispatch.current({ type: LAYOUT_CHANGE_ACTION, payload: newState }),
    [dispatch]
  );

  // const onLayoutRowsChange = React.useCallback(
  //   (rows: number) => dispatch.current({ type: LAYOUT_ROWS_CHANGE_ACTION, payload: { rows } }),
  //   [dispatch]
  // );

  // const onLayoutAutoColumnsChange = React.useCallback(
  //   (auto: boolean) => dispatch.current({ type: LAYOUT_COLUMNS_AUTO_CHANGE_ACTION, payload: { auto } }),
  //   [dispatch]
  // );

  // const onLayoutAutoRowsChange = React.useCallback(
  //   (auto: boolean) => dispatch.current({ type: LAYOUT_ROWS_AUTO_CHANGE_ACTION, payload: { auto } }),
  //   [dispatch]
  // );

  // const onContainerMouseDown = React.useCallback(
  //   (event: MouseEvent) => dispatch.current({ type: LAYOUT_CONTAINER_MOUSE_DOWN, payload: { event } }),
  //   [dispatch]
  // );

  return {
    onDataInit,
    onLayoutResize,
    onLayoutChange
    // onLayoutColumnsChange,
    // onLayoutRowsChange,
    // onLayoutAutoColumnsChange,
    // onLayoutAutoRowsChange,
    // onContainerMouseDown
  };
};
