// import { makeStyles } from '@material-ui/core';
// import clsx from 'clsx';
// import React from 'react';
// import { HexTable } from '.';
// import { HexStoreProps, useLayout, useScroll, useStyles } from '../../..';

// const useHexStyles = makeStyles(theme => ({
//   layout: {
//     display: 'flex',
//     flexDirection: 'row',
//     width: '100%',
//     cursor: 'default',
//     overflowX: 'hidden',
//     overflowY: 'hidden',
//     alignItems: 'stretch',
//     userSelection: 'none',

//     lineHeight: 1.15
//   }
// }));

// export const WrappedHexTableMain = ({ store }: HexStoreProps) => {
//   const classes = useHexStyles();

//   const { layoutRef } = useLayout();

//   const { onScrollWheel, onScrollTouchStart, onScrollTouchEnd, onScrollTouchMove } = useScroll();
//   const {
//     hexClasses,
//     itemClasses,
//     getHexColorClass,
//     getCursorClass,
//     getSelectClass,
//     getSearchClass,
//     getSelectedSearchClass
//   } = useStyles();

//   return (
//     <div
//       className={clsx(hexClasses.app)}
//       ref={layoutRef}
//       onWheel={event => onScrollWheel(event)}
//       onTouchStart={event => onScrollTouchStart(event)}
//       onTouchMove={event => onScrollTouchMove(event)}
//       onTouchEnd={event => onScrollTouchEnd(event)}
//     >
//       <HexTable store={store} />
//     </div>
//   );
// };

// export const HexTableMain = React.memo(WrappedHexTableMain);

import { makeStyles } from '@material-ui/core';
import React, { useEffect, useMemo } from 'react';
import { HexStoreProps, useLayout, useScroll } from '../../..';
import HexScrollBar from '../scrollbar';
import { HexRow } from './row';

const useHexStyles = makeStyles(theme => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    cursor: 'default',
    overflowX: 'hidden',
    overflowY: 'hidden',
    alignItems: 'stretch',
    userSelection: 'none',

    lineHeight: 1.15
  },
  table: {
    fontFamily:
      '"Source Code Pro", "HexEd.it Symbols", "Courier New", Consolas, Menlo, "PT Mono", "Liberation Mono", monospace;',
    fontSize: '1rem',
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

export const WrappedHexTableBody = ({ store }: HexStoreProps) => {
  const classes = useHexStyles();
  const { bodyRef, onLayoutResize } = useLayout();
  const { onScrollResize, onScrollWheel, onScrollTouchStart, onScrollTouchEnd, onScrollTouchMove } = useScroll();

  const { layoutRows, scrollIndex } = store;

  useEffect(() => {
    onLayoutResize();
    onScrollResize();
  }, [onLayoutResize, onScrollResize]);

  useEffect(() => {
    const handleResize = () => {
      onLayoutResize();
      onScrollResize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onLayoutResize, onScrollResize]);

  const rowIndexes: number[] = useMemo(
    () => Array.from(Array(layoutRows).keys()).map(i => i + scrollIndex),
    [layoutRows, scrollIndex]
  );

  return (
    <div
      ref={bodyRef}
      className={classes.root}
      onWheel={event => onScrollWheel(event)}
      onTouchStart={event => onScrollTouchStart(event)}
      onTouchMove={event => onScrollTouchMove(event)}
      onTouchEnd={event => onScrollTouchEnd(event)}
    >
      <div className={classes.spacer} />
      <table className={classes.table}>
        <tbody className={classes.tableBody}>
          {rowIndexes.map(index => (
            <HexRow key={index} store={store} rowIndex={index} />
          ))}
        </tbody>
      </table>
      <div className={classes.spacer} />
      <HexScrollBar store={store} />
    </div>
  );
};

export const HexTableBody = React.memo(WrappedHexTableBody);
