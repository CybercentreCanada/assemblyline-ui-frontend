import { makeStyles } from '@material-ui/core';
import { default as React, KeyboardEvent, memo, MouseEvent, PropsWithChildren, useMemo } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List, ListOnItemsRenderedProps } from 'react-window';
import {
  ACTIONS,
  HexRow,
  HexScrollBar,
  LAYOUT_SIZE,
  StoreProps,
  useDispatch,
  useEventListener,
  useReducer,
  useStore,
  WindowRow
} from '../..';

export * from './cell';
export * from './offset';
export * from './row';
export * from './scrollbar';
export * from './spacer';

const useHexStyles = makeStyles(theme => ({
  root: {
    fontFamily:
      '"Source Code Pro", "HexEd.it Symbols", "Courier New", Consolas, Menlo, "PT Mono", "Liberation Mono", monospace;',
    fontSize: '1rem',
    lineHeight: 1.15,
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    cursor: 'default',
    overflowX: 'hidden',
    overflowY: 'hidden',
    alignItems: 'stretch',
    userSelection: 'none',
    padding: 0,
    margin: 0,
    borderSpacing: 0
  },
  table: {
    padding: 0,
    margin: 0,
    borderSpacing: 0
  },
  tableBody: {
    padding: 0,
    margin: 0
  },
  spacer: {
    flex: 1
  }
}));

const HexTableBody = memo(({ store }: StoreProps) => {
  const classes = useHexStyles();
  const { refs } = useReducer();
  const {
    onBodyInit,
    onBodyResize,
    onBodyMouseLeave,
    onBodyScrollWheel,
    onBodyKeyDown,
    onBodyMouseUp,
    onScrollTouchStart,
    onScrollTouchMove,
    onScrollTouchEnd
  } = useDispatch();
  const { dispatch } = useStore();

  const bodyRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    refs.current.layout.bodyRef = bodyRef;
    onBodyInit(true);
    return () => {
      // refs.current.layout.listRef = null;
      // refs.current.layout.bodyRef = null;
      onBodyInit(false);
    };
  }, [onBodyInit, refs]);

  React.useEffect(() => {
    if (store.initialized) {
      dispatch({ type: ACTIONS.bodyResize, payload: refs.current.layout.bodyRef.current.getBoundingClientRect() });
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [dispatch, refs, store.initialized]);

  useEventListener('resize', () => onBodyResize(bodyRef?.current?.getBoundingClientRect()));
  useEventListener('keydown', (e: KeyboardEvent) => onBodyKeyDown(e, refs));
  useEventListener('mouseup', (e: MouseEvent) => onBodyMouseUp(e, refs));

  const rowIndexes: number[] = useMemo(
    () => Array.from(Array(store.layout.row.size).keys()).map(i => i + store.scroll.rowIndex),
    [store.layout.row.size, store.scroll.rowIndex]
  );

  return (
    <div
      ref={bodyRef}
      className={classes.root}
      onWheel={(e: React.WheelEvent<HTMLDivElement>) => onBodyScrollWheel(e.deltaY)}
      onMouseLeave={() => onBodyMouseLeave()}
      onTouchStart={e => onScrollTouchStart(e)}
      onTouchMove={e => onScrollTouchMove(e)}
      onTouchEnd={e => onScrollTouchEnd(e)}
    >
      {store.initialized ? (
        <>
          <div className={classes.spacer} />
          <table className={classes.table}>
            <tbody className={classes.tableBody}>
              {rowIndexes.map(rowIndex => (
                <HexRow key={rowIndex} store={store} rowIndex={rowIndex} Tag="tr" bodyRef={bodyRef.current} />
              ))}
            </tbody>
          </table>
          <div className={classes.spacer} />
          <HexScrollBar store={store} />
        </>
      ) : (
        <></>
      )}
    </div>
  );
});

