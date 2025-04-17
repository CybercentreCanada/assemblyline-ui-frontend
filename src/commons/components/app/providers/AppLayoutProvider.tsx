import { CssBaseline, styled, useMediaQuery, useTheme } from '@mui/material';
import { type AppLayoutMode } from 'commons/components/app/AppConfigs';
import { AppStorageKeys } from 'commons/components/app/AppConstants';
import { AppLayoutContext } from 'commons/components/app/AppContexts';
import { AppQuickNav } from 'commons/components/app/AppQuickNav';
import { useAppConfigs, useAppUser } from 'commons/components/app/hooks';
import LeftNavDrawer from 'commons/components/leftnav/LeftNavDrawer';
import AppBar from 'commons/components/topnav/AppBar';
import useLocalStorageItem from 'commons/components/utils/hooks/useLocalStorageItem';
import { type ReactNode, useCallback, useMemo, useState } from 'react';

const { LS_KEY_LAYOUT_MODE } = AppStorageKeys;

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
    overflow: 'unset !important'
  },
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
  const { preferences } = useAppConfigs();
  const user = useAppUser();
  const isSM = useMediaQuery(muiTheme.breakpoints.only('sm'));
  const isPrinting = useMediaQuery('print');

  // Layout related states.
  const [current, setCurrent] = useLocalStorageItem<AppLayoutMode>(LS_KEY_LAYOUT_MODE, preferences.defaultLayout);
  const [layoutReady, setLayoutReady] = useState<boolean>(false);
  const [showMenus, setShowMenus] = useState<boolean>(true);
  const [focus, setFocus] = useState<boolean>(false);

  // Callback to toggle between 'side' and 'top' layouts.
  const toggle = useCallback(() => setCurrent(current === 'top' ? 'side' : 'top'), [current, setCurrent]);

  // Callback to hide topnav and leftnav.
  const hideMenus = useCallback(() => setShowMenus(false), []);

  // Callback to indicate whether the app layout is ready to be fully rendered.
  const setReady = useCallback((isReady: boolean) => setLayoutReady(isReady), []);

  // Union between AppLayoutMode + 'zen'.
  const mode = useMemo(() => {
    return focus ? ('focus' as const) : current;
  }, [focus, current]);

  const showNavs = useMemo(() => {
    return !focus && showMenus;
  }, [focus, showMenus]);

  // Memoize the value of the context provider.
  const context = useMemo(() => {
    return {
      mode,
      ready: layoutReady,
      current: preferences.allowLayoutSelection ? current : preferences.defaultLayout,
      hideMenus,
      setReady,
      toggle,
      setFocus
    };
  }, [
    current,
    mode,
    preferences.allowLayoutSelection,
    preferences.defaultLayout,
    hideMenus,
    layoutReady,
    setReady,
    setFocus,
    toggle
  ]);

  return (
    <AppLayoutContext.Provider value={context}>
      <CssBaseline enableColorScheme />
      <AppQuickNav />

      {
        {
          side: (
            <AppVertical>
              <AppVerticalLeft>{user.isReady() && layoutReady && showNavs && <LeftNavDrawer />}</AppVerticalLeft>
              <AppVerticalRight
                id="app-scrollct"
                style={{ overflow: 'auto', paddingLeft: showNavs && isSM && !isPrinting ? muiTheme.spacing(7) : 0 }}
              >
                {user.isReady() && layoutReady && showNavs && <AppBar />}
                {children}
              </AppVerticalRight>
            </AppVertical>
          ),
          top: (
            <AppHorizontal id="app-scrollct" style={{ overflow: 'auto' }}>
              {user.isReady() && layoutReady && showNavs && <AppBar />}
              <AppVertical>
                <AppVerticalLeft>{user.isReady() && layoutReady && showNavs && <LeftNavDrawer />}</AppVerticalLeft>
                <AppVerticalRight style={{ paddingLeft: showNavs && isSM && !isPrinting ? muiTheme.spacing(7) : 0 }}>
                  {children}
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
