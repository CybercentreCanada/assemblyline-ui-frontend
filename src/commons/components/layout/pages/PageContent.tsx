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
}

const PageContent: React.FC<PageContentProps> = ({ children, margin = 2 }) => {
  const theme = useTheme();
  const classes = useStyles();
  return (
    <div className={classes.pagecontent} style={{ margin: theme.spacing(margin) }}>
      {children}
    </div>
  );
};

export default PageContent;
