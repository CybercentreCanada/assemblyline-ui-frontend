import { useCallback } from 'react';
import type { HoverState, ReducerHandler, Reducers, RenderHandler, Store, UseReducer } from '..';
import { isAction, isCellMouseDown, renderIndexClass } from '..';

export const useHoverReducer: UseReducer = () => {
  const initialState: HoverState = { hover: { index: null } };

  const hoverRender = useCallback((prevStore: Store, nextStore: Store): void => {
    const { index: prevIndex } = prevStore.hover;
    const { index: nextIndex } = nextStore.hover;
    renderIndexClass(prevIndex, nextIndex, 'hex-viewer-hover', nextStore.cellsRendered);
  }, []);

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
