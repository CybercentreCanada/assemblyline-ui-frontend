import { Box, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    overflowY: 'auto'
  },
  wrapper: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    height: 'fit-content'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '1200px'
  },
  navigation: {
    position: 'sticky',
    top: '0px',
    overflowX: 'hidden',
    overflowY: 'scroll',
    scrollbarWidth: 'none',
    minWidth: 'fit-content'
  },
  header: {
    position: 'sticky',
    top: -1,
    zIndex: 1000,
    backgroundColor: theme.palette.background.default,
    paddingBottom: theme.spacing(1),
    margin: theme.spacing(4),
    marginBottom: 0
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(2),
    padding: '1px',
    margin: theme.spacing(4),
    marginTop: 0
  }
}));

export type PageLayoutProps = {
  header?: React.ReactNode;
  children?: React.ReactNode;
  leftNav?: React.ReactNode;
  rightNav?: React.ReactNode;
  rootRef?: React.MutableRefObject<HTMLDivElement>;
  contentRef?: React.MutableRefObject<HTMLDivElement>;
  headerRef?: React.MutableRefObject<HTMLDivElement>;
  margin?: number;
};

export const PageLayout: React.FC<PageLayoutProps> = React.memo(
  ({
    header = null,
    children = null,
    leftNav = null,
    rightNav = null,
    rootRef = null,
    contentRef = null,
    headerRef = null,
    margin = 0
  }: PageLayoutProps) => {
    const theme = useTheme();
    const classes = useStyles();

    return (
      <div className={classes.root} ref={rootRef}>
        {!leftNav ? null : <div className={classes.navigation}>{leftNav}</div>}

        <div className={classes.wrapper}>
          <div className={classes.container}>
            <Box className={classes.header} ref={headerRef}>
              {header}
            </Box>

            <Box className={classes.content} ref={contentRef}>
              {children}

              <div style={{ height: window.innerHeight / 2 }} />
            </Box>
          </div>
        </div>

        {!rightNav ? null : <div className={classes.navigation}>{rightNav}</div>}
      </div>
    );
  }
);
