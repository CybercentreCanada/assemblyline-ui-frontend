/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Box, CircularProgress, Divider, makeStyles } from '@material-ui/core';
import { isArrowDown, isArrowUp, isEnter, isEscape } from 'components/elements/utils/keyboard';
import Throttler from 'components/elements/utils/throttler';
import React, { useLayoutEffect, useRef, useState } from 'react';

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
  pageSize?: number;
  onItemSelected: (item: I) => void;
  onRenderItem: (item: InfiniteListItem) => React.ReactNode;
  onMoreItems: (startIndex: number, stopIndex: number) => Promise<any>;
}

InfiniteList.defaultProps = {
  pageSize: 10,
  selected: null
};

export default function InfiniteList<I extends InfiniteListItem>({
  loading,
  items,
  selected,
  rowHeight,
  pageSize,
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

  // Track cursor index position for keyboard navigation.
  const [cursor, setCursor] = useState<number>(-1);

  // Function throttler to streamline keydown event handlers.
  const throttler = new Throttler(10);

  // Compute the frame of items within visual range.
  const computeFrame = (_items: I[], _rowHeight: number): InfiniteListFrame<I> => {
    // extract some requirement dom element for measurements.
    // a 'frame' here refers to the set of elements within visual range.
    const { current: _containerEl } = containerEl;
    const { current: _innerEl } = innerEl;
    const tH = _innerEl.getBoundingClientRect().height;
    const fH = _containerEl.getBoundingClientRect().height;
    const sT = _containerEl.scrollTop;
    // current position of scroll at bottom of frame.
    const cP = fH + sT;
    // remaining height, hidden height, i.e. what's overflowing under scroll.
    const rH = tH - cP;
    // given the specified row height, how many items we can show in a frame.
    const itemCount = Math.ceil(fH / _rowHeight) + 1;
    // the total index of the first element shown.
    const topIndex = Math.floor(sT / _rowHeight);
    // extract all the elements that we'll show in a frame.
    const displayItems = _items
      .slice(topIndex, topIndex + itemCount)
      .map((item, index) => ({ index: topIndex + index, item }));
    // Give it back ... someone or something, needs to know!
    return { displayItems, sT, rH, fH };
  };

  //
  const onFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    if (cursor === -1) {
      setCursor(0);
    } else {
      scrollSelection(event.currentTarget, cursor, 'start');
    }
  };

  // Handler::OnScroll
  const onScroll = (event: React.UIEvent<HTMLElement>) => {
    const _frame = computeFrame(items, rowHeight);
    setFrame(_frame);
    if (_frame.rH === 0) {
      onMoreItems(items.length, items.length + pageSize);
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
  const scrollSelection = (target: HTMLDivElement, position: number, direction: 'up' | 'down' | 'start') => {
    const scrollToEl = target.querySelector(`[data-listposition="${position}"]`);
    if (scrollToEl) {
      scrollToEl.scrollIntoView({ block: direction === 'start' ? 'start' : 'nearest' });
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

    // compute which items are within visual frame.
    const updateFrame = () => {
      setFrame(computeFrame(items, rowHeight));
    };

    // Recompute the frame each time this component mounts or receives update to properties.
    updateFrame();

    // Register a windows resize event to ensure frame measurement remain in line with window size.
    window.addEventListener('resize', updateFrame);
    return () => {
      // Deregister window event listener.
      window.removeEventListener('resize', updateFrame);
    };
  }, [items, rowHeight]);

  return (
    <div
      ref={containerEl}
      className={classes.infiniteListCt}
      tabIndex={0}
      onScroll={onScroll}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
    >
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
