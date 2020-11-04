import { makeStyles, useTheme } from '@material-ui/core';
import React from 'react';

const useStyles = (w, mxw) => {
  return makeStyles(theme => ({
    page: {
      textAlign: 'center',
      margin: '0 auto auto auto',
      width: w,
      maxWidth: mxw,
      [theme.breakpoints.down('xs')]: {
        width: 'auto',
        maxWidth: '100%'
      }
    }
  }))();
};

type PageCenterProps = {
  children: React.ReactNode;
  margin?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
  maxWidth?: string;
  width?: string;
};

const PageCenter: React.FC<PageCenterProps> = ({
  children,
  margin = null,
  maxWidth = '1200px',
  mb = 2,
  ml = 2,
  mr = 2,
  mt = 2,
  width = '95%'
}) => {
  const classes = useStyles(width, maxWidth);
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

export default PageCenter;
