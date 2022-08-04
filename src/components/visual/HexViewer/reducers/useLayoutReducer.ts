import { useCallback, useMemo } from 'react';
import {
  DisplayType,
  FocusType,
  handleLayoutColumnResize2,
  handleLayoutRowResize,
  isAction,
  isBody,
  ReducerHandler,
  Reducers,
  UseReducer
} from '..';

export type LayoutState = {
  layout: {
    display: DisplayType;
    column: {
      size: number;
      auto: boolean;
    };
    row: {
      size: number;
      auto: boolean;
    };
    isFocusing: FocusType;
  };
};

export const useLayoutReducer: UseReducer<LayoutState> = () => {
  const initialState = useMemo<LayoutState>(
    () => ({
      layout: {
        display: 'dual',
        column: {
          size: 1,
          auto: true
        },
        row: {
          size: 0,
          auto: true
        },
        isFocusing: 'none'
      }
    }),
    []
  );

  const layoutResize: Reducers['bodyResize'] = useCallback((store, { height, width }) => {
    const {
      column: { auto: columnAuto, size: columnSize },
      row: { auto: rowAuto, size: rowSize }
    } = store.layout;
    const newColumnSize = columnAuto ? handleLayoutColumnResize2(store, width as number) : columnSize;
    const newRowSize = rowAuto && isBody.table(store) ? handleLayoutRowResize(height as number) : rowSize;

    return {
      ...store,
      layout: {
        ...store.layout,
        column: { ...store.layout.column, size: newColumnSize },
        row: { ...store.layout.row, size: newRowSize }
      }
    };
  }, []);

  const layoutFocusNone: Reducers['appClickAway'] = useCallback(store => {
    return { ...store, layout: { ...store.layout, isFocusing: 'none' } };
  }, []);

  const layoutFocusBody: Reducers['cellMouseDown'] = useCallback(store => {
    return { ...store, layout: { ...store.layout, isFocusing: 'body' } };
  }, []);

  const layoutFocusToolbar: Reducers['searchBarFocus'] = useCallback(store => {
    return { ...store, layout: { ...store.layout, isFocusing: 'toolbar' } };
  }, []);

  const layoutCellRendered: Reducers['bodyItemsRendered'] = useCallback((store, { event }) => {
    if (event === null) return { ...store };
    const { visibleStartIndex, visibleStopIndex } = event;
    return {
      ...store,
      layout: {
        ...store.layout,
        row: { ...store.layout.row, size: visibleStopIndex - visibleStartIndex }
      }
    };
  }, []);

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.bodyResize(type)) return layoutResize(store, payload);
      else if (isAction.appClickAway(type)) return layoutFocusNone(store, payload);
      else if (isAction.cellMouseDown(type)) return layoutFocusBody(store, payload);
      else if (isAction.searchBarFocus(type)) return layoutFocusToolbar(store, payload);
      else if (isAction.bodyItemsRendered(type)) return layoutCellRendered(store, payload);
      else return { ...store };
    },
    [layoutCellRendered, layoutFocusBody, layoutFocusNone, layoutFocusToolbar, layoutResize]
  );

  return { initialState, reducer };
};
