import { useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import * as React from 'react';

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

const FlexPort: React.FC<{
  margin?: number;
  mt?: number;
  mr?: number;
  mb?: number;
  ml?: number;
  children: React.ReactNode;
}> = React.memo(({ margin = null, mb = 0, ml = 0, mr = 0, mt = 0, children }) => {
  const theme = useTheme();
  const classes = useStyles();
  const divider = useMediaQuery(theme.breakpoints.up('md')) ? 1 : 2;
  return (
    <div
      className={classes.flexPortOuter}
      style={{
        marginBottom: theme.spacing(margin / divider || mb / divider),
        marginLeft: theme.spacing(margin / divider || ml / divider),
        marginRight: theme.spacing(margin / divider || mr / divider),
        marginTop: theme.spacing(margin / divider || mt / divider)
      }}
    >
      <div className={classes.flexPortInner}>{children}</div>
    </div>
  );
});

export default FlexPort;
