import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    // maxHeight: 'calc(100vh-64px)',
    overflowY: 'auto'
  },
  wrapper: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    height: 'fit-content'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    margin: `0 ${theme.spacing(4)}`,
    width: '100%',
    minWidth: `${theme.breakpoints.values.md}px`,
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
    top: 0,
    zIndex: 1000,
    backgroundColor: theme.palette.background.default,
    paddingBottom: theme.spacing(2)
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(4),
    marginTop: theme.spacing(2),
    padding: '1px'
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
};

export const PageLayout: React.FC<PageLayoutProps> = React.memo(
  ({
    header = null,
    children = null,
    leftNav = null,
    rightNav = null,
    rootRef = null,
    contentRef = null,
    headerRef = null
  }: PageLayoutProps) => {
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
