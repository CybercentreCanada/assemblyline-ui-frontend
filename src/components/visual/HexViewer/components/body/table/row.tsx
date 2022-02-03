import { makeStyles } from '@material-ui/core';
import React, { useMemo } from 'react';
import { HexStoreProps, useHex } from '../../..';
import { HexCell } from './cell';
import { HexOffset } from './offset';

const useHexStyles = makeStyles(theme => ({
  row: {
    padding: '10px',
    margin: 0
  },
  spacer: {
    width: '10px',
    padding: 0,
    margin: 0
  }
}));

export type HexRowProps = HexStoreProps & {
  rowIndex?: number;
};

export const WrappedHexRow = ({ store, rowIndex }: HexRowProps) => {
  const classes = useHexStyles();
  const { hexMap } = useHex();

  const indexes: number[] = useMemo(
    () => Array.from({ length: store.layoutColumns }, (v, i) => i + rowIndex * store.layoutColumns),
    [rowIndex, store.layoutColumns]
  );

  return (
    <tr className={classes.row}>
      <HexOffset store={store} index={rowIndex * store.layoutColumns} />
      <td className={classes.spacer} />
      {indexes.map((index, columnIndex) =>
        index >= 0 && index < hexMap.current.size ? (
          <HexCell key={index} store={store} type="hex" columnIndex={columnIndex} index={index} />
        ) : (
          <td key={index}></td>
        )
      )}
      <td className={classes.spacer} />
      {indexes.map((index, columnIndex) =>
        index >= 0 && index < hexMap.current.size ? (
          <HexCell key={columnIndex} store={store} type="text" columnIndex={columnIndex} index={index} />
        ) : (
          <td key={index}></td>
        )
      )}
      <td className={classes.spacer} />
    </tr>
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
);
