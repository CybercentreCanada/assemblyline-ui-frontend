import { makeStyles, useTheme } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme => ({
  page: {
    width: '100%'
  }
}));

type PageFullWidthProps = {
  children: React.ReactNode;
  margin?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
};

const PageFullWidth: React.FC<PageFullWidthProps> = ({ children, margin = null, mb = 2, ml = 2, mr = 2, mt = 2 }) => {
  const classes = useStyles();
  const theme = useTheme();
  return (
    <div className={classes.page}>
      <div
        style={{
          marginBottom: theme.spacing(margin || mb),
          marginLeft: theme.spacing(margin || ml),
          marginRight: theme.spacing(margin || mr),
          marginTop: theme.spacing(margin || mt)
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PageFullWidth;
