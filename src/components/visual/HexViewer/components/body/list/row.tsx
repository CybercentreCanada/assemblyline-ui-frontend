import { makeStyles } from '@material-ui/core';
import { HexStore } from 'components/visual/HexViewer';
import React, { useCallback, useMemo } from 'react';
import { HexCell } from '.';

const useStyles = makeStyles(theme => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: '10px',
    margin: 0
    // border: `1px solid ${theme.palette.text.hint}`
  },
  spacer: {
    width: '10px',
    padding: 0,
    margin: 0
  }
}));

export type HexRowProps = {
  store?: HexStore;
  rowIndex?: number;
  style?: React.CSSProperties;
};

export const WrappedHexRow = ({ store, rowIndex, style }: HexRowProps) => {
  const classes = useStyles();

  const columnIndexes: number[] = useMemo(() => Array.from(Array(store.layoutColumns).keys()), [store.layoutColumns]);

  const getIndex = useCallback(
    (index: number) => rowIndex * store.layoutColumns + index,
    [rowIndex, store.layoutColumns]
  );

  return (
    <div className={classes.row} style={style}>
      <HexCell store={store} type="offset" index={rowIndex * store.layoutColumns} />
      <td className={classes.spacer} />
      {columnIndexes.map(columnIndex => (
        <HexCell key={columnIndex} store={store} type="hex" columnIndex={columnIndex} index={getIndex(columnIndex)} />
      ))}
      <td className={classes.spacer} />
      {columnIndexes.map(columnIndex => (
        <HexCell key={columnIndex} store={store} type="text" columnIndex={columnIndex} index={getIndex(columnIndex)} />
      ))}
      <td className={classes.spacer} />
    </div>
  );
};

export const HexRow = React.memo(
  WrappedHexRow,
  (
    prevProps: Readonly<React.PropsWithChildren<HexRowProps>>,
    nextProps: Readonly<React.PropsWithChildren<HexRowProps>>
  ) =>
    prevProps.rowIndex === nextProps.rowIndex &&
    prevProps.store.initialized === nextProps.store.initialized &&
    prevProps.store.layoutColumns === nextProps.store.layoutColumns
  // prevProps.store.isLightTheme === nextProps.store.isLightTheme
);
