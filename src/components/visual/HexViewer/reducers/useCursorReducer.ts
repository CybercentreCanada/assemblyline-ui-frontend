import { isArrowDown, isArrowLeft, isArrowRight, isArrowUp } from 'commons_deprecated/addons/elements/utils/keyboard';
import { useCallback } from 'react';
import {
  DEFAULT_STORE,
  isAction,
  isCursorNull,
  isEnd,
  isHome,
  isPageDown,
  isPageUp,
  isSameCellClick,
  ReducerHandler,
  Reducers,
  RenderHandler,
  renderIndexClass,
  Store,
  useCellStyles,
  UseReducer
} from '..';

export const useCursorReducer: UseReducer = () => {
  const classes = useCellStyles();

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

  const cursorClickAway: Reducers['appClickAway'] = useCallback(
    store => handleCursorIndex(store, null),
    [handleCursorIndex]
  );

  const cursorClear: Reducers['cursorClear'] = useCallback(
    store => handleCursorIndex(store, null),
    [handleCursorIndex]
  );

  const cursorMouseUp: Reducers['bodyMouseUp'] = useCallback(
    store => {
      if (store.cell.mouseEnterIndex === null) return { ...store };
      else if (!isSameCellClick(store)) return handleCursorIndex(store, null);
      else return handleCursorIndex(store, store.cell.mouseEnterIndex);
    },
    [handleCursorIndex]
  );

  const cursorIndexChange: Reducers['cursorIndexChange'] = useCallback(
    (store, { index }) => handleCursorIndex(store, index),
    [handleCursorIndex]
  );

  const cursorKeyDown: Reducers['cursorKeyDown'] = useCallback(
    (store, { event }) => {
      if (isCursorNull(store)) return { ...store };

      const { key: keyCode } = event;
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

  const locationLoad: Reducers['locationLoad'] = useCallback(
    store => {
      if (DEFAULT_STORE.location.cursor.index === store.location.cursor.index) return { ...store };
      else return handleCursorIndex(store, store.location.cursor.index);
    },
    [handleCursorIndex]
  );

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.bodyMouseUp(type)) return cursorMouseUp(store);
      else if (isAction.cursorIndexChange(type)) return cursorIndexChange(store, payload);
      else if (isAction.appClickAway(type)) return cursorClickAway(store);
      else if (isAction.cursorClear(type)) return cursorClear(store);
      else if (isAction.cursorKeyDown(type)) return cursorKeyDown(store, payload);
      else if (isAction.locationLoad(type)) return locationLoad(store);
      else return { ...store };
    },
    [cursorClear, cursorClickAway, cursorIndexChange, cursorKeyDown, locationLoad, cursorMouseUp]
  );

  const render: RenderHandler = useCallback(
    ({ prevStore, nextStore }) => {
      if (prevStore.cursor.index !== nextStore.cursor.index) cursorRender(prevStore, nextStore);
    },
    [cursorRender]
  );

  return { reducer, render };
};
