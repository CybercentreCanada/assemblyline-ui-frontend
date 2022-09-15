import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { useRef } from 'react';
import { HexBody, HexHeader, HexSettings, StoreProps, useDispatch, useEventListener } from '../..';

const useHexStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    cursor: 'default',

    userSelection: 'none',
    '-webkit-user-select': 'none' /* Safari */,
    '-khtml-user-select': 'none' /* Konqueror HTML */,
    '-moz-user-select': 'none' /* Firefox */,
    '-ms-user-select': 'none' /* Internet Explorer/Edge */
  },

  hidden: {
    visibility: 'hidden'
  }
}));

export const WrappedHexPageLayout = ({ store }: StoreProps) => {
  const ref = useRef(null);
  const classes = useHexStyles();
  const { onAppClickAway } = useDispatch();

  // Mouse Up
  useEventListener('mousedown', (e: MouseEvent) => {
    !ref?.current?.contains(e.target) && onAppClickAway();
  });

  return (
    <div ref={ref} className={clsx(classes.root, store.loading.status !== 'initialized' && classes.hidden)}>
      <HexHeader store={store} />
      <HexBody store={store} />
      <HexSettings store={store} />
    </div>
  );
};

export const HexPageLayout = React.memo(WrappedHexPageLayout);
