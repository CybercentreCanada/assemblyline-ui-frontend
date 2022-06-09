import React from 'react';
import { HexFullscreenLayout, HexPageLayout, StoreProps } from '../..';

export * from './fullscreen';
export * from './page';

export const WrappedHexLayout = ({ store }: StoreProps) => {
  if (store.mode.layoutType === 'page') return <HexPageLayout store={store} />;
  else if (store.mode.layoutType === 'fullscreen') return <HexFullscreenLayout store={store} />;
  else <></>;
};

export const HexLayout = React.memo(WrappedHexLayout);
