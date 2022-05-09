import { makeStyles } from '@material-ui/core';
import React, { useRef } from 'react';
import { HexBody, HexHeader, HexSettings, LAYOUT_SIZE, StoreProps, useDispatch, useEventListener } from '../..';

const useHexStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: `250px`,
    height: `calc(100vh - ${LAYOUT_SIZE.windowHeight}px)`,
    width: '100%',
    cursor: 'default',

    userSelection: 'none',
    '-webkit-user-select': 'none' /* Safari */,
    '-khtml-user-select': 'none' /* Konqueror HTML */,
    '-moz-user-select': 'none' /* Firefox */,
    '-ms-user-select': 'none' /* Internet Explorer/Edge */
  }
}));

export const WrappedHexPageLayout = ({ store }: StoreProps) => {
  const classes = useHexStyles();

  const { onAppClickAway } = useDispatch();

  const ref = useRef(null);

  // Mouse Up
  useEventListener('mousedown', (e: MouseEvent) => {
    !ref?.current?.contains(e.target) && onAppClickAway();
  });

  return (
    <div ref={ref} className={classes.root}>
      <HexHeader store={store} />
      <HexBody store={store} />
      <HexSettings store={store} />
    </div>
  );
};

export const HexPageLayout = React.memo(WrappedHexPageLayout);
