import React from 'react';
import { HexFullscreenLayout, HexPageLayout, StoreProps } from '../..';

export * from './fullscreen';
export * from './loading';
export * from './page';

export const WrappedHexLayout = ({ store }: StoreProps) => {
  if (store.mode.layout === 'page') return <HexPageLayout store={store} />;
  else if (store.mode.layout === 'fullscreen') return <HexFullscreenLayout store={store} />;
  else <></>;
};

export const HexLayout = React.memo(WrappedHexLayout);
