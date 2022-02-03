import React from 'react';
import { HexStoreProps } from '../..';
import { HexFullscreenLayout } from './fullscreen';
import { HexPageLayout } from './page';

export const WrappedHexLayout = ({ store }: HexStoreProps) => {
  const { layoutType } = store;

  if (layoutType === 'page') return <HexPageLayout store={store} />;
  else if (layoutType === 'fullscreen') return <HexFullscreenLayout store={store} />;
  else <></>;
};

export const HexLayout = React.memo(WrappedHexLayout);
