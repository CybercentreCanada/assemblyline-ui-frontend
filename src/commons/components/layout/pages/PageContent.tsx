import { makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
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
  const divider = useMediaQuery(theme.breakpoints.up('md')) ? 1 : 2;

  return (
    <div
      className={classes.pagecontent}
      style={{
        marginBottom: theme.spacing(margin / divider || mb / divider),
        marginLeft: theme.spacing(margin / divider || ml / divider),
        marginRight: theme.spacing(margin / divider || mr / divider),
        marginTop: theme.spacing(margin / divider || mt / divider)
      }}
    >
      {children}
    </div>
  );
};

export default PageContent;
