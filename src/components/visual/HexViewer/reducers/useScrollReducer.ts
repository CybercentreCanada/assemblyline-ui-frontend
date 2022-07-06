import { isArrowDown, isArrowUp } from 'commons/addons/elements/utils/keyboard';
import { useCallback, useMemo } from 'react';
import {
  clampScrollIndex,
  getScrollLastIndex,
  getScrollMaxIndex,
  getTableCellsRendered,
  getWindowCellsRendered,
  isAction,
  isBody,
  isEnd,
  isHome,
  isPageDown,
  isPageUp,
  LAYOUT_SIZE,
  ReducerHandler,
  Reducers,
  scrollToTableIndex,
  ScrollType,
  Store,
  UseReducer
} from '..';

export type ScrollState = {
  scroll: {
    index: number;
    rowIndex: number;
    maxRowIndex: number;
    lastRowIndex: number;
    speed: number;
    overscanCount: number;
    type: ScrollType;
  };
  cellsRendered: {
    overscanStartRowIndex: number;
    overscanStopRowIndex: number;
    visibleStartRowIndex: number;
    visibleStopRowIndex: number;

    overscanStartIndex: number;
    overscanStopIndex: number;
    visibleStartIndex: number;
    visibleStopIndex: number;
  };
  touchScroll: {
    startTouchScreenY: number;
    prevTouchDistance: number;
  };
};

export const useScrollReducer: UseReducer<ScrollState> = () => {
  const initialState = useMemo<ScrollState>(
    () => ({
      scroll: {
        index: 0,
        rowIndex: 0,
        maxRowIndex: 1,
        lastRowIndex: 1,
        speed: 3,
        overscanCount: 20,
        type: 'top'
      },
      cellsRendered: {
        overscanStartRowIndex: 0,
        overscanStopRowIndex: 0,
        visibleStartRowIndex: 0,
        visibleStopRowIndex: 0,

        overscanStartIndex: 0,
        overscanStopIndex: 0,
        visibleStartIndex: 0,
        visibleStopIndex: 0
      },
      touchScroll: {
        startTouchScreenY: 0,
        prevTouchDistance: 0
      }
    }),
    []
  );

  const scrollIndexChange = useCallback((store: Store, _index: number, scrollType: ScrollType): Store => {
    if (_index === null || _index === undefined || isNaN(_index)) return { ...store };

    const hexcodeSize = store.hex.codes.size;
    const index = Math.min(Math.max(_index, 0), hexcodeSize);
    const rowIndex = Math.floor(index / store.layout.column.size);
    const maxRowIndex = getScrollMaxIndex(store, hexcodeSize);
    const lastRowIndex = getScrollLastIndex(store, hexcodeSize);

    if (isBody.table(store)) {
      let newStore = { ...store, scroll: { ...store.scroll, maxRowIndex, lastRowIndex } };
      newStore = scrollToTableIndex(newStore, index, scrollType);
      const cellsRendered = getTableCellsRendered(store);
      return { ...newStore, cellsRendered: { ...newStore.cellsRendered, ...cellsRendered } };
    } else if (isBody.window(store)) {
      let newStore = {
        ...store,
        scroll: { ...store.scroll, index, rowIndex, maxRowIndex, lastRowIndex, type: scrollType }
      };
      return { ...newStore };
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
    const cellsRendered = getWindowCellsRendered({ ...event }, store.layout.column.size);
    return {
      ...store,
      cellsRendered: {
        ...store.cellsRendered,
        ...cellsRendered
      }
    };
  }, []);

  const scrollTouchStart: Reducers['scrollTouchStart'] = useCallback((store, { event }) => {
    return {
      ...store,
      touchScroll: { ...store.touchScroll, startTouchScreenY: event.targetTouches[0].screenY, prevTouchDistance: 0 }
    };
  }, []);

  const scrollTouchEnd: Reducers['scrollTouchEnd'] = useCallback((store, payload) => {
    return {
      ...store,
      touchScroll: { ...store.touchScroll, startTouchScreenY: 0, prevTouchDistance: 0 }
    };
  }, []);

  const scrollTouchMove: Reducers['scrollTouchMove'] = useCallback(
    (store, { event }) => {
      const { startTouchScreenY, prevTouchDistance } = store.touchScroll;
      const distance: number = (event.targetTouches[0].screenY - startTouchScreenY) / LAYOUT_SIZE.rowHeight;
      const scrollDistance: number = distance >= 0 ? Math.floor(distance) : Math.ceil(distance);

      if (scrollDistance !== prevTouchDistance) {
        const newScrollIndex = store.scroll.rowIndex - (scrollDistance - prevTouchDistance);
        const newStore = scrollRowIndexChange(store, newScrollIndex);
        store.touchScroll.prevTouchDistance = scrollDistance;
        return { ...newStore };
      } else return { ...store };
    },
    [scrollRowIndexChange]
  );

  const scrollLocation: Reducers['bodyInit'] = useCallback(
    (store, { initialized }) => {
      if (store.location.scroll === null) return { ...store };
      else {
        let newStore = { ...store, scroll: { ...store.scroll, index: store.location.scroll } };
        return scrollIndexChange(newStore, store.location.scroll, 'top');
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
        prevStore.search.selectedIndex !== nextStore.search.selectedIndex ||
        prevStore.search.value !== nextStore.search.value
      )
        newStore = scrollIndexChange(
          nextStore,
          nextStore.search.indexes[nextStore.search.selectedIndex],
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
      else if (isAction.appLocationInit(type)) return scrollIndexChange(store, store.location.scroll, 'top');
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

  return { initialState, reducer };
};
