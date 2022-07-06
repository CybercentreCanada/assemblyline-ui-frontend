import { Store } from '..';

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

export const getScrollLastIndex = (store: Store, hexCodeSize: number) =>
  Math.ceil(hexCodeSize / store.layout.column.size);

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

export const scrollToTableIndex = (store: Store, index: number, scrollType: ScrollType): Store => {
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

export const scrollToWindowIndex = (
  store: Store,
  listRef: React.MutableRefObject<any>,
  index: number,
  location: ScrollType
): void => {
  setTimeout(() => {
    const scrollIndex = Math.floor(index / store.layout.column.size);
    if (isScroll.top(location)) listRef?.current?.scrollToItem(scrollIndex, 'start');
    else if (isScroll.middle(location)) listRef?.current?.scrollToItem(scrollIndex, 'center');
    else if (isScroll.bottom(location)) listRef?.current?.scrollToItem(scrollIndex, 'end');
    else if (isScroll.include(location)) listRef?.current?.scrollToItem(scrollIndex, 'auto');
    else if (
      isScroll.includeMiddle(location) &&
      (index < store.cellsRendered.visibleStartIndex || store.cellsRendered.visibleStopIndex < index)
    )
      listRef?.current?.scrollToItem(scrollIndex, 'center');
    else if (isScroll.smart(location)) listRef?.current?.scrollToItem(scrollIndex, 'smart');
  }, 1);
};

export const scrollToWindowIndexAsync = (
  store: Store,
  listRef: React.MutableRefObject<any>,
  index: number,
  location: ScrollType
): Promise<void> =>
  new Promise(async (resolve, reject) => {
    if (listRef.current === null) {
      reject();
      return;
    }

    const scrollIndex = Math.floor(index / store.layout.column.size);
    if (isScroll.top(location)) await listRef.current.scrollToItem(scrollIndex, 'start');
    else if (isScroll.middle(location)) await listRef.current.scrollToItem(scrollIndex, 'center');
    else if (isScroll.bottom(location)) await listRef.current.scrollToItem(scrollIndex, 'end');
    else if (isScroll.include(location)) await listRef.current.scrollToItem(scrollIndex, 'auto');
    else if (
      isScroll.includeMiddle(location) &&
      (index < store.cellsRendered.visibleStartIndex || store.cellsRendered.visibleStopIndex < index)
    )
      await listRef.current.scrollToItem(scrollIndex, 'center');
    else if (isScroll.smart(location)) await listRef.current.scrollToItem(scrollIndex, 'smart');

    resolve();
    return;
  });

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
  overscanStopIndex: overscanStopIndex * columnSize + (columnSize - 1),
  visibleStartIndex: visibleStartIndex * columnSize,
  visibleStopIndex: visibleStopIndex * columnSize + (columnSize - 1)
});
