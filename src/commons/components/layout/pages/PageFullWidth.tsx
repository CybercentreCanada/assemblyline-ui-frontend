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
};

const PageFullWidth: React.FC<PageFullWidthProps> = ({ children, margin = 2 }) => {
  const classes = useStyles();
  const theme = useTheme();
  return (
    <div className={classes.page}>
      <div style={{ margin: theme.spacing(margin) }}>{children}</div>
    </div>
  );
};

export default PageFullWidth;
