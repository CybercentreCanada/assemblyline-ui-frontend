import { CssBaseline, styled, useMediaQuery, useTheme } from '@mui/material';
import { AppCommands } from '../../commands/AppCommands';
import type { TuiCookiesStore } from '../../cookies';
import { useCookiesStore } from '../../cookies/hooks/useCookiesStore';
import { AppFocusControl } from '../../focus/AppFocusControl';
import LeftNavDrawer from '../../leftnav/LeftNavDrawer';
import AppBar from '../../topnav/AppBar';
import { AppLayoutContext } from '../AppContexts';
import { useAppUser } from '../hooks';

import { type ReactNode, type SetStateAction, useCallback, useMemo, useState } from 'react';
import { OverlayShadow } from '../../overlay/OverlayShadow';

const AppHorizontal = styled('div')({
  '@media print': {
    overflow: 'unset !important'
  },
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
});

const AppVertical = styled('div')({
  height: '100%',
  display: 'flex',
  flexDirection: 'row',
  position: 'relative'
});

const AppVerticalLeft = styled('div')(({ theme }) => ({
  height: '100%',
  [theme.breakpoints.down('md')]: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0
  }
}));

const AppVerticalRight = styled('div')({
  '@media print': {
    overflow: 'unset !important',
    paddingLeft: 'unset !important'
  },
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  flex: 1,
  height: '100%',
  minWidth: 0
});

const AppContent = styled(OverlayShadow)({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  flex: 1,
  height: '100%',
  minWidth: 0
});

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayoutProvider = ({ children }: AppLayoutProps) => {
  const muiTheme = useTheme();
  const user = useAppUser();
  const isSM = useMediaQuery(muiTheme.breakpoints.only('sm'));

  const current = useCookiesStore(state => state.layout);
  const setCurrent = useCookiesStore((state: TuiCookiesStore) => state.setLayout);

  const [ready, setReady] = useState<boolean>(false);
  const [showMenus, setShowMenus] = useState<boolean>(true);
  const [focus, setFocus] = useState<boolean>(false);
  const [quicknav, setQuicknav] = useState<boolean>(false);
  const [focusctrl, setFocusctrl] = useState<{ open: boolean; flexDirection: 'row' | 'column' }>({
    open: false,
    flexDirection: 'row'
  });

  // Callback to toggle between 'side' and 'top' layouts.
  const toggle = useCallback(() => setCurrent(current === 'top' ? 'side' : 'top'), [current, setCurrent]);

  // Union between AppLayoutMode + 'focus'.
  const mode = useMemo(() => {
    return focus ? ('focus' as const) : current;
  }, [focus, current]);

  const showNavs = useMemo(() => {
    return !focus && showMenus;
  }, [focus, showMenus]);

  const _setFocus = useCallback(
    (value: SetStateAction<boolean>) => {
      const nextValue = typeof value === 'function' ? value(focus) : value;
      setFocus(nextValue);
      setFocusctrl(_focusctrl => ({ ..._focusctrl, open: nextValue }));
    },
    [focus]
  );

  // Memoize the value of the context provider.
  const context = useMemo(() => {
    return {
      initialized: true,
      mode,
      ready,
      current,
      setReady,
      toggle,
      setFocus: _setFocus,
      hideMenus: () => setShowMenus(false),
      showMenus: () => setShowMenus(true)
    };
  }, [current, mode, ready, setReady, toggle, _setFocus]);

  return (
    <AppLayoutContext.Provider value={context}>
      <CssBaseline enableColorScheme />
      {ready && (
        <AppFocusControl
          focus={focus}
          setFocus={_setFocus}
          quicknav={quicknav}
          setQuicknav={setQuicknav}
          focusctrl={focusctrl}
          setFocusctrl={setFocusctrl}
        />
      )}
      {ready && <AppCommands open={quicknav} setOpen={setQuicknav} />}
      {
        {
          side: (
            <AppVertical>
              <AppVerticalLeft>{user.isReady() && ready && showNavs && <LeftNavDrawer />}</AppVerticalLeft>
              <AppVerticalRight
                id="app-scrollct"
                style={{ overflow: 'auto', paddingLeft: showNavs && isSM ? `max(${muiTheme.spacing(7)}, 42px)` : 0 }}
              >
                {user.isReady() && ready && showNavs && <AppBar />}
                <AppContent region="layout" id="app-content">
                  {children}
                </AppContent>
              </AppVerticalRight>
            </AppVertical>
          ),
          top: (
            <AppHorizontal id="app-scrollct" style={{ overflow: 'auto' }}>
              {user.isReady() && ready && showNavs && <AppBar />}
              <AppVertical>
                <AppVerticalLeft>{user.isReady() && ready && showNavs && <LeftNavDrawer />}</AppVerticalLeft>
                <AppVerticalRight style={{ paddingLeft: showNavs && isSM ? `max(${muiTheme.spacing(7)}, 42px)` : 0 }}>
                  <AppContent region="layout" id="app-content">
                    {children}
                  </AppContent>
                </AppVerticalRight>
              </AppVertical>
            </AppHorizontal>
          )
        }[current]
      }
    </AppLayoutContext.Provider>
  );
};

export default AppLayoutProvider;
