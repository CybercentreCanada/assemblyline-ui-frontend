import { useCallback } from 'react';
import {
  DEFAULT_STORE,
  getSelectIndexes,
  isAction,
  isCellMouseDown,
  isSameCellClick,
  orderSelectIndexes,
  ReducerHandler,
  Reducers,
  renderArrayClass,
  RenderHandler,
  setStore,
  Store,
  useCellStyles,
  UseReducer
} from '..';

export const useSelectReducer: UseReducer = () => {
  const classes = useCellStyles();

  const selectRender = useCallback(
    (prevStore: Store, nextStore: Store): void => {
      const prev = getSelectIndexes(prevStore);
      const next = getSelectIndexes(nextStore);
      renderArrayClass(prev, next, classes.select, nextStore.cellsRendered);
    },
    [classes.select]
  );

  const selectClear: Reducers['appClickAway'] = useCallback(
    store => ({ ...store, select: { ...store.select, startIndex: -1, endIndex: -1 } }),
    []
  );

  const selectMouseEnter: Reducers['cellMouseEnter'] = useCallback(store => {
    if (!isCellMouseDown(store)) return { ...store };
    const { mouseEnterIndex, mouseDownIndex } = store.cell;
    return { ...store, select: { ...store.select, ...orderSelectIndexes(mouseDownIndex, mouseEnterIndex) } };
  }, []);

  const selectMouseDown: Reducers['cellMouseDown'] = useCallback(
    store => {
      return selectClear({ ...store, select: { ...store.select, isHighlighting: true } });
    },
    [selectClear]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const selectMouseUp: Reducers['bodyMouseUp'] = useCallback(
    store => {
      if (store.cell.mouseEnterIndex === null) return { ...store };
      else if (isSameCellClick(store) || !store.select.isHighlighting) return selectClear(store);
      else {
        return { ...store, select: { ...store.select, isHighlighting: false } };
      }
    },
    [selectClear]
  );

  const locationLoad: Reducers['locationLoad'] = useCallback(store => {
    if (
      DEFAULT_STORE.select.startIndex === store.location.select.startIndex ||
      DEFAULT_STORE.select.endIndex === store.location.select.endIndex
    )
      return { ...store };
    else
      return setStore.store.Select(
        store,
        orderSelectIndexes(store.location.select.startIndex, store.location.select.endIndex)
      );
  }, []);

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.appClickAway(type)) return selectClear(store);
      else if (isAction.cellMouseEnter(type)) return selectMouseEnter(store, payload);
      else if (isAction.cellMouseDown(type)) return selectMouseDown(store, payload);
      // else if (isAction.bodyMouseUp(type)) return selectMouseUp(store);
      else if (isAction.locationLoad(type)) return locationLoad(store);
      else return { ...store };
    },
    [selectClear, locationLoad, selectMouseDown, selectMouseEnter]
  );

  const render: RenderHandler = useCallback(
    ({ prevStore, nextStore }) => {
      if (!Object.is(prevStore.select, nextStore.select)) selectRender(prevStore, nextStore);
    },
    [selectRender]
  );

  return { reducer, render };
};
