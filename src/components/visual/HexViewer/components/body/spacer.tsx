import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React from 'react';
import { LAYOUT_SIZE, useDispatch } from '../..';

const useHexStyles = makeStyles(theme => ({
  offset: {
    margin: 0,
    height: 'auto',
    fontWeight: theme.palette.mode === 'dark' ? 400 : 600,
    userSelect: 'none',
    width: LAYOUT_SIZE.spacingWidth,
    'td&': {},
    'div&': {
      display: 'block'
    }
  }
}));

export type HexSpacerProps = {
  Tag?: 'div' | 'td';
  style?: string;
};

export const WrappedHexSpacer = ({ Tag = 'div', style = '' }: HexSpacerProps) => {
  const classes = useHexStyles();
  const { onBodyMouseLeave } = useDispatch();
  return <Tag className={clsx(classes.offset, style)} onMouseEnter={() => onBodyMouseLeave()} />;
};

export const HexSpacer = React.memo(WrappedHexSpacer);
