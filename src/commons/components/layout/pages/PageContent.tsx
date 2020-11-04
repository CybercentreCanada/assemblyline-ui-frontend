import { makeStyles, useTheme } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme => ({
  pagecontent: {
    height: '100%'
  }
}));

interface PageContentProps {
  children: React.ReactNode;
  margin?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
}

const PageContent: React.FC<PageContentProps> = ({ children, margin = null, mb = 2, ml = 2, mr = 2, mt = 2 }) => {
  const theme = useTheme();
  const classes = useStyles();
  return (
    <div
      className={classes.pagecontent}
      style={{
        marginBottom: theme.spacing(margin || mb),
        marginLeft: theme.spacing(margin || ml),
        marginRight: theme.spacing(margin || mr),
        marginTop: theme.spacing(margin || mt)
      }}
    >
      {children}
    </div>
  );
};

export default PageContent;
