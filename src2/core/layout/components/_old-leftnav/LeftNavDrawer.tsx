import { ChevronRight } from '@mui/icons-material';
import {
  Box,
  ClickAwayListener,
  Divider,
  Drawer,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Stack,
  Toolbar,
  Tooltip,
  styled,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppLayout, useAppLeftNav, useAppPreferences } from '../app/hooks';
import { LeftNavMenuRoot } from '../leftnav/v2/LeftNavMenu';
import { MODULE_NAME } from '../name';
import { OverlayShadow } from '../overlay/OverlayShadow';
import { AppName } from '../topnav/AppName';

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

const LeftNavHeader = () => {
  const theme = useTheme();
  const layout = useAppLayout();
  const isTopLayout = layout.current === 'top';

  return (
    <OverlayShadow region="layout" id="app-brand">
      <Toolbar
        sx={{
          [theme.breakpoints.up('xs')]: {
            padding: 0
          }
        }}
      >
        <AppName />
      </Toolbar>
      {!isTopLayout && <Divider />}
    </OverlayShadow>
  );
};

const LeftNavFooter = () => {
  const leftnav = useAppLeftNav();
  const { t } = useTranslation(MODULE_NAME);

  const onToggle = useCallback(() => {
    if (!leftnav.open) {
      leftnav.collapseMenus();
    }
    leftnav.toggle();
  }, [leftnav]);

  return (
    <Tooltip
      title={t(leftnav.open ? 'drawer.collapse' : 'drawer.expand')}
      aria-label={t(leftnav.open ? 'drawer.collapse' : 'drawer.expand')}
      placement="right"
      style={{ alignSelf: 'flex-start' }}
      id="app-leftnav-footer"
    >
      <ListItem disablePadding>
        <ListItemButton key="chevron" onClick={onToggle} sx={{ minHeight: 48 }}>
          <ListItemIcon>
            <ChevronRight
              sx={theme => ({
                transform: leftnav.open && 'rotate(180deg)',
                transition: theme.transitions.create('transform', {
                  easing: theme.transitions.easing.sharp,
                  duration: leftnav.open
                    ? theme.transitions.duration.leavingScreen
                    : theme.transitions.duration.enteringScreen
                })
              })}
            />
          </ListItemIcon>
        </ListItemButton>
      </ListItem>
    </Tooltip>
  );
};

const LeftNavDrawer = () => {
  const theme = useTheme();
  const leftnav = useAppLeftNav();

  const { leftnav: leftnavPreference } = useAppPreferences();

  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const onCloseDrawerIfOpen = useCallback(() => {
    if (isSmDown && leftnav.open) {
      leftnav.setOpen(false);
    }
  }, [isSmDown, leftnav]);

  const onToggle = useCallback(() => {
    if (!leftnav.open) {
      leftnav.collapseMenus();
    }
    leftnav.toggle();
  }, [leftnav]);

  return (
    <ClickAwayListener mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={onCloseDrawerIfOpen}>
      <StyledDrawer
        slotProps={{
          paper: {
            elevation: 1,
            style: { display: 'flex', flexDirection: 'column' }
          }
        }}
        variant="permanent"
        style={{ height: '100%' }}
        width={leftnavPreference.width}
        open={leftnav.open}
      >
        <LeftNavHeader />

        <Stack
          sx={{
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          <OverlayShadow region="layout" id="app-leftnav-menus">
            <LeftNavMenuRoot />
          </OverlayShadow>
        </Stack>

        <Box
          sx={{
            flexGrow: 1,
            '&:hover': {
              cursor: 'pointer'
            }
          }}
          onClick={onToggle}
        />

        <Divider />

        <LeftNavFooter />
      </StyledDrawer>
    </ClickAwayListener>
  );
};

export default LeftNavDrawer;
