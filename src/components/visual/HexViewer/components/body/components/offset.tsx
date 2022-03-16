import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { HexStoreProps } from 'components/visual/HexViewer';
import { getAddressValue } from 'components/visual/HexViewer/handlers/HexHandler';
import React from 'react';

const useHexStyles = makeStyles(theme => ({
  offset: {
    margin: 0,
    padding: 0,
    display: 'block',
    color: theme.palette.text.secondary,
    fontWeight: theme.palette.type === 'dark' ? 400 : 600,
    userSelect: 'none'
  }
}));

export type HexOffsetProps = HexStoreProps & {
  index?: number;
  Tag?: 'div' | 'td';
  style?: string;
};

export const WrappedHexOffset = ({ store, index = -1, Tag = 'div', style = '' }: HexOffsetProps) => {
  const classes = useHexStyles();

  const {
    offset: { base, size }
  } = store;

  return <Tag className={clsx(classes.offset, style)}>{getAddressValue(base, size, index)}</Tag>;
};

export const HexOffset = React.memo(
  WrappedHexOffset,
  (
    prevProps: Readonly<React.PropsWithChildren<HexOffsetProps>>,
    nextProps: Readonly<React.PropsWithChildren<HexOffsetProps>>
  ) =>
    prevProps.index === nextProps.index &&
    prevProps.store.initialized === nextProps.store.initialized &&
    prevProps.store.offset.base === nextProps.store.offset.base &&
    prevProps.store.offset.size === nextProps.store.offset.size
);
