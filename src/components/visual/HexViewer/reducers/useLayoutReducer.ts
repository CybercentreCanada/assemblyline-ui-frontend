import { useCallback, useMemo } from 'react';
import {
  ActionProps,
  FocusType,
  handleLayoutColumnResize,
  handleLayoutRowResize,
  isAction,
  isBody,
  ReducerProps,
  Store,
  StoreRef
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

export type LayoutRef = {
  layout: {
    listRef?: React.MutableRefObject<any>;
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

  const initialRef = useMemo<LayoutRef>(
    () => ({
      layout: {
        listRef: null
      }
    }),
    []
  );

  const layoutResize = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
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

  const layoutFocusNone = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    return { ...store, layout: { ...store.layout, isFocusing: 'none' } };
  }, []);

  const layoutFocusBody = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    return { ...store, layout: { ...store.layout, isFocusing: 'body' } };
  }, []);

  const layoutFocusToolbar = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    return { ...store, layout: { ...store.layout, isFocusing: 'toolbar' } };
  }, []);

  const layoutCellRendered = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
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
    ({ prevStore, nextStore, refs, action }: ReducerProps): Store => {
      if (isAction.bodyResize(action)) return layoutResize(nextStore, refs, action);
      else if (isAction.appClickAway(action)) return layoutFocusNone(nextStore, refs, action);
      else if (isAction.cellMouseDown(action)) return layoutFocusBody(nextStore, refs, action);
      else if (isAction.searchBarFocus(action)) return layoutFocusToolbar(nextStore, refs, action);
      else if (isAction.bodyItemsRendered(action)) return layoutCellRendered(nextStore, refs, action);
      else return { ...nextStore };
    },
    [layoutCellRendered, layoutFocusBody, layoutFocusNone, layoutFocusToolbar, layoutResize]
  );

  return { initialState, initialRef, reducer };
};
