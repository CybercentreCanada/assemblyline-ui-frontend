import { ClickAwayListener, makeStyles } from '@material-ui/core';
import React from 'react';
import { HexBody, HexStoreProps } from '../..';
// import React, { useEffect } from 'react';
// import { HexBody, HexStoreProps, useCopy, useCursor, useHover, useLayout, useScroll, useSelect } from '../..';
import { LAYOUT_SIZE } from '../../models/Layout';

const useHexStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: `calc(100vh - ${LAYOUT_SIZE.windowHeight}px)`,
    width: '100%',
    cursor: 'default',

    userSelection: 'none',
    '-webkit-user-select': 'none' /* Safari */,
    '-khtml-user-select': 'none' /* Konqueror HTML */,
    '-moz-user-select': 'none' /* Firefox */,
    '-ms-user-select': 'none' /* Internet Explorer/Edge */
  }
}));

export const WrappedHexPageLayout = ({ store }: HexStoreProps) => {
  const classes = useHexStyles();

  // const { onContainerMouseDown } = useLayout();
  // const { onCursorKeyDown, onCursorMouseUp, onCursorClear } = useCursor();
  // const { onSelectMouseUp, onSelectClear } = useSelect();
  // const { onHoverMouseUp } = useHover();
  // const { onCopyKeyDown } = useCopy();

  // const { onScrollSliderMouseUp } = useScroll();

  // useEffect(() => {
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     onCursorKeyDown(event);
  //     onCopyKeyDown(event);
  //   };
  //   const handleMouseUp = (event: MouseEvent) => {
  //     onScrollSliderMouseUp();
  //     onHoverMouseUp();
  //     onCursorMouseUp(event);
  //     onSelectMouseUp(event);
  //   };
  //   const handleMouseDown = (event: MouseEvent) => {
  //     onContainerMouseDown(event);
  //   };

  //   window.addEventListener('keydown', handleKeyDown);
  //   window.addEventListener('mouseup', handleMouseUp);
  //   window.addEventListener('mousedown', handleMouseDown);
  //   return () => {
  //     window.removeEventListener('keydown', handleKeyDown);
  //     window.removeEventListener('mouseup', handleMouseUp);
  //     window.removeEventListener('mousedown', handleMouseDown);
  //   };
  // }, [
  //   onContainerMouseDown,
  //   onCopyKeyDown,
  //   onCursorKeyDown,
  //   onCursorMouseUp,
  //   onHoverMouseUp,
  //   onScrollSliderMouseUp,
  //   onSelectMouseUp
  // ]);

  return (
    <ClickAwayListener
      onClickAway={event => {
        // onCursorClear();
        // onSelectClear();
      }}
    >
      <div className={classes.root}>
        <div style={{ textAlign: 'center' }}>Header</div>
        <HexBody store={store} />
      </div>
    </ClickAwayListener>
  );
};

export const HexPageLayout = React.memo(WrappedHexPageLayout);
