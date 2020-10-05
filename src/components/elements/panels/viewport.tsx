import { makeStyles } from '@material-ui/core';
import React, { useLayoutEffect, useRef, useState } from 'react';

const useStyles = makeStyles({
  viewportCt: {
    position: 'relative'
  },
  viewport: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});

interface ViewportProps {
  children: React.ReactNode;
}

const Viewport: React.FC<ViewportProps> = ({ children }) => {
  // Some styles...
  const classes = useStyles();

  // Some references...
  const ref = useRef<HTMLDivElement>();

  // Some states...
  const [height, setHeight] = useState<number>(0);

  // recompute height with each render and when the window resizes.
  useLayoutEffect(() => {
    const updateHeight = () => {
      const { current: element } = ref;
      const rect = element.getBoundingClientRect();
      const _height = window.innerHeight - rect.top;
      setHeight(_height);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  });

  return (
    <div ref={ref} style={{ height }} className={classes.viewportCt}>
      <div className={classes.viewport}>{children}</div>
    </div>
  );
};

export default Viewport;
