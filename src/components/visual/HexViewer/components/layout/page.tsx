import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { useRef } from 'react';
import { HexBody, HexHeader, HexSettings, LAYOUT_SIZE, StoreProps, useDispatch, useEventListener } from '../..';

const useHexStyles = ({ y = 0, height = 1000 }: { y: number; height: number }) =>
  makeStyles(theme => ({
    root: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: `250px`,
      height: `calc(${height}px - ${y}px - 75px)`,
      width: '100%',
      cursor: 'default',

      userSelection: 'none',
      '-webkit-user-select': 'none' /* Safari */,
      '-khtml-user-select': 'none' /* Konqueror HTML */,
      '-moz-user-select': 'none' /* Firefox */,
      '-ms-user-select': 'none' /* Internet Explorer/Edge */
    },
    mobile: {
      height: `calc(${height}px - ${LAYOUT_SIZE.mobileWindowHeight}px)`
    },
    hidden: {
      visibility: 'hidden'
    }
  }));

export const WrappedHexPageLayout = ({ store }: StoreProps) => {
  const ref = useRef(null);
  const classes = useHexStyles({
    y: document.getElementById('hex-viewer')?.getBoundingClientRect()?.y,
    height: window.innerHeight
  })();
  const { onAppClickAway } = useDispatch();

  // Mouse Up
  useEventListener('mousedown', (e: MouseEvent) => {
    !ref?.current?.contains(e.target) && onAppClickAway();
  });

  return (
    <div
      ref={ref}
      className={clsx(
        classes.root,
        window.innerHeight.valueOf() < 1000 && classes.mobile,
        (!store.loading.initialized || store.layout.column.size <= 1 || store.layout.row.size < 3) && classes.hidden
      )}
    >
      <HexHeader store={store} />
      <HexBody store={store} />
      <HexSettings store={store} />
    </div>
  );
};

export const HexPageLayout = React.memo(WrappedHexPageLayout);
