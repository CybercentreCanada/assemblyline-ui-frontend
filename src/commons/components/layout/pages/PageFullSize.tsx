import { makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme => ({
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    minHeight: 0
  }
}));

type PageFullSizeProps = {
  children: React.ReactNode;
  margin?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
};

const PageFullSize: React.FC<PageFullSizeProps> = ({ children, margin = null, mb = 2, ml = 2, mr = 2, mt = 2 }) => {
  const classes = useStyles();
  const theme = useTheme();
  const divider = useMediaQuery(theme.breakpoints.up('md')) ? 1 : 2;

  return (
    <div className={classes.page}>
      <div
        style={{
          marginBottom: theme.spacing(margin / divider || mb / divider),
          marginLeft: theme.spacing(margin / divider || ml / divider),
          marginRight: theme.spacing(margin / divider || mr / divider),
          marginTop: theme.spacing(margin / divider || mt / divider),

          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minHeight: 0
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PageFullSize;
