import { Box, Divider, makeStyles } from '@material-ui/core';
import React, { useLayoutEffect, useRef, useState } from 'react';

const useStyles = makeStyles(theme => ({
  infiniteListCt: {
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    width: '100%',

    position: 'relative',
    overflow: 'auto',
    // height: '500px'
    outline: 'none'
  },
  infiniteListInnerCt: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%'
  },

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
  rowHeight: number;
  onItemSelected: (item: I) => void;
  onRenderItem: (item: InfiniteListItem) => React.ReactNode;
  onNextPage: (startIndex: number, stopIndex: number) => Promise<any>;
}

export default function InfiniteList<I extends InfiniteListItem>({
  loading,
  items,
  rowHeight,
  onItemSelected,
  onRenderItem,
  onNextPage
}: InfiniteListProps<I>) {
  // Styles.
  const classes = useStyles();

  // Element references.
  const containerEl = useRef<HTMLDivElement>();
  const innerEl = useRef<HTMLDivElement>();

  const [frame, setFrame] = useState<{ index: number; item: I }[]>([]);

  const computeFrame = (_items: I[], _rowHeight: number) => {
    const { current: _containerEl } = containerEl;
    const { current: _innerEl } = innerEl;
    const tH = _innerEl.getBoundingClientRect().height;
    const fH = _containerEl.getBoundingClientRect().height;
    const sT = _containerEl.scrollTop;
    const cP = fH + sT;
    const rH = tH - cP;

    const itemCount = Math.ceil(fH / _rowHeight);

    const topIndex = Math.floor(sT / _rowHeight);

    console.log(`${topIndex}-${topIndex + itemCount}`);

    const displayItems = _items
      .slice(topIndex, topIndex + itemCount)
      .map((item, index) => ({ index: topIndex + index, item }));

    return { displayItems, rH };
  };

  //
  const onScroll = (event: React.UIEvent<HTMLElement>) => {
    // const tH = innerEl.current.getBoundingClientRect().height;
    // const fH = containerEl.current.getBoundingClientRect().height;
    // const sT = event.currentTarget.scrollTop;
    // const cP = fH + sT;
    // const rH = tH - cP;

    // const itemCount = Math.ceil(fH / rowHeight);

    // const topIndex = Math.floor(sT / rowHeight);

    // console.log(`${topIndex}-${topIndex + itemCount}`);

    // const _items = items
    //   .slice(topIndex, topIndex + itemCount)
    //   .map((item, index) => ({ index: topIndex + index, item }));

    const { displayItems, rH } = computeFrame(items, rowHeight);

    setFrame(displayItems);

    if (rH === 0) {
      console.log('fetching next page of items...');
      onNextPage(items.length, items.length + 10);
    }
  };

  // Render children relative to top
  // Row renderer.
  const rowRenderer = (displayItem: { index: number; item: I }) => {
    return (
      <Box
        mr={0}
        key={`listitem[${displayItem.index}].id[${displayItem.item.id}]`}
        onClick={() => onItemSelected(displayItem.item)}
        style={{
          top: displayItem.index * rowHeight,
          left: 0,
          position: 'absolute',
          width: '100%',
          height: rowHeight
        }}
      >
        <Box className={classes.listItem} data-listposition={displayItem.index}>
          {onRenderItem(displayItem.item)}
        </Box>
        <Divider />
      </Box>
    );
  };

  useLayoutEffect(() => {
    // initialize scrolling container height.
    innerEl.current.style.height = `${items.length * rowHeight}px`;

    const { displayItems } = computeFrame(items, rowHeight);
    setFrame(displayItems);

    // const fH = containerEl.current.getBoundingClientRect().height;

    // const itemCount = Math.ceil(fH / rowHeight);
    // setDisplayItems(items.slice(0, itemCount).map((item, index) => ({ index, item })));
    // console.log(itemCount);
  }, [items, rowHeight]);

  return (
    <div ref={containerEl} className={classes.infiniteListCt} tabIndex={-1} onScroll={onScroll}>
      <div ref={innerEl} className={classes.infiniteListInnerCt}>
        {frame.map(item => rowRenderer(item))}
      </div>
    </div>
  );
}
