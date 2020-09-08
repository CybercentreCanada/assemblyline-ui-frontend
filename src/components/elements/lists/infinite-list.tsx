import { Box, Divider, makeStyles } from '@material-ui/core';
import React, { useLayoutEffect, useRef, useState } from 'react';

const useStyles = makeStyles(theme => ({
  infiniteListCt: {
    position: 'relative',
    overflow: 'auto',
    height: '500px'
  },
  infiniteListInnerCt: {
    position: 'relative',
    overflow: 'hidden'
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

  //
  // const frameRef = useRef<{ top: number; frame: number; bottom: number; startIndex; endIndex }>();
  const [frameState, setFrameState] = useState<{
    top: number;
    frame: number;
    bottom: number;
    startIndex: number;
    endIndex: number;
  }>({ top: 200, frame: 200, bottom: 200, startIndex: 0, endIndex: 0 });

  // Render children relative to top
  // Row renderer.
  const rowRenderer = (item: I, index: number) => {
    const sT = containerEl.current.scrollTop;
    return (
      <Box
        mr={0}
        key={`listitem[${index}].id[${item.id}]`}
        onClick={() => onItemSelected(item)}
        style={{ top: sT + index * rowHeight, left: 0, position: 'absolute', width: '100%', height: rowHeight }}
      >
        <Box className={classes.listItem} data-listposition={index}>
          {onRenderItem(item)}
        </Box>
        <Divider />
      </Box>
    );
  };

  useLayoutEffect(() => {
    innerEl.current.style.height = `${items.length * rowHeight}px`;

    const fH = containerEl.current.getBoundingClientRect().height;
    console.log(fH);

    // console.log(innerEl.current.style.height);.
  });

  // InfinitListInnerCt overflow into

  return (
    <div ref={containerEl} className={classes.infiniteListCt}>
      <div ref={innerEl} className={classes.infiniteListInnerCt}>
        {items.map((item, i) => rowRenderer(item, i))}
      </div>
    </div>
  );
}
