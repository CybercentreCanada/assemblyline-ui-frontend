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
    display: { type: DisplayType; width: number; height: number };
    column: {
      size: number;
      auto: boolean;
      max: number;
    };
    row: {
      size: number;
      auto: boolean;
      max: number;
    };
    isFocusing: FocusType;
  };
};

export const useLayoutReducer: UseReducer<LayoutState> = () => {
  const initialState = useMemo<LayoutState>(
    () => ({
      layout: {
        display: { type: 'dual', width: 0, height: 0 },
        column: {
          size: 1,
          auto: true,
          max: 24
        },
        row: {
          size: 0,
          auto: true,
          max: 2000
        },
        isFocusing: 'none'
      }
    }),
    []
  );

  const layoutResize: Reducers['bodyResize'] = useCallback((store, { height, width }) => {
    const {
      column: { auto: columnAuto, max: maxColumns },
      row: { auto: rowAuto, max: maxRows }
    } = store.layout;

    let newColumnSize = handleLayoutColumnResize2(store, width as number);
    let newRowSize = handleLayoutRowResize(height as number);
    newColumnSize = columnAuto ? newColumnSize : Math.min(newColumnSize, maxColumns);
    newRowSize = rowAuto && isBody.table(store) ? newRowSize : Math.min(newRowSize, maxRows);

    return {
      ...store,
      layout: {
        ...store.layout,
        display: { ...store.layout.display, width: width as number, height: height as number },
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

  const settingLoad: Reducers['settingLoad'] = useCallback(store => {
    const {
      column: { auto: columnAuto, max: maxColumns }
    } = store.setting.layout;

    const { width = 1 } = document.getElementById('hex-viewer')?.getBoundingClientRect();
    let newColumnSize = handleLayoutColumnResize2(store, width as number);
    newColumnSize = columnAuto ? newColumnSize : Math.min(newColumnSize, maxColumns);
    
    return {
      ...store,
      layout: {
        ...store.layout,
        column: { ...store.layout.column, auto: columnAuto, size: newColumnSize, max: maxColumns }
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
      else if (isAction.settingLoad(type)) return settingLoad(store, payload);
      else return { ...store };
    },
    [layoutCellRendered, layoutFocusBody, layoutFocusNone, layoutFocusToolbar, layoutResize, settingLoad]
  );

  return { initialState, reducer };
};
