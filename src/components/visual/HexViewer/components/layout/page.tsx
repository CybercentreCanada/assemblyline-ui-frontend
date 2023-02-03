import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { useRef } from 'react';
import { HexBody, HexHeader, HexSettings, StoreProps, useDispatch, useEventListener } from '../..';

const useHexStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    cursor: 'default',
    flexGrow: 1,

    userSelection: 'none',
    '-webkit-user-select': 'none' /* Safari */,
    '-khtml-user-select': 'none' /* Konqueror HTML */,
    '-moz-user-select': 'none' /* Firefox */,
    '-ms-user-select': 'none' /* Internet Explorer/Edge */
  },

  hidden: {
    visibility: 'hidden'
  },
  container: {
    flexGrow: 1
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
      <div className={classes.container}>
        <HexBody store={store} />
      </div>
      <HexSettings store={store} />
    </div>
  );
};

export const HexPageLayout = React.memo(WrappedHexPageLayout);
