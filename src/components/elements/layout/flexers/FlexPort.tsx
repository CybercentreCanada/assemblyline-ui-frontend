import { makeStyles} from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles({
  flexPortOuter: {
    position: 'relative',
    flexGrow: 1
  },
  flexPortInner: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'auto'
  }
});

const FlexPort = ({ mt = 0, mr = 0, mb = 0, ml = 0, children }) => {
  const classes = useStyles();
  return (
    <div className={classes.flexPortOuter}>
      <div className={classes.flexPortInner}>{children}</div>
    </div>
  );
};

export default FlexPort;
