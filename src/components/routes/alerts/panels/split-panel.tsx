import { makeStyles } from '@material-ui/core';
import React, { useLayoutEffect, useRef } from 'react';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%'
  },
  left: {
    // flex: '0 0 auto',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'row',
    // backgroundColor: 'silver',
    height: '100%'
  },
  leftContent: {
    flex: '1 1 auto'
  },
  right: {
    // flex: '1 1 auto',
    // backgroundColor: 'grey',
    // display: 'flex',
    // flexDirection: 'row',
    // width: '100%',
    overflow: 'auto',
    height: '100%'
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
  '@global': {
    '*::-webkit-scrollbar': {
      width: '0.4em'
    },
    '*::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '*::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,.1)',
      outline: '1px solid slategrey'
    }
  }
}));

type SplitPanelProps = {
  leftInitWidth?: number;
  leftMinWidth?: number;
  rightMinWidth?: number;
  left: React.ReactNode;
  right: React.ReactNode;
};

const SplitPanel: React.FC<SplitPanelProps> = ({
  left,
  right,
  leftInitWidth = 400,
  leftMinWidth = 200,
  rightMinWidth = 200
}) => {
  const classes = useStyles();
  const containerEl = useRef<HTMLDivElement>();
  const leftEl = useRef<HTMLDivElement>();
  const rightEl = useRef<HTMLDivElement>();
  const anchorEl = useRef<HTMLDivElement>();
  const leftWidthRef = useRef<number>(leftInitWidth);
  const mouseDownRef = useRef<boolean>(false);

  useLayoutEffect(() => {
    console.log('layoutEffect...');

    // TODO: collapsible left/right.
    // TODO: remember last width when toggling.

    const _containerEl = containerEl.current;
    const _leftEl = leftEl.current;
    const _rightEl = rightEl.current;
    const _anchorEl = anchorEl.current;

    const onAnchorMD = (event: MouseEvent) => {
      console.log('mouse down');
      mouseDownRef.current = true;
    };
    const onAnchorMU = () => {
      console.log('mouse up');
      mouseDownRef.current = false;
    };
    const onAnchorMM = (event: MouseEvent) => {
      if (mouseDownRef.current) {
        console.log(`moved by: ${event.movementX}`);

        updateLayout(leftWidthRef.current + event.movementX);
      }
    };
    const onAnchorMO = () => {
      console.log('mouse exit.');
      mouseDownRef.current = false;
    };

    const updateLayout = (leftWidth?: number) => {
      const cW = _containerEl.getBoundingClientRect().width;

      if (!right) {
        leftWidthRef.current = cW;
      } else if (leftWidth && leftWidth > leftMinWidth) {
        leftWidthRef.current = leftWidth;
      }

      if (right && leftWidthRef.current === cW) {
        leftWidthRef.current = leftInitWidth;
      }

      const _leftWidth = leftWidthRef.current;
      const _rightWidth = cW - _leftWidth;

      console.log(`cW[${cW}]:lW[${_leftWidth}]:rW[${_rightWidth}]`);
      if (_leftWidth > leftMinWidth && (_rightWidth === 0 || _rightWidth > rightMinWidth)) {
        _leftEl.style.width = `${_leftWidth}px`;
        _rightEl.style.width = `${cW - _leftWidth}px`;
      }
    };

    updateLayout();
    _anchorEl.addEventListener('mousedown', onAnchorMD);
    _containerEl.addEventListener('mouseup', onAnchorMU);
    _containerEl.addEventListener('mousemove', onAnchorMM);
    _containerEl.addEventListener('mouseleave', onAnchorMO);
    return () => {
      _anchorEl.removeEventListener('mousedown', onAnchorMD);
      _containerEl.removeEventListener('mouseup', onAnchorMU);
      _containerEl.removeEventListener('mousemove', onAnchorMM);
      _containerEl.removeEventListener('mouseleave', onAnchorMO);
    };
  }, [leftInitWidth, leftMinWidth, rightMinWidth, right]);

  return (
    <div ref={containerEl} className={classes.container}>
      <div ref={leftEl} className={classes.left}>
        <div className={classes.leftContent}>
          {/* <h3 style={{ textAlign: 'center' }}>Left</h3> */}
          {left}
        </div>
        <div ref={anchorEl} className={classes.anchor} style={{ width: right && left ? '5px' : '0px' }} />
      </div>
      <div ref={rightEl} className={classes.right}>
        {/* <h3 style={{ textAlign: 'center' }}>Right</h3> */}
        {right}
      </div>
    </div>
  );
};

export default SplitPanel;
