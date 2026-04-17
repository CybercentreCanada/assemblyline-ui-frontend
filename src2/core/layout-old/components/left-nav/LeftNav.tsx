import { ChevronRight, Menu } from '@mui/icons-material';
import {
  ClickAwayListener,
  Divider,
  Drawer,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useAppConfig, useAppSetConfig } from 'core/config';
import { AppLogo } from 'core/layout';
import { AppListItemLink } from 'core/router/navigate/navigate.components';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'ui/Tooltip';
import { closeLeftNavDrawer, toggleLeftNavDrawer } from '../../layout.utils';
import { LeftNavMenuRoot } from './LeftNavItem';

const StyledDrawer = styled(Drawer, { shouldForwardProp: prop => prop !== 'open' && prop !== 'width' })<{
  open: boolean;
  width: number;
}>(({ theme, open, width }) => ({
  width,
  flexShrink: 0,
  heigth: '100%',
  whiteSpace: 'nowrap',
  '@media print': {
    display: 'none !important'
  },
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  ...(!open && {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: 'hidden',
    width: 0,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(7)
    },
    [theme.breakpoints.only('xs')]: {
      border: 'none'
    }
  }),
  '& .MuiDrawer-paper': {
    width,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    ...(!open && {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      width: 0,
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(7)
      },
      [theme.breakpoints.only('xs')]: {
        border: 'none'
      }
    })
  }
}));

StyledDrawer.displayName = 'StyledDrawer';

//*****************************************************************************************
// LeftNavHeader
//*****************************************************************************************
export const LeftNavHeader = React.memo(() => {
  const theme = useTheme();

  const appName = useAppConfig(s => s.app.name);
  const appLink = useAppConfig(s => s.app.link);
  const leftNavOpen = useAppConfig(s => s.layout.leftNav.open);
  const isSideLayout = useAppConfig(s => s.layout.mode === 'side');

  const isXs = useMediaQuery(theme.breakpoints.only('xs'));

  return (
    <>
      <Tooltip
        id="app-leftnav-header"
        title={leftNavOpen ? null : appName}
        aria-label={appName}
        placement="right"
        noDiv
        slotProps={{ popper: { disablePortal: false } }}
      >
        <AppListItemLink path={appLink} variant="to" panel={0} params={null} sx={{ flex: 0, minHeight: '64px' }}>
          <ListItemIcon children={isXs ? <Menu /> : <AppLogo />} />
          <ListItemText primary={appName} slotProps={{ primary: { fontSize: '1.5rem', letterSpacing: -1 } }} />
        </AppListItemLink>
      </Tooltip>

      {isSideLayout && <Divider />}
    </>
  );
});

LeftNavHeader.displayName = 'LeftNavHeader';

//*****************************************************************************************
// LeftNavFooter
//*****************************************************************************************
export const LeftNavFooter = React.memo(() => {
  const { t } = useTranslation(['layout']);

  const leftNavOpen = useAppConfig(s => s.layout.leftNav.open);
  const setStore = useAppSetConfig();

  const handleToggle = useCallback(() => setStore(s => toggleLeftNavDrawer(s)), [setStore]);

  return (
    <>
      <Divider />

      <Tooltip
        id="app-leftnav-footer"
        title={leftNavOpen ? null : t('drawer.expand')}
        aria-label={leftNavOpen ? t('drawer.collapse') : t('drawer.expand')}
        placement="right"
        noDiv
        slotProps={{ popper: { disablePortal: false } }}
      >
        <ListItem disablePadding>
          <ListItemButton onClick={handleToggle} sx={{ minHeight: 48 }}>
            <ListItemIcon>
              <ChevronRight
                sx={theme => ({
                  transition: theme.transitions.create('transform', {
                    easing: theme.transitions.easing.sharp,
                    duration: leftNavOpen
                      ? theme.transitions.duration.leavingScreen
                      : theme.transitions.duration.enteringScreen
                  }),
                  transform: leftNavOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                })}
              />
            </ListItemIcon>
            <ListItemText primary={t('drawer.collapse')} />
          </ListItemButton>
        </ListItem>
      </Tooltip>
    </>
  );
});

LeftNavFooter.displayName = 'LeftNavFooter';

//*****************************************************************************************
// AppLeftNav
//*****************************************************************************************
export const AppLeftNav = React.memo(() => {
  const theme = useTheme();

  const leftNavOpen = useAppConfig(s => s.layout.leftNav.open);
  const leftNavWidth = useAppConfig(s => s.layout.leftNav.width);
  const setStore = useAppSetConfig();

  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = useCallback(
    () => (!isSmDown ? null : setStore(s => closeLeftNavDrawer(s))),
    [isSmDown, setStore]
  );
  const handleToggle = useCallback(() => setStore(s => toggleLeftNavDrawer(s)), [setStore]);

  return (
    <ClickAwayListener mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={handleClose}>
      <StyledDrawer
        open={leftNavOpen}
        width={leftNavWidth}
        variant="permanent"
        slotProps={{
          root: {
            sx: {
              height: '100%'
            }
          },
          paper: {
            elevation: 1,
            sx: { display: 'flex', flexDirection: 'column' }
          }
        }}
      >
        <LeftNavHeader />
        <LeftNavMenuRoot />
        <div onClick={handleToggle} style={{ flexGrow: 1, cursor: 'pointer' }} />
        <LeftNavFooter />
      </StyledDrawer>
    </ClickAwayListener>
  );
});

AppLeftNav.displayName = 'AppLeftNav';
