import { useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
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

export default PageFullWidth;
