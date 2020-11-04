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
  maxWidth?: string;
  width?: string;
};

const PageCenter: React.FC<PageCenterProps> = ({ children, margin = 2, maxWidth = '1200px', width = '95%' }) => {
  const classes = useStyles(width, maxWidth);
  const theme = useTheme();
  return (
    <div className={classes.page}>
      <div style={{ margin: theme.spacing(margin) }}>{children}</div>
    </div>
  );
};

export default PageCenter;
