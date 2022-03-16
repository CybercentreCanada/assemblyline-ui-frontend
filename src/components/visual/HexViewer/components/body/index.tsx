import { makeStyles } from '@material-ui/core';
import { default as React, memo, PropsWithChildren, useMemo } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import { HexStoreProps } from '../..';
import { DEFAULT } from '../../configs/default';
import { useReducer } from '../../stores/useNewStore';
import { HexRow } from './components/row';
import HexScrollBar from './components/scrollbar';
import { HexContainerMain } from './container';

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

const HexTableBody = memo(({ store }: HexStoreProps) => {
  const classes = useHexStyles();

  const { layoutRows, scrollIndex } = store;

  const { refs } = useReducer();
  const bodyRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    refs.current.bodyRef = bodyRef;
  }, [refs]);

  // const { bodyRef, onLayoutResize } = useLayout();
  // const { onScrollResize, onScrollWheel, onScrollTouchStart, onScrollTouchEnd, onScrollTouchMove } = useScroll();

  // useLayoutEffect(() => {
  //   onLayoutResize();
  //   onScrollResize();
  // }, [onLayoutResize, onScrollResize]);

  // useEffect(() => {
  //   const handleResize = () => {
  //     onLayoutResize();
  //     onScrollResize();
  //   };
  //   window.addEventListener('resize', handleResize);
  //   return () => window.removeEventListener('resize', handleResize);
  // }, [bodyRef, onLayoutResize, onScrollResize]);

  // const rowIndexes: number[] = useMemo(
  //   () => Array.from(Array(layoutRows).keys()).map(i => i + scrollIndex),
  //   [layoutRows, scrollIndex]
  // );

  const rowIndexes: number[] = useMemo(() => Array.from(Array(layoutRows).keys()).map(i => i), [layoutRows]);

  return (
    <div
      // ref={bodyRef}
      className={classes.root}
      // onWheel={onScrollWheel}
      // onTouchStart={onScrollTouchStart}
      // onTouchMove={onScrollTouchMove}
      // onTouchEnd={onScrollTouchEnd}
    >
      <div className={classes.spacer} />
      <table className={classes.table}>
        <tbody className={classes.tableBody}>
          {rowIndexes.map(index => (
            <HexRow key={index} store={store} rowIndex={index} Tag="tr" />
          ))}
        </tbody>
      </table>
      <div className={classes.spacer} />
      <HexScrollBar store={store} />
    </div>
  );
});

const HexWindowBody = memo(({ store }: HexStoreProps) => {
  const classes = useHexStyles();

  const {
    hex: { codes: hexcodes },
    layoutColumns
  } = store;

  const { refs } = useReducer();
  const bodyRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    refs.current.bodyRef = bodyRef;
  }, [refs]);

  // const { hexMap } = useHex();
  // const { bodyRef, onLayoutResize } = useLayout();
  // const { onScrollResize } = useScroll();

  return (
    <AutoSizer
      onResize={() => {
        // onLayoutResize();
        // onScrollResize();
      }}
    >
      {({ height, width }) => (
        <List
          innerRef={bodyRef}
          className={classes.root}
          height={height - 10}
          width={width}
          itemSize={DEFAULT.rowHeight}
          itemCount={Math.floor(hexcodes.size / layoutColumns)}
          overscanCount={3}
        >
          {({ index, style }) => <HexRow store={store} rowIndex={index} style={style} Tag="div" />}
        </List>
      )}
    </AutoSizer>
  );
});

const HexBodySelector = memo(({ store }: HexStoreProps) => {
  const { bodyType } = store;

  if (bodyType === 'container') return <HexContainerMain store={store} />;
  else if (bodyType === 'table') return <HexTableBody store={store} />;
  else if (bodyType === 'list') return <HexWindowBody store={store} />;
});

export const HexBody = memo(
  ({ store }: HexStoreProps) =>
    store.hex.codes === null || store.hex.codes.size <= 0 ? null : <HexBodySelector store={store} />,
  (prevProps: Readonly<PropsWithChildren<HexStoreProps>>, nextProps: Readonly<PropsWithChildren<HexStoreProps>>) =>
    prevProps.store.initialized === nextProps.store.initialized &&
    prevProps.store.hex.codes === nextProps.store.hex.codes &&
    prevProps.store.modeTheme === nextProps.store.modeTheme &&
    prevProps.store.modeLanguage === nextProps.store.modeLanguage &&
    prevProps.store.modeWidth === nextProps.store.modeWidth &&
    prevProps.store.offset.base === nextProps.store.offset.base &&
    prevProps.store.offset.size === nextProps.store.offset.size &&
    prevProps.store.layoutRows === nextProps.store.layoutRows &&
    prevProps.store.layoutColumns === nextProps.store.layoutColumns &&
    prevProps.store.layoutAutoRows === nextProps.store.layoutAutoRows &&
    prevProps.store.layoutAutoColumns === nextProps.store.layoutAutoColumns &&
    prevProps.store.layoutType === nextProps.store.layoutType &&
    prevProps.store.bodyType === nextProps.store.bodyType &&
    prevProps.store.scrollIndex === nextProps.store.scrollIndex
);

export default HexBody;
