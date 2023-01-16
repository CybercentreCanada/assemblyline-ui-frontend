/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { CircularProgress, Grid, useTheme } from '@mui/material';
import useListKeyboard from 'commons/addons/elements/lists/hooks/useListKeyboard';
import useListStyles from 'commons/addons/elements/lists/hooks/useListStyles';
import { LineItem } from 'commons/addons/elements/lists/item/ListItemBase';
import React, { useCallback, useEffect, useRef } from 'react';
import useListNavigator from '../hooks/useListNavigator';
import ListItemBase from '../item/ListItemBase';
import ListScroller from '../scrollers/ListScroller';
import SimpleListScroller from '../scrollers/SimpleListScroller';

interface Breakpoints {
  xs?: 1 | 2 | 3 | 4 | 6 | 12;
  sm?: 1 | 2 | 3 | 4 | 6 | 12;
  md?: 1 | 2 | 3 | 4 | 6 | 12;
  lg?: 1 | 2 | 3 | 4 | 6 | 12;
  xl?: 1 | 2 | 3 | 4 | 6 | 12;
}

interface ImageListProps {
  id: string;
  items: LineItem[];
  emptyValue?: React.ReactNode;
  spacing?: number;
  view?: 'table' | 'card';
  breakpoints?: Breakpoints;
  loading?: boolean;
  disableOverflow?: boolean;
  scrollTargetId?: string;
  children: (item: LineItem) => React.ReactNode;
  onItemSelected?: (item: LineItem, position?: number) => void;
  onCursorChange?: (position: number, item: LineItem) => void;
  onRenderActions?: (item: LineItem) => React.ReactNode;
}

const ImageList: React.FC<ImageListProps> = ({
  id,
  loading = false,
  spacing = 1,
  items,
  emptyValue,
  view = 'card',
  breakpoints = { xs: 12, sm: 12, md: 6, lg: 4, xl: 3 },
  disableOverflow = false,
  scrollTargetId,
  children,
  onItemSelected,
  onCursorChange,
  onRenderActions
}) => {
  // React hooks.
  const theme = useTheme();
  const { simpleListStyles } = useListStyles();

  // Some refs.
  const outerEL = useRef<HTMLDivElement>();
  const scrollEL = useRef<HTMLElement>();
  const scroller = useRef<ListScroller>();

  // Configure the list keyboard custom hook...
  const { register } = useListNavigator(id);
  const { cursor, setCursor, next, previous, onKeyDown } = useListKeyboard({
    id,
    scroller: scroller.current,
    infinite: false,
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

  // Figure out which breakpoints to use.
  const computeBreakpoints = (): Breakpoints => {
    if (view && view === 'table') {
      return { xs: 12 };
    }
    return breakpoints;
  };

  // Memoized callback for when clicking on an item.
  const _onItemClick = useCallback(
    (_item: LineItem, index: number) => {
      setCursor(index);
      if (onItemSelected) {
        onItemSelected(_item);
      }
    },
    [setCursor, onItemSelected]
  );

  useEffect(() => {
    // Register scroll handler on scrolltarget.
    if (scrollTargetId) {
      scrollEL.current = document.getElementById(scrollTargetId);
    } else {
      scrollEL.current = outerEL.current;
    }

    // Create the scroller computer.
    scroller.current = new SimpleListScroller(scrollEL.current, outerEL.current);
  });

  useEffect(() =>
    register({
      onSelect: () => {},
      onSelectNext: () => next(),
      onSelectPrevious: () => previous()
    })
  );

  return (
    <div ref={outerEL} className={simpleListStyles.outer}>
      {loading && (
        <div className={simpleListStyles.progressCt}>
          <CircularProgress className={simpleListStyles.progressSpinner} />
        </div>
      )}
      <div
        id={id}
        className={simpleListStyles.inner}
        tabIndex={0}
        onKeyDown={!loading ? onKeyDown : null}
        style={{ overflow: disableOverflow ? 'unset' : null, padding: theme.spacing(spacing) }}
      >
        <Grid container spacing={view === 'card' ? spacing : 0}>
          {items.length === 0
            ? emptyValue
            : items.map((item: LineItem, index: number) => (
                <Grid key={item.id} item {...computeBreakpoints()}>
                  <ListItemBase
                    noDivider
                    card={view !== 'table'}
                    index={index}
                    item={item}
                    height="100%"
                    selected={cursor === index}
                    onClick={_onItemClick}
                    onRenderActions={onRenderActions}
                  >
                    {children}
                  </ListItemBase>
                </Grid>
              ))}
        </Grid>
      </div>
    </div>
  );
};

export default ImageList;
