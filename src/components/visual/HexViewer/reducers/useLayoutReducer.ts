import { useCallback } from 'react';
import {
  COLUMNS,
  getFoldingRowMap,
  handleLayoutColumnResize2,
  handleLayoutRowResize,
  isAction,
  isType,
  LAYOUT_STATE,
  ReducerHandler,
  Reducers,
  setStore,
  Store,
  UseReducer
} from '..';

export const useLayoutReducer: UseReducer = () => {
  const handleResize = useCallback(
    (store: Store, { height, width }: { height?: number; width?: number } = { height: 1, width: 1 }) => {
      const {
        column: { auto: columnAuto, max: maxColumns },
        row: { auto: rowAuto, max: maxRows },
        folding: { active: foldingActive }
      } = store.layout;

      const newColumnSize = handleLayoutColumnResize2(store, width as number);
      const newRowSize = handleLayoutRowResize(height as number);
      const ColumnSize = columnAuto ? newColumnSize : Math.min(newColumnSize, maxColumns);
      const RowSize = rowAuto && isType.mode.body(store, 'table') ? newRowSize : Math.min(newRowSize, maxRows);
      const foldingRows = foldingActive ? getFoldingRowMap(store, newColumnSize) : new Map();

      return {
        ...store,
        layout: {
          ...store.layout,
          display: { ...store.layout.display, width: width as number, height: height as number },
          column: { ...store.layout.column, size: ColumnSize },
          row: { ...store.layout.row, size: RowSize },
          folding: { ...store.layout.folding, rows: foldingRows }
        },
        setting: {
          ...store.setting,
          layout: {
            ...store.setting.layout,
            column: {
              ...store.setting.layout.column,
              max: store.setting.layout.column.auto ? newColumnSize : store.setting.layout.column.max
            }
          }
        }
      };
    },
    []
  );

  const layoutResize: Reducers['bodyResize'] = useCallback(
    (store, { height, width }) => {
      return handleResize(store, { height, width });
    },
    [handleResize]
  );

  const layoutFocusNone: Reducers['appClickAway'] = useCallback(
    store => setStore.store.layout.IsFocusing(store, 'none'),
    []
  );

  const layoutFocusBody: Reducers['cellMouseDown'] = useCallback(
    store => setStore.store.layout.IsFocusing(store, 'body'),
    []
  );

  const layoutFocusToolbar: Reducers['searchBarFocus'] = useCallback(
    store => setStore.store.layout.IsFocusing(store, 'toolbar'),
    []
  );

  const layoutCellRendered: Reducers['bodyItemsRendered'] = useCallback((store, { event }) => {
    if (event === null) return { ...store };
    else return setStore.store.layout.row.Size(store, event.visibleStopIndex - event.visibleStartIndex);
  }, []);

  const settingAutoColumnChange: Reducers['settingAutoColumnChange'] = useCallback(store => {
    const { width = 1 } = document.getElementById('hex-viewer')?.getBoundingClientRect();
    const newColumnSize = handleLayoutColumnResize2(store, width as number);
    return setStore.store.setting.layout.Column(store, store.setting.layout.column, data => ({
      auto: !data.auto,
      max: data.auto ? data.max : newColumnSize
    }));
  }, []);

  const settingLoad: Reducers['settingLoad'] = useCallback(
    store => {
      let newStore = setStore.store.Layout(store, store.setting.storage.data?.layout, data => {
        const maxColumn =
          data?.column?.max === undefined || !COLUMNS.map(c => c.columns).includes(data?.column?.max)
            ? undefined
            : data?.column?.max;
        return { column: { auto: data?.column?.auto, max: maxColumn }, folding: { active: data?.folding?.active } };
      });
      const { height = 1, width = 1 } = document.getElementById('hex-viewer')?.getBoundingClientRect();
      return handleResize(newStore, { height, width });
    },
    [handleResize]
  );

  const settingOpen: Reducers['settingOpen'] = useCallback(store => {
    return setStore.store.setting.Layout(store, store.layout, data => ({
      ...data,
      column: { max: data.column.size },
      folding: { active: data.folding.active }
    }));
  }, []);

  const settingSave: Reducers['settingSave'] = useCallback(
    store => {
      let newStore = setStore.store.Layout(store, store.setting.layout);
      const { height = 1, width = 1 } = document.getElementById('hex-viewer')?.getBoundingClientRect();
      return handleResize(newStore, { height, width });
    },
    [handleResize]
  );

  const settingReset: Reducers['settingReset'] = useCallback(store => {
    const { width = 1 } = document.getElementById('hex-viewer')?.getBoundingClientRect();
    const newColumnSize = handleLayoutColumnResize2(store, width as number);
    return setStore.store.setting.Layout(store, LAYOUT_STATE.layout, data => ({
      column: { auto: data?.column?.auto, max: newColumnSize },
      folding: { active: data?.folding?.active }
    }));
  }, []);

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload } }) => {
      if (isAction.bodyResize(type)) return layoutResize(store, payload);
      else if (isAction.appClickAway(type)) return layoutFocusNone(store, payload);
      else if (isAction.cellMouseDown(type)) return layoutFocusBody(store, payload);
      else if (isAction.searchBarFocus(type)) return layoutFocusToolbar(store, payload);
      else if (isAction.bodyItemsRendered(type)) return layoutCellRendered(store, payload);
      else if (isAction.settingAutoColumnChange(type)) return settingAutoColumnChange(store, payload);
      else if (isAction.settingLoad(type)) return settingLoad(store, payload);
      else if (isAction.settingOpen(type)) return settingOpen(store, payload);
      else if (isAction.settingSave(type)) return settingSave(store, payload);
      else if (isAction.settingReset(type)) return settingReset(store, payload);
      else return { ...store };
    },
    [
      layoutCellRendered,
      layoutFocusBody,
      layoutFocusNone,
      layoutFocusToolbar,
      layoutResize,
      settingAutoColumnChange,
      settingLoad,
      settingOpen,
      settingReset,
      settingSave
    ]
  );

  return { reducer };
};
