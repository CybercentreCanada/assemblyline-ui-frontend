import Dialog from '@material-ui/core/Dialog';
import { makeStyles } from '@material-ui/core/styles';
import React, { useRef } from 'react';
import { HexBody, HexHeader, HexSettings, StoreProps, useDispatch, useEventListener } from '../..';

const useHexStyles = makeStyles(theme => ({
  appBar: {
    position: 'relative'
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1
  }
}));

export const WrappedHexFullscreenLayout = ({ store }: StoreProps) => {
  const classes = useHexStyles();

  const { onAppClickAway, onFullscreenToggle } = useDispatch();

  const ref = useRef(null);

  // Mouse Up
  useEventListener('mousedown', (e: MouseEvent) => {
    !ref?.current?.contains(e.target) && onAppClickAway();
  });

  return (
    <Dialog ref={ref} fullScreen open={store.mode.layoutType === 'fullscreen'} onClose={e => onFullscreenToggle()}>
      <HexHeader store={store} />
      <HexBody store={store} />
      <HexSettings store={store} />
    </Dialog>
  );
};

export const HexFullscreenLayout = React.memo(WrappedHexFullscreenLayout);
