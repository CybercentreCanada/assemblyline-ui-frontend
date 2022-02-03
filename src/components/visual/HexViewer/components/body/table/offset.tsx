import { makeStyles } from '@material-ui/core';
import { HexStoreProps, useHex } from 'components/visual/HexViewer';
import React from 'react';

const useHexStyles = makeStyles(theme => ({
  offset: {
    // border: `1px solid ${theme.palette.text.hint}`,
    padding: '2px',
    margin: 0,
    height: '22px',
    display: 'block',
    color: theme.palette.text.secondary,
    fontWeight: theme.palette.type === 'dark' ? 400 : 600,
    userSelect: 'none'
  }
}));

export type HexOffsetProps = HexStoreProps & {
  index?: number;
};

export const WrappedHexOffset = ({ store, index }: HexOffsetProps) => {
  const classes = useHexStyles();
  const { getAddressValue } = useHex();

  return <td className={classes.offset}>{getAddressValue(index)}</td>;
};

export const HexOffset = React.memo(
  WrappedHexOffset,
  (
    prevProps: Readonly<React.PropsWithChildren<HexOffsetProps>>,
    nextProps: Readonly<React.PropsWithChildren<HexOffsetProps>>
  ) =>
    prevProps.index === nextProps.index &&
    prevProps.store.initialized === nextProps.store.initialized &&
    prevProps.store.hexOffsetBase === nextProps.store.hexOffsetBase &&
    prevProps.store.hexOffsetSize === nextProps.store.hexOffsetSize
);
