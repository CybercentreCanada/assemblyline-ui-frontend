import React from 'react';
import { StoreProps } from '../..';

export const WrappedHexFullscreenLayout = ({ store }: StoreProps) => {
  return <>Fullscreen</>;
};

export const HexFullscreenLayout = React.memo(WrappedHexFullscreenLayout);
