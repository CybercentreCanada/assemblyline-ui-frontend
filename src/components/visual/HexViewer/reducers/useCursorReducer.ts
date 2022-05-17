import { isArrowDown, isArrowLeft, isArrowRight, isArrowUp } from 'commons/addons/elements/utils/keyboard';
import { useCallback } from 'react';
import {
  ActionProps,
  isAction,
  isCursorNull,
  isEnd,
  isHome,
  isPageDown,
  isPageUp,
  isSameCellClick,
  ReducerProps,
  renderIndexClass,
  RenderProps,
  Store,
  useCellStyles
} from '..';

export type CursorState = {
  cursor: {
    index: number;
  };
};

export type CursorRef = {};

export const useCursorReducer = () => {
  const classes = useCellStyles();

  const initialState: CursorState = {
    cursor: {
      index: null
    }
  };

  const initialRef: CursorRef = {};

  const cursorRender = useCallback(
    (prevStore: Store, nextStore: Store): void => {
      const { index: prevIndex } = prevStore.cursor;
      const { index: nextIndex } = nextStore.cursor;
      renderIndexClass(prevIndex, nextIndex, classes.cursor, nextStore.cellsRendered);
    },
    [classes.cursor]
  );

  const handleCursorIndex = useCallback((store: Store, index: number): Store => {
    if (index === null) return { ...store, cursor: { ...store.cursor, index: null } };
    const newCursorIndex = Math.min(Math.max(index, 0), store.hex.codes.size - 1);
    return { ...store, cursor: { ...store.cursor, index: newCursorIndex } };
  }, []);

  const cursorClear = useCallback(
    (store: Store): Store => {
      return handleCursorIndex(store, null);
    },
    [handleCursorIndex]
  );

  const cursorMouseUp = useCallback(
    (store: Store): Store => {
      if (store.cell.mouseEnterIndex === null) return { ...store };
      else if (!isSameCellClick(store)) return handleCursorIndex(store, null);
      else return handleCursorIndex(store, store.cell.mouseEnterIndex);
    },
    [handleCursorIndex]
  );

  const cursorIndexChange = useCallback(
    (store: Store, action: ActionProps): Store => {
      return handleCursorIndex(store, action.payload.index);
    },
    [handleCursorIndex]
  );

  const cursorKeyDown = useCallback(
    (store: Store, { type, payload }: ActionProps): Store => {
      if (isCursorNull(store)) return { ...store };

      const { key: keyCode } = payload.event;
      let newCursorIndex: number = store.cursor.index;
      const { visibleStartIndex, visibleStopIndex } = store.cellsRendered;

      if (isArrowLeft(keyCode)) newCursorIndex -= 1;
      else if (isArrowRight(keyCode)) newCursorIndex += 1;
      else if (isArrowUp(keyCode)) newCursorIndex -= store.layout.column.size;
      else if (isArrowDown(keyCode)) newCursorIndex += store.layout.column.size;
      else if (isHome(keyCode)) newCursorIndex = 0;
      else if (isEnd(keyCode)) newCursorIndex = store.hex.codes.size - 1;
      else if (isPageUp(keyCode)) newCursorIndex -= visibleStopIndex - visibleStartIndex;
      else if (isPageDown(keyCode)) newCursorIndex += visibleStopIndex - visibleStartIndex;

      return handleCursorIndex(store, newCursorIndex);
    },
    [handleCursorIndex]
  );

  const cursorLocation = useCallback(
    (store: Store, action: ActionProps): Store => {
      if (store.location.cursor === null) return { ...store };
      else return handleCursorIndex(store, store.location.cursor);
    },
    [handleCursorIndex]
  );

  const reducer = useCallback(
    ({ store, action }: ReducerProps): Store => {
      if (isAction.bodyMouseUp(action)) return cursorMouseUp(store);
      else if (isAction.cursorIndexChange(action)) return cursorIndexChange(store, action);
      else if (isAction.appClickAway(action)) return cursorClear(store);
      else if (isAction.cursorClear(action)) return cursorClear(store);
      else if (isAction.cursorKeyDown(action)) return cursorKeyDown(store, action);
      else if (isAction.appLocationInit(action)) return cursorLocation(store, action);
      else return { ...store };
    },
    [cursorClear, cursorIndexChange, cursorKeyDown, cursorLocation, cursorMouseUp]
  );

  const render = useCallback(
    ({ prevStore, nextStore }: RenderProps): void => {
      if (prevStore.cursor.index !== nextStore.cursor.index) cursorRender(prevStore, nextStore);
    },
    [cursorRender]
  );

  return { initialState, initialRef, reducer, render };
};
