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
  StoreRef,
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
    (prevStore: Store, nextStore: Store, refs: StoreRef): void => {
      const { index: prevIndex } = prevStore.cursor;
      const { index: nextIndex } = nextStore.cursor;
      renderIndexClass(refs.current.layout.bodyRef, prevIndex, nextIndex, classes.cursor, refs.current.cellsRendered);
    },
    [classes.cursor]
  );

  const handleCursorIndex = useCallback((store: Store, refs: StoreRef, index: number): Store => {
    if (index === null) return { ...store, cursor: { ...store.cursor, index: null } };
    const newCursorIndex = Math.min(Math.max(index, 0), refs.current.hex.codes.size - 1);
    return { ...store, cursor: { ...store.cursor, index: newCursorIndex } };
  }, []);

  const cursorClear = useCallback(
    (store: Store, refs: StoreRef): Store => {
      return handleCursorIndex(store, refs, null);
    },
    [handleCursorIndex]
  );

  const cursorMouseUp = useCallback(
    (store: Store, refs: StoreRef): Store => {
      if (store.cell.mouseEnterIndex === null) return { ...store };
      else if (!isSameCellClick(store)) return handleCursorIndex(store, refs, null);
      else return handleCursorIndex(store, refs, store.cell.mouseEnterIndex);
    },
    [handleCursorIndex]
  );

  const cursorIndexChange = useCallback(
    (store: Store, refs: StoreRef, action: ActionProps): Store => {
      return handleCursorIndex(store, refs, action.payload.index);
    },
    [handleCursorIndex]
  );

  const cursorKeyDown = useCallback(
    (store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
      if (isCursorNull(store)) return { ...store };

      const { key: keyCode } = payload.event;
      let newCursorIndex: number = store.cursor.index;
      const { visibleStartIndex, visibleStopIndex } = refs.current.cellsRendered;

      if (isArrowLeft(keyCode)) newCursorIndex -= 1;
      else if (isArrowRight(keyCode)) newCursorIndex += 1;
      else if (isArrowUp(keyCode)) newCursorIndex -= store.layout.column.size;
      else if (isArrowDown(keyCode)) newCursorIndex += store.layout.column.size;
      else if (isHome(keyCode)) newCursorIndex = 0;
      else if (isEnd(keyCode)) newCursorIndex = refs.current.hex.codes.size - 1;
      else if (isPageUp(keyCode)) newCursorIndex -= visibleStopIndex - visibleStartIndex;
      else if (isPageDown(keyCode)) newCursorIndex += visibleStopIndex - visibleStartIndex;

      return handleCursorIndex(store, refs, newCursorIndex);
    },
    [handleCursorIndex]
  );

  const cursorLocation = useCallback(
    (store: Store, refs: StoreRef, action: ActionProps): Store => {
      if (store.location.cursor === null) return { ...store };
      else return handleCursorIndex(store, refs, store.location.cursor);
    },
    [handleCursorIndex]
  );

  const reducer = useCallback(
    ({ prevStore, nextStore, refs, action }: ReducerProps): Store => {
      if (isAction.bodyMouseUp(action)) return cursorMouseUp(nextStore, refs);
      else if (isAction.cursorIndexChange(action)) return cursorIndexChange(nextStore, refs, action);
      else if (isAction.appClickAway(action)) return cursorClear(nextStore, refs);
      else if (isAction.cursorClear(action)) return cursorClear(nextStore, refs);
      else if (isAction.cursorKeyDown(action)) return cursorKeyDown(nextStore, refs, action);
      else if (isAction.appLocationInit(action)) return cursorLocation(nextStore, refs, action);
      else return { ...nextStore };
    },
    [cursorClear, cursorIndexChange, cursorKeyDown, cursorLocation, cursorMouseUp]
  );

  const render = useCallback(
    ({ prevStore, nextStore, refs }: RenderProps): void => {
      if (prevStore.cursor.index !== nextStore.cursor.index) cursorRender(prevStore, nextStore, refs);
    },
    [cursorRender]
  );

  return { initialState, initialRef, reducer, render };
};