const HexWindowBody = memo(({ store }: StoreProps) => {
  const classes = useHexStyles();
  const { refs } = useReducer();
  const { onBodyInit, onBodyResize, onBodyItemsRendered, onBodyKeyDown, onBodyMouseUp } = useDispatch();
  const { dispatch } = useStore();

  const listRef = React.useRef<any>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    refs.current.layout.listRef = listRef;
    refs.current.layout.bodyRef = bodyRef;
    onBodyInit(true);
    return () => {
      // refs.current.layout.listRef = null;
      // refs.current.layout.bodyRef = null;
      onBodyInit(false);
    };
  }, [onBodyInit, refs]);

  React.useEffect(() => {
    if (store.initialized) {
      dispatch({ type: ACTIONS.bodyResize, payload: bodyRef.current.getBoundingClientRect() });
      listRef?.current?.scrollToItem(store.scroll.rowIndex, 'top');
    }
  }, [dispatch, refs, store.initialized]);

  useEventListener('keydown', (e: KeyboardEvent) => onBodyKeyDown(e, refs));
  useEventListener('mouseup', (e: MouseEvent) => onBodyMouseUp(e, refs));

  const Row = React.useMemo(
    () =>
      ({ index, style, data }) =>
        store.initialized ? (
          <WindowRow
            key={index}
            rowIndex={index}
            style={style}
            Tag={data.Tag}
            bodyRef={bodyRef.current}
            listRef={listRef.current}
          />
        ) : (
          <></>
        ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.layout.column.size, store.scroll.index]
  );

  return (
    <AutoSizer onResize={({ height, width }: { height: number; width: number }) => onBodyResize({ height, width })}>
      {({ height, width }) => (
        <List
          ref={listRef}
          innerRef={bodyRef}
          className={classes.root}
          height={height - 50}
          width={width}
          itemSize={LAYOUT_SIZE.rowHeight}
          itemCount={store.scroll.maxRowIndex + store.layout.row.size}
          overscanCount={store.scroll.overscanCount}
          initialScrollOffset={0}
          itemData={{
            Tag: 'div'
          }}
          onItemsRendered={(e: ListOnItemsRenderedProps) => onBodyItemsRendered(e)}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
});

const HexBodySelector = memo(({ store }: StoreProps) => {
  if (store.mode.bodyType === 'table') return <HexTableBody store={store} />;
  else if (store.mode.bodyType === 'window') return <HexWindowBody store={store} />;
});

export const HexBody = memo(
  ({ store }: StoreProps) => <HexBodySelector store={store} />,
  (prevProps: Readonly<PropsWithChildren<StoreProps>>, nextProps: Readonly<PropsWithChildren<StoreProps>>) =>
    prevProps.store.initialized === nextProps.store.initialized &&
    prevProps.store.hex.null.char === nextProps.store.hex.null.char &&
    prevProps.store.hex.lower.encoding === nextProps.store.hex.lower.encoding &&
    prevProps.store.hex.lower.char === nextProps.store.hex.lower.char &&
    prevProps.store.hex.higher.encoding === nextProps.store.hex.higher.encoding &&
    prevProps.store.hex.higher.char === nextProps.store.hex.higher.char &&
    prevProps.store.offset.base === nextProps.store.offset.base &&
    prevProps.store.offset.size === nextProps.store.offset.size &&
    prevProps.store.layout.row.size === nextProps.store.layout.row.size &&
    prevProps.store.layout.column.size === nextProps.store.layout.column.size &&
    prevProps.store.layout.row.auto === nextProps.store.layout.row.auto &&
    prevProps.store.layout.column.auto === nextProps.store.layout.column.auto &&
    prevProps.store.mode.bodyType === nextProps.store.mode.bodyType &&
    prevProps.store.mode.theme === nextProps.store.mode.theme &&
    prevProps.store.mode.language === nextProps.store.mode.language &&
    prevProps.store.mode.width === nextProps.store.mode.width &&
    prevProps.store.scroll.index === nextProps.store.scroll.index &&
    prevProps.store.scroll.rowIndex === nextProps.store.scroll.rowIndex &&
    prevProps.store.scroll.maxRowIndex === nextProps.store.scroll.maxRowIndex &&
    prevProps.store.scroll.speed === nextProps.store.scroll.speed
);

export default HexBody;
