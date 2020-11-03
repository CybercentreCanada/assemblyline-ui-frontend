import { AppBar, makeStyles, Slide, Toolbar, useMediaQuery, useTheme } from '@material-ui/core';
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';
import useAppContext from 'commons/components/hooks/useAppContext';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import Breadcrumbs from 'commons/components/layout/breadcrumbs/Breadcrumbs';
import AppSwitcher from 'commons/components/layout/topnav/AppSwitcher';
import QuickSearch from 'commons/components/layout/topnav/QuickSearch';
import ThemeSelectionIcon from 'commons/components/layout/topnav/ThemeSelectionIcon';
import UserProfile from 'commons/components/layout/topnav/UserProfile';
import React from 'react';
import AppTitle from './AppTitle';

const useStyles = makeStyles(theme => ({
  appBarTopLayout: {
    zIndex: theme.zIndex.drawer + 1
  },
  appBar: {
    [theme.breakpoints.only('xs')]: {
      zIndex: theme.zIndex.drawer - 1
    }
  },
  toolbar: {
    [theme.breakpoints.only('xs')]: {}
  },
  menuButton: {
    display: 'none',
    [theme.breakpoints.down('xs')]: {
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
  width: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

const TopBar: React.FC<AppBarProps> = ({ width }) => {
  const {
    currentLayout,
    layoutProps,
    showQuickSearch,
    autoHideAppbar,
    breadcrumbsEnabled,
    appbarState
  } = useAppLayout();
  const theme = useTheme();
  const { getAppbarStyles } = useAppContext();
  const classes = useStyles(currentLayout);
  const isTopLayout = currentLayout === 'top';
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.down('sm'));
  const { elevation, ...appbarStyles } = getAppbarStyles(currentLayout as 'side' | 'top');
  const { left, leftAfterBreadcrumbs } = layoutProps.topnav;

  const renderLeft = () => {
    return (
      <div className={classes.topBarLeft}>
        <AppTitle disabled={!isTopLayout && !isXs} noTitle={isXs} />
        <div className={isTopLayout ? classes.leftSpacer : null} />
        {left}
        {breadcrumbsEnabled && !isSm && <Breadcrumbs />}
        {leftAfterBreadcrumbs}
      </div>
    );
  };

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
          {(isXs || !isSm || left || leftAfterBreadcrumbs) && <div style={{ flexGrow: 1 }} />}
          {showQuickSearch && isWidthUp('sm', width) && <QuickSearch />}
          {layoutProps.topnav.themeSelectionUnder === 'icon' && <ThemeSelectionIcon />}
          {layoutProps.topnav.right}
          <AppSwitcher />
          <UserProfile />
        </Toolbar>
      </AppBar>
    </SlideIn>
  );
};

function SlideIn({ children, show }) {
  return (
    <Slide
      appear={false}
      direction="down"
      in={show}
      mountOnEnter
      unmountOnExit
      onEntered={() => {
        window.dispatchEvent(new CustomEvent('mui.elements.viewport.resize', { detail: { delta: -64 } }));
      }}
      onExited={() => window.dispatchEvent(new CustomEvent('mui.elements.viewport.resize', { detail: { delta: 64 } }))}
    >
      {children}
    </Slide>
  );
}

export default withWidth()(TopBar);
