import { makeStyles, useTheme } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme => ({
  pagecontent: {
    height: '100%'
  }
}));

interface PageContentProps {
  full?: boolean;
  children: React.ReactNode;
}

//
const PageContent: React.FC<PageContentProps> = ({ full = false, children }) => {
  const theme = useTheme();
  const classes = useStyles();
  return (
    <div
      className={classes.pagecontent}
      style={{ marginLeft: full ? 0 : theme.spacing(2), marginRight: full ? 0 : theme.spacing(2) }}
    >
      {children}
    </div>
  );
};

export default PageContent;
