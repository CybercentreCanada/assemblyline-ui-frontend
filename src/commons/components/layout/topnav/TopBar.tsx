import { AppBar, Slide, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { APPBAR_READY_EVENT } from 'commons/components/hooks/useAppBarHeight';
import useAppContext from 'commons/components/hooks/useAppContext';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import Breadcrumbs from 'commons/components/layout/breadcrumbs/Breadcrumbs';
import AppSwitcher, { AppElement } from 'commons/components/layout/topnav/AppSwitcher';
import QuickSearch from 'commons/components/layout/topnav/QuickSearch';
import ThemeSelectionIcon from 'commons/components/layout/topnav/ThemeSelectionIcon';
import UserProfile from 'commons/components/layout/topnav/UserProfile';
import React, { useLayoutEffect } from 'react';
import AppTitle from './AppTitle';

// FIXME checkout https://mui.com/components/use-media-query/#migrating-from-withwidth
const withWidth = () => (WrappedComponent) => (props) => <WrappedComponent {...props} width="xs" />;

const useStyles = makeStyles(theme => ({
  appBarTopLayout: {
    zIndex: theme.zIndex.drawer + 1
  },
  appBar: {
    '@media print': {
      display: 'none !important'
    },
    [theme.breakpoints.only('xs')]: {
      zIndex: theme.zIndex.drawer - 1
    }
  },
  toolbar: {
    [theme.breakpoints.only('xs')]: {}
  },
  menuButton: {
    display: 'none',
    [theme.breakpoints.down('md')]: {
      display: 'inline-block'
    }
  },
  topBarLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  leftSpacer: {
    marginLeft: theme.spacing(3)
  }
}));

type AppBarProps = {
  apps: AppElement[];
  width: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

const TopBar: React.FC<AppBarProps> = ({ apps, width }) => {
  const { currentLayout, layoutProps, showQuickSearch, autoHideAppbar, breadcrumbsEnabled, appbarState } =
    useAppLayout();
  const theme = useTheme();
  const { getAppbarStyles } = useAppContext();
  const classes = useStyles(currentLayout);
  const isTopLayout = currentLayout === 'top';
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.down('lg'));
  const { elevation, ...appbarStyles } = getAppbarStyles(currentLayout as 'side' | 'top');
  const { left, leftAfterBreadcrumbs } = layoutProps.topnav;

  // Once the dom is mounted, dispatch event to let listeners know
  //  that the apppbar/topbar dom is available.
  // Primary usecase if to initialize the 'useAppBarHeight' hook
  //  which didn't initialize properly because it will typically be
  //  call before the appbar is ready, because the appbar/top bar
  //  is conditionally rendered on app/user ready state.
  useLayoutEffect(() => {
    window.dispatchEvent(new CustomEvent(APPBAR_READY_EVENT));
  }, []);

  const renderLeft = () => (
    <div className={classes.topBarLeft}>
      <AppTitle disabled={!isTopLayout && !isXs} noTitle={isXs} />
      <div className={isTopLayout ? classes.leftSpacer : null} />
      {left}
      {breadcrumbsEnabled && !isSm && <Breadcrumbs />}
      {leftAfterBreadcrumbs}
    </div>
  );

  const autoHide = !isTopLayout && autoHideAppbar;

  return (
    <SlideIn show={appbarState}>
      <AppBar
        elevation={elevation}
        position={autoHide && !isTopLayout ? 'relative' : 'sticky'}
        id="appbar"
        className={`${classes.appBar} ${isTopLayout && classes.appBarTopLayout}`}
        style={appbarStyles}
      >
        <Toolbar
          disableGutters
          className={classes.toolbar}
          style={{ paddingLeft: !isXs && !isTopLayout ? theme.spacing(2) : null, paddingRight: theme.spacing(1) }}
        >
          {renderLeft()}
          {(isXs ||
            left ||
            leftAfterBreadcrumbs ||
            (breadcrumbsEnabled && !isSm) ||
            (!showQuickSearch && !breadcrumbsEnabled) ||
            (!showQuickSearch && breadcrumbsEnabled && isSm)) && <div style={{ flexGrow: 1 }} />}
          {showQuickSearch && isWidthUp('sm', width) && <QuickSearch />}
          {layoutProps.topnav.right}
          <AppSwitcher apps={apps} />
          {layoutProps.topnav.themeSelectionUnder === 'icon' && <ThemeSelectionIcon />}
          <UserProfile />
        </Toolbar>
      </AppBar>
    </SlideIn>
  );
};

function SlideIn({ children, show }) {
  return (
    <Slide appear={false} direction="down" in={show} mountOnEnter unmountOnExit>
      {children}
    </Slide>
  );
}

export default withWidth()(TopBar);
