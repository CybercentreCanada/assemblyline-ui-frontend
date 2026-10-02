import type { StoreProps } from 'components/visual/HexViewer';
import { HexBody, HexHeader, HexSettings, useDispatch, useEventListener } from 'components/visual/HexViewer';
import React, { useRef } from 'react';

export const WrappedHexPageLayout = ({ store }: StoreProps) => {
  const ref = useRef(null);
  const { onAppClickAway } = useDispatch();

  // Mouse Up
  useEventListener('mousedown', (e: MouseEvent) => {
    !ref?.current?.contains(e.target) && onAppClickAway();
  });

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        cursor: 'default',
        flexGrow: 1,

        userSelect: 'none' /* Safari */,
        WebkitUserSelect: 'none' /* Konqueror HTML */,
        KhtmlUserSelect: 'none' /* Firefox */,
        msUserSelect: 'none' /* Internet Explorer/Edge */,

        ...(store.loading.status !== 'initialized' && {
          visibility: 'hidden'
        })
      }}
    >
      <HexHeader store={store} />
      <div style={{ flexGrow: 1 }}>
        <HexBody store={store} />
      </div>
      <HexSettings store={store} />
    </div>
  );
};

export const HexPageLayout = React.memo(WrappedHexPageLayout);
