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
    flex: '0 0 auto',
    overflow: 'auto',
    transition: 'width 0.2s ease 0s'
  }
  // '@global': {
  //   '*::-webkit-scrollbar': {
  //     width: '0.4em'
  //   },
  //   '*::-webkit-scrollbar-track': {
  //     '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
  //   },
  //   '*::-webkit-scrollbar-thumb': {
  //     backgroundColor: 'rgba(0,0,0,.1)',
  //     outline: '1px solid slategrey'
  //   }
  // }
}));

type SplitPanelProps = {
  leftMinWidth?: number;
  leftInitWidthPerc?: number;
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
  leftInitWidthPerc = 50,
  leftMinWidth = 200,
  rightMinWidth = 200,
  rightOpen = true,
  rightDrawerBreakpoint = 500,
  rightDrawerBackgroundColor,
  rightDrawerWidth = 400
}) => {
  const classes = useStyles();
  const drawerClasses = makeStyles(theme => ({
    paper: {
      backgroundColor: rightDrawerBackgroundColor,
      width: rightDrawerWidth,
      [theme.breakpoints.down('sm')]: {
        position: 'fixed',
        width: '100vw',
        top: 0,
        right: 0,
        bottom: 0
      }
    }
  }))();
  const containerEl = useRef<HTMLDivElement>();
  const leftEl = useRef<HTMLDivElement>();
  const rightEl = useRef<HTMLDivElement>();
  const anchorEl = useRef<HTMLDivElement>();
  const mouseDownRef = useRef<boolean>(false);
  const leftSizeRef = useRef<number>();
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
      if (_rightEl) {
        // remove transition effect when resizing.
        // this will prevent delays and other weirdness.
        // the dom update is fast enough to keep up and make
        //  things smooth.
        _rightEl.style.transition = 'none';
      }
    };

    // Event: containerEl[mouseup]
    const onAnchorMU = () => {
      // console.log('mouse up');
      mouseDownRef.current = false;
      if (_rightEl) {
        // reset the transition effect when no longer resizing.
        _rightEl.style.transition = 'width 0.2s ease 0s';
      }
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

    // Get the base left width for the next layout update.
    const nextLeftWidthBase = () => {
      const cW = _containerEl.getBoundingClientRect().width;
      // Not right panel.
      if (!right || !rightOpen) {
        return cW;
      }
      // The last non-fullwidth/non-zero width.
      if (leftSizeRef.current) {
        return leftSizeRef.current;
      }
      // First time opening the right panel.
      return cW * (leftInitWidthPerc / 100);
    };

    // Check to see if we've hit the layout breakpoint.
    const checkLayout = () => {
      const cW = _containerEl.getBoundingClientRect().width;
      const _layout = cW < rightDrawerBreakpoint ? 'drawer' : 'default';
      if (_layout !== layout) {
        setLayout(_layout);
      }
      return _layout;
    };

    // Update the widths of left and right split panel elements for the specified left value.
    const updateLayout = (leftWidth: number) => {
      const cW = _containerEl.getBoundingClientRect().width;

      let _leftWidth: number;
      let _rightWidth: number;

      if (!right || !rightOpen) {
        // No right panel.
        _leftWidth = cW;
        _rightWidth = 0;
      } else if (leftWidth < leftMinWidth) {
        // Left side is within range.
        _leftWidth = leftMinWidth;
        _rightWidth = cW - leftMinWidth;
      } else if (cW - leftWidth < rightMinWidth) {
        // left size want to overflow into right size.
        _leftWidth = cW - rightMinWidth;
        _rightWidth = rightMinWidth;
      } else {
        // iz all gooudd. we within range on both sides.
        _leftWidth = leftWidth;
        _rightWidth = cW - leftWidth;
      }

      // keep track of last size update.
      // only update it if we're not closing the right side.
      // this will ensure it opens at same size next time around.
      if (right && _rightWidth > 0 && _leftWidth !== cW) {
        leftSizeRef.current = _leftWidth;
      }

      // console.log(`cW[${cW}],lW[${_leftWidth}],rW[${_rightWidth}]`);

      // Update the left and right widths.
      // We update the DOM directly to minimize the amount of re-render and state updates.
      if (_leftEl) {
        _leftEl.style.width = `${_leftWidth}px`;
      }
      if (_rightEl) {
        _rightEl.style.width = `${_rightWidth}px`;
      }
    };

    // Initialize the width of left panel.
    // if (!leftSizeRef.current) {
    //   leftSizeRef.current = defaultLeftWidth();
    // }..

    const _layout = checkLayout();
    if (_layout === 'default') {
      updateLayout(nextLeftWidthBase());
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

  // We display the right panel as a temporary drawer.
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
