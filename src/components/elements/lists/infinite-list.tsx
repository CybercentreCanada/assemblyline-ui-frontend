import { Box, Divider, makeStyles } from '@material-ui/core';
import { isArrowDown, isArrowUp, isEnter, isEscape } from 'components/elements/keyboard';
import Throttler from 'components/elements/throttler';
import React, { useState } from 'react';
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
  const [cursor, setCursor] = useState<number>(2);

  // Function throttler to streamline keydown event handlers.
  const throttler = new Throttler(10);

  //
  const isRowLoaded = ({ index }): boolean => {
    return index < items.length;
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
        <Box
          className={classes.listItem}
          data-listposition={index}
          data-listitemselected={item === selected}
          data-listitemfocus={index === cursor}
        >
          {loading ? <span>Loading...</span> : onRenderItem(item)}
        </Box>
        <Divider />
      </Box>
    );
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    event.preventDefault();
    const { keyCode } = event;
    if (isArrowUp(keyCode) || isArrowDown(keyCode)) {
      // Here we handle our custom scrolls and cursor item selection.
      _onKeyDownThrottled(keyCode, event.currentTarget as HTMLDivElement);
    } else if (isEnter(keyCode)) {
      // [ENTER]: select the cursor item.
      onItemSelected(items[cursor]);
    } else if (isEscape(keyCode)) {
      // [ENTER]: select the cursor item.
      onItemSelected(null);
    }
    // TODO: handle[PageUp,PageDown ]
  };

  const _onKeyDownThrottled = (keyCode: number, target: HTMLDivElement) => {
    // This will ensure that users who hold down UP/DOWN arrow key don't overload
    //  react with constant stream of keydown events.
    // We'll process on event every 10ms and throw away the rest.
    throttler.throttle(() => {
      if (isArrowUp(keyCode)) {
        console.log('keyup');
        const nextIndex = cursor - 1;
        if (nextIndex > -1) {
          setCursor(nextIndex);
          scrollSelection(target, nextIndex);
        }
      } else if (isArrowDown(keyCode)) {
        console.log('keydown');
        const nextIndex = cursor + 1;
        if (nextIndex < items.length) {
          setCursor(nextIndex);
          scrollSelection(target, nextIndex);
        }
      }
    });
  };

  // Ensure the list element at specified position is into view.
  const scrollSelection = (target: HTMLDivElement, position: number) => {
    const scrollToEl = target.querySelector(`[data-listposition="${position}"`);
    if (scrollToEl) {
      scrollToEl.scrollIntoView({ block: 'nearest' });
    }
  };

  //
  return (
    <AutoSizer>
      {({ width, height }) => {
        return (
          <InfiniteLoader isRowLoaded={isRowLoaded} loadMoreRows={loadMoreRows} rowCount={totalCount}>
            {({ onRowsRendered, registerChild }) => (
              <Box onKeyDown={onKeyDown}>
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
                  on
                />
              </Box>
            )}
          </InfiniteLoader>
        );
      }}
    </AutoSizer>
  );
}
