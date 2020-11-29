/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { CircularProgress } from '@material-ui/core';
import useListKeyboard from 'components/elements/lists/hooks/useListKeyboard';
import useListNavigator from 'components/elements/lists/hooks/useListNavigator';
import useListStyles from 'components/elements/lists/hooks/useListStyles';
import ListItemBase, { LineItem } from 'components/elements/lists/item/ListItemBase';
import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

interface SimpleListProps {
  id: string;
  loading: boolean;
  disableProgress?: boolean;
  disableBackgrounds?: boolean;
  noDivider?: boolean;
  scrollInfinite?: boolean;
  scrollReset?: boolean;
  scrollLoadNextThreshold?: number;
  items: LineItem[];
  onCursorChange?: (cursor: number, item: LineItem) => void;
  onItemSelected: (item: LineItem) => void;
  onRenderRow: (item: LineItem) => React.ReactNode;
  onRenderActions?: (item: LineItem) => React.ReactNode;
  onLoadNext?: () => void;
}

const SimpleList: React.FC<SimpleListProps> = ({
  id,
  loading,
  items,
  disableProgress,
  disableBackgrounds,
  noDivider,
  scrollInfinite,
  scrollLoadNextThreshold = 75,
  scrollReset,
  onCursorChange,
  onItemSelected,
  onRenderRow,
  onRenderActions,
  onLoadNext
}) => {
  // Hooks.
  const { simpleListStyles: classes } = useListStyles();

  // Configure the list keyboard custom hook.
  const { cursor, next, previous, setCursor, onKeyDown } = useListKeyboard({
    id,
    infinite: scrollInfinite,
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

  // List Navigator hook to register event handling.
  const { register } = useListNavigator(id);

  // Some refs.
  const outerEL = useRef<HTMLDivElement>();
  const innerEL = useRef<HTMLDivElement>();
  const nextScrollThreshold = useRef<number>(scrollLoadNextThreshold);

  // Enable scroll event handler?
  const onScrollEnabled = !loading && onLoadNext && scrollInfinite;

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
    const sT = outerEL.current.scrollTop;
    const tH = innerEL.current.scrollHeight;
    const cP = sT + fH;
    const scrollPerc = Math.ceil((cP / tH) * 100);
    if (scrollPerc >= nextScrollThreshold.current && !loading) {
      nextScrollThreshold.current = 100;
      onLoadNext();
    }
  };

  useLayoutEffect(() => {
    if (scrollReset) {
      nextScrollThreshold.current = scrollLoadNextThreshold;
      outerEL.current.scrollTo({ top: 0 });
    }
  }, [scrollReset, scrollLoadNextThreshold]);

  useEffect(() => {
    return register({
      onSelect: () => null,
      onSelectNext: () => next(),
      onSelectPrevious: () => previous()
    });
  });

  return (
    <div
      id={id}
      tabIndex={0}
      ref={outerEL}
      className={classes.outer}
      onScroll={onScrollEnabled ? onScroll : null}
      onKeyDown={!loading ? onKeyDown : null}
    >
      {loading && !disableProgress && (
        <div className={classes.progressCt}>
          <CircularProgress className={classes.progressSpinner} />
        </div>
      )}
      <div ref={innerEL} className={classes.inner}>
        {items.map((item, index) => (
          <ListItemBase
            key={`list.rowitem[${index}]`}
            index={index}
            disableBackgrounds={disableBackgrounds}
            noDivider={noDivider}
            selected={cursor === index}
            item={item}
            onRenderActions={onRenderActions}
            onClick={_onRowClick}
          >
            {onRenderRow}
          </ListItemBase>
        ))}
      </div>
    </div>
  );
};

export default SimpleList;
