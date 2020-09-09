import { Box, makeStyles } from '@material-ui/core';
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
        maxWidth: '95%'
      }
    }
  }))();
};

type PageCenterProps = {
  width?: string;
  maxWidth?: string;
  children: React.ReactNode;
};

const PageCenter: React.FC<PageCenterProps> = ({ width = '95%', maxWidth = '100%', children }) => {
  const classes = useStyles(width, maxWidth);
  return <Box className={classes.page}>{children}</Box>;
};

export default PageCenter;
