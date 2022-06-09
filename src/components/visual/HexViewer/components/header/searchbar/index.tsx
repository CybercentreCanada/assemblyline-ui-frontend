import React, { memo } from 'react';
import { HexcodeBar, HexCursorBar, StoreProps, TextBar } from '../../..';

export * from './cursorbar';
export * from './hexcodebar';
export * from './textbar';

const WrappedHexSearchBar = ({ store }: StoreProps) => {
  if (store.search.type === 'cursor') return <HexCursorBar store={store} />;
  else if (store.search.type === 'hex') return <HexcodeBar store={store} />;
  else if (store.search.type === 'text') return <TextBar store={store} />;
  else return <></>;
};

export const HexSearchBar = memo(WrappedHexSearchBar);
