import { makeStyles } from '@material-ui/core';
import React, { useLayoutEffect, useRef, useState } from 'react';

const useStyles = makeStyles({
  viewportCt: {
    position: 'relative'
  },
  //
  viewport: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});

const Viewport = ({ children, isNested = false }) => {
  const classes = useStyles();
  const ref = useRef<HTMLDivElement>();
  const [height, setHeight] = useState<number>(0);
  useLayoutEffect(() => {
    const updateHeight = () => {
      const { current: element } = ref;
      const rect = element.getBoundingClientRect();
      const _height = window.innerHeight - rect.top;
      setHeight(_height);
    };
    window.addEventListener('resize', updateHeight);
    updateHeight();
    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);
  return (
    <div ref={ref} style={{ height }} className={classes.viewportCt}>
      <div className={classes.viewport}>{children}</div>
    </div>
  );
};

export default Viewport;
