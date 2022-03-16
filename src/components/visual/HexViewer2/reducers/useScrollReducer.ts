import { isArrowDown, isArrowUp } from 'commons/addons/elements/utils/keyboard';
import React from 'react';
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
  scrollToWindowIndex,
  ScrollType,
  Store,
  StoreRef
} from '..';

export type ScrollState = {
  scroll: {
    index: number;
    maxIndex: number;
    speed: number;
    overscanCount: number;
  };
};

export type ScrollRef = {
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

export const useScrollReducer = () => {
  const initialState = React.useMemo<ScrollState>(
    () => ({
      scroll: {
        index: 0,
        maxIndex: 1,
        speed: 3,
        overscanCount: 30
      }
    }),
    []
  );

  const initialRef = React.useMemo<ScrollRef>(
    () => ({
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

  const scrollResize = React.useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    const hexcodeSize = refs.current.hex.codes.size;
    const newMaxIndex = getScrollMaxIndex(store, hexcodeSize);
    store = { ...store, scroll: { ...store.scroll, maxIndex: newMaxIndex } };

    if (isBody.table(store)) {
      store = scrollToTableIndex(store, refs.current.cellsRendered.visibleStartIndex, 'top');
      refs.current.cellsRendered = getTableCellsRendered(store);
      return { ...store };
    } else if (isBody.window(store)) {
      const { visibleStartIndex, visibleStopIndex } = refs.current.cellsRendered;
      scrollToWindowIndex(store, refs, visibleStopIndex - visibleStartIndex, 'middle');
      return { ...store };
    } else return { ...store };
  }, []);

  const handleTableScrollChange = React.useCallback((store: Store, refs: StoreRef, index: number) => {
    const newScrollMaxIndex = getScrollMaxIndex(store, refs?.current?.hex.codes.size);
    const newScrollIndex = clampScrollIndex(index, newScrollMaxIndex);
    const newStore = { ...store, scroll: { ...store.scroll, index: newScrollIndex, maxIndex: newScrollMaxIndex } };
    refs.current.cellsRendered = getTableCellsRendered(newStore);
    return { ...newStore };
  }, []);

  const scrollWheel = React.useCallback(
    (store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
      const deltaY = payload.deltaY >= 0 ? store.scroll.speed : -store.scroll.speed;
      const newScrollIndex = store.scroll.index + deltaY;
      return handleTableScrollChange(store, refs, newScrollIndex);
    },
    [handleTableScrollChange]
  );

  const scrollButtonClick = React.useCallback(
    (store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
      const newScrollIndex = store.scroll.index + store.scroll.speed * payload.value;
      return handleTableScrollChange(store, refs, newScrollIndex);
    },
    [handleTableScrollChange]
  );

  const scrollSliderChange = React.useCallback(
    (store: Store, refs: StoreRef, { type, payload: { event, newValue } }: ActionProps): Store => {
      event.preventDefault();
      if (event.type === 'mousemove' || event.type === 'mousedown') {
        return handleTableScrollChange(store, refs, store.scroll.maxIndex - newValue);
      } else if (event.type === 'keydown') {
        const { key: keyCode } = event;
        let newScrollIndex: number = store.scroll.index;

        if (isArrowUp(keyCode)) newScrollIndex -= store.scroll.speed;
        else if (isArrowDown(keyCode)) newScrollIndex += store.scroll.speed;
        else if (isHome(keyCode)) newScrollIndex = 0;
        else if (isEnd(keyCode)) newScrollIndex = store.scroll.maxIndex;
        else if (isPageUp(keyCode)) newScrollIndex -= store.layout.row.size;
        else if (isPageDown(keyCode)) newScrollIndex += store.layout.row.size;

        return handleTableScrollChange(store, refs, newScrollIndex);
      } else return { ...store };
    },
    [handleTableScrollChange]
  );

  const scrollCellRendered = React.useCallback(
    (store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
      refs.current.cellsRendered = getWindowCellsRendered({ ...payload.event }, store.layout.column.size);
      return {
        ...store,
        scroll: { ...store.scroll, index: refs.current.cellsRendered.visibleStartRowIndex }
      };
    },
    []
  );

  const scrollToCellIndex = React.useCallback(
    (store: Store, refs: StoreRef, index: number, location: ScrollType): Store => {
      if (index === null) return { ...store };
      else if (isBody.table(store)) {
        store = scrollToTableIndex(store, index, location);
        refs.current.cellsRendered = getTableCellsRendered(store);
        return { ...store };
      } else if (isBody.window(store)) {
        scrollToWindowIndex(store, refs, index, location);
        return { ...store };
      } else return { ...store };
    },
    []
  );

  const scrollTouchStart = React.useCallback(
    (store: Store, refs: StoreRef, { type, payload: { event } }: ActionProps): Store => {
      refs.current.touchScroll = {
        startTouchScreenY: event.targetTouches[0].screenY,
        prevTouchDistance: 0
      };
      return { ...store };
    },
    []
  );

  const scrollTouchEnd = React.useCallback(
    (store: Store, refs: StoreRef, { type, payload: { event } }: ActionProps): Store => {
      refs.current.touchScroll = {
        startTouchScreenY: 0,
        prevTouchDistance: 0
      };
      return { ...store };
    },
    []
  );

  const scrollTouchMove = React.useCallback(
    (store: Store, refs: StoreRef, { type, payload: { event } }: ActionProps): Store => {
      const { startTouchScreenY, prevTouchDistance } = refs.current.touchScroll;
      const distance: number = (event.targetTouches[0].screenY - startTouchScreenY) / LAYOUT_SIZE.rowHeight;
      const scrollDistance: number = distance >= 0 ? Math.floor(distance) : Math.ceil(distance);

      if (scrollDistance !== prevTouchDistance) {
        const newScrollIndex = store.scroll.index - (scrollDistance - prevTouchDistance);
        const newStore = handleTableScrollChange(store, refs, newScrollIndex);
        refs.current.touchScroll.prevTouchDistance = scrollDistance;
        return { ...newStore };
      } else return { ...store };
    },
    [handleTableScrollChange]
  );

  const scrollLocation = React.useCallback(
    (store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
      if (store.location.scroll === null) return { ...store };
      else return scrollToCellIndex(store, refs, store.location.scroll, 'top');
    },
    [scrollToCellIndex]
  );

  const scrollStoreChange = React.useCallback(
    (prevStore: Store, nextStore: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
      let newStore = { ...nextStore };

      if (prevStore.cursor.index !== nextStore.cursor.index)
        newStore = scrollToCellIndex(nextStore, refs, nextStore.cursor.index, 'smart');

      if (
        prevStore.search.selectedIndex !== nextStore.search.selectedIndex ||
        prevStore.search.value !== nextStore.search.value
      )
        newStore = scrollToCellIndex(
          nextStore,
          refs,
          nextStore.search.indexes[nextStore.search.selectedIndex],
          'includeMiddle'
        );

      return { ...newStore };
    },
    [scrollToCellIndex]
  );

  const reducer = React.useCallback(
    ({ prevStore, nextStore, refs, action }: ReducerProps): Store => {
      if (isAction.appInit(action)) return scrollResize(nextStore, refs, action);
      else if (isAction.appDataChange(action)) return scrollResize(nextStore, refs, action);
      else if (isAction.bodyResize(action)) return scrollResize(nextStore, refs, action);
      else if (isAction.bodyScrollWheel(action)) return scrollWheel(nextStore, refs, action);
      else if (isAction.scrollButtonClick(action)) return scrollButtonClick(nextStore, refs, action);
      else if (isAction.scrollSliderChange(action)) return scrollSliderChange(nextStore, refs, action);
      else if (isAction.bodyItemsRendered(action)) return scrollCellRendered(nextStore, refs, action);
      else if (isAction.scrollTouchStart(action)) return scrollTouchStart(nextStore, refs, action);
      else if (isAction.scrollTouchEnd(action)) return scrollTouchEnd(nextStore, refs, action);
      else if (isAction.scrollTouchMove(action)) return scrollTouchMove(nextStore, refs, action);
      else if (isAction.appLocationInit(action)) return scrollLocation(nextStore, refs, action);
      else return scrollStoreChange(prevStore, nextStore, refs, action);
    },
    [
      scrollButtonClick,
      scrollCellRendered,
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
