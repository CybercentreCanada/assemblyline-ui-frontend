/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { CircularProgress, useScrollTrigger } from '@material-ui/core';
import React, { useCallback, useLayoutEffect, useRef } from 'react';
import useListKeyboard from '../hooks/useListKeyboard';
import useListStyles from '../hooks/useListStyles';
import ListRow, { LineItem } from '../list-item';

interface SimpleListProps {
  loading: boolean;
  disableProgress?: boolean;
  scrollReset?: boolean;
  scrollLoadNextThreshold?: number;
  items: LineItem[];
  onCursorChange?: (cursor: number, item: LineItem) => void;
  onItemSelected: (item: LineItem) => void;
  onRenderRow: (item: LineItem) => React.ReactNode;
  onLoadNext?: () => void;
}

const SimpleList: React.FC<SimpleListProps> = ({
  loading,
  items,
  disableProgress = false,
  scrollLoadNextThreshold = 75,
  scrollReset = false,
  onCursorChange,
  onItemSelected,
  onRenderRow,
  onLoadNext
}) => {
  // Hooks.
  const { simpleListStyles: classes } = useListStyles();

  // Configure the list keyboard custom hook.
  const { cursor, setCursor, onKeyDown } = useListKeyboard({
    infinite: true,
    count: items.length,
    onEscape: () => onItemSelected(null),
    onEnter: (_cursor: number) => onItemSelected(items[_cursor]),
    onCursorChange: (_cursor: number) => {
      const item = items[_cursor];
      if (onCursorChange) {
        onCursorChange(_cursor, item);
      }
    }
  });

  // Some refs.
  const outerEL = useRef<HTMLDivElement>();
  const innerEL = useRef<HTMLDivElement>();
  const nextScrollThreshold = useRef<number>(scrollLoadNextThreshold);
  const trigger = useScrollTrigger({ target: innerEL.current });
  console.log(trigger);

  // Enable scroll event handler?
  const onScrollEnabled = !loading && onLoadNext;

  // Memoized callback for when clicking on an item.
  const _onRowClick = useCallback(
    (_item: LineItem, index: number) => {
      setCursor(index);
      onItemSelected(_item);
    },
    [setCursor, onItemSelected]
  );

  // Scroll handler to track scroll position in order check if it has hit the scrollThreshold.
  const onScroll = () => {
    const fH = outerEL.current.getBoundingClientRect().height;
    const sT = innerEL.current.scrollTop;
    const tH = innerEL.current.scrollHeight;
    const cP = sT + fH;
    const scrollPerc = Math.ceil((cP / tH) * 100);
    if (scrollPerc >= nextScrollThreshold.current && !loading) {
      nextScrollThreshold.current = 100;
      onLoadNext();
    }
  };

  //
  useLayoutEffect(() => {
    if (scrollReset) {
      nextScrollThreshold.current = scrollLoadNextThreshold;
      innerEL.current.scrollTo({ top: 0 });
    }
  }, [scrollReset, scrollLoadNextThreshold]);

  return (
    <div ref={outerEL} className={classes.outer} onScroll={onScrollEnabled ? onScroll : null}>
      {loading && !disableProgress && (
        <div className={classes.progressCt}>
          <CircularProgress className={classes.progressSpinner} />
        </div>
      )}
      <div ref={innerEL} className={classes.inner} tabIndex={0} onKeyDown={!loading ? onKeyDown : null}>
        {items.map((item, index) => (
          <ListRow
            key={`list.rowitem[${index}]`}
            loaded
            index={index}
            selected={cursor === index}
            item={item}
            onClick={_onRowClick}
            onRenderRow={onRenderRow}
          />
        ))}
      </div>
    </div>
  );
};

export default SimpleList;
