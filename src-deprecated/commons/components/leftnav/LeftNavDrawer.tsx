import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import {
  Box,
  ClickAwayListener,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  styled,
  useMediaQuery,
  useTheme
} from '@mui/material';
import type { AppLeftNavGroup, AppLeftNavItem } from 'commons/components/app/AppConfigs';
import { useAppConfigs, useAppLayout, useAppLeftNav } from 'commons/components/app/hooks';
import LeftNavGroup from 'commons/components/leftnav/LeftNavGroup';
import LeftNavItem from 'commons/components/leftnav/LeftNavItem';
import AppName from 'commons/components/topnav/AppName';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

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

const LeftNavDrawer = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { preferences } = useAppConfigs();
  const layout = useAppLayout();
  const leftnav = useAppLeftNav();
  const isSmDown = useMediaQuery(theme.breakpoints.down('md'));
  const isTopLayout = layout.current === 'top';

  const onCloseDrawerIfOpen = useCallback(() => {
    if (isSmDown && leftnav.open) {
      leftnav.setOpen(false);
    }
  }, [isSmDown, leftnav]);

  const header = (
    <div>
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
    </div>
  );

  const hide = (
    <ListItem disablePadding>
      <ListItemButton key="chevron" onClick={leftnav.toggle}>
        <ListItemIcon>{leftnav.open ? <ChevronLeftIcon /> : <ChevronRightIcon />}</ListItemIcon>
        <ListItemText primary={t('drawer.collapse')} />
      </ListItemButton>
    </ListItem>
  );

  const elementOnClick = () => {
    if (isSmDown) {
      onCloseDrawerIfOpen();
    }
  };

  return (
    <ClickAwayListener mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={onCloseDrawerIfOpen}>
      <StyledDrawer
        PaperProps={{
          elevation: 1,
          style: preferences.leftnav.longMenu ? { display: 'flex', flexDirection: 'column' } : {}
        }}
        variant="permanent"
        style={{ height: '100%' }}
        width={preferences.leftnav.width}
        open={leftnav.open}
      >
        {leftnav.open ? (
          header
        ) : (
          <Tooltip title={preferences.appName} aria-label={preferences.appName} placement="right">
            {header}
          </Tooltip>
        )}
        <List
          disablePadding
          sx={
            preferences.leftnav.longMenu
              ? {
                  flexGrow: '1',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }
              : {}
          }
        >
          {leftnav.elements.map((e, i) => {
            if (e.type === 'item') {
              const item = e.element as AppLeftNavItem;
              return <LeftNavItem key={item.id} item={item} onClick={elementOnClick} />;
            }
            if (e.type === 'group') {
              const item = e.element as AppLeftNavGroup;
              return <LeftNavGroup key={item.id} group={item} onItemClick={elementOnClick} />;
            }
            if (e.type === 'divider') {
              return <Divider key={`divider-${i}`} />;
            }

            // eslint-disable-next-line no-console
            console.warn(`${e.type} is not a valid type for left nav element.`);
            return null;
          })}
          <Box
            sx={{
              flexGrow: 1,
              '&:hover': {
                cursor: 'pointer'
              }
            }}
            onClick={leftnav.toggle}
          />
        </List>
        {leftnav.elements?.length > 0 && <Divider />}
        {leftnav.open ? (
          hide
        ) : (
          <Tooltip
            title={t('drawer.expand')}
            aria-label={t('drawer.expand')}
            placement="right"
            style={preferences.leftnav.longMenu ? { alignSelf: 'flex-start' } : {}}
          >
            {hide}
          </Tooltip>
        )}
        {!preferences.leftnav.longMenu && (
          <Box
            sx={{
              height: '100%',
              width: '100%',
              '&:hover': {
                cursor: 'pointer'
              }
            }}
            onClick={leftnav.toggle}
          />
        )}
      </StyledDrawer>
    </ClickAwayListener>
  );
};

export default memo(LeftNavDrawer);
