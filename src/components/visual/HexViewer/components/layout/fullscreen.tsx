import Dialog from '@material-ui/core/Dialog';
import React, { useRef } from 'react';
import { HexBody, HexHeader, HexSettings, StoreProps, useDispatch, useEventListener } from '../..';

export const WrappedHexFullscreenLayout = ({ store }: StoreProps) => {
  const { onAppClickAway, onFullscreenToggle } = useDispatch();

  const ref = useRef(null);

  // Mouse Up
  useEventListener('mousedown', (e: MouseEvent) => {
    !ref?.current?.contains(e.target) && onAppClickAway();
  });

  return (
    <Dialog ref={ref} fullScreen open={store.mode.layout === 'fullscreen'} onClose={e => onFullscreenToggle()}>
      <HexHeader store={store} />
      <HexBody store={store} />
      <HexSettings store={store} />
    </Dialog>
  );
};

export const HexFullscreenLayout = React.memo(WrappedHexFullscreenLayout);
