import { useCallback, useMemo } from 'react';
import {
  ActionProps,
  FocusType,
  handleLayoutColumnResize,
  handleLayoutRowResize,
  isAction,
  isBody,
  ReducerProps,
  Store
} from '..';

export type LayoutState = {
  layout: {
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

export const useLayoutReducer = () => {
  const initialState = useMemo<LayoutState>(
    () => ({
      layout: {
        column: {
          size: 8,
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

  const layoutResize = useCallback((store: Store, { type, payload }: ActionProps): Store => {
    const { height, width } = payload;
    const {
      column: { auto: columnAuto, size: columnSize },
      row: { auto: rowAuto, size: rowSize }
    } = store.layout;
    const newColumnSize = columnAuto ? handleLayoutColumnResize(width as number) : columnSize;
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

  const layoutFocusNone = useCallback((store: Store, { type, payload }: ActionProps): Store => {
    return { ...store, layout: { ...store.layout, isFocusing: 'none' } };
  }, []);

  const layoutFocusBody = useCallback((store: Store, { type, payload }: ActionProps): Store => {
    return { ...store, layout: { ...store.layout, isFocusing: 'body' } };
  }, []);

  const layoutFocusToolbar = useCallback((store: Store, { type, payload }: ActionProps): Store => {
    return { ...store, layout: { ...store.layout, isFocusing: 'toolbar' } };
  }, []);

  const layoutCellRendered = useCallback((store: Store, { type, payload }: ActionProps): Store => {
    const { visibleStartIndex, visibleStopIndex } = payload.event;
    return {
      ...store,
      layout: {
        ...store.layout,
        row: { ...store.layout.row, size: visibleStopIndex - visibleStartIndex }
      }
    };
  }, []);

  const reducer = useCallback(
    ({ store, action }: ReducerProps): Store => {
      if (isAction.bodyResize(action)) return layoutResize(store, action);
      else if (isAction.appClickAway(action)) return layoutFocusNone(store, action);
      else if (isAction.cellMouseDown(action)) return layoutFocusBody(store, action);
      else if (isAction.searchBarFocus(action)) return layoutFocusToolbar(store, action);
      else if (isAction.bodyItemsRendered(action)) return layoutCellRendered(store, action);
      else return { ...store };
    },
    [layoutCellRendered, layoutFocusBody, layoutFocusNone, layoutFocusToolbar, layoutResize]
  );

  return { initialState, reducer };
};
