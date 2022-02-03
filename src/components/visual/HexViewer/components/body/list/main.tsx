import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { HexStore, useLayout, useScroll, useStyles } from 'components/visual/HexViewer';
import React from 'react';
import { HexList } from '.';

const useHexStyles = makeStyles(theme => ({
  layout: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    cursor: 'default',
    overflowX: 'hidden',
    overflowY: 'hidden',
    alignItems: 'stretch',
    userSelection: 'none',

    lineHeight: 1.15
  }
}));

export type HexListMainProps = {
  store?: HexStore;
};

export const WrappedHexListMain = ({ store }: HexListMainProps) => {
  const classes = useHexStyles();

  const { layoutRef } = useLayout();

  const { onScrollWheel, onScrollTouchStart, onScrollTouchEnd, onScrollTouchMove } = useScroll();
  const {
    hexClasses,
    itemClasses,
    getHexColorClass,
    getCursorClass,
    getSelectClass,
    getSearchClass,
    getSelectedSearchClass
  } = useStyles();

  return (
    <div
      className={clsx(hexClasses.app)}
      ref={layoutRef}
      onWheel={event => onScrollWheel(event)}
      onTouchStart={event => onScrollTouchStart(event)}
      onTouchMove={event => onScrollTouchMove(event)}
      onTouchEnd={event => onScrollTouchEnd(event)}
    >
      <HexList store={store} />
    </div>
  );
};

export const HexListMain = React.memo(WrappedHexListMain);
