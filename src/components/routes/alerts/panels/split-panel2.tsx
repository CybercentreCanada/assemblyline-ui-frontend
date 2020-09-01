import { Drawer, makeStyles } from '@material-ui/core';
import React, { useLayoutEffect, useRef, useState } from 'react';

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
    flexDirection: 'row'
    // backgroundColor: 'silver'
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
    transition: 'width 0.2s ease 0s'
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
  rightDrawerBreakpoint?: number;
  rightDrawerWidth?: number;
  rightDrawerBackgroundColor?: string;
  rightOpen?: boolean;
  left: React.ReactNode;
  right: React.ReactNode;
};

const SplitPanel: React.FC<SplitPanelProps> = ({
  left,
  right,
  leftMinWidth = 200,
  rightMinWidth = 200,
  rightOpen = true,
  rightDrawerBreakpoint = 500,
  rightDrawerBackgroundColor,
  rightDrawerWidth = 400
}) => {
  const classes = useStyles();
  const drawerClasses = makeStyles({
    paper: {
      backgroundColor: rightDrawerBackgroundColor,
      width: rightDrawerWidth
    }
  })();
  const containerEl = useRef<HTMLDivElement>();
  const leftEl = useRef<HTMLDivElement>();
  const rightEl = useRef<HTMLDivElement>();
  const anchorEl = useRef<HTMLDivElement>();
  const mouseDownRef = useRef<boolean>(false);
  const leftSizeRef = useRef<number>(leftMinWidth);
  const [layout, setLayout] = useState<'default' | 'drawer'>('default');

  useLayoutEffect(() => {
    const _containerEl = containerEl.current;
    const _leftEl = leftEl.current;
    const _rightEl = rightEl.current;
    const _anchorEl = anchorEl.current;

    // Event: anchorEl[mousedown]
    const onAnchorMD = (event: MouseEvent) => {
      // console.log('mouse down');
      mouseDownRef.current = true;
      _rightEl.style.transition = 'none';
    };

    // Event: containerEl[mouseup]
    const onAnchorMU = () => {
      // console.log('mouse up');
      mouseDownRef.current = false;
      _rightEl.style.transition = 'width 0.2s ease 0s';
    };

    // Event: containerEl[mousemove]
    const onAnchorMM = (event: MouseEvent) => {
      if (mouseDownRef.current) {
        // console.log(`moved by: ${event.movementX}`);
        updateLayout(_leftEl.getBoundingClientRect().width + event.movementX);
      }
    };

    // Event: containerEl[mouseleave]
    const onAnchorMO = () => {
      // console.log('mouse exit.');
      mouseDownRef.current = false;
    };

    // Event: window[resize]
    const onWindowResize = event => {
      // console.log(event);
      checkLayout();
    };

    const checkLayout = () => {
      const cW = _containerEl.getBoundingClientRect().width;
      const _layout = cW < rightDrawerBreakpoint ? 'drawer' : 'default';
      if (_layout !== layout) {
        setLayout(_layout);
      }
    };

    // Update the widths of left and right split panel elements for the specified left value.
    const updateLayout = (leftWidth: number) => {
      const cW = _containerEl.getBoundingClientRect().width;

      let _leftWidth: number;
      let _rightWidth: number;

      if (!right || !rightOpen) {
        //
        _leftWidth = cW;
        _rightWidth = 0;
      } else if (leftWidth < leftMinWidth) {
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

      // keep track of last size update.
      leftSizeRef.current = _leftWidth;

      // console.log(`cW[${cW}],lW[${_leftWidth}],rW[${_rightWidth}]`);

      // Update the left and right widths.
      // We update the DOM directly to minimize the amount of re-render and state updates.
      _leftEl.style.width = `${_leftWidth}px`;
      _rightEl.style.width = `${_rightWidth}px`;
    };

    if (layout === 'default') {
      checkLayout();
      updateLayout(leftSizeRef.current);
    }

    // Register handlers.
    if (_anchorEl) {
      _anchorEl.addEventListener('mousedown', onAnchorMD);
    }
    _containerEl.addEventListener('mouseup', onAnchorMU);
    _containerEl.addEventListener('mousemove', onAnchorMM);
    _containerEl.addEventListener('mouseleave', onAnchorMO);
    window.addEventListener('resize', onWindowResize);
    return () => {
      if (_anchorEl) {
        _anchorEl.removeEventListener('mousedown', onAnchorMD);
      }
      _containerEl.removeEventListener('mouseup', onAnchorMU);
      _containerEl.removeEventListener('mousemove', onAnchorMM);
      _containerEl.removeEventListener('mouseleave', onAnchorMO);
      window.removeEventListener('resize', onWindowResize);
    };
  });

  // We display the right panel as a drawer
  if (layout === 'drawer') {
    return (
      <div ref={containerEl} className={classes.container}>
        <div ref={leftEl} className={classes.left}>
          <div className={classes.leftContent}>{left}</div>
        </div>
        <Drawer open={rightOpen} anchor="right" classes={{ paper: drawerClasses.paper }}>
          {right}
        </Drawer>
      </div>
    );
  }

  // Default split panel layout.
  return (
    <div ref={containerEl} className={classes.container}>
      <div ref={leftEl} className={classes.left}>
        <div className={classes.leftContent}>{left}</div>
        {right && rightOpen ? <div ref={anchorEl} className={classes.anchor} /> : null}
      </div>
      <div ref={rightEl} className={classes.right}>
        {right && rightOpen ? right : null}
      </div>
    </div>
  );
};

export default SplitPanel;
