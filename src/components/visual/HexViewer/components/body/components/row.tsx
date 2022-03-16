import { makeStyles } from '@material-ui/core';
import React, { useMemo } from 'react';
import { HexStoreProps } from '../../..';
import { DEFAULT } from '../../../configs/default';
import { HexCell } from './cell';
import { HexOffset } from './offset';
import { HexSpacer } from './spacer';

const useHexStyles = makeStyles(theme => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    height: DEFAULT.rowHeight
  },
  spacer: {
    width: DEFAULT.spacingWidth,
    padding: 0,
    margin: 0
  },
  empty: {
    adding: 0,
    margin: 0
  }
}));

export type HexRowProps = HexStoreProps & {
  rowIndex?: number;
  style?: React.CSSProperties;
  Tag?: 'div' | 'tr';
};

export const WrappedHexRow = ({ store, rowIndex, style = null, Tag = 'div' }: HexRowProps) => {
  const classes = useHexStyles();

  const {
    hex: { codes: hexcodes }
  } = store;

  const indexes: number[] = useMemo(
    () => Array.from({ length: store.layoutColumns }, (_, i) => i + rowIndex * store.layoutColumns),
    [rowIndex, store.layoutColumns]
  );

  return (
    <Tag className={classes.row} style={style}>
      <HexOffset store={store} index={rowIndex * store.layoutColumns} Tag={Tag === 'tr' ? 'td' : 'div'} />
      <HexSpacer Tag={Tag === 'tr' ? 'td' : 'div'} style={classes.spacer} />
      {indexes.map((index, columnIndex) =>
        index >= 0 && index < hexcodes.size ? (
          <HexCell
            key={index}
            store={store}
            Tag={Tag === 'tr' ? 'td' : 'div'}
            type="hex"
            columnIndex={columnIndex}
            index={index}
          />
        ) : (
          <HexSpacer key={index} Tag={Tag === 'tr' ? 'td' : 'div'} style={classes.empty} />
        )
      )}
      <HexSpacer Tag={Tag === 'tr' ? 'td' : 'div'} style={classes.spacer} />
      {indexes.map((index, columnIndex) =>
        index >= 0 && index < hexcodes.size ? (
          <HexCell
            key={columnIndex}
            store={store}
            Tag={Tag === 'tr' ? 'td' : 'div'}
            type="text"
            columnIndex={columnIndex}
            index={index}
          />
        ) : (
          <HexSpacer key={index} Tag={Tag === 'tr' ? 'td' : 'div'} style={classes.empty} />
        )
      )}
      <HexSpacer Tag={Tag === 'tr' ? 'td' : 'div'} style={classes.spacer} />
    </Tag>
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
