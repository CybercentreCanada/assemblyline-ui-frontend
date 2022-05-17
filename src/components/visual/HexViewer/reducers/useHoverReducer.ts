import { useCallback } from 'react';
import { isAction, isCellMouseDown, ReducerProps, renderIndexClass, RenderProps, Store, useCellStyles } from '..';

export type HoverState = {
  hover: { index: number };
};

export type HoverRef = {};

export const useHoverReducer = () => {
  const classes = useCellStyles();

  const initialState: HoverState = { hover: { index: null } };

  const initialRef: HoverRef = {};

  const hoverRender = useCallback(
    (prevStore: Store, nextStore: Store): void => {
      const { index: prevIndex } = prevStore.hover;
      const { index: nextIndex } = nextStore.hover;
      renderIndexClass(prevIndex, nextIndex, classes.hover, nextStore.cellsRendered);
    },
    [classes.hover]
  );

  const hoverMouseEnter = useCallback((store: Store): Store => {
    return { ...store, hover: { ...store.hover, index: store.cell.mouseEnterIndex } };
  }, []);

  const hoverMouseLeave = useCallback((store: Store): Store => {
    return { ...store, hover: { ...store.hover, index: null } };
  }, []);

  const reducer = useCallback(
    ({ store, action }: ReducerProps): Store => {
      if (isAction.cellMouseEnter(action) && !isCellMouseDown(store)) return hoverMouseEnter(store);
      else if (isAction.bodyMouseLeave(action)) return hoverMouseLeave(store);
      else return { ...store };
    },
    [hoverMouseEnter, hoverMouseLeave]
  );

  const render = useCallback(
    ({ prevStore, nextStore }: RenderProps): void => {
      if (prevStore.hover.index !== nextStore.hover.index) hoverRender(prevStore, nextStore);
    },
    [hoverRender]
  );

  return { initialState, initialRef, reducer, render };
};
