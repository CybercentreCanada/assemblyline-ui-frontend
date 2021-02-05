import { Drawer, IconButton, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import React, { useMemo, useState } from 'react';

const XLWidth = '45vw';
const LGWidth = '85%';
const MDWidth = '85%';
const SMWidth = '100%';

const useStyles = makeStyles(theme => ({
  appMain: {
    '@media print': {
      overflow: 'unset !important'
    },
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    overflowX: 'hidden'
  },
  appContent: {
    '@media print': {
      overflow: 'unset !important'
    },
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    flex: 1,
    height: '100%',
    overflowX: 'hidden'
  },
  appRightDrawer: {
    '@media print': {
      display: 'none'
    },
    transition: 'width 225ms cubic-bezier(0, 0, 0.2, 1) 0ms'
  },
  paper: {
    [theme.breakpoints.only('xl')]: {
      width: XLWidth
    },
    [theme.breakpoints.only('lg')]: {
      width: LGWidth
    },
    [theme.breakpoints.only('md')]: {
      width: MDWidth
    },
    [theme.breakpoints.down('sm')]: {
      width: SMWidth
    }
  }
}));

export type DrawerContextProps = {
  closeGlobalDrawer: () => void;
  setGlobalDrawer: (elements: React.ReactElement<any>) => void;
  globalDrawer: React.ReactElement<any>;
};

export interface DrawerProviderProps {
  children: React.ReactNode;
}

export const DrawerContext = React.createContext<DrawerContextProps>(null);

function DrawerProvider(props: DrawerProviderProps) {
  const { children } = props;
  const [globalDrawer, setGlobalDrawer] = useState(null);
  const theme = useTheme();
  const classes = useStyles();
  const isMD = useMediaQuery(theme.breakpoints.only('md'));
  const isLG = useMediaQuery(theme.breakpoints.only('lg'));
  const isXL = useMediaQuery(theme.breakpoints.only('xl'));

  const drawerWidth = isXL ? XLWidth : isLG ? LGWidth : isMD ? MDWidth : SMWidth;
  const closeGlobalDrawer = () => {
    setGlobalDrawer(null);
  };

  return (
    <DrawerContext.Provider
      value={{
        closeGlobalDrawer,
        setGlobalDrawer,
        globalDrawer
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
          style={{
            width: globalDrawer ? drawerWidth : 0,
            zIndex: theme.zIndex.drawer + 100
          }}
          classes={{ paper: classes.paper }}
          anchor="right"
          variant={isXL ? 'persistent' : 'temporary'}
          onClose={closeGlobalDrawer}
        >
          {useMemo(
            () => (
              <>
                <div
                  id="drawerTop"
                  style={{
                    backgroundColor: theme.palette.background.paper,
                    padding: theme.spacing(1),
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                  }}
                >
                  <IconButton onClick={closeGlobalDrawer}>
                    <CloseOutlinedIcon />
                  </IconButton>
                </div>
                <div
                  style={{
                    paddingLeft: theme.spacing(2),
                    paddingRight: theme.spacing(2)
                  }}
                >
                  {globalDrawer}
                </div>
              </>
            ),
            [globalDrawer, theme]
          )}
        </Drawer>
      </div>
    </DrawerContext.Provider>
  );
}

export default DrawerProvider;
