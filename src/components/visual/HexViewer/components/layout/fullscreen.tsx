import React from 'react';
import { HexStoreProps } from '../..';

export const WrappedHexFullscreenLayout = ({ store }: HexStoreProps) => {
  return <>Fullscreen</>;
};

export const HexFullscreenLayout = React.memo(WrappedHexFullscreenLayout);
