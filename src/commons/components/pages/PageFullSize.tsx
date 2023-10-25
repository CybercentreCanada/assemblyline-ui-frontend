import { useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React, { LegacyRef } from 'react';

const useStyles = makeStyles(theme => ({
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    minHeight: 0
  }
}));

type PageFullSizeProps = {
  id?: string;
  ref?: LegacyRef<HTMLDivElement>;
  children: React.ReactNode;
  margin?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mt?: number;
  styles?: {
    root?: React.CSSProperties;
    paper?: React.CSSProperties;
  };
};

const PageFullSize: React.FC<PageFullSizeProps> = ({
  id,
  ref,
  children,
  margin = null,
  mb = 2,
  ml = 2,
  mr = 2,
  mt = 2,
  styles = {
    root: null,
    paper: null
  }
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const divider = useMediaQuery(theme.breakpoints.up('md')) ? 1 : 2;

  return (
    <div className={classes.page} ref={ref} style={{ ...styles.root }}>
      <div
        style={{
          marginBottom: theme.spacing(margin / divider || mb / divider),
          marginLeft: theme.spacing(margin / divider || ml / divider),
          marginRight: theme.spacing(margin / divider || mr / divider),
          marginTop: theme.spacing(margin / divider || mt / divider),

          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minHeight: 0,
          ...styles.paper
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PageFullSize;
