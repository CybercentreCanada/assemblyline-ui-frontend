import { Box, makeStyles } from '@material-ui/core';
import React, { useLayoutEffect, useRef } from 'react';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%'
  },
  left: {
    flex: '1 1 auto',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'silver'
  },
  leftContent: {
    flex: '1 1 auto'
  },
  anchor: {
    width: '5px',
    height: '100%',
    backgroundColor: theme.palette.type === 'dark' ? 'hsl(211, 0%, 25%)' : 'hsl(211, 0%, 90%)',
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? 'hsl(211, 0%, 20%)' : 'hsl(211, 0%, 75%)',
      cursor: 'col-resize'
    }
  },
  right: {
    flex: '1 1 auto',
    overflow: 'auto',
    backgroundColor: 'darkgrey'
  }
}));

type SplitPanelProps = {
  leftInitWidthPerc?: number;
  leftMinWidth?: number;
  rightMinWidth?: number;
  breakpoint?: number;
  // left: React.ReactNode;
  // right: React.ReactNode;
};

const SplitPanel: React.FC<SplitPanelProps> = ({ leftMinWidth = 200, rightMinWidth = 200 }) => {
  const classes = useStyles();
  const containerEl = useRef<HTMLDivElement>();
  const leftEl = useRef<HTMLDivElement>();
  const rightEl = useRef<HTMLDivElement>();
  const anchorEl = useRef<HTMLDivElement>();
  const mouseDownRef = useRef<boolean>(false);

  useLayoutEffect(() => {
    const _containerEl = containerEl.current;
    const _leftEl = leftEl.current;
    const _rightEl = rightEl.current;
    const _anchorEl = anchorEl.current;

    // Event: anchorEl[mousedown]
    const onAnchorMD = (event: MouseEvent) => {
      console.log('mouse down');
      mouseDownRef.current = true;
    };

    // Event: containerEl[mouseup]
    const onAnchorMU = () => {
      console.log('mouse up');
      mouseDownRef.current = false;
    };

    // Event: containerEl[mousemove]
    const onAnchorMM = (event: MouseEvent) => {
      if (mouseDownRef.current) {
        console.log(`moved by: ${event.movementX}`);
        updateLayout(_leftEl.getBoundingClientRect().width + event.movementX);
      }
    };

    // Event: containerEl[mouseleave]
    const onAnchorMO = () => {
      console.log('mouse exit.');
      mouseDownRef.current = false;
    };

    // Event: window[resize]
    const onWindowResize = event => {
      console.log(event);
      // updateLayout()
    };

    // Update the widths of left and right split panel elements for the specified left value.
    const updateLayout = (leftWidth: number) => {
      const cW = _containerEl.getBoundingClientRect().width;

      let _leftWidth: number;
      let _rightWidth: number;

      //
      if (leftWidth < leftMinWidth) {
        //
        _leftWidth = leftMinWidth;
        _rightWidth = cW - leftMinWidth;
      } else if (cW - leftWidth < rightMinWidth) {
        //
        _leftWidth = cW - rightMinWidth;
        _rightWidth = rightMinWidth;
      } else {
        //
        _leftWidth = leftWidth;
        _rightWidth = cW - leftWidth;
      }

      console.log(`cW[${cW}],lW[${_leftWidth}],rW[${_rightWidth}]`);
      _leftEl.style.width = `${_leftWidth}px`;
      _rightEl.style.width = `${_rightWidth}px`;
    };

    updateLayout(leftMinWidth);

    // Register handlers.
    _anchorEl.addEventListener('mousedown', onAnchorMD);
    _containerEl.addEventListener('mouseup', onAnchorMU);
    _containerEl.addEventListener('mousemove', onAnchorMM);
    _containerEl.addEventListener('mouseleave', onAnchorMO);
    window.addEventListener('resize', onWindowResize);
    return () => {
      _anchorEl.removeEventListener('mousedown', onAnchorMD);
      _containerEl.removeEventListener('mouseup', onAnchorMU);
      _containerEl.removeEventListener('mousemove', onAnchorMM);
      _containerEl.removeEventListener('mouseleave', onAnchorMO);
      window.removeEventListener('resize', onWindowResize);
    };
  });

  return (
    <div ref={containerEl} className={classes.container}>
      <div ref={leftEl} className={classes.left}>
        <div className={classes.leftContent}>
          <h3 style={{ textAlign: 'center' }}>Left</h3>
        </div>
        <div ref={anchorEl} className={classes.anchor} />
      </div>
      <div ref={rightEl} className={classes.right}>
        <h3 style={{ textAlign: 'center' }}>Right</h3>
        <Box width={800} height={600}>
          test
        </Box>
      </div>
    </div>
  );
};

export default SplitPanel;
