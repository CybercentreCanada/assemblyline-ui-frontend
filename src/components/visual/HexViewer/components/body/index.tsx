import React from 'react';
import { HexStoreProps, useHex } from '../..';
import { HexContainerMain } from './container';
import { HexListMain } from './list';
import { HexTableBody } from './table/table';

export const WrappedHexBody = ({ store }: HexStoreProps) => {
  const { bodyType } = store;
  const { hexMap } = useHex();

  if (hexMap.current.size === null || hexMap.current.size <= 0) return null;

  if (bodyType === 'container') return <HexContainerMain store={store} />;
  else if (bodyType === 'list') return <HexListMain store={store} />;
  else if (bodyType === 'table') return <HexTableBody store={store} />;
  else return <></>;
};

export const HexBody = React.memo(WrappedHexBody);
