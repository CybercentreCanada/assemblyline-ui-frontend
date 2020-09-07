import React, { useState } from 'react';
import { AutoSizer, IndexRange, InfiniteLoader, List } from 'react-virtualized';
import Viewport from '../viewport';
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
  const [rows, setRows] = useState<{ id: number }[]>([{ id: 0 }]);
  // const { current: rows } = useRef<{ id: number }[]>([{ id: 0 }]);

  //
  // const hasNextPage = true;

  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const rowCount = rows.length;

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  // const loadMoreRows = !loaded ? () => {} : async () => onNextPage();
  const loadMoreRows = (params: IndexRange): Promise<any> => {
    // if (!loaded) {
    //   return () => {};
    // }
    console.log('more rows please...');
    console.log(params);

    const newRows = [];
    for (let i = params.startIndex; i <= params.stopIndex; i++) {
      newRows.push({ id: `new_id.${i}` });
    }

    // rows.current.push(...newItems);
    setRows([...rows, ...newRows]);
    // rows.push(...newRows);

    console.log(rows);

    return Promise.resolve();
  };

  // Every row is loaded except for our loading indicator row.
  const isRowLoaded = ({ index }) => {
    const _loaded = index < rows.length;
    console.log(`isRowLoaded...${index}: ${_loaded}`);
    return _loaded;
  };

  // Render a list item or a loading indicator.
  const rowRenderer = ({ index, key, style }) => {
    console.log(`r[${index}:${key}]`);
    const item = rows[index];
    return (
      <div
        key={key}
        style={style}
        // style={{ borderBottom: '1px solid hsl(0, 0%, 15%)', backgroundColor: 'hsl(0, 0%, 20%)', height: 200 }}
      >
        <div style={{ borderBottom: '1px solid hsl(0, 0%, 15%)', backgroundColor: 'hsl(0, 0%, 20%)', height: 200 }}>
          {index}: {item.id}
        </div>
      </div>
    );

    // return onRenderItem(items[index]);
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

  // return (
  //   <AutoSizer>
  //     {({ width, height }) => {
  //       return (
  //         <List
  //           width={width}
  //           height={height}
  //           rowHeight={rowHeight}
  //           rowRenderer={this.renderRow}
  //           rowCount={this.list.length}
  //           overscanRowCount={3}
  //         />
  //       );
  //     }}
  //   </AutoSizer>
  // );..

  return (
    <Viewport>
      <AutoSizer>
        {({ width, height }) => {
          return (
            <InfiniteLoader isRowLoaded={isRowLoaded} loadMoreRows={loadMoreRows} rowCount={1000}>
              {({ onRowsRendered, registerChild }) => (
                <List
                  ref={registerChild}
                  onRowsRendered={onRowsRendered}
                  rowRenderer={rowRenderer}
                  rowCount={rows.length}
                  height={height}
                  rowHeight={200}
                  rowWidth={1500}
                  width={width}
                />
              )}
            </InfiniteLoader>
          );
        }}
      </AutoSizer>
    </Viewport>
  );

  // <InfiniteLoader isRowLoaded={isRowLoaded} loadMoreRows={loadMoreRows} rowCount={1000}>
  //   {({ onRowsRendered, registerChild }) => (
  //     <List
  //       ref={registerChild}
  //       onRowsRendered={onRowsRendered}
  //       rowRenderer={rowRenderer}
  //       rowCount={rows.length}
  //       height={500}
  //       rowHeight={200}
  //       rowWidth={1500}
  //       width={2000}
  //     />
  //   )}
  // </InfiniteLoader>
  // );
}
// export default VirtualizedList;
