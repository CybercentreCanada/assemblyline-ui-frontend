import { makeStyles } from '@material-ui/core';
import { default as React, KeyboardEvent, memo, PropsWithChildren, useMemo } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List, ListOnItemsRenderedProps } from 'react-window';
import {
  ACTIONS,
  HexRow,
  HexScrollBar,
  LAYOUT_SIZE,
  scrollToWindowIndex,
  StoreProps,
  useDispatch,
  useEventListener,
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
  const {
    onBodyInit,
    onBodyResize,
    onBodyMouseLeave,
    onBodyScrollWheel,
    onCursorKeyDown,
    onCopyKeyDown,
    onBodyMouseUp,
    onScrollTouchStart,
    onScrollTouchMove,
    onScrollTouchEnd
  } = useDispatch();
  const { dispatch } = useStore();

  const bodyRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    onBodyInit({ initialized: true });
    return () => {
      onBodyInit({ initialized: false });
    };
  }, [onBodyInit]);

  React.useEffect(() => {
    if (store.initialized) {
      dispatch({ type: ACTIONS.bodyResize, payload: bodyRef.current.getBoundingClientRect() });
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [dispatch, store.initialized]);

  useEventListener('resize', () => onBodyResize(bodyRef?.current?.getBoundingClientRect()));
  useEventListener('keydown', (event: KeyboardEvent) => onCursorKeyDown({ event }, { store }));
  useEventListener('keydown', (event: KeyboardEvent) => onCopyKeyDown(undefined, { event, store }));
  useEventListener('mouseup', () => onBodyMouseUp(undefined, { store }));

  const rowIndexes: number[] = useMemo(
    () => Array.from(Array(store.layout.row.size).keys()).map(i => i + store.scroll.rowIndex),
    [store.layout.row.size, store.scroll.rowIndex]
  );

  return (
    <div
      ref={bodyRef}
      className={classes.root}
      onWheel={(event: React.WheelEvent<HTMLDivElement>) => onBodyScrollWheel({ event })}
      onMouseLeave={() => onBodyMouseLeave()}
      onTouchStart={(event: React.TouchEvent<HTMLDivElement>) => onScrollTouchStart({ event })}
      onTouchMove={(event: React.TouchEvent<HTMLDivElement>) => onScrollTouchMove({ event })}
      onTouchEnd={() => onScrollTouchEnd()}
    >
      {store.initialized ? (
        <>
          <div className={classes.spacer} />
          <table className={classes.table}>
            <tbody className={classes.tableBody}>
              {rowIndexes.map(rowIndex => (
                <HexRow key={rowIndex} store={store} rowIndex={rowIndex} Tag="tr" />
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
  const { onBodyInit, onBodyResize, onBodyItemsRendered, onCursorKeyDown, onCopyKeyDown, onBodyMouseUp } =
    useDispatch();
  const { dispatch } = useStore();

  const listRef = React.useRef<any>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    onBodyInit({ initialized: true });
    return () => {
      onBodyInit({ initialized: false });
    };
  }, [onBodyInit]);

  React.useEffect(() => {
    if (store.initialized) {
      dispatch({ type: ACTIONS.bodyResize, payload: bodyRef.current.getBoundingClientRect() });
      listRef?.current?.scrollToItem(store.scroll.rowIndex, 'top');
    }
  }, [dispatch, store.initialized]);

  useEventListener('keydown', (event: KeyboardEvent) => onCursorKeyDown({ event }, { store }));
  useEventListener('keydown', (event: KeyboardEvent) => onCopyKeyDown(undefined, { event, store }));
  useEventListener('mouseup', () => onBodyMouseUp(undefined, { store }));

  React.useEffect(() => {
    if (store.initialized) scrollToWindowIndex(store, listRef, store.scroll.index, store.scroll.type);
  }, [dispatch, store.initialized, store.scroll.index, store.scroll.rowIndex, store.scroll.type]);

  const Row = React.useMemo(
    () =>
      ({ index, style, data }) =>
        store.initialized ? <WindowRow key={index} rowIndex={index} style={style} Tag={data.Tag} /> : <></>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.layout.column.size]
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
          onItemsRendered={(event: ListOnItemsRenderedProps) => onBodyItemsRendered({ event })}
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
    prevProps.store.hex.nonPrintable.encoding === nextProps.store.hex.nonPrintable.encoding &&
    prevProps.store.hex.nonPrintable.char === nextProps.store.hex.nonPrintable.char &&
    prevProps.store.hex.higher.encoding === nextProps.store.hex.higher.encoding &&
    prevProps.store.hex.higher.char === nextProps.store.hex.higher.char &&
    prevProps.store.offset.base === nextProps.store.offset.base &&
    prevProps.store.offset.size === nextProps.store.offset.size &&
    prevProps.store.layout.row.size === nextProps.store.layout.row.size &&
    prevProps.store.layout.column.size === nextProps.store.layout.column.size &&
    prevProps.store.layout.row.auto === nextProps.store.layout.row.auto &&
    prevProps.store.layout.column.auto === nextProps.store.layout.column.auto &&
    prevProps.store.layout.isFocusing === nextProps.store.layout.isFocusing &&
    prevProps.store.mode.bodyType === nextProps.store.mode.bodyType &&
    prevProps.store.mode.themeType === nextProps.store.mode.themeType &&
    prevProps.store.mode.languageType === nextProps.store.mode.languageType &&
    prevProps.store.mode.widthType === nextProps.store.mode.widthType &&
    prevProps.store.scroll.index === nextProps.store.scroll.index &&
    prevProps.store.scroll.rowIndex === nextProps.store.scroll.rowIndex &&
    prevProps.store.scroll.maxRowIndex === nextProps.store.scroll.maxRowIndex &&
    prevProps.store.scroll.speed === nextProps.store.scroll.speed &&
    prevProps.store.scroll.type === nextProps.store.scroll.type &&
    prevProps.store.select.isHighlighting === nextProps.store.select.isHighlighting
);

export default HexBody;
