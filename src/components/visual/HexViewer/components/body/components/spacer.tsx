import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { DEFAULT } from 'components/visual/HexViewer/configs/default';
import React from 'react';

const useHexStyles = makeStyles(theme => ({
  offset: {
    margin: 0,
    height: 'auto',
    display: 'block',
    color: theme.palette.text.secondary,
    fontWeight: theme.palette.type === 'dark' ? 400 : 600,
    userSelect: 'none',
    width: DEFAULT.spacingWidth
  }
}));

export type HexSpacerProps = {
  Tag?: 'div' | 'td';
  style?: string;
};

export const WrappedHexSpacer = ({ Tag = 'div', style = '' }: HexSpacerProps) => {
  const classes = useHexStyles();
  return <Tag className={clsx(classes.offset, style)} />;
};

export const HexSpacer = React.memo(WrappedHexSpacer);
