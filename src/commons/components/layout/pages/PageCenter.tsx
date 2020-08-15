import { Box, makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = width => {
  return makeStyles(theme => ({
    page: {
      textAlign: 'center',
      margin: '0 auto auto auto',
      width: `${width}%`,
      [theme.breakpoints.down('xs')]: {
        width: 'auto',
        maxWidth: '95%'
      }
    }
  }))();
};

type PageCenterProps = {
  width?: number;
  children: React.ReactNode;
};

const PageCenter: React.FC<PageCenterProps> = ({ width = 95, children }) => {
  const classes = useStyles(width);
  return <Box className={classes.page}>{children}</Box>;
};

export default PageCenter;
