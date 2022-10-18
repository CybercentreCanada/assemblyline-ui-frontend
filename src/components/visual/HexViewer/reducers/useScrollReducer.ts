import { isArrowDown, isArrowUp } from 'commons/addons/elements/utils/keyboard';
import { useCallback } from 'react';
import {
  clampScrollIndex,
  DEFAULT_STORE,
  getFoldingRowIndex,
  getScrollLastIndex,
  getScrollMaxIndex,
  getTableCellsRendered,
  getWindowCellsRendered,
  hasValidSearchResult,
  isAction,
  isEnd,
  isHome,
  isPageDown,
  isPageUp,
  isType,
  LAYOUT_SIZE,
  ReducerHandler,
  Reducers,
  scrollToTableIndex,
  ScrollType,
  setStore,
  Store,
  UseReducer
} from '..';

export const useScrollReducer: UseReducer = () => {
  const scrollIndexChange = useCallback((store: Store, _index: number, scrollType: ScrollType): Store => {
    if (_index === null || _index === undefined || isNaN(_index)) return { ...store };

    let { index, rowIndex, maxRowIndex, lastRowIndex } = store.scroll;
    let hexcodeSize = store.hex.codes.size;

    if (!store.layout.folding.active) {
      hexcodeSize = store.hex.codes.size;
      index = Math.min(Math.max(_index, 0), hexcodeSize);
      rowIndex = Math.floor(index / store.layout.column.size);
      maxRowIndex = getScrollMaxIndex(store, hexcodeSize);
      lastRowIndex = getScrollLastIndex(store, hexcodeSize);
    } else {
      hexcodeSize = store.hex.codes.size;
      index = Math.min(Math.max(_index, 0), hexcodeSize);
      rowIndex = getFoldingRowIndex(store, index);
      maxRowIndex = store.layout.folding.rows.size - store.layout.row.size;
      lastRowIndex = store.layout.folding.rows.size;
    }

    if (isType.mode.body(store, 'table')) {
      let newStore = setStore.store.Scroll(store, { maxRowIndex, lastRowIndex });
      newStore = scrollToTableIndex(newStore, index, scrollType);
      return setStore.store.CellsRendered(newStore, { ...getTableCellsRendered(newStore) });
    } else if (isType.mode.body(store, 'window')) {
      return setStore.store.Scroll(store, { index, rowIndex, maxRowIndex, lastRowIndex, type: scrollType });
    } else return { ...store };
  }, []);

  const scrollRowIndexChange = useCallback((store: Store, rowIndex: number): Store => {
    const maxRowIndex = getScrollMaxIndex(store, store.hex.codes.size);
    rowIndex = clampScrollIndex(rowIndex, maxRowIndex);
    const index = rowIndex * store.layout.column.size;
    const newStore = { ...store, scroll: { ...store.scroll, index, rowIndex, maxRowIndex } };
    store.cellsRendered = getTableCellsRendered(newStore);
    return { ...newStore };
  }, []);

  const scrollResize: Reducers['bodyResize'] = useCallback(
    (store, { width, height }) => {
      if (store.layout.column.size === 0) return { ...store };
      else {
        const newStore = scrollIndexChange(store, store.scroll.index, 'top');
        store.cellsRendered = getTableCellsRendered(newStore);
        return { ...newStore };
      }
    },
    [scrollIndexChange]
  );

  const scrollWheel: Reducers['bodyScrollWheel'] = useCallback(
    (store, { event }) => {
      const deltaY = event.deltaY >= 0 ? store.scroll.speed : -store.scroll.speed;
      const newScrollIndex = store.scroll.rowIndex + deltaY;
      const newStore = scrollRowIndexChange(store, newScrollIndex);
      return newStore;
    },
    [scrollRowIndexChange]
  );

  const scrollButtonClick: Reducers['scrollButtonClick'] = useCallback(
    (store, { value }) => {
      const newScrollIndex = store.scroll.rowIndex + store.scroll.speed * value;
      return scrollRowIndexChange(store, newScrollIndex);
    },
    [scrollRowIndexChange]
  );

  const scrollSliderChange: Reducers['scrollSliderChange'] = useCallback(
    (store, { event, newValue }) => {
      event.preventDefault();
      if (event.type === 'mousemove' || event.type === 'mousedown') {
        return scrollRowIndexChange(store, store.scroll.maxRowIndex - (newValue as number));
      } else if (event.type === 'keydown') {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        const keyCode = event['key'];
        let newScrollIndex: number = store.scroll.rowIndex;

        if (isArrowUp(keyCode)) newScrollIndex -= store.scroll.speed;
        else if (isArrowDown(keyCode)) newScrollIndex += store.scroll.speed;
        else if (isHome(keyCode)) newScrollIndex = 0;
        else if (isEnd(keyCode)) newScrollIndex = store.scroll.maxRowIndex;
        else if (isPageUp(keyCode)) newScrollIndex -= store.layout.row.size;
        else if (isPageDown(keyCode)) newScrollIndex += store.layout.row.size;

        return scrollRowIndexChange(store, newScrollIndex);
      } else return { ...store };
    },
    [scrollRowIndexChange]
  );

  const scrollCellRendered: Reducers['bodyItemsRendered'] = useCallback((store, { event }) => {
    if (event === null) return { ...store };
    return setStore.store.CellsRendered(store, getWindowCellsRendered(store, { ...event }));
  }, []);

  const scrollTouchStart: Reducers['scrollTouchStart'] = useCallback((store, { event }) => {
    return setStore.store.scroll.TouchScroll(store, {
      startTouchScreenY: event.targetTouches[0].screenY,
      prevTouchDistance: 0
    });
  }, []);

  const scrollTouchEnd: Reducers['scrollTouchEnd'] = useCallback((store, payload) => {
    return setStore.store.scroll.TouchScroll(store, { startTouchScreenY: 0, prevTouchDistance: 0 });
  }, []);

  const scrollTouchMove: Reducers['scrollTouchMove'] = useCallback(
    (store, { event }) => {
      const { startTouchScreenY, prevTouchDistance } = store.scroll.touchScroll;
      const distance: number = (event.targetTouches[0].screenY - startTouchScreenY) / LAYOUT_SIZE.rowHeight;
      const scrollDistance: number = distance >= 0 ? Math.floor(distance) : Math.ceil(distance);

      if (scrollDistance !== prevTouchDistance) {
        const newScrollIndex = store.scroll.rowIndex - (scrollDistance - prevTouchDistance);
        const newStore = scrollRowIndexChange(store, newScrollIndex);
        return { ...setStore.store.scroll.touchScroll.PrevTouchDistance(newStore, scrollDistance) };
      } else return { ...store };
    },
    [scrollRowIndexChange]
  );

  const scrollLocation: Reducers['bodyInit'] = useCallback(
    (store, { initialized }) => {
      if (DEFAULT_STORE.location.scroll.index === store.location.scroll.index) return { ...store };
      else {
        let newStore = { ...store, scroll: { ...store.scroll, index: store.location.scroll.index } };
        return scrollIndexChange(newStore, store.location.scroll.index, 'top');
      }
    },
    [scrollIndexChange]
  );

  const scrollStoreChange = useCallback(
    (prevStore: Store, nextStore: Store): Store => {
      let newStore = { ...nextStore };

      if (prevStore.cursor.index !== nextStore.cursor.index)
        newStore = scrollIndexChange(nextStore, nextStore.cursor.index, 'smart');

      if (
        (prevStore.search.selectedResult !== nextStore.search.selectedResult ||
          prevStore.search.inputValue !== nextStore.search.inputValue) &&
        hasValidSearchResult(newStore)
      )
        newStore = scrollIndexChange(
          nextStore,
          nextStore.search.results[nextStore.search.selectedResult].index,
          'includeMiddle'
        );

      return { ...newStore };
    },
    [scrollIndexChange]
  );

  const reducer: ReducerHandler = useCallback(
    ({ store, action: { type, payload }, prevStore }) => {
      if (isAction.bodyResize(type)) return scrollResize(store, payload);
      else if (isAction.bodyScrollWheel(type)) return scrollWheel(store, payload);
      else if (isAction.scrollButtonClick(type)) return scrollButtonClick(store, payload);
      else if (isAction.scrollSliderChange(type)) return scrollSliderChange(store, payload);
      else if (isAction.bodyItemsRendered(type)) return scrollCellRendered(store, payload);
      else if (isAction.scrollTouchStart(type)) return scrollTouchStart(store, payload);
      else if (isAction.scrollTouchEnd(type)) return scrollTouchEnd(store, payload);
      else if (isAction.scrollTouchMove(type)) return scrollTouchMove(store, payload);
      else if (isAction.bodyInit(type)) return scrollLocation(store, payload);
      else if (isAction.locationLoad(type)) return scrollIndexChange(store, store.location.scroll.index, 'top');
      else return scrollStoreChange(prevStore, store);
    },
    [
      scrollButtonClick,
      scrollCellRendered,
      scrollIndexChange,
      scrollLocation,
      scrollResize,
      scrollSliderChange,
      scrollStoreChange,
      scrollTouchEnd,
      scrollTouchMove,
      scrollTouchStart,
      scrollWheel
    ]
  );

  return { reducer };
};
