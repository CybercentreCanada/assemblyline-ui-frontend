import { useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

const useStyles = makeStyles(theme => ({
  pagecontent: {}
}));

interface PageContentProps {
  children: React.ReactNode;
  height?: string;
  margin?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
}

const PageContent: React.FC<PageContentProps> = ({
  children,
  height = null,
  margin = null,
  mb = 2,
  ml = 2,
  mr = 2,
  mt = 2
}) => {
  const theme = useTheme();
  const classes = useStyles();
  const divider = useMediaQuery(theme.breakpoints.up('md')) ? 1 : 2;

  return (
    <div
      className={classes.pagecontent}
      style={{
        height,
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
