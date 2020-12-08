/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { CircularProgress, Grid, GridSpacing, useMediaQuery, useTheme } from '@material-ui/core';
import useListKeyboard from 'commons/addons/elements/lists/hooks/useListKeyboard';
import useListStyles from 'commons/addons/elements/lists/hooks/useListStyles';
import { LineItem } from 'commons/addons/elements/lists/item/ListItemBase';
import React, { useCallback, useEffect } from 'react';
import useListNavigator from '../hooks/useListNavigator';
import ListItemBase from '../item/ListItemBase';

interface Breakpoints {
  xs?: 1 | 2 | 3 | 4 | 6 | 12;
  sm?: 1 | 2 | 3 | 4 | 6 | 12;
  md?: 1 | 2 | 3 | 4 | 6 | 12;
  lg?: 1 | 2 | 3 | 4 | 6 | 12;
  xl?: 1 | 2 | 3 | 4 | 6 | 12;
}

interface GridListProps {
  id: string;
  items: LineItem[];
  spacing?: GridSpacing;
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

const GridList: React.FC<GridListProps> = ({
  id,
  loading = false,
  spacing = 0,
  items,
  view,
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
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isCardLayout = view === 'card' || (!view && isLg);

  // Configure the list keyboard custom hook...
  const { register } = useListNavigator(id);
  const { cursor, setCursor, next, previous, onKeyDown } = useListKeyboard({
    id,
    scroller: null,
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

  console.log(`isCard: ${isCardLayout}`);

  useEffect(() => {
    return register({
      onSelect: () => console.log('select'),
      onSelectNext: () => next(),
      onSelectPrevious: () => previous()
    });
  });

  //
  return (
    <div className={simpleListStyles.outer}>
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
        <Grid container spacing={spacing}>
          {items.map((item: LineItem, index: number) => (
            <Grid key={item.id} item {...computeBreakpoints()}>
              <ListItemBase
                noDivider
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

export default GridList;
