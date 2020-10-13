import { AppBar, IconButton, makeStyles, Slide, Toolbar, useTheme } from '@material-ui/core';
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';
import MenuIcon from '@material-ui/icons/Menu';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import useTopBarScrollTrigger from 'commons/components/hooks/useTopBarScrollTrigger';
import Breadcrumbs from 'commons/components/layout/breadcrumbs/Breadcrumbs';
import AppSwitcher from 'commons/components/layout/topnav/AppSwitcher';
import QuickSearch from 'commons/components/layout/topnav/QuickSearch';
import ThemeSelectionIcon from 'commons/components/layout/topnav/ThemeSelectionIcon';
import UserProfile from 'commons/components/layout/topnav/UserProfile';
import React from 'react';
import { Link } from 'react-router-dom';

function HideOnScroll({ children, enabled }) {
  const trigger = useTopBarScrollTrigger();
  return enabled ? (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  ) : (
    <>{children}</>
  );
}

const useStyles = (layout, drawerState) => {
  return makeStyles(theme => ({
    appBar: {
      zIndex: layout === 'top' ? theme.zIndex.drawer + 1 : theme.zIndex.drawer - 1,
      backgroundColor: theme.palette.background.default,
      color: theme.palette.action.active,
      [theme.breakpoints.up('sm')]: {
        color: theme.palette.action.active,
        marginLeft: theme.spacing(7) + 1
      },
      '@media print': {
        display: 'none !important'
      }
    },
    toolbar: {
      paddingRight: theme.spacing(2),
      [theme.breakpoints.only('xs')]: {
        paddingLeft: theme.spacing(2)
      }
    },
    title: {
      alignItems: 'center',
      display: 'inline-flex',
      flex: '0 0 auto',
      fontSize: '1.5rem',
      letterSpacing: '-1px',
      textDecoration: 'none',
      color: theme.palette.text.primary
    },
    menuButton: {
      display: 'none',
      [theme.breakpoints.down('xs')]: {
        display: 'inline-block'
      }
    },
    icon: {
      display: 'flex',
      padding: '0 10px',
      [theme.breakpoints.down('xs')]: {
        display: 'none'
      }
    },
    leftSpacer: {
      transition: theme.transitions.create('margin-left', {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.short
      }),
      marginLeft: layout === 'side' ? (drawerState ? theme.spacing(7) + 240 - 56 : theme.spacing(7)) : theme.spacing(3),
      overflow: 'auto',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 0
      }
    }
  }))();
};

type AppBarProps = {
  width: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

const TopBar: React.FC<AppBarProps> = ({ width }) => {
  const theme = useTheme();
  const {
    currentLayout,
    layoutProps,
    showQuickSearch,
    autoHideAppbar,
    breadcrumbsEnabled,
    breadcrumbsPlacement,
    drawerState,
    getLogo,
    toggleDrawer
  } = useAppLayout();
  const classes = useStyles(currentLayout, drawerState);
  const isTopLayout = currentLayout === 'top';

  const renderTitle = () => {
    if (currentLayout === 'top') {
      return (
        <Link className={classes.title} to="/">
          <div className={classes.icon}>{getLogo(theme)}</div>
          <div style={{ display: 'flex' }}>{layoutProps.appName}</div>
        </Link>
      );
    }
    return null;
  };

  return (
    <HideOnScroll enabled={!isTopLayout && autoHideAppbar}>
      <AppBar elevation={isTopLayout ? 2 : 0} position="fixed" className={classes.appBar} id="appbar">
        <Toolbar disableGutters={isTopLayout} className={classes.toolbar}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            edge="start"
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          {renderTitle()}
          <div className={classes.leftSpacer} />
          {layoutProps.topnav.left}
          {layoutProps.allowBreadcrumbs && breadcrumbsEnabled && breadcrumbsPlacement === 'topbar' && <Breadcrumbs />}

          {layoutProps.allowQuickSearch && showQuickSearch && isWidthUp('sm', width) ? (
            <QuickSearch />
          ) : (
            <div style={{ flexGrow: 1 }} />
          )}
          {layoutProps.topnav.themeSelectionUnder === 'icon' && <ThemeSelectionIcon />}
          <AppSwitcher />
          <UserProfile />
          {layoutProps.topnav.right}
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
};

export default withWidth()(TopBar);
