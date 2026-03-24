import { styled } from '@mui/material';
import React from 'react';

export const AppHorizontalLayout = React.memo(
  styled('div')({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '@media print': {
      overflow: 'unset !important'
    }
  })
);

export const AppVerticalLayout = React.memo(
  styled('div')({
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    position: 'relative'
  })
);

export const AppVerticalLeft = React.memo(
  styled('div')(({ theme }) => ({
    height: '100%',
    [theme.breakpoints.down('md')]: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0
    }
  }))
);

export const AppVerticalRight = React.memo(
  styled('div')({
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    flex: 1,
    height: '100%',
    minWidth: 0,
    '@media print': {
      overflow: 'unset !important'
    }
  })
);
