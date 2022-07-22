import { useCallback } from 'react';
import {
  isAction,
  isCellMouseDown,
  ReducerHandler,
  Reducers,
  RenderHandler,
  renderIndexClass,
  Store,
  useCellStyles,
  UseReducer
} from '..';

export type HoverState = {
  hover: { index: number };
};

export const useHoverReducer: UseReducer<HoverState> = () => {
  const classes = useCellStyles();

  const initialState: HoverState = { hover: { index: null } };

  const hoverRender = useCallback(
    (prevStore: Store, nextStore: Store): void => {
      const { index: prevIndex } = prevStore.hover;
      const { index: nextIndex } = nextStore.hover;
      renderIndexClass(prevIndex, nextIndex, classes.hover, nextStore.cellsRendered);
    },
    [classes.hover]
  );

  const hoverMouseEnter: Reducers['cellMouseEnter'] = useCallback(store => {
    return { ...store, hover: { ...store.hover, index: store.cell.mouseEnterIndex } };
  }, []);

  const hoverMouseLeave: Reducers['bodyMouseLeave'] = useCallback(store => {
    return { ...store, hover: { ...store.hover, index: null } };
  }, []);

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.cellMouseEnter(type) && !isCellMouseDown(store)) return hoverMouseEnter(store, payload);
      else if (isAction.bodyMouseLeave(type)) return hoverMouseLeave(store);
      else return { ...store };
    },
    [hoverMouseEnter, hoverMouseLeave]
  );

  const render: RenderHandler = useCallback(
    ({ prevStore, nextStore }) => {
      if (prevStore.hover.index !== nextStore.hover.index) hoverRender(prevStore, nextStore);
    },
    [hoverRender]
  );

  return { initialState, reducer, render };
};
