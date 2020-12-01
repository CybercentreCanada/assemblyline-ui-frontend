import { Drawer, IconButton, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import React, { useMemo, useState } from 'react';

const useStyles = makeStyles(theme => ({
  appMain: {
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    position: 'relative'
  },
  appContent: {
    '@media print': {
      overflow: 'unset !important'
    },
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    flex: 1,
    height: '100%'
  },
  appRightDrawer: {
    '@media print': {
      display: 'none'
    },
    transition: 'width 225ms cubic-bezier(0, 0, 0.2, 1) 0ms'
  },
  paper: {
    [theme.breakpoints.only('xl')]: {
      width: '42vw'
    },
    [theme.breakpoints.only('lg')]: {
      width: '960px'
    },
    [theme.breakpoints.only('md')]: {
      width: '800px'
    },
    [theme.breakpoints.down('sm')]: {
      width: '100vw'
    }
  }
}));

export type DrawerContextProps = {
  closeGlobalDrawer: () => void;
  setGlobalDrawer: (elements: React.ReactElement<any>) => void;
  setGlobalDrawerCallback: (callback: () => void) => void;
};

export interface HighlightProviderProps {
  children: React.ReactNode;
}

export const DrawerContext = React.createContext<DrawerContextProps>(null);

function DrawerProvider(props: HighlightProviderProps) {
  const { children } = props;
  const [globalDrawer, setGlobalDrawer] = useState(null);
  const [globalDrawerCallback, setGlobalDrawerCallback] = useState(undefined);
  const theme = useTheme();
  const classes = useStyles();
  const isMD = useMediaQuery(theme.breakpoints.only('md'));
  const isLG = useMediaQuery(theme.breakpoints.only('lg'));
  const isXL = useMediaQuery(theme.breakpoints.only('xl'));

  const drawerWidth = isXL ? '42vw' : isLG ? '960px' : isMD ? '800px' : '100vw';
  const closeGlobalDrawer = () => {
    if (globalDrawerCallback) globalDrawerCallback();
    setGlobalDrawer(null);
  };

  return (
    <DrawerContext.Provider
      value={{
        closeGlobalDrawer,
        setGlobalDrawer,
        setGlobalDrawerCallback
      }}
    >
      <div className={classes.appMain}>
        {useMemo(
          () => (
            <div className={classes.appContent}>{children}</div>
          ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [children]
        )}
        <Drawer
          open={globalDrawer !== null}
          className={classes.appRightDrawer}
          style={{ width: globalDrawer ? drawerWidth : 0 }}
          classes={{ paper: classes.paper }}
          anchor="right"
          variant={isXL ? 'persistent' : 'temporary'}
          onClose={closeGlobalDrawer}
        >
          <div id="drawerTop" style={{ padding: theme.spacing(1) }}>
            <IconButton onClick={closeGlobalDrawer}>
              <CloseOutlinedIcon />
            </IconButton>
          </div>
          <div style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>{globalDrawer}</div>
        </Drawer>
      </div>
    </DrawerContext.Provider>
  );
}

export default DrawerProvider;
