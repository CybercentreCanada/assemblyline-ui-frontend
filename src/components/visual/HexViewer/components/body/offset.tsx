import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';
import { getAddressValue, StoreProps, useDispatch } from '../..';

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

export type HexOffsetProps = StoreProps & {
  index?: number;
  Tag?: 'div' | 'td';
  style?: string;
};

export const WrappedHexOffset = ({ store, index = -1, Tag = 'div', style = '' }: HexOffsetProps) => {
  const classes = useHexStyles();
  const { onBodyMouseLeave } = useDispatch();

  const {
    offset: { base, size }
  } = store;

  return (
    <Tag className={clsx(classes.offset, style)} onMouseEnter={() => onBodyMouseLeave()}>
      {getAddressValue(base, size, index)}
    </Tag>
  );
};

export const HexOffset = React.memo(
  WrappedHexOffset,
  (
    prevProps: Readonly<React.PropsWithChildren<HexOffsetProps>>,
    nextProps: Readonly<React.PropsWithChildren<HexOffsetProps>>
  ) =>
    prevProps.index === nextProps.index &&
    prevProps.store.offset.base === nextProps.store.offset.base &&
    prevProps.store.offset.size === nextProps.store.offset.size &&
    prevProps.store.mode.body === nextProps.store.mode.body &&
    prevProps.store.mode.theme === nextProps.store.mode.theme &&
    prevProps.store.mode.language === nextProps.store.mode.language &&
    prevProps.store.mode.width === nextProps.store.mode.width
);
