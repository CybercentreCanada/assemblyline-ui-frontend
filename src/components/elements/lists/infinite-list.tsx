/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Box, CircularProgress, Divider, makeStyles } from '@material-ui/core';
import { isArrowDown, isArrowUp, isEnter, isEscape } from 'components/elements/keyboard';
import React, { useLayoutEffect, useRef, useState } from 'react';
import Throttler from '../throttler';

const useStyles = makeStyles(theme => ({
  infiniteListCt: {
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    position: 'relative',
    overflow: 'auto',
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
  },
  progressCt: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.7,
    zIndex: 1,
    alignItems: 'center',
    backgroundColor: theme.palette.background.default
  },
  progressSpinner: {
    position: 'absolute',
    left: '50%',
    top: '50%'
    // margin: 'auto'
  }
}));

interface InfiniteListFrame<I extends InfiniteListItem> {
  sT: number;
  fH: number;
  rH: number;
  displayItems: { index: number; item: I }[];
}

export interface InfiniteListItem {
  id: number | string;
}

interface InfiniteListProps<I extends InfiniteListItem> {
  loading: boolean;
  items: I[];
  selected?: I;
  rowHeight: number;
  onItemSelected: (item: I) => void;
  onRenderItem: (item: InfiniteListItem) => React.ReactNode;
  onMoreItems: (startIndex: number, stopIndex: number) => Promise<any>;
}

InfiniteList.defaultProps = {
  selected: null
};

export default function InfiniteList<I extends InfiniteListItem>({
  loading,
  items,
  selected,
  rowHeight,
  onItemSelected,
  onRenderItem,
  onMoreItems
}: InfiniteListProps<I>) {
  // Styles.
  const classes = useStyles();

  // Element references.
  const containerEl = useRef<HTMLDivElement>();
  const innerEl = useRef<HTMLDivElement>();

  // Store the current frame in state.
  const [frame, setFrame] = useState<InfiniteListFrame<I>>({ displayItems: [], sT: -1, fH: -1, rH: -1 });

  // Cursor position for keyboard navigation.
  const [cursor, setCursor] = useState<number>(-1);

  // Function throttler to streamline keydown event handlers.
  const throttler = new Throttler(10);

  // Compute the frame of items within visual range.
  const computeFrame = (_items: I[], _rowHeight: number): InfiniteListFrame<I> => {
    const { current: _containerEl } = containerEl;
    const { current: _innerEl } = innerEl;
    const tH = _innerEl.getBoundingClientRect().height;
    const fH = _containerEl.getBoundingClientRect().height;
    const sT = _containerEl.scrollTop;
    const cP = fH + sT;
    const rH = tH - cP;
    const itemCount = Math.ceil(fH / _rowHeight);
    const topIndex = Math.floor(sT / _rowHeight);
    const displayItems = _items
      .slice(topIndex, topIndex + itemCount)
      .map((item, index) => ({ index: topIndex + index, item }));
    return { displayItems, sT, rH, fH };
  };

  // Handler::OnScroll
  const onScroll = (event: React.UIEvent<HTMLElement>) => {
    console.log('scrolling..');
    const _frame = computeFrame(items, rowHeight);
    setFrame(_frame);
    if (_frame.rH === 0) {
      onMoreItems(items.length, items.length + 10);
    }
  };

  // Handler::OnScroll
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

  //
  const _onKeyDownThrottled = (keyCode: number, target: HTMLDivElement) => {
    // This will ensure that users who hold down UP/DOWN arrow key don't overload
    //  react with constant stream of keydown events.
    // We'll process on event every 10ms and throw away the rest.
    throttler.throttle(() => {
      if (isArrowUp(keyCode)) {
        const nextIndex = cursor - 1;
        if (nextIndex > -1) {
          setCursor(nextIndex);
          scrollSelection(target, nextIndex, 'up');
        }
      } else if (isArrowDown(keyCode)) {
        const nextIndex = cursor + 1;
        if (nextIndex < items.length) {
          setCursor(nextIndex);
        }
        scrollSelection(target, nextIndex, 'down');
      }
    });
  };

  // Ensure the list element at specified position is into view.
  const scrollSelection = (target: HTMLDivElement, position: number, direction: 'up' | 'down') => {
    const scrollToEl = target.querySelector(`[data-listposition="${position}"]`);
    if (scrollToEl) {
      scrollToEl.scrollIntoView({ block: 'nearest' });
    } else {
      // Items might not be rendered yet because of we only render what's
      //  within visual range.
      containerEl.current.scrollBy({ top: direction === 'down' ? rowHeight : -rowHeight });
    }
  };

  //
  const onItemClick = ({ item, index }: { index: number; item: I }) => {
    setCursor(index);
    onItemSelected(item);
  };

  // Row renderer.
  // Each item is absolutely positioned relative to the top of the innerContainer
  //  in order to ensure that it lines up with the current scrolling range.
  const rowRenderer = (displayItem: { index: number; item: I }) => {
    return (
      <Box
        mr={0}
        key={`listitem[${displayItem.index}].id[${displayItem.item.id}]`}
        onClick={() => onItemClick(displayItem)}
        style={{
          top: displayItem.index * rowHeight,
          left: 0,
          position: 'absolute',
          width: '100%',
          height: rowHeight
        }}
      >
        <Box
          className={classes.listItem}
          data-listposition={displayItem.index}
          data-listitemselected={displayItem.item === selected}
          data-listitemfocus={displayItem.index === cursor}
        >
          {onRenderItem(displayItem.item)}
        </Box>
        <Divider />
      </Box>
    );
  };

  // Compute new frame and innerContainer height each time we receive new items.
  useLayoutEffect(() => {
    // initialize/update scrolling container height.
    innerEl.current.style.height = `${items.length * rowHeight}px`;

    //
    const firstItem = innerEl.current.querySelector('[data-listposition="0"]');
    if (firstItem) {
      console.log(firstItem.getBoundingClientRect().height);
    }

    // compute which items are within visual frame.
    setFrame(computeFrame(items, rowHeight));
  }, [items, rowHeight]);

  return (
    <div ref={containerEl} className={classes.infiniteListCt} tabIndex={-1} onScroll={onScroll} onKeyDown={onKeyDown}>
      {loading ? (
        <div className={classes.progressCt} style={{ top: frame.sT, height: frame.fH }}>
          <CircularProgress className={classes.progressSpinner} />
        </div>
      ) : null}
      <div ref={innerEl} className={classes.infiniteListInnerCt}>
        {frame.displayItems.map(item => rowRenderer(item))}
      </div>
    </div>
  );
}
