import { Menu } from '@mui/icons-material';
import { Box, AppBar as MuiAppBar, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { useAppConfig, useAppSetConfig } from 'core/config';
import { toggleLeftNavOpen } from 'core/layout/layout.utils';
import React, { useCallback, useLayoutEffect, useMemo, type FC, type PropsWithChildren } from 'react';
import { IconButton } from 'ui/buttons/IconButton';
import { AppUserMenu } from './UserMenu';
// import { useAppBar, useAppBreadcrumbs, useAppLayout, useAppPreferences, useAppQuickSearch } from '../app/hooks';
// import { APPBAR_READY_EVENT } from '../app/hooks/useAppBarHeight';
// import { AppBreadcrumbs } from '../breadcrumbs/AppBreadcrumbs';
// import { OverlayShadow } from '../overlay/OverlayShadow';
// import { AppSearch } from '../search/AppSearch';
// import { AppName } from '../topnav/AppName';
// import ThemeSelectionIcon from '../topnav/theme/ThemeSelectionIcon';
// import { UserProfile } from '../topnav/user/UserProfile';

const SlotOverlayShadow: FC<PropsWithChildren & { id: string }> = ({ id, children }) => {
  return (
    <OverlayShadow display="flex" flexDirection="row" alignItems="center" region="slot" id={id}>
      {children}
    </OverlayShadow>
  );
};

export const AppBarBase: FC<PropsWithChildren> = ({ children }) => {
  // const layout = useAppLayout();
  // const appbar = useAppBar();

  const isTopLayout = useAppConfig(s => s.layout.mode === 'top');
  const isSideLayout = useAppConfig(s => s.layout.mode === 'side');
  const autoHide = useAppConfig(s => s.layout.mode !== 'top' && s.layout.topBar.autoHide);

  const elevation = useMemo(() => (isSideLayout ? 0 : 1), [isSideLayout]);

  return (
    <MuiAppBar
      data-layout-region="layout"
      data-layout-id="app-topnav"
      id="appbar"
      position={autoHide && !isTopLayout ? 'relative' : 'sticky'}
      elevation={elevation}
      sx={theme => ({
        '@media print': {
          display: 'none !important'
        },
        [theme.breakpoints.only('xs')]: {
          zIndex: theme.zIndex.drawer - 1
        },

        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.paper,

        ...(isTopLayout
          ? {
              zIndex: theme.zIndex.drawer + 1
            }
          : {})
      })}
    >
      {children}
    </MuiAppBar>
  );
};

export const AppTopBar = React.memo(() => {
  const theme = useTheme();

  const isTopLayout = useAppConfig(s => s.layout.mode === 'top');
  const setConfig = useAppSetConfig();

  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));

  const handleSetLeftNavOpen = useCallback(() => setConfig(s => toggleLeftNavOpen(s)), []);

  return (
    <AppBarBase>
      <Toolbar
        disableGutters
        style={{
          paddingLeft: !isXs && !isTopLayout ? theme.spacing(2) : null,
          paddingRight: theme.spacing(1)
        }}
      >
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          {!isTopLayout && !isXs ? null : (
            <IconButton
              size="large"
              onClick={handleSetLeftNavOpen}
              sx={{ margin: `${theme.spacing(1)} ${theme.spacing(0.5)}` }}
            >
              <Menu />
            </IconButton>
          )}

          {!isTopLayout && !isXs ? null : 'what'}

          <div style={{ flex: 1 }} />

          <AppUserMenu />
        </div>
        <div style={{ flex: 1 }} />
      </Toolbar>
    </AppBarBase>
  );

  // React Hooks.
  const muiTheme = useTheme();

  // TUI hooks.
  const layout = useAppLayout();
  const breadcrumbs = useAppBreadcrumbs();
  const quicksearch = useAppQuickSearch();
  const { topnav } = useAppPreferences();

  // media queries.
  // const isXs = useMediaQuery(muiTheme.breakpoints.only('xs'));
  // const isMdDown = useMediaQuery(muiTheme.breakpoints.down('md'));

  // compute some flags we need to perform render.
  // const isTopLayout = layout.current === 'top';
  const showBreadcrumbs = breadcrumbs.show && !isMdDown;

  // Once the dom is mounted, dispatch event to let listeners know
  //  that the apppbar/topbar dom is available.
  // Primary usecase is to initialize the 'useAppBarHeight' hook.
  // That value doesn't initialize properly because it typically gets
  //  called before the appbar is ready.
  // The appbar/top bar is conditionally rendered on app/user ready state.
  useLayoutEffect(() => {
    window.dispatchEvent(new CustomEvent(APPBAR_READY_EVENT));
  }, []);

  const renderLeft = useCallback(
    () => (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        {(isTopLayout || isXs) && <AppName noName={isXs} />}
        <Box sx={{ ...(isTopLayout && { marginLeft: 3 }) }} />
        <SlotOverlayShadow id="topnav.slots.left">{topnav.slots?.left}</SlotOverlayShadow>
        <SlotOverlayShadow id="topnav.slots.breadcrumbs.left">{topnav.slots?.breadcrumbs?.left}</SlotOverlayShadow>
        {showBreadcrumbs && <AppBreadcrumbs />}
        <SlotOverlayShadow id="topnav.slots.breadcrumbs.right">{topnav.slots?.breadcrumbs?.right}</SlotOverlayShadow>
      </Box>
    ),
    [topnav.slots, showBreadcrumbs, isXs, isTopLayout]
  );

  return (
    <AppBarBase>
      <Toolbar
        disableGutters
        style={{
          paddingLeft: !isXs && !isTopLayout ? muiTheme.spacing(2) : null,
          paddingRight: muiTheme.spacing(1)
        }}
      >
        {renderLeft()}
        <div style={{ flex: 1 }} />

        <SlotOverlayShadow id="topnav.slots.search.left">{topnav.slots?.search?.left}</SlotOverlayShadow>
        {quicksearch.show && <AppSearch />}
        <SlotOverlayShadow id="topnav.slots.search.right">{topnav.slots?.search?.right}</SlotOverlayShadow>
        {topnav.themeSelectionMode === 'icon' && <ThemeSelectionIcon />}
        {!topnav.hideUserAvatar && <UserProfile />}
        <SlotOverlayShadow id="topnav.slots.right">{topnav.slots?.right}</SlotOverlayShadow>
      </Toolbar>
    </AppBarBase>
  );
});

AppTopBar.displayName = 'AppTopBar';
