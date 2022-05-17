import { useCallback } from 'react';
import {
  getSelectIndexes,
  isAction,
  isCellMouseDown,
  isSameCellClick,
  orderSelectIndexes,
  ReducerProps,
  renderArrayClass,
  RenderProps,
  Store,
  useCellStyles
} from '..';

export type SelectState = { select: { startIndex: number; endIndex: number; isHighlighting: boolean } };

export type SelectRef = {};

export const useSelectReducer = () => {
  const classes = useCellStyles();
  const initialState: SelectState = { select: { startIndex: -1, endIndex: -1, isHighlighting: false } };
  const initialRef: SelectRef = {};

  const selectRender = useCallback(
    (prevStore: Store, nextStore: Store): void => {
      const prev = getSelectIndexes(prevStore);
      const next = getSelectIndexes(nextStore);
      renderArrayClass(prev, next, classes.select, nextStore.cellsRendered);
    },
    [classes.select]
  );

  const selectMouseEnter = useCallback((store: Store): Store => {
    if (!isCellMouseDown(store)) return { ...store };
    const { mouseEnterIndex, mouseDownIndex } = store.cell;
    return { ...store, select: { ...store.select, ...orderSelectIndexes(mouseDownIndex, mouseEnterIndex) } };
  }, []);

  const selectClear = useCallback(
    (store: Store): Store => ({ ...store, select: { ...store.select, startIndex: -1, endIndex: -1 } }),
    []
  );

  const selectMouseUp = useCallback(
    (store: Store): Store => {
      if (store.cell.mouseEnterIndex === null) return { ...store };
      else if (isSameCellClick(store) || !store.select.isHighlighting) return selectClear(store);
      else {
        return { ...store, select: { ...store.select, isHighlighting: false } };
      }
    },
    [selectClear]
  );

  const selectMouseDown = useCallback(
    (store: Store): Store => {
      return selectClear({ ...store, select: { ...store.select, isHighlighting: true } });
    },
    [selectClear]
  );

  const selectLocation = useCallback((store: Store): Store => {
    if (store.location.selectStart === null || store.location.selectEnd === null) return { ...store };
    else
      return {
        ...store,
        select: { ...store.select, ...orderSelectIndexes(store.location.selectStart, store.location.selectEnd) }
      };
  }, []);

  const reducer = useCallback(
    ({ prevStore, store, action }: ReducerProps): Store => {
      if (isAction.cellMouseEnter(action)) return selectMouseEnter(store);
      else if (isAction.cellMouseDown(action)) return selectMouseDown(store);
      else if (isAction.bodyMouseUp(action)) return selectMouseUp(store);
      else if (isAction.appClickAway(action)) return selectClear(store);
      else if (isAction.appLocationInit(action)) return selectLocation(store);
      else return { ...store };
    },
    [selectClear, selectLocation, selectMouseDown, selectMouseEnter, selectMouseUp]
  );

  const render = useCallback(
    ({ prevStore, nextStore }: RenderProps): void => {
      if (!Object.is(prevStore.select, nextStore.select)) selectRender(prevStore, nextStore);
    },
    [selectRender]
  );

  return { initialState, initialRef, reducer, render };
};
