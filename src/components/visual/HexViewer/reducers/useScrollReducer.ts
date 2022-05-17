import { isArrowDown, isArrowUp } from 'commons/addons/elements/utils/keyboard';
import { useCallback, useMemo } from 'react';
import {
  ActionProps,
  clampScrollIndex,
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
  ReducerProps,
  scrollToTableIndex,
  ScrollType,
  Store
} from '..';

export type ScrollState = {
  scroll: {
    index: number;
    rowIndex: number;
    maxRowIndex: number;
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

export type ScrollRef = {};

export const useScrollReducer = () => {
  const initialState = useMemo<ScrollState>(
    () => ({
      scroll: {
        index: 0,
        rowIndex: 0,
        maxRowIndex: 1,
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

  const initialRef = useMemo<ScrollRef>(() => ({}), []);

  const scrollIndexChange = useCallback((store: Store, _index: number, scrollType: ScrollType): Store => {
    if (_index === null || _index === undefined || isNaN(_index)) return { ...store };

    const hexcodeSize = store.hex.codes.size;
    const index = Math.min(Math.max(_index, 0), hexcodeSize);
    const rowIndex = Math.floor(index / store.layout.column.size);
    const maxRowIndex = getScrollMaxIndex(store, hexcodeSize);

    if (isBody.table(store)) {
      let newStore = { ...store, scroll: { ...store.scroll, maxRowIndex } };
      newStore = scrollToTableIndex(newStore, index, scrollType);
      const cellsRendered = getTableCellsRendered(store);
      return { ...newStore, cellsRendered: { ...newStore.cellsRendered, ...cellsRendered } };
    } else if (isBody.window(store)) {
      let newStore = { ...store, scroll: { ...store.scroll, index, rowIndex, maxRowIndex, type: scrollType } };
      // scrollToWindowIndex(newStore, refs, newIndex, scrollType);
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

  const scrollResize = useCallback(
    (store: Store, { type, payload }: ActionProps): Store => {
      if (store.layout.column.size === 0) return { ...store };
      else {
        const newStore = scrollIndexChange(store, store.scroll.index, 'top');
        store.cellsRendered = getTableCellsRendered(newStore);
        return { ...newStore };
      }
    },
    [scrollIndexChange]
  );

  const scrollWheel = useCallback(
    (store: Store, { type, payload }: ActionProps): Store => {
      const deltaY = payload.deltaY >= 0 ? store.scroll.speed : -store.scroll.speed;
      const newScrollIndex = store.scroll.rowIndex + deltaY;
      const newStore = scrollRowIndexChange(store, newScrollIndex);
      return newStore;
    },
    [scrollRowIndexChange]
  );

  const scrollButtonClick = useCallback(
    (store: Store, { type, payload }: ActionProps): Store => {
      const newScrollIndex = store.scroll.rowIndex + store.scroll.speed * payload.value;
      return scrollRowIndexChange(store, newScrollIndex);
    },
    [scrollRowIndexChange]
  );

  const scrollSliderChange = useCallback(
    (store: Store, { type, payload: { event, newValue } }: ActionProps): Store => {
      event.preventDefault();
      if (event.type === 'mousemove' || event.type === 'mousedown') {
        return scrollRowIndexChange(store, store.scroll.maxRowIndex - newValue);
      } else if (event.type === 'keydown') {
        const { key: keyCode } = event;
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

  const scrollCellRendered = useCallback((store: Store, { type, payload }: ActionProps): Store => {
    const cellsRendered = getWindowCellsRendered({ ...payload.event }, store.layout.column.size);
    return {
      ...store,
      cellsRendered: {
        ...store.cellsRendered,
        ...cellsRendered
      }
    };
  }, []);

  const scrollTouchStart = useCallback((store: Store, { type, payload: { event } }: ActionProps): Store => {
    store.touchScroll = {
      startTouchScreenY: event.targetTouches[0].screenY,
      prevTouchDistance: 0
    };
    return { ...store };
  }, []);

  const scrollTouchEnd = useCallback((store: Store, { type, payload: { event } }: ActionProps): Store => {
    store.touchScroll = {
      startTouchScreenY: 0,
      prevTouchDistance: 0
    };
    return { ...store };
  }, []);

  const scrollTouchMove = useCallback(
    (store: Store, { type, payload: { event } }: ActionProps): Store => {
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

  const scrollLocation = useCallback(
    (store: Store, { type, payload }: ActionProps): Store => {
      if (store.location.scroll === null) return { ...store };
      else {
        let newStore = { ...store, scroll: { ...store.scroll, index: store.location.scroll } };
        return scrollIndexChange(newStore, store.location.scroll, 'top');
      }
    },
    [scrollIndexChange]
  );

  const scrollStoreChange = useCallback(
    (prevStore: Store, nextStore: Store, { type, payload }: ActionProps): Store => {
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

  const reducer = useCallback(
    ({ prevStore, store, action }: ReducerProps): Store => {
      if (isAction.bodyResize(action)) return scrollResize(store, action);
      else if (isAction.bodyScrollWheel(action)) return scrollWheel(store, action);
      else if (isAction.scrollButtonClick(action)) return scrollButtonClick(store, action);
      else if (isAction.scrollSliderChange(action)) return scrollSliderChange(store, action);
      else if (isAction.bodyItemsRendered(action)) return scrollCellRendered(store, action);
      else if (isAction.scrollTouchStart(action)) return scrollTouchStart(store, action);
      else if (isAction.scrollTouchEnd(action)) return scrollTouchEnd(store, action);
      else if (isAction.scrollTouchMove(action)) return scrollTouchMove(store, action);
      else if (isAction.bodyInit(action)) return scrollLocation(store, action);
      else if (isAction.appLocationInit(action)) return scrollIndexChange(store, store.location.scroll, 'top');
      else return scrollStoreChange(prevStore, store, action);
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

  return { initialState, initialRef, reducer };
};
