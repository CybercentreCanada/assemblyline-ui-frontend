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
  scrollToWindowIndex,
  ScrollType,
  Store,
  StoreRef
} from '..';

export type ScrollState = {
  scroll: {
    index: number;
    rowIndex: number;
    maxRowIndex: number;
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
  const initialState = useMemo<ScrollState>(
    () => ({
      scroll: {
        index: 0,
        rowIndex: 0,
        maxRowIndex: 1,
        speed: 3,
        overscanCount: 20
      }
    }),
    []
  );

  const initialRef = useMemo<ScrollRef>(
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

  const scrollIndexChange = useCallback(
    (store: Store, refs: StoreRef, index: number, scrollType: ScrollType): Store => {
      if (index === null || index === undefined || isNaN(index)) return { ...store };

      const hexcodeSize = refs.current.hex.codes.size;
      const newIndex = Math.min(Math.max(index, 0), hexcodeSize);
      const rowIndex = Math.floor(newIndex / store.layout.column.size);
      const maxRowIndex = getScrollMaxIndex(store, hexcodeSize);

      if (isBody.table(store)) {
        let newStore = { ...store, scroll: { ...store.scroll, maxRowIndex } };
        newStore = scrollToTableIndex(newStore, refs, newIndex, scrollType);
        refs.current.cellsRendered = getTableCellsRendered(store);
        return { ...newStore };
      } else if (isBody.window(store)) {
        let newStore = { ...store, scroll: { ...store.scroll, rowIndex, maxRowIndex } };
        scrollToWindowIndex(newStore, refs, newIndex, scrollType);
        return { ...newStore };
      } else return { ...store };
    },
    []
  );

  const scrollRowIndexChange = useCallback((store: Store, refs: StoreRef, rowIndex: number): Store => {
    const maxRowIndex = getScrollMaxIndex(store, refs?.current?.hex.codes.size);
    rowIndex = clampScrollIndex(rowIndex, maxRowIndex);
    const index = rowIndex * store.layout.column.size;
    const newStore = { ...store, scroll: { ...store.scroll, index, rowIndex, maxRowIndex } };
    refs.current.cellsRendered = getTableCellsRendered(newStore);
    return { ...newStore };
  }, []);

  const scrollResize = useCallback(
    (store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
      if (store.layout.column.size === 0) return { ...store };
      else {
        const newStore = scrollIndexChange(store, refs, store.scroll.index, 'top');
        refs.current.cellsRendered = getTableCellsRendered(newStore);
        return { ...newStore };
      }
    },
    [scrollIndexChange]
  );

  const scrollWheel = useCallback(
    (store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
      const deltaY = payload.deltaY >= 0 ? store.scroll.speed : -store.scroll.speed;
      const newScrollIndex = store.scroll.rowIndex + deltaY;
      const newStore = scrollRowIndexChange(store, refs, newScrollIndex);
      return newStore;
    },
    [scrollRowIndexChange]
  );

  const scrollButtonClick = useCallback(
    (store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
      const newScrollIndex = store.scroll.rowIndex + store.scroll.speed * payload.value;
      return scrollRowIndexChange(store, refs, newScrollIndex);
    },
    [scrollRowIndexChange]
  );

  const scrollSliderChange = useCallback(
    (store: Store, refs: StoreRef, { type, payload: { event, newValue } }: ActionProps): Store => {
      event.preventDefault();
      if (event.type === 'mousemove' || event.type === 'mousedown') {
        return scrollRowIndexChange(store, refs, store.scroll.maxRowIndex - newValue);
      } else if (event.type === 'keydown') {
        const { key: keyCode } = event;
        let newScrollIndex: number = store.scroll.rowIndex;

        if (isArrowUp(keyCode)) newScrollIndex -= store.scroll.speed;
        else if (isArrowDown(keyCode)) newScrollIndex += store.scroll.speed;
        else if (isHome(keyCode)) newScrollIndex = 0;
        else if (isEnd(keyCode)) newScrollIndex = store.scroll.maxRowIndex;
        else if (isPageUp(keyCode)) newScrollIndex -= store.layout.row.size;
        else if (isPageDown(keyCode)) newScrollIndex += store.layout.row.size;

        return scrollRowIndexChange(store, refs, newScrollIndex);
      } else return { ...store };
    },
    [scrollRowIndexChange]
  );

  const scrollCellRendered = useCallback((store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
    refs.current.cellsRendered = getWindowCellsRendered({ ...payload.event }, store.layout.column.size);
    return {
      ...store,
      scroll: {
        ...store.scroll,
        // index: refs.current.cellsRendered.visibleStartIndex,
        rowIndex: refs.current.cellsRendered.visibleStartRowIndex
      }
    };
  }, []);

  const scrollTouchStart = useCallback(
    (store: Store, refs: StoreRef, { type, payload: { event } }: ActionProps): Store => {
      refs.current.touchScroll = {
        startTouchScreenY: event.targetTouches[0].screenY,
        prevTouchDistance: 0
      };
      return { ...store };
    },
    []
  );

  const scrollTouchEnd = useCallback(
    (store: Store, refs: StoreRef, { type, payload: { event } }: ActionProps): Store => {
      refs.current.touchScroll = {
        startTouchScreenY: 0,
        prevTouchDistance: 0
      };
      return { ...store };
    },
    []
  );

  const scrollTouchMove = useCallback(
    (store: Store, refs: StoreRef, { type, payload: { event } }: ActionProps): Store => {
      const { startTouchScreenY, prevTouchDistance } = refs.current.touchScroll;
      const distance: number = (event.targetTouches[0].screenY - startTouchScreenY) / LAYOUT_SIZE.rowHeight;
      const scrollDistance: number = distance >= 0 ? Math.floor(distance) : Math.ceil(distance);

      if (scrollDistance !== prevTouchDistance) {
        const newScrollIndex = store.scroll.rowIndex - (scrollDistance - prevTouchDistance);
        const newStore = scrollRowIndexChange(store, refs, newScrollIndex);
        refs.current.touchScroll.prevTouchDistance = scrollDistance;
        return { ...newStore };
      } else return { ...store };
    },
    [scrollRowIndexChange]
  );

  const scrollLocation = useCallback(
    (store: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
      if (store.location.scroll === null) return { ...store };
      else {
        let newStore = { ...store, scroll: { ...store.scroll, index: store.location.scroll } };
        return scrollIndexChange(newStore, refs, store.location.scroll, 'top');
      }
    },
    [scrollIndexChange]
  );

  const scrollStoreChange = useCallback(
    (prevStore: Store, nextStore: Store, refs: StoreRef, { type, payload }: ActionProps): Store => {
      let newStore = { ...nextStore };

      if (prevStore.cursor.index !== nextStore.cursor.index)
        newStore = scrollIndexChange(nextStore, refs, nextStore.cursor.index, 'smart');

      if (
        prevStore.search.selectedIndex !== nextStore.search.selectedIndex ||
        prevStore.search.value !== nextStore.search.value
      )
        newStore = scrollIndexChange(
          nextStore,
          refs,
          nextStore.search.indexes[nextStore.search.selectedIndex],
          'includeMiddle'
        );

      return { ...newStore };
    },
    [scrollIndexChange]
  );

  const reducer = useCallback(
    ({ prevStore, nextStore, refs, action }: ReducerProps): Store => {
      // if (isAction.appInit(action)) return scrollResize(nextStore, refs, action);
      // else if (isAction.appDataChange(action)) return scrollResize(nextStore, refs, action);
      if (isAction.bodyResize(action)) return scrollResize(nextStore, refs, action);
      else if (isAction.bodyScrollWheel(action)) return scrollWheel(nextStore, refs, action);
      else if (isAction.scrollButtonClick(action)) return scrollButtonClick(nextStore, refs, action);
      else if (isAction.scrollSliderChange(action)) return scrollSliderChange(nextStore, refs, action);
      else if (isAction.bodyItemsRendered(action)) return scrollCellRendered(nextStore, refs, action);
      else if (isAction.scrollTouchStart(action)) return scrollTouchStart(nextStore, refs, action);
      else if (isAction.scrollTouchEnd(action)) return scrollTouchEnd(nextStore, refs, action);
      else if (isAction.scrollTouchMove(action)) return scrollTouchMove(nextStore, refs, action);
      else if (isAction.bodyInit(action)) return scrollLocation(nextStore, refs, action);
      else if (isAction.appLocationInit(action))
        return scrollIndexChange(nextStore, refs, nextStore.location.scroll, 'top');
      else return scrollStoreChange(prevStore, nextStore, refs, action);
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
