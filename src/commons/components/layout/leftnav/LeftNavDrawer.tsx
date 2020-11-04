/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  Box,
  ClickAwayListener,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Toolbar,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import withWidth, { isWidthDown } from '@material-ui/core/withWidth';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import clsx from 'clsx';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import LeftNavGroup from 'commons/components/layout/leftnav/LeftNavGroup';
import LeftNavItem from 'commons/components/layout/leftnav/LeftNavItem';
import { ValidatedProp } from 'commons/components/user/UserProvider';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AppTitle from '../topnav/AppTitle';

const drawerWidth = 240;

export const useStyles = makeStyles(theme => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    '@media print': {
      display: 'none !important'
    }
  },
  drawerOver: {
    overflowX: 'hidden'
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: 'hidden',
    width: 0,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(7) + 1
    },
    [theme.breakpoints.only('xs')]: {
      border: 'none'
    }
  },
  toolbar: {
    [theme.breakpoints.up('xs')]: {
      padding: 0
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
  toggler: {
    height: '100%',
    width: '100%',
    '&:hover': {
      cursor: 'pointer'
    }
  }
}));

export type LeftNavElement = {
  type: 'item' | 'group' | 'divider';
  element: LeftNavItemProps | LeftNavGroupProps | null;
};

export type LeftNavItemProps = {
  id: number | string;
  text: string;
  userPropValidators?: ValidatedProp[];
  icon?: React.ReactElement<any>;
  route?: string;
  nested?: boolean;
  width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

export type LeftNavGroupProps = {
  open?: boolean;
  id: number | string;
  title: string;
  icon: React.ReactElement<any>;
  items: LeftNavItemProps[];
};

type LeftNavDrawerProps = {
  width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

const LeftNavDrawer: React.FC<LeftNavDrawerProps> = props => {
  const { t } = useTranslation();
  const theme = useTheme();
  const classes = useStyles();
  const { layoutProps, drawerState, currentLayout, toggleDrawer } = useAppLayout();
  const isTopLayout = currentLayout === 'top';
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));

  const onCloseDrawerIfOpen = () => {
    if (isWidthDown('sm', props.width) && drawerState) {
      toggleDrawer();
    }
  };

  const header = (
    <div>
      <Toolbar className={classes.toolbar}>
        <AppTitle />
      </Toolbar>
      <Divider style={{ backgroundColor: isTopLayout && !isXs ? 'transparent' : null }} />
    </div>
  );

  const hide = (
    <List disablePadding>
      <ListItem button key="chevron" onClick={toggleDrawer}>
        <ListItemIcon>{drawerState ? <ChevronLeftIcon /> : <ChevronRightIcon />}</ListItemIcon>
        <ListItemText primary={t('drawer.collapse')} />
      </ListItem>
    </List>
  );

  return (
    <ClickAwayListener mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={onCloseDrawerIfOpen}>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: drawerState,
          [classes.drawerClose]: !drawerState
        })}
        classes={{
          paper: clsx(classes.drawerOver, {
            [classes.drawerOpen]: drawerState,
            [classes.drawerClose]: !drawerState
          })
        }}
      >
        {drawerState ? (
          header
        ) : (
          <Tooltip title={layoutProps.appName} aria-label={layoutProps.appName} placement="right">
            {header}
          </Tooltip>
        )}
        <List disablePadding>
          {layoutProps.leftnav.elements.map((e, i) => {
            const key = `{navel-${i}}`;
            if (e.type === 'item') {
              return <LeftNavItem key={key} {...(e.element as LeftNavItemProps)} />;
            }
            if (e.type === 'group') {
              return <LeftNavGroup key={key} open={drawerState} {...(e.element as LeftNavGroupProps)} />;
            }
            if (e.type === 'divider') {
              return <Divider key={key} />;
            }

            return null;
          })}
        </List>
        <Divider />
        {drawerState ? (
          hide
        ) : (
          <Tooltip title={t('drawer.expand')} aria-label={t('drawer.expand')} placement="right">
            {hide}
          </Tooltip>
        )}
        <Box className={clsx(classes.toggler)} onClick={toggleDrawer} />
      </Drawer>
    </ClickAwayListener>
  );
};

export default withWidth()(LeftNavDrawer);
