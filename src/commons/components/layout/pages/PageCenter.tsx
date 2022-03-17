import { makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import React from 'react';

const useStyles = (w, mxw, ta, mb, ml, mr, mt) =>
  makeStyles(theme => ({
    page: {
      '@media print': {
        display: 'flex'
      },
      textAlign: ta,
      margin: '0 auto auto auto',
      width: w,
      maxWidth: mxw,
      [theme.breakpoints.down('xs')]: {
        maxWidth: '100%'
      }
    },
    children: {
      marginBottom: theme.spacing(mb),
      marginLeft: theme.spacing(ml),
      marginRight: theme.spacing(mr),
      marginTop: theme.spacing(mt),
      '@media print': {
        margin: 0,
        flexGrow: 1
      }
    }
  }))();

type PageCenterProps = {
  children: React.ReactNode;
  margin?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
  maxWidth?: string;
  width?: string;
  textAlign?: string;
};

const PageCenter: React.FC<PageCenterProps> = ({
  children,
  margin = null,
  maxWidth = '1200px',
  mb = 2,
  ml = 2,
  mr = 2,
  mt = 2,
  width = '95%',
  textAlign = 'center'
}) => {
  const theme = useTheme();
  const divider = useMediaQuery(theme.breakpoints.up('md')) ? 1 : 2;
  const classes = useStyles(
    width,
    maxWidth,
    textAlign,
    margin / divider || mb / divider,
    margin / divider || ml / divider,
    margin / divider || mr / divider,
    margin / divider || mt / divider
  );

  return (
    <div className={classes.page}>
      <div className={classes.children}>{children}</div>
    </div>
  );
};

export default PageCenter;
