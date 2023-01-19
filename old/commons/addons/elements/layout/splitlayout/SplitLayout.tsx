/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react-hooks/exhaustive-deps */
import { IconButton } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import useSplitLayout from 'commons/addons/elements/layout/hooks/useSplitLayout';
import React, { useEffect, useRef, useState } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import FlexHorizontal from '../flexers/FlexHorizontal';
import Flexport from '../flexers/FlexPort';
import FlexVertical from '../flexers/FlexVertical';
import Layouts, { LayoutState } from './layouts/Layouts';

const useStyles = makeStyles(theme => ({
  splitLayoutContainer: {
    overflow: 'hidden',
    flexGrow: 1
  },
  splitLayoutLeftCt: {
    height: '100%',
    display: 'inline-block',
    backgroundColor: theme.palette.background.default
  },
  splitLayoutRightCt: {
    height: '100%',
    display: 'inline-block',
    backgroundColor: theme.palette.background.default
  },
  splitLayoutDock: {},
  splitLayoutLeftAnchor: {
    width: '10px',
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
      cursor: 'col-resize'
    }
  }
}));

interface SplitLayoutProps {
  id: string;
  leftMinWidth?: number;
  rightMinWidth?: number;
  initLeftWidthPerc?: number;
  persistentMenu?: boolean;
  persistentMenuDock?: 'left' | 'right';
  disableManualResize?: boolean;
  left: React.ReactElement;
  right: React.ReactElement;
  onRenderLeftDock?: () => React.ReactElement;
  onRenderRightDock?: () => React.ReactElement;
}

const SplitLayout: React.FC<SplitLayoutProps> = React.memo(
  ({
    id,
    left: leftNode,
    right: rightNode,
    persistentMenu = false,
    persistentMenuDock = 'left',
    leftMinWidth = 300,
    rightMinWidth = 300,
    initLeftWidthPerc = 25,
    disableManualResize = false,
    onRenderLeftDock,
    onRenderRightDock
  }) => {
    // Some styles
    const classes = useStyles();

    // Some states
    const [state, setState] = useState<LayoutState>({
      leftOpen: true,
      rightOpen: true,
      leftWidth: null,
      rightWidth: null,
      width: null,
      layout: null
    });

    // Hook to register event handlers.
    const { register } = useSplitLayout(id);

    // Layout computer ref.
    const computerRef = useRef<Layouts>(new Layouts(leftMinWidth, rightMinWidth, initLeftWidthPerc));

    // Ref to track whether there was a mouse down event on resize anchor.
    const mouseDownRef = useRef<boolean>(false);

    // Some DOM refs
    const containerRef = useRef<HTMLDivElement>();
    const anchorRef = useRef<HTMLDivElement>();

    // Utility function the get the current width of container.
    const getWidth = (): number => containerRef.current.getBoundingClientRect().width;
    // Update the current layout state.
    const updateState = (_state: LayoutState) => {
      setState(_state);
    };

    // Layout Handlers

    const onAnchorMouseDown = () => {
      mouseDownRef.current = true;
    };

    const onContainerMouseUp = () => {
      mouseDownRef.current = false;
    };

    const onContainerMouseMove = (event: React.MouseEvent) => {
      if (mouseDownRef.current) {
        updateState(computerRef.current.onManualResize(event.movementX));
      }
    };

    const onContainerMouseLeave = () => {
      mouseDownRef.current = false;
    };

    const onResize = () => {
      updateState(computerRef.current.onResize(getWidth()));
    };

    const onOpenLeft = () => {
      updateState(computerRef.current.onOpenLeft());
    };

    const onCloseLeft = () => {
      updateState(computerRef.current.onCloseLeft());
    };

    const onOpenRight = () => {
      updateState(computerRef.current.onOpenRight());
    };

    const onCloseRight = () => {
      updateState(computerRef.current.onCloseRight());
    };

    const onToggleLeft = () => {
      updateState(computerRef.current.onToggleLeft());
    };

    const onToggleRight = () => {
      updateState(computerRef.current.onToggleRight());
    };

    const renderLeftDock = () =>
      !disableManualResize && (
        <FlexVertical>
          <IconButton onClick={onToggleLeft} size="large">
            <MenuOpenIcon style={{ transform: !state.leftOpen ? 'rotate(180deg)' : null }} />
          </IconButton>
          {onRenderLeftDock && onRenderLeftDock()}
        </FlexVertical>
      );

    const renderRightDock = () =>
      !disableManualResize &&
      rightNode && (
        <FlexVertical>
          <IconButton onClick={onToggleRight} size="large">
            <MenuOpenIcon style={{ transform: state.rightOpen ? 'rotate(180deg)' : null }} />
          </IconButton>
          {onRenderRightDock && onRenderRightDock()}
        </FlexVertical>
      );

    // Ensure we recompute state when rightNode is provided.
    // This handles cases where the component will toggle between
    //  having no right node and having one.
    useEffect(() => {
      updateState(computerRef.current.init(getWidth(), !!rightNode));
    }, [rightNode]);

    // Listen for splitlayout events.
    useEffect(() => register({ onOpenLeft, onCloseLeft, onOpenRight, onCloseRight, onToggleLeft, onToggleRight }));

    //
    return (
      <FlexVertical>
        <Flexport>
          <FlexHorizontal>
            <ReactResizeDetector handleWidth handleHeight={false} targetRef={containerRef} onResize={onResize}>
              {() => (
                <div
                  ref={containerRef}
                  className={classes.splitLayoutContainer}
                  onMouseUp={onContainerMouseUp}
                  onMouseMove={onContainerMouseMove}
                  onMouseLeave={onContainerMouseLeave}
                >
                  <div
                    className={classes.splitLayoutLeftCt}
                    style={{
                      position: 'absolute',
                      width: state.leftOpen ? state.leftWidth : leftMinWidth,
                      zIndex: state.leftOpen ? 1 : -1
                    }}
                  >
                    <FlexHorizontal>
                      {persistentMenu && persistentMenuDock === 'left' && renderLeftDock()}
                      <div style={{ flexGrow: 1, overflow: state.leftOpen ? 'auto' : 'hidden' }}>{leftNode}</div>
                      {!state.rightOpen && renderRightDock()}
                      {!disableManualResize && (
                        <div
                          ref={anchorRef}
                          className={classes.splitLayoutLeftAnchor}
                          onMouseDown={onAnchorMouseDown}
                        />
                      )}
                    </FlexHorizontal>
                  </div>
                  <div
                    className={classes.splitLayoutRightCt}
                    style={{
                      position: 'absolute',
                      width: state.rightOpen ? state.rightWidth : rightMinWidth,
                      zIndex: state.rightOpen ? 1 : -1,
                      left: state.rightOpen ? state.leftWidth : 0
                    }}
                  >
                    <FlexHorizontal>
                      {!state.leftOpen && renderLeftDock()}
                      <div style={{ flexGrow: 1, overflow: state.rightOpen ? 'auto' : 'hidden' }}>{rightNode}</div>
                      {persistentMenu && persistentMenuDock === 'right' && renderRightDock()}
                    </FlexHorizontal>
                  </div>
                </div>
              )}
            </ReactResizeDetector>
          </FlexHorizontal>
        </Flexport>
      </FlexVertical>
    );
  }
);

export default SplitLayout;
