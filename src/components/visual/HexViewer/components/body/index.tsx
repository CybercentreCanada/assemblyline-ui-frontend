import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { default as React, KeyboardEvent, memo, PropsWithChildren, useMemo } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList, FixedSizeList as List, ListOnItemsRenderedProps } from 'react-window';
import {
  HexRow,
  HexScrollBar,
  LAYOUT_SIZE,
  scrollToWindowIndexAsync,
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
    onBodyRefInit,
    onBodyScrollInit,
    onScrollTouchEnd
  } = useDispatch();
  const bodyRef = React.useRef<HTMLDivElement>(null);

  useEventListener('resize', () => onBodyResize(bodyRef?.current?.getBoundingClientRect()));
  useEventListener('keydown', (event: KeyboardEvent) => onCursorKeyDown({ event }, { store }));
  useEventListener('keydown', (event: KeyboardEvent) => onCopyKeyDown(undefined, { event, store }));
  useEventListener('mouseup', (event: MouseEvent) => onBodyMouseUp(undefined, { store, event }));

  React.useLayoutEffect(() => {
    if (bodyRef.current !== null && store.loading.refsReady === false) onBodyRefInit({ ready: true });
    else if (bodyRef.current === null && store.loading.refsReady === true) onBodyRefInit({ ready: false });
  }, [store, onBodyInit, onBodyRefInit]);

  React.useEffect(() => {
    if (store.loading.refsReady) onBodyResize(bodyRef.current.getBoundingClientRect());
  }, [onBodyResize, store.loading.refsReady]);

  React.useEffect(() => {
    if (store.loading.hasResized && !store.loading.hasScrolled) onBodyScrollInit();
  }, [onBodyScrollInit, store.loading.hasResized, store.loading.hasScrolled]);

  React.useEffect(() => {
    if (store.loading.hasScrolled) onBodyInit({ initialized: true });
  }, [onBodyInit, store.loading.hasScrolled]);

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
      {store.loading.initialized ? (
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
  const {
    onBodyInit,
    onBodyRefInit,
    onBodyResize,
    onBodyItemsRendered,
    onBodyScrollInit,
    onCursorKeyDown,
    onCopyKeyDown,
    onBodyMouseUp
  } = useDispatch();
  const { dispatch } = useStore();

  const listRef = React.useRef<FixedSizeList<any>>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);

  useEventListener('keydown', (event: KeyboardEvent) => onCursorKeyDown({ event }, { store }));
  useEventListener('keydown', (event: KeyboardEvent) => onCopyKeyDown(undefined, { event, store }));
  useEventListener('mouseup', (event: MouseEvent) => onBodyMouseUp(undefined, { store, event }));

  React.useLayoutEffect(() => {
    if (listRef.current !== null && bodyRef.current !== null && store.loading.refsReady === false)
      onBodyRefInit({ ready: true });
    else if ((listRef.current === null || bodyRef.current === null) && store.loading.refsReady === true)
      onBodyRefInit({ ready: false });
  }, [store, onBodyInit, onBodyRefInit]);

  React.useEffect(() => {
    if (store.loading.refsReady) onBodyResize(bodyRef.current.getBoundingClientRect());
  }, [onBodyResize, store.loading.refsReady]);

  React.useEffect(() => {
    if (store.loading.hasResized)
      scrollToWindowIndexAsync(store, listRef, store.scroll.index, store.scroll.type).then(
        () => !store.loading.hasScrolled && onBodyScrollInit()
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    onBodyScrollInit,
    store.loading.hasResized,
    store.scroll.index,
    store.scroll.rowIndex,
    store.scroll.type
  ]);

  const Row = React.useMemo(
    () =>
      ({ index, style, data }) =>
        store.loading.initialized ? <WindowRow key={index} rowIndex={index} style={style} Tag={data.Tag} /> : <></>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.layout.column.size, store.layout.row.size]
  );

  return (
    <AutoSizer onResize={({ height, width }: { height: number; width: number }) => onBodyResize({ height, width })}>
      {({ height, width }) => (
        <List
          ref={listRef}
          innerRef={bodyRef}
          className={clsx(classes.root)}
          height={height - 50}
          width={width}
          itemSize={LAYOUT_SIZE.rowHeight}
          itemCount={store.scroll.lastRowIndex}
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
    Object.is(prevProps.store.loading, nextProps.store.loading) &&
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
