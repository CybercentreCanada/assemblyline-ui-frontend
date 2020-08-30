import { Drawer, makeStyles } from '@material-ui/core';
import React, { useLayoutEffect, useRef, useState } from 'react';

const useStyles = makeStyles(theme => ({
  container: {
    // display: 'flex',
    // flexDirection: 'row',
    width: '100%',
    height: '100%'
  },
  left: {
    // flex: '0 0 auto',
    overflow: 'auto',
    display: 'inline-flex',
    flexDirection: 'row',
    // backgroundColor: 'silver',
    height: '100%',
    width: '100%',
    verticalAlign: 'top'
  },
  leftContent: {
    flex: '1 1 auto'
    // display: 'inline-block',
  },
  right: {
    // flex: '1 1 auto',
    // backgroundColor: 'grey',
    display: 'inline-block',
    // flexDirection: 'row',
    // width: '100%',
    overflow: 'auto',
    height: '100%'
  },
  anchor: {
    // display: 'inline-block',
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
  leftInitWidthPerc?: number;
  leftMinWidth?: number;
  rightMinWidth?: number;
  breakpoint?: number;
  left: React.ReactNode;
  right: React.ReactNode;
};

const SplitPanel: React.FC<SplitPanelProps> = ({
  left,
  right,
  leftInitWidthPerc = 50,
  breakpoint = 500,
  leftMinWidth = 200,
  rightMinWidth = 200
}) => {
  const classes = useStyles();
  const containerEl = useRef<HTMLDivElement>();
  const leftEl = useRef<HTMLDivElement>();
  const rightEl = useRef<HTMLDivElement>();
  const anchorEl = useRef<HTMLDivElement>();
  const leftWidthRef = useRef<number>();
  const mouseDownRef = useRef<boolean>(false);
  const [layout, setLayout] = useState<'default' | 'drawer'>('default');

  useLayoutEffect(() => {
    console.log('layoutEffect...');

    // TODO: collapsible left/right.
    // TODO: remember last width when toggling.

    const _containerEl = containerEl.current;
    const _leftEl = leftEl.current;
    const _rightEl = rightEl.current;
    const _anchorEl = anchorEl.current;

    //
    const relativeWidth = () => {
      return _containerEl.getBoundingClientRect().width * (leftInitWidthPerc / 100);
    };

    //
    const computedTotal = () => {
      const lW = _leftEl.getBoundingClientRect().width;
      const rW = _rightEl.getBoundingClientRect().width;
      return lW + rW;
    };

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

        updateLayout(leftWidthRef.current + event.movementX);
      }
    };

    // Event: containerEl[mouseleave]
    const onAnchorMO = () => {
      console.log('mouse exit.');
      mouseDownRef.current = false;
    };

    // Event: window[resize]
    const onWindowResize = event => {
      // console.log(event);
      updateLayout(relativeWidth());
    };

    // Update the widths of left and right split panel elements for the specified left value.
    const updateLayout = (leftWidth: number, bypassTotal = false) => {
      const cW = _containerEl.getBoundingClientRect().width;
      const _leftWidth = right ? (leftWidth > leftMinWidth ? leftWidth : leftMinWidth) : cW;
      const _rightWidth = right ? (cW - _leftWidth > rightMinWidth ? cW - _leftWidth : rightMinWidth) : 0;

      // if (_leftWidth + _rightWidth > cW) {
      //   alert('error!!!');
      // }

      // if (_leftWidth > leftMinWidth && (_rightWidth === 0 || _rightWidth > rightMinWidth)) {
      leftWidthRef.current = _leftWidth;
      _leftEl.style.width = `${_leftWidth}px`;
      _rightEl.style.width = `${_rightWidth}px`;
      // }

      console.log(`cW[${cW}]:lW[${_leftWidth}]:rW[${_rightWidth}]:computedTotal[${computedTotal()}}]`);
      if (computedTotal() > cW) {
        // if (cW < breakpoint) {
        leftWidthRef.current = cW;
        _leftEl.style.width = `${cW}px`;
        _rightEl.style.width = `${0}px`;
        setLayout('drawer');
      } else if (layout === 'drawer') {
        leftWidthRef.current = relativeWidth();
        _leftEl.style.width = `${leftWidthRef.current}px`;
        _rightEl.style.width = `${cW - leftWidthRef.current}px`;
        setLayout('default');
      }

      // if (!right) {
      //   leftWidthRef.current = cW;
      // } else if (leftWidth && leftWidth > leftMinWidth) {
      //   leftWidthRef.current = leftWidth;
      // }

      // if (right && leftWidthRef.current === cW) {
      //   leftWidthRef.current = leftInitWidth;
      // }

      // const _leftWidth = leftWidthRef.current;
      // const _rightWidth = cW - _leftWidth;

      // console.log(`cW[${cW}]:lW[${_leftWidth}]:rW[${_rightWidth}]`);
      // if (_leftWidth > leftMinWidth && (_rightWidth === 0 || _rightWidth > rightMinWidth)) {
      //   _leftEl.style.width = `${_leftWidth}px`;
      //   _rightEl.style.width = `${cW - _leftWidth}px`;
      // }
    };

    // Initial layout.
    updateLayout(relativeWidth());

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
  }, [leftInitWidthPerc, leftMinWidth, rightMinWidth, right, layout]);

  console.log(layout);

  return (
    <div style={{ height: '100%', display: 'flex' }}>
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
          {layout === 'default' ? right : null}
        </div>
      </div>
      {layout === 'drawer' && right ? (
        // <Box display="flex">.
        <Drawer open variant="persistent" anchor="right">
          {right}
        </Drawer>
      ) : // </Box>
      null}
    </div>
  );
};

export default SplitPanel;
