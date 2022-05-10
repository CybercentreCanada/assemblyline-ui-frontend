import { Store, StoreRef } from '..';

type Scroll = {
  top: 'top';
  middle: 'middle';
  bottom: 'bottom';
  include: 'include';
  includeMiddle: 'includeMiddle';
  smart: 'smart';
};
const SCROLL: Scroll = {
  top: 'top',
  middle: 'middle',
  bottom: 'bottom',
  include: 'include',
  includeMiddle: 'includeMiddle',
  smart: 'smart'
};
export type ScrollType = typeof SCROLL[keyof typeof SCROLL];
export type IsScroll = { [Property in ScrollType]: (scrollType: ScrollType) => boolean };
export const isScroll = Object.fromEntries(
  Object.keys(SCROLL).map(key => [key, (scrollType: ScrollType) => scrollType === SCROLL[key]])
) as IsScroll;

export const getScrollMaxIndex = (store: Store, hexCodeSize: number) =>
  Math.ceil(hexCodeSize / store.layout.column.size - store.layout.row.size);

export const getRowIndex = (store: Store, index: number) => Math.floor(index / store.layout.column.size);

export const clampScrollIndex = (index: number, maxRowIndex: number): number =>
  Math.min(Math.max(index, 0), maxRowIndex);

export const clampOffsetIndex = (offsetIndex: number, scrollIndex: number, rowSize: number) => {
  if (offsetIndex < scrollIndex) return offsetIndex;
  else if (offsetIndex >= scrollIndex + rowSize - 1) return offsetIndex - rowSize + 1;
  else return scrollIndex;
};

export const isOffsetClamped = (offsetIndex: number, scrollIndex: number, rowSize: number) => {
  if (offsetIndex < scrollIndex) return true;
  else if (offsetIndex >= scrollIndex + rowSize - 1) return true;
  return false;
};

export const scrollToTableIndex = (store: Store, refs: StoreRef, index: number, scrollType: ScrollType): Store => {
  const {
    layout: {
      column: { size: columnSize },
      row: { size: rowSize }
    },
    scroll: { maxRowIndex }
  } = store;

  let scrollIndex = store.scroll.rowIndex;

  if (isScroll.top(scrollType)) {
    scrollIndex = Math.floor(index / columnSize);
  } else if (isScroll.middle(scrollType)) {
    scrollIndex = Math.floor(index / columnSize - rowSize / 2);
  } else if (isScroll.bottom(scrollType)) {
    scrollIndex = Math.floor(index / columnSize - rowSize);
  } else if (isScroll.include(scrollType)) {
    scrollIndex = clampOffsetIndex(Math.floor(index / columnSize), scrollIndex, rowSize);
  } else if (isScroll.includeMiddle(scrollType)) {
    scrollIndex = isOffsetClamped(Math.floor(index / columnSize), scrollIndex, rowSize)
      ? Math.floor(index / columnSize - rowSize / 2)
      : scrollIndex;
  } else if (isScroll.smart(scrollType)) {
    const distance = columnSize * rowSize;
    const prev = scrollIndex * columnSize - distance;
    const next = (scrollIndex + rowSize) * columnSize + distance;
    if (prev <= index && index <= next) {
      scrollIndex = clampOffsetIndex(Math.floor(index / columnSize), scrollIndex, rowSize);
    } else {
      scrollIndex = isOffsetClamped(Math.floor(index / columnSize), scrollIndex, rowSize)
        ? Math.floor(index / columnSize - rowSize / 2)
        : scrollIndex;
    }
  }
  scrollIndex = clampScrollIndex(scrollIndex, maxRowIndex);

  return { ...store, scroll: { ...store.scroll, rowIndex: scrollIndex } };
};

export const scrollToWindowIndex = (store: Store, refs: StoreRef, index: number, location: ScrollType): void => {
  setTimeout(() => {
    const scrollIndex = Math.floor(index / store.layout.column.size);
    if (isScroll.top(location)) refs?.current?.layout.listRef?.current?.scrollToItem(scrollIndex, 'start');
    else if (isScroll.middle(location)) refs?.current?.layout.listRef?.current?.scrollToItem(scrollIndex, 'center');
    else if (isScroll.bottom(location)) refs?.current?.layout.listRef?.current?.scrollToItem(scrollIndex, 'end');
    else if (isScroll.include(location)) refs?.current?.layout.listRef?.current?.scrollToItem(scrollIndex, 'auto');
    else if (
      isScroll.includeMiddle(location) &&
      (index < store.cellsRendered.visibleStartIndex || store.cellsRendered.visibleStopIndex < index)
    )
      refs?.current?.layout.listRef?.current?.scrollToItem(scrollIndex, 'center');
    else if (isScroll.smart(location)) refs?.current?.layout.listRef?.current?.scrollToItem(scrollIndex, 'smart');
  }, 1);
};

export const getTableCellsRendered = ({
  scroll: { rowIndex: scrollIndex, maxRowIndex: scrollMaxIndex, overscanCount },
  layout: {
    column: { size: columnSize },
    row: { size: rowSize }
  }
}: Store): {
  overscanStartRowIndex: number;
  overscanStopRowIndex: number;
  visibleStartRowIndex: number;
  visibleStopRowIndex: number;

  overscanStartIndex: number;
  overscanStopIndex: number;
  visibleStartIndex: number;
  visibleStopIndex: number;
} => ({
  overscanStartRowIndex: Math.max(scrollIndex - overscanCount, 0),
  overscanStopRowIndex: Math.min(scrollIndex + overscanCount + rowSize, scrollMaxIndex),
  visibleStartRowIndex: Math.max(scrollIndex, 0),
  visibleStopRowIndex: Math.min(scrollIndex + rowSize, scrollMaxIndex),

  overscanStartIndex: Math.max(scrollIndex - overscanCount, 0) * columnSize,
  overscanStopIndex: Math.min(scrollIndex + overscanCount + rowSize, scrollMaxIndex) * columnSize,
  visibleStartIndex: Math.max(scrollIndex, 0) * columnSize,
  visibleStopIndex: Math.min(scrollIndex + rowSize, scrollMaxIndex) * columnSize
});

export const getWindowCellsRendered = (
  {
    overscanStartIndex,
    overscanStopIndex,
    visibleStartIndex,
    visibleStopIndex
  }: {
    overscanStartIndex: number;
    overscanStopIndex: number;
    visibleStartIndex: number;
    visibleStopIndex: number;
  },
  columnSize: number
): {
  overscanStartRowIndex: number;
  overscanStopRowIndex: number;
  visibleStartRowIndex: number;
  visibleStopRowIndex: number;

  overscanStartIndex: number;
  overscanStopIndex: number;
  visibleStartIndex: number;
  visibleStopIndex: number;
} => ({
  overscanStartRowIndex: overscanStartIndex,
  overscanStopRowIndex: overscanStopIndex,
  visibleStartRowIndex: visibleStartIndex,
  visibleStopRowIndex: visibleStopIndex,

  overscanStartIndex: overscanStartIndex * columnSize,
  overscanStopIndex: overscanStopIndex * columnSize,
  visibleStartIndex: visibleStartIndex * columnSize,
  visibleStopIndex: visibleStopIndex * columnSize
});
