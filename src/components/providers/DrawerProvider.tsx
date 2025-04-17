import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DoubleArrowOutlinedIcon from '@mui/icons-material/DoubleArrowOutlined';
import { Drawer, IconButton, styled, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const GD_EVENT_PREVENTED = 'GlobalDrawerClose.Prevented';
export const GD_EVENT_PROCEED = 'GlobalDrawerClose.Proceed';
const XLWidth = '45vw';
const LGWidth = '75%';
const MDWidth = '85%';
const SMWidth = '100%';
const MAXIMIZE_CLASS = 'maximize';

const AppMain = styled('div')(({ theme }) => ({
  '@media print': {
    overflow: 'unset !important'
  },
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  position: 'relative',
  overflowX: 'hidden',
  '-webkit-transform': 'translate3d(0, 0, 0)'
}));

const AppContent = styled('div')(({ theme }) => ({
  '@media print': {
    overflow: 'unset !important'
  },
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  flex: 1,
  height: '100%',
  overflowX: 'hidden'
}));

export type DrawerContextProps = {
  closeGlobalDrawer: () => void;
  closeTemporaryDrawer: () => void;
  setGlobalDrawer: (elements: React.ReactElement<any>, options?: { hasMaximize?: boolean }) => void;
  setDrawerClosePrompt: (boolean) => void;
  subscribeCloseDrawer: (callback: () => void) => () => boolean;
  globalDrawer: React.ReactElement<any>;
  globalDrawerOpened: boolean;
};

export interface DrawerProviderProps {
  children: React.ReactNode;
}

export const DrawerContext = React.createContext<DrawerContextProps>(null);

function DrawerProvider({ children }: DrawerProviderProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.only('md'));
  const isLG = useMediaQuery(theme.breakpoints.only('lg'));
  const isXL = useMediaQuery(theme.breakpoints.only('xl'));

  const [globalDrawer, setGlobalDrawerState] = useState<any>(null);
  const [globalDrawerOpened, setGlobalDrawerOpened] = useState<boolean>(false);
  const [drawerClosePrompt, setDrawerClosePrompt] = useState<boolean>(false);
  const [nextDrawer, setNextDrawer] = useState<any>(null);
  const [isMaximized, setIsMaximized] = useState<boolean>(null);

  const subscribers = useRef(new Set<() => void>());

  const drawerWidth = isXL ? XLWidth : isLG ? LGWidth : isMD ? MDWidth : SMWidth;

  const setGlobalDrawer = useCallback(
    (newDrawer, options = { hasMaximize: false }) => {
      if (drawerClosePrompt) {
        setNextDrawer(newDrawer);
        window.dispatchEvent(new CustomEvent(GD_EVENT_PREVENTED));
      } else {
        setNextDrawer(null);
        setGlobalDrawerState(newDrawer);
        setIsMaximized(options?.hasMaximize ? false : null);
      }
    },
    [drawerClosePrompt]
  );

  useEffect(() => {
    function proceedWithDrawerChange(event: CustomEvent) {
      setNextDrawer(null);
      setGlobalDrawerState(nextDrawer);
    }
    window.addEventListener(GD_EVENT_PROCEED, proceedWithDrawerChange);
    return () => {
      window.removeEventListener(GD_EVENT_PROCEED, proceedWithDrawerChange);
    };
  }, [nextDrawer]);

  useEffect(() => {
    setGlobalDrawerOpened(globalDrawer !== null);
  }, [globalDrawer]);

  const closeGlobalDrawer = useCallback(() => {
    subscribers.current.forEach(callback => callback());
    setGlobalDrawer(null);
  }, [setGlobalDrawer]);

  const closeTemporaryDrawer = useCallback(() => {
    if (!isXL) setGlobalDrawer(null);
  }, [isXL, setGlobalDrawer]);

  const subscribeCloseDrawer = useCallback((callback: () => void) => {
    subscribers.current.add(callback);
    return () => subscribers.current.delete(callback);
  }, []);

  return (
    <DrawerContext.Provider
      value={{
        closeGlobalDrawer,
        closeTemporaryDrawer,
        setGlobalDrawer,
        setDrawerClosePrompt,
        subscribeCloseDrawer,
        globalDrawer,
        globalDrawerOpened
      }}
    >
      <AppMain id="globalDrawer">
        {useMemo(
          () => (
            <AppContent>{children}</AppContent>
          ),
          [children]
        )}
        <Drawer
          open={globalDrawerOpened}
          anchor="right"
          variant={isXL ? 'persistent' : 'temporary'}
          style={{ width: globalDrawer ? drawerWidth : 0 }}
          ModalProps={{ disableEnforceFocus: true }}
          onClose={closeGlobalDrawer}
          slotProps={{
            root: {
              sx: {
                '@media print': {
                  display: 'none'
                },
                transition: 'width 225ms cubic-bezier(0, 0, 0.2, 1) 0ms'
              }
            },
            paper: {
              className: isMaximized && MAXIMIZE_CLASS,
              sx: {
                transition: `${theme.transitions.create(['all'])} !important`,
                [theme.breakpoints.only('xl')]: {
                  width: XLWidth
                },
                [theme.breakpoints.only('lg')]: {
                  width: LGWidth
                },
                [theme.breakpoints.only('md')]: {
                  width: MDWidth
                },
                [theme.breakpoints.down('md')]: {
                  width: SMWidth
                },
                [`&.${MAXIMIZE_CLASS}`]: {
                  width: '90vw'
                }
              }
            }
          }}
        >
          {useMemo(
            () => (
              <>
                <div
                  id="drawerTop"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    columnGap: theme.spacing(1),
                    backgroundColor: theme.palette.background.paper,
                    padding: theme.spacing(1),
                    position: 'sticky',
                    top: 0,
                    zIndex: 5
                  }}
                >
                  <IconButton size="large" onClick={closeGlobalDrawer} children={<CloseOutlinedIcon />} />
                  {isXL && isMaximized !== null && (
                    <Tooltip title={isMaximized ? t('drawer.minimize') : t('drawer.maximize')}>
                      <IconButton size="large" onClick={() => setIsMaximized(v => !v)}>
                        <DoubleArrowOutlinedIcon
                          className={isMaximized && MAXIMIZE_CLASS}
                          sx={{
                            transform: 'rotate(180deg)',
                            transition: theme.transitions.create(['all']),
                            [`&.${MAXIMIZE_CLASS}`]: {
                              transform: 'rotate(0deg)'
                            }
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
                <div
                  id="drawerContent"
                  style={{
                    height: '100%',
                    paddingLeft: theme.spacing(2),
                    paddingRight: theme.spacing(2)
                  }}
                >
                  {globalDrawer}
                </div>
              </>
            ),
            [t, closeGlobalDrawer, isXL, isMaximized, globalDrawer]
          )}
        </Drawer>
      </AppMain>
    </DrawerContext.Provider>
  );
}

export default DrawerProvider;
