import { isType, ScrollType, Store } from '..';

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

  if (isType.scroll.type(scrollType, 'top')) {
    scrollIndex = Math.floor(index / columnSize);
  } else if (isType.scroll.type(scrollType, 'middle')) {
    scrollIndex = Math.floor(index / columnSize - rowSize / 2);
  } else if (isType.scroll.type(scrollType, 'bottom')) {
    scrollIndex = Math.floor(index / columnSize - rowSize);
  } else if (isType.scroll.type(scrollType, 'include')) {
    scrollIndex = clampOffsetIndex(Math.floor(index / columnSize), scrollIndex, rowSize);
  } else if (isType.scroll.type(scrollType, 'includeMiddle')) {
    scrollIndex = isOffsetClamped(Math.floor(index / columnSize), scrollIndex, rowSize)
      ? Math.floor(index / columnSize - rowSize / 2)
      : scrollIndex;
  } else if (isType.scroll.type(scrollType, 'smart')) {
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
    if (isType.scroll.type(location, 'top')) listRef?.current?.scrollToItem(scrollIndex, 'start');
    else if (isType.scroll.type(location, 'middle')) listRef?.current?.scrollToItem(scrollIndex, 'center');
    else if (isType.scroll.type(location, 'bottom')) listRef?.current?.scrollToItem(scrollIndex, 'end');
    else if (isType.scroll.type(location, 'include')) listRef?.current?.scrollToItem(scrollIndex, 'auto');
    else if (
      isType.scroll.type(location, 'includeMiddle') &&
      (index < store.cellsRendered.visibleStartIndex || store.cellsRendered.visibleStopIndex < index)
    )
      listRef?.current?.scrollToItem(scrollIndex, 'center');
    else if (isType.scroll.type(location, 'smart')) listRef?.current?.scrollToItem(scrollIndex, 'smart');
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

    let scrollIndex = 0;
    if (store.layout.folding.active) scrollIndex = getFoldingRowIndex(store, index);
    else scrollIndex = Math.floor(index / store.layout.column.size);

    if (isType.scroll.type(location, 'top')) await listRef.current.scrollToItem(scrollIndex, 'start');
    else if (isType.scroll.type(location, 'middle')) await listRef.current.scrollToItem(scrollIndex, 'center');
    else if (isType.scroll.type(location, 'bottom')) await listRef.current.scrollToItem(scrollIndex, 'end');
    else if (isType.scroll.type(location, 'include')) await listRef.current.scrollToItem(scrollIndex, 'auto');
    else if (
      isType.scroll.type(location, 'includeMiddle') &&
      (index < store.cellsRendered.visibleStartIndex || store.cellsRendered.visibleStopIndex < index)
    )
      await listRef.current.scrollToItem(scrollIndex, 'center');
    else if (isType.scroll.type(location, 'smart')) await listRef.current.scrollToItem(scrollIndex, 'smart');

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
  store: Store,
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
  }
): {
  overscanStartRowIndex: number;
  overscanStopRowIndex: number;
  visibleStartRowIndex: number;
  visibleStopRowIndex: number;

  overscanStartIndex: number;
  overscanStopIndex: number;
  visibleStartIndex: number;
  visibleStopIndex: number;
} => {
  const columnSize = store.layout.column.size;
  if (store.layout.folding.active) {
    const rows = store.layout.folding.rows;
    return {
      overscanStartRowIndex: rows.get(overscanStartIndex).index,
      overscanStopRowIndex: rows.get(overscanStopIndex).index,
      visibleStartRowIndex: rows.get(visibleStartIndex).index,
      visibleStopRowIndex: rows.get(visibleStopIndex).index,

      overscanStartIndex: rows.get(overscanStartIndex).index * columnSize,
      overscanStopIndex: rows.get(overscanStopIndex).index * columnSize + (columnSize - 1),
      visibleStartIndex: rows.get(visibleStartIndex).index * columnSize,
      visibleStopIndex: rows.get(visibleStopIndex).index * columnSize + (columnSize - 1)
    };
  } else
    return {
      overscanStartRowIndex: overscanStartIndex,
      overscanStopRowIndex: overscanStopIndex,
      visibleStartRowIndex: visibleStartIndex,
      visibleStopRowIndex: visibleStopIndex,

      overscanStartIndex: overscanStartIndex * columnSize,
      overscanStopIndex: overscanStopIndex * columnSize + (columnSize - 1),
      visibleStartIndex: visibleStartIndex * columnSize,
      visibleStopIndex: visibleStopIndex * columnSize + (columnSize - 1)
    };
};

export const getFoldingRowIndex = (store: Store, index: number): number => {
  let i = 0;
  while (i < store.layout.folding.rows.size) {
    if (Math.floor(index / store.layout.column.size) <= store.layout.folding.rows.get(i).index) return i;
    i++;
  }
};
