import React from 'react';
import { IndexRange, InfiniteLoader, List } from 'react-virtualized';
import { ListItemProps } from './list';

// export interface VirtualizedListItemProps {
//   id: number | string;
// }

// export interface VirtualizedListPage<I extends VirtualizedListItemProps> {
//   index: number;
//   items: I[];
// }

interface VirtualizedListProps<I extends ListItemProps> {
  loaded: boolean;
  items: I[];
  onNextPage: () => void;
  onRenderItem: (item: I) => React.ReactNode;
}

export default function VirtualizedList<I extends ListItemProps>({
  loaded,
  items,
  onNextPage,
  onRenderItem
}: VirtualizedListProps<I>) {
  //
  const hasNextPage = true;

  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const rowCount = hasNextPage ? items.length + 1 : items.length;

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  // const loadMoreRows = !loaded ? () => {} : async () => onNextPage();
  const loadMoreRows = (params: IndexRange): Promise<any> => {
    // if (!loaded) {
    //   return () => {};
    // }
    console.log('more rows please...');
    return Promise.resolve(onNextPage()).then(() => items);
  };

  // Every row is loaded except for our loading indicator row.
  const isRowLoaded = ({ index }) => {
    return false;
    // const _loaded = index < items.length;
    // console.log(`isRowLoaded...${index}: ${_loaded}`);
    // return _loaded;
  };

  // Render a list item or a loading indicator.
  const rowRenderer = ({ index, key, style }) => {
    return onRenderItem(items[index]);
    // let content;
    // if (!isRowLoaded({ index })) {
    //   content = 'Loading...';
    // } else {
    //   content = list.getIn([index, 'name']);
    // }

    // return (
    //   <div key={key} style={style}>
    //     {content}
    //   </div>
    // );
  };
  return (
    <InfiniteLoader isRowLoaded={isRowLoaded} loadMoreRows={loadMoreRows} rowCount={rowCount}>
      {({ onRowsRendered, registerChild }) => (
        <List
          ref={registerChild}
          onRowsRendered={onRowsRendered}
          rowRenderer={rowRenderer}
          rowCount={items.length}
          height={600}
          rowHeight={200}
          rowWidth={1500}
          width={2000}
        />
      )}
    </InfiniteLoader>
  );
}
// export default VirtualizedList;
