import { CircularProgress, Grid, useTheme } from '@mui/material';
import useListKeyboard from 'commons/addons/elements/lists/hooks/useListKeyboard';
import useListNavigator from 'commons/addons/elements/lists/hooks/useListNavigator';
import ListItemBase, { LineItem } from 'commons/addons/elements/lists/item/ListItemBase';
import ListScroller from 'commons/addons/elements/lists/scrollers/ListScroller';
import SimpleListScroller from 'commons/addons/elements/lists/scrollers/SimpleListScroller';
import { useStyles } from 'commons/addons/elements/lists/simplelist/SimpleList';
import TableListMoreBtn, { TableListMoreConfig } from 'commons/addons/elements/lists/table/TableListMoreBtn';
import PageCenter from 'commons/components/pages/PageCenter';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Breakpoints {
  xs?: 1 | 2 | 3 | 4 | 6 | 12;
  sm?: 1 | 2 | 3 | 4 | 6 | 12;
  md?: 1 | 2 | 3 | 4 | 6 | 12;
  lg?: 1 | 2 | 3 | 4 | 6 | 12;
  xl?: 1 | 2 | 3 | 4 | 6 | 12;
}

interface GridListProps<T extends LineItem> {
  id: string;
  items: T[];
  autofocus?: boolean;
  emptyValue?: React.ReactNode;
  spacing?: number;
  view?: 'table' | 'card';
  breakpoints?: Breakpoints;
  loading?: boolean;
  disableOverflow?: boolean;
  scrollTargetId?: string;
  moreConfig?: TableListMoreConfig;
  children: (item: T) => React.ReactNode;
  onItemSelected?: (item: T, position?: number) => void;
  onCursorChange?: (position: number, item: T) => void;
  onRenderActions?: (item: T) => React.ReactNode;
}

export default function GridList<T extends LineItem>({
  id,
  autofocus,
  loading,
  spacing = 1,
  items,
  emptyValue,
  view = 'card',
  breakpoints = { xs: 12, sm: 12, md: 6, lg: 4, xl: 3 },
  disableOverflow = false,
  scrollTargetId,
  moreConfig,
  children,
  onItemSelected,
  onCursorChange,
  onRenderActions
}: GridListProps<T>) {
  // React hooks.
  const theme = useTheme();
  const classes = useStyles();

  // Some refs.
  const outerEL = useRef<HTMLDivElement>();
  const scrollEL = useRef<HTMLElement>();

  // Some States
  const [scroller, setScroller] = useState<ListScroller>();

  // Configure the list keyboard custom hook...
  const { register } = useListNavigator(id);
  const { cursor, setCursor, next, previous, onKeyDown } = useListKeyboard({
    id,
    autofocus,
    scroller,
    infinite: false,
    count: items.length,
    onEscape: onItemSelected ? (_cursor: number) => onItemSelected(null, _cursor) : null,
    onEnter: onItemSelected ? (_cursor: number) => onItemSelected(items[_cursor], _cursor) : null,
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
    (_item: T, index: number) => {
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
    setScroller(new SimpleListScroller(scrollEL.current, outerEL.current));
  }, [scrollTargetId]);

  useEffect(() =>
    register({
      onSelect: () => {},
      onSelectNext: () => next(),
      onSelectPrevious: () => previous()
    })
  );

  return (
    <div ref={outerEL} className={classes.outer}>
      {loading && (
        <div className={classes.progressCt}>
          <CircularProgress className={classes.progressSpinner} />
        </div>
      )}
      <div
        id={id}
        className={classes.inner}
        tabIndex={0}
        onKeyDown={!loading ? onKeyDown : null}
        style={{ overflow: disableOverflow ? 'unset' : null, padding: theme.spacing(spacing) }}
      >
        <Grid container spacing={view === 'card' ? spacing : 0}>
          {items.length === 0
            ? emptyValue
            : items.map((item: T, index: number) => (
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
        {moreConfig && (
          <PageCenter>
            <TableListMoreBtn {...moreConfig} />
          </PageCenter>
        )}
      </div>
    </div>
  );
}
