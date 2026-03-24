import { ChevronRight } from '@mui/icons-material';
import {
  Box,
  BoxProps,
  ClickAwayListener,
  Divider,
  Drawer,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Stack,
  styled,
  Toolbar,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useAppConfigStore } from 'core/config';
import { useAppConfigSetStore } from 'core/config/config.providers';
import { t } from 'i18next';
import React, { FC, useCallback, useContext, useMemo, useRef } from 'react';
import { AppLogo } from '../layout.components';

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

export const OverlayShadow: FC<Omit<BoxProps, 'component'> & { region: string; id: string }> = ({
  region,
  id,
  children,
  ...boxProps
}) => {
  return children;

  const ctx = useContext(OverlayContext);

  const ref = useRef<HTMLDivElement | null>(null);

  const enabled = useMemo(() => ctx?.regions.includes(region), [region, ctx?.regions]);

  const active = useMemo(() => ctx?.actives.includes(id), [id, ctx?.actives]);

  if (!enabled) {
    return children;
  }

  return (
    <Box
      ref={ref}
      data-layout-region={region}
      data-layout-id={id}
      style={
        !children
          ? {
              height: '100%',
              width: active ? 100 : 0
            }
          : {}
      }
      {...boxProps}
    >
      {children}
    </Box>
  );
};

const LeftNavHeader = () => {
  const theme = useTheme();
  // const layout = useAppLayout();
  // const isTopLayout = layout.current === 'top';

  const isTopLayout = useAppConfigStore(s => s.layout.mode === 'top');

  return <AppLogo />;

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
  // const leftnav = useAppLeftNav();
  // const { t } = useTranslation(MODULE_NAME);

  const onToggle = useCallback(() => {
    // if (!leftnav.open) {
    //   leftnav.collapseMenus();
    // }
    // leftnav.toggle();
  }, []);

  return 'item';

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

export const LeftNavBar = React.memo(() => {
  const theme = useTheme();

  const open = useAppConfigStore(s => s.layout.left_nav.open);
  const width = useAppConfigStore(s => s.layout.left_nav.width);

  const setStore = useAppConfigSetStore();

  // const leftnav = useAppLeftNav();

  // const { leftnav: leftnavPreference } = useAppPreferences();

  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const onCloseDrawerIfOpen = useCallback(() => {
    if (isSmDown && open) {
      setStore(s => {
        s.layout.left_nav.open = false;
        return s;
      });
    }
  }, []);

  const onToggle = useCallback(() => {
    if (!leftnav.open) {
      leftnav.collapseMenus();
    }
    leftnav.toggle();
  }, []);

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
        open={open}
        width={width}
      >
        <LeftNavHeader />

        <Stack
          sx={{
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {/* <OverlayShadow region="layout" id="app-leftnav-menus">
            <LeftNavMenuRoot />
          </OverlayShadow> */}
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
});
