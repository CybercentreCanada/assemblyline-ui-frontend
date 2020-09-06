import { Box, Divider, makeStyles } from '@material-ui/core';
import React from 'react';
import { AutoSizer, IndexRange, InfiniteLoader, List } from 'react-virtualized';

const useStyles = makeStyles(theme => ({
  list: {},
  listItem: {
    padding: theme.spacing(2),
    wordBreak: 'break-all',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 17%)' : 'hsl(0, 0%, 95%)'
    },
    '&[data-listitemfocus="true"]': {
      backgroundColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 17%)' : 'hsl(0, 0%, 95%)'
    },
    '&[data-listitemselected="true"]': {
      backgroundColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 15%)' : 'hsl(0, 0%, 92%)'
    }
  }
}));

export interface InfiniteListItem {
  id: number | string;
}

interface InfiniteListProps<I extends InfiniteListItem> {
  loading: boolean;
  items: I[];
  selected: I;
  rowHeight: number;
  totalCount?: number;
  onItemSelected: (item: I) => void;
  onRenderItem: (item: I) => React.ReactNode;
  onNextPage: (startIndex: number, stopIndex: number) => Promise<any>;
}

InfiniteList.defaultProps = {
  totalCount: 10000
};

export default function InfiniteList<I extends InfiniteListItem>({
  loading,
  items,
  rowHeight,
  totalCount,
  selected,
  onItemSelected,
  onRenderItem,
  onNextPage
}: InfiniteListProps<I>) {
  //
  const classes = useStyles();

  //
  const isRowLoaded = ({ index }): boolean => {
    const isLoaded = index < items.length;
    console.log(`isRowLoaded[${index}: ${isLoaded} : ${items.length}]`);
    return isLoaded;
  };

  //
  const loadMoreRows = (params: IndexRange): Promise<any> => {
    return onNextPage(params.startIndex, params.stopIndex);
  };

  //
  const rowRenderer = ({ index, key, style }) => {
    const item = items[index];
    return (
      <Box key={key} style={style} onClick={() => onItemSelected(item)}>
        <Box className={classes.listItem}>{loading ? <span>Loading...</span> : onRenderItem(item)}</Box>
        <Divider />
      </Box>
    );
  };

  //
  return (
    <AutoSizer>
      {({ width, height }) => {
        return (
          <InfiniteLoader isRowLoaded={isRowLoaded} loadMoreRows={loadMoreRows} rowCount={totalCount}>
            {({ onRowsRendered, registerChild }) => (
              <List
                ref={registerChild}
                onRowsRendered={onRowsRendered}
                rowRenderer={rowRenderer}
                rowCount={items.length}
                height={height}
                rowHeight={rowHeight}
                rowWidth={width}
                width={width}
                style={{ outline: 'none' }}
              />
            )}
          </InfiniteLoader>
        );
      }}
    </AutoSizer>
  );
}
