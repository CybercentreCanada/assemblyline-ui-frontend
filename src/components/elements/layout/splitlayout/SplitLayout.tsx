/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react-hooks/exhaustive-deps */
import { IconButton, makeStyles } from '@material-ui/core';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import useSplitLayout from 'components/elements/layout/hooks/useSplitLayout';
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
  splitLayoutLeft: {
    display: 'inline-block',
    verticalAlign: 'top',
    width: '25%',
    height: '100%'
  },
  splitLayoutLeftContent: {
    flexGrow: 1,
    overflow: 'auto'
  },
  splitLayoutLeftAnchor: {
    width: '10px',
    '&:hover': {
      cursor: 'col-resize'
    }
  },
  splitLayoutRight: {
    display: 'inline-block',
    verticalAlign: 'top',
    width: '75%',
    height: '100%'
  },
  splitLayoutRightContent: {
    flexGrow: 1,
    overflow: 'auto'
  },
  splitLayoutDock: {}
}));

interface SplitLayoutState {
  leftOpen: boolean;
  rightOpen: boolean;
  widths: {
    container: number;
    left: number;
    right: number;
  };
}

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
    const leftRef = useRef<HTMLDivElement>();
    const rightRef = useRef<HTMLDivElement>();
    const anchorRef = useRef<HTMLDivElement>();

    // Utility function the get the current width of container.
    const getWidth = (): number => {
      return containerRef.current.getBoundingClientRect().width;
    };

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

    const renderLeftDock = () => {
      return (
        <>
          <div className={classes.splitLayoutDock}>
            <FlexVertical>
              <IconButton onClick={onToggleLeft}>
                <MenuOpenIcon style={{ transform: !state.leftOpen ? 'rotate(180deg)' : null }} />
              </IconButton>
              {onRenderLeftDock && onRenderLeftDock()}
            </FlexVertical>
          </div>
        </>
      );
    };

    const renderRightDock = () => {
      return (
        rightNode && (
          <>
            <div className={classes.splitLayoutDock}>
              <IconButton onClick={onToggleRight}>
                <MenuOpenIcon style={{ transform: state.rightOpen ? 'rotate(180deg)' : null }} />
              </IconButton>
              <FlexVertical>{onRenderRightDock && onRenderRightDock()}</FlexVertical>
            </div>
          </>
        )
      );
    };

    // Ensure we recompute state when rightNode is provided.
    // This handles cases where the component will toggle between
    //  having no right node and having noe.
    useEffect(() => {
      updateState(computerRef.current.init(getWidth(), !!rightNode));
    }, [rightNode]);

    // Listen for splitlayout events.
    useEffect(() => {
      return register({ onOpenLeft, onCloseLeft, onOpenRight, onCloseRight, onToggleLeft, onToggleRight });
    });

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
                    ref={leftRef}
                    className={classes.splitLayoutLeft}
                    style={{
                      width: !state.leftOpen ? 0 : state.leftWidth ? state.leftWidth : null,
                      overflow: !state.leftOpen ? 'hidden' : null
                    }}
                  >
                    <FlexHorizontal>
                      {persistentMenu && persistentMenuDock === 'left' && renderLeftDock()}
                      <div className={classes.splitLayoutLeftContent}>{leftNode}</div>
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
                    ref={rightRef}
                    className={classes.splitLayoutRight}
                    style={{ width: state.rightWidth ? state.rightWidth : null }}
                  >
                    <FlexHorizontal>
                      {!state.leftOpen && renderLeftDock()}
                      <div className={classes.splitLayoutRightContent}>{state.rightOpen && rightNode}</div>
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
