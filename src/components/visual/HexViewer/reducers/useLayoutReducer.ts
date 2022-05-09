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
  };
};

export type LayoutRef = {
  layout: {
    bodyRef?: React.MutableRefObject<HTMLDivElement | HTMLTableElement>;
    listRef?: React.MutableRefObject<any>;
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
        }
      }
    }),
    []
  );

  const initialRef = useMemo<LayoutRef>(
    () => ({
      layout: {
        bodyRef: null,
        listRef: null,
        isFocusing: 'none'
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
    refs.current.layout.isFocusing = 'none';
    return { ...store };
  }, []);

  const layoutFocusBody = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    refs.current.layout.isFocusing = 'body';
    return { ...store };
  }, []);

  const layoutFocusToolbar = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    refs.current.layout.isFocusing = 'toolbar';
    return { ...store };
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
