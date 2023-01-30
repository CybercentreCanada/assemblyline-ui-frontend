/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useListKeyboard from 'commons/addons/elements/lists/hooks/useListKeyboard';
import useListNavigator from 'commons/addons/elements/lists/hooks/useListNavigator';
import ListItemBase, { LineItem } from 'commons/addons/elements/lists/item/ListItemBase';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ListScroller from '../scrollers/ListScroller';
import SimpleListScroller from '../scrollers/SimpleListScroller';

export const useStyles = makeStyles(theme => ({
  outer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    minHeight: 300,
    height: '100%',
    width: '100%',
    outline: 'none'
  },
  inner: {
    position: 'relative',
    width: '100%',
    outline: 'none'
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
  }
}));

export interface SimpleListProps {
  id: string;
  loading: boolean;
  autofocus?: boolean;
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
  autofocus,
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
  const classes = useStyles();

  // List Navigator hook to register event handling.
  const { register } = useListNavigator(id);

  // Some refs.
  const outerEL = useRef<HTMLDivElement>();
  const scrollEL = useRef<HTMLElement>();
  const innerEL = useRef<HTMLDivElement>();
  const nextScrollThreshold = useRef<number>(scrollLoadNextThreshold);

  // Some states.
  const [scroller, setScroller] = useState<ListScroller>();

  // Configure the list keyboard custom hook.
  const { cursor, next, previous, setCursor, onKeyDown } = useListKeyboard({
    id,
    autofocus,
    scroller,
    infinite: scrollInfinite,
    count: items.length,
    pause: loading,
    onEscape: onItemSelected ? (_cursor: number) => onItemSelected(null, _cursor) : null,
    onEnter: onItemSelected ? (_cursor: number) => onItemSelected(items[_cursor], _cursor) : null,
    onCursorChange: onCursorChange
      ? (_cursor: number) => {
          const item = items[_cursor];
          if (onCursorChange) {
            onCursorChange(item, _cursor);
          }
        }
      : null
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
    setScroller(new SimpleListScroller(scrollEL.current, outerEL.current));

    // Unregister scroll handler.
    return () => {
      scrollEL.current.removeEventListener('scroll', onScroll);
    };
  }, [scrollTargetId, outerEL, onScrollEnabled, loading, onLoadNext]);

  useEffect(() =>
    register({
      onSelect: () => null,
      onSelectNext: () => next(),
      onSelectPrevious: () => previous()
    })
  );

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
          ? items.map((item, index) => (
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
            ))
          : !loading
          ? emptyValue
          : null}
      </div>
    </div>
  );
};

export default SimpleList;
