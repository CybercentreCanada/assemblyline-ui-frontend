/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { CircularProgress } from '@material-ui/core';
import useListKeyboard from 'commons/addons/elements/lists/hooks/useListKeyboard';
import useListNavigator from 'commons/addons/elements/lists/hooks/useListNavigator';
import useListStyles from 'commons/addons/elements/lists/hooks/useListStyles';
import ListItemBase, { LineItem } from 'commons/addons/elements/lists/item/ListItemBase';
import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import ListScroller from '../scrollers/ListScroller';
import SimpleListScroller from '../scrollers/SimpleListScroller';

interface SimpleListProps {
  id: string;
  loading: boolean;
  disableProgress?: boolean;
  disableBackgrounds?: boolean;
  scrollInfinite?: boolean;
  scrollReset?: boolean;
  scrollLoadNextThreshold?: number;
  scrollTargetId?: string;
  noDivider?: boolean;
  emptyValue?: React.ReactNode;
  items: LineItem[];
  children: (item: LineItem) => React.ReactNode;
  onCursorChange?: (item: LineItem, cursor?: number) => void;
  onItemSelected?: (item: LineItem, index?: number) => void;
  onRenderActions?: (item: LineItem, index?: number) => React.ReactNode;
  onLoadNext?: () => void;
}

const SimpleList: React.FC<SimpleListProps> = ({
  id,
  loading,
  items,
  disableProgress,
  scrollTargetId,
  scrollInfinite,
  scrollLoadNextThreshold = 75,
  scrollReset,
  disableBackgrounds,
  noDivider,
  children,
  emptyValue,
  onCursorChange,
  onItemSelected,
  onRenderActions,
  onLoadNext
}) => {
  // Hooks.
  const { simpleListStyles: classes } = useListStyles();

  // List Navigator hook to register event handling.
  const { register } = useListNavigator(id);

  // Some refs.
  const outerEL = useRef<HTMLDivElement>();
  const scrollEL = useRef<HTMLElement>();
  const innerEL = useRef<HTMLDivElement>();
  const scroller = useRef<ListScroller>();
  const nextScrollThreshold = useRef<number>(scrollLoadNextThreshold);

  // Configure the list keyboard custom hook.
  const { cursor, next, previous, setCursor, onKeyDown } = useListKeyboard({
    id,
    // scrollTargetId,
    scroller: scroller.current,
    infinite: scrollInfinite,
    count: items.length,
    pause: loading,
    onEscape: () => {
      if (onItemSelected) {
        onItemSelected(null, -1);
      }
    },
    onEnter: (_cursor: number) => {
      if (onItemSelected) {
        onItemSelected(items[_cursor], _cursor);
      }
    },
    onCursorChange: (_cursor: number) => {
      const item = items[_cursor];
      if (onCursorChange) {
        onCursorChange(item, _cursor);
      }
    }
  });

  // Enable scroll event handler?
  const onScrollEnabled = !loading && onLoadNext && scrollInfinite;

  // Memoized callback for when clicking on an item.
  const _onRowClick = useCallback(
    (_item: LineItem, index: number) => {
      setCursor(index);
      if (onItemSelected) {
        onItemSelected(_item, index);
      }
    },
    [setCursor, onItemSelected]
  );

  useLayoutEffect(() => {
    if (scrollReset) {
      nextScrollThreshold.current = scrollLoadNextThreshold;
      scrollEL.current.scrollTo({ top: 0 });
    }
  }, [scrollReset, scrollLoadNextThreshold]);

  useEffect(() => {
    // Scroll handler to track scroll position in order check if it has hit the scrollThreshold.
    const onScroll = () => {
      const fH = scrollEL.current.getBoundingClientRect().height;
      const sT = scrollEL.current.scrollTop;
      const tH = innerEL.current.scrollHeight;
      const cP = sT + fH;
      const scrollPerc = Math.ceil((cP / tH) * 100);
      if (scrollPerc >= nextScrollThreshold.current && !loading) {
        nextScrollThreshold.current = 100;
        onLoadNext();
      }
    };

    // Register scroll handler on scrolltarget.
    if (scrollTargetId) {
      scrollEL.current = document.getElementById(scrollTargetId);
    } else {
      scrollEL.current = outerEL.current;
    }
    if (scrollEL.current && onScrollEnabled) {
      scrollEL.current.addEventListener('scroll', onScroll);
    }

    // Create the scroller computer.
    scroller.current = new SimpleListScroller(scrollEL.current, outerEL.current);

    // Unregister scroll handler.
    return () => {
      scrollEL.current.removeEventListener('scroll', onScroll);
    };
  }, [scrollTargetId, outerEL, onScrollEnabled, loading, onLoadNext]);

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
      onKeyDown={!loading ? onKeyDown : null}
      style={{ overflow: !scrollTargetId ? 'auto' : null }}
    >
      {loading && !disableProgress && (
        <div className={classes.progressCt}>
          <CircularProgress className={classes.progressSpinner} />
        </div>
      )}
      <div ref={innerEL} className={classes.inner}>
        {items && items.length !== 0
          ? items.map((item, index) => {
              return (
                <ListItemBase
                  key={`list.rowitem[${index}]`}
                  index={index}
                  selected={cursor === index}
                  item={item}
                  disableBackgrounds={disableBackgrounds}
                  noDivider={noDivider}
                  onRenderActions={onRenderActions}
                  onClick={_onRowClick}
                >
                  {children}
                </ListItemBase>
              );
            })
          : !loading
          ? emptyValue
          : null}
      </div>
    </div>
  );
};

export default SimpleList;
