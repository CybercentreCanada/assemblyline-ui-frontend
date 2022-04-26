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
  StoreRef,
  useCellStyles
} from '..';

export type SelectState = { select: { startIndex: number; endIndex: number } };

export type SelectRef = {
  select: {
    isHighlighting: boolean;
  };
};

export const useSelectReducer = () => {
  const classes = useCellStyles();
  const initialState: SelectState = { select: { startIndex: -1, endIndex: -1 } };
  const initialRef: SelectRef = { select: { isHighlighting: false } };

  const selectRender = useCallback(
    (prevStore: Store, nextStore: Store, refs: StoreRef): void => {
      const prev = getSelectIndexes(prevStore, refs);
      const next = getSelectIndexes(nextStore, refs);
      renderArrayClass(refs.current.layout.bodyRef, prev, next, classes.select, refs.current.cellsRendered);
    },
    [classes.select]
  );

  const selectMouseEnter = useCallback((store: Store, refs: StoreRef): Store => {
    if (!isCellMouseDown(refs)) return { ...store };
    const { mouseEnterIndex, mouseDownIndex } = refs.current.cell;
    return { ...store, select: orderSelectIndexes(mouseDownIndex, mouseEnterIndex) };
  }, []);

  const selectClear = useCallback(
    (store: Store): Store => ({ ...store, select: { startIndex: -1, endIndex: -1 } }),
    []
  );

  const selectMouseUp = useCallback(
    (store: Store, refs: StoreRef): Store => {
      if (refs?.current?.cell.mouseEnterIndex === null) return { ...store };
      else if (isSameCellClick(refs) || !refs.current.select.isHighlighting) return selectClear(store);
      else {
        refs.current.select.isHighlighting = false;
        return { ...store };
      }
    },
    [selectClear]
  );

  const selectMouseDown = useCallback(
    (store: Store, refs: StoreRef): Store => {
      refs.current.select.isHighlighting = true;
      return selectClear(store);
    },
    [selectClear]
  );

  // const selectClear = useCallback(
  //   (store: Store, refs: StoreRef): Store => {
  //     if (store.select.startIndex === -1 && store.select.endIndex === -1) return { ...store };
  //     removeClassToRange(refs.current.layout.bodyRef, store.select.startIndex, store.select.endIndex, classes.select);
  //     return { ...store, select: { startIndex: -1, endIndex: -1 } };
  //   },
  //   [classes.select]
  // );

  // const selectMouseEnter = useCallback(
  //   (store: Store, refs: StoreRef): Store => {
  //     if (!isCellMouseDown(refs)) return { ...store };
  //     const { mouseEnterIndex, mouseLeaveIndex, mouseDownIndex } = refs.current.cell;
  //     handleSelectClass(refs.current.layout.bodyRef, mouseEnterIndex, mouseLeaveIndex, mouseDownIndex, classes.select);
  //     return {
  //       ...store,
  //       select: orderSelectIndexes(refs.current.cell.mouseDownIndex, refs.current.cell.mouseEnterIndex)
  //     };
  //   },
  //   [classes.select]
  // );

  // const selectMouseUp = useCallback(
  //   (store: Store, refs: StoreRef): Store => {
  //     if (isSameCellClick(refs) || !refs.current.select.isHighlighting) return selectClear(store, refs);
  //     refs.current.select.isHighlighting = false;
  //     return { ...store };
  //   },
  //   [selectClear]
  // );

  // const selectMouseDown = useCallback(
  //   (store: Store, refs: StoreRef): Store => {
  //     refs.current.select.isHighlighting = true;
  //     return selectClear(store, refs);
  //   },
  //   [selectClear]
  // );

  const selectLocation = useCallback((store: Store, refs: StoreRef): Store => {
    if (store.location.selectStart === null || store.location.selectEnd === null) return { ...store };
    else return { ...store, select: orderSelectIndexes(store.location.selectStart, store.location.selectEnd) };
  }, []);

  const reducer = useCallback(
    ({ prevStore, nextStore, refs, action }: ReducerProps): Store => {
      if (isAction.cellMouseEnter(action)) return selectMouseEnter(nextStore, refs);
      else if (isAction.cellMouseDown(action)) return selectMouseDown(nextStore, refs);
      else if (isAction.bodyMouseUp(action)) return selectMouseUp(nextStore, refs);
      else if (isAction.appClickAway(action)) return selectClear(nextStore);
      else if (isAction.appLocationInit(action)) return selectLocation(nextStore, refs);
      else return { ...nextStore };
    },
    [selectClear, selectLocation, selectMouseDown, selectMouseEnter, selectMouseUp]
  );

  const render = useCallback(
    ({ prevStore, nextStore, refs }: RenderProps): void => {
      if (!Object.is(prevStore.select, nextStore.select)) selectRender(prevStore, nextStore, refs);
    },
    [selectRender]
  );

  return { initialState, initialRef, reducer, render };
};
