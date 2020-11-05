import { makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
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
  const divider = useMediaQuery(theme.breakpoints.up('md')) ? 1 : 2;

  return (
    <div className={classes.page}>
      <div
        style={{
          marginBottom: theme.spacing(margin / divider || mb / divider),
          marginLeft: theme.spacing(margin / divider || ml / divider),
          marginRight: theme.spacing(margin / divider || mr / divider),
          marginTop: theme.spacing(margin / divider || mt / divider)
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PageCenter;
