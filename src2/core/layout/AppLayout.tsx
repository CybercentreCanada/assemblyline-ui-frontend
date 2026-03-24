import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { APP_LEFT_MENU_ITEMS, APP_TOP_NAV_RIGHT, APP_USER_MENU_ITEMS } from 'app/app.layout';
import { useAppLogo } from 'core/layout/layout.hooks';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

type UserPropValidator = {
  prop: string;
  value: any;
  enforce?: boolean;
};

type LeftNavBase = {
  id: string;
  i18nKey: string;
  route?: string;
  icon?: React.ReactNode;
  nested?: boolean;
  userPropValidators?: UserPropValidator[];
};

type LeftNavItem = {
  type: 'item';
  element: LeftNavBase;
};

type LeftNavGroup = {
  type: 'group';
  element: LeftNavBase & { items: LeftNavBase[] };
};

type LeftNavDivider = {
  type: 'divider';
  element: null;
};

type LeftNavEntry = LeftNavItem | LeftNavGroup | LeftNavDivider;

const LEFT_NAV_WIDTH_OPEN = 280;
const LEFT_NAV_WIDTH_CLOSED = 64;

const coerceBoolean = (value: unknown) => value === true || value === 'true';

const shouldShow = (_validators?: UserPropValidator[]) => {
  // TODO: wire this into your user/config state when available.
  return true;
};

export type AppLayoutProps = {
  children: React.ReactNode;
};

export const AppLayout = React.memo(({ children }: AppLayoutProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const Logo = useAppLogo();
  const TopNavRight = APP_TOP_NAV_RIGHT;

  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));

  const [leftNavOpen, setLeftNavOpen] = useState(() => {
    try {
      const raw = window.localStorage.getItem('app.leftnav.open');
      return raw === null ? true : coerceBoolean(raw);
    } catch {
      return true;
    }
  });

  const leftNavVariant: 'temporary' | 'permanent' = isMdDown ? 'temporary' : 'permanent';
  const leftNavWidth = leftNavOpen ? LEFT_NAV_WIDTH_OPEN : LEFT_NAV_WIDTH_CLOSED;

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const setGroupOpen = useCallback((groupId: string, open: boolean) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: open }));
  }, []);

  const toggleLeftNav = useCallback(() => {
    setLeftNavOpen(prev => {
      const next = !prev;
      try {
        window.localStorage.setItem('app.leftnav.open', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const closeLeftNavIfTemporary = useCallback(() => {
    if (leftNavVariant === 'temporary') setLeftNavOpen(false);
  }, [leftNavVariant]);

  const isSelectedRoute = useCallback(
    (route?: string) => {
      if (!route) return false;
      return location.pathname === route || location.pathname.startsWith(route + '/');
    },
    [location.pathname]
  );

  const entries = useMemo(() => APP_LEFT_MENU_ITEMS as LeftNavEntry[], []);

  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<HTMLElement | null>(null);
  const userMenuOpen = Boolean(userMenuAnchorEl);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
      >
        <Toolbar sx={{ minHeight: 56, gap: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label={t('drawer.toggle', { defaultValue: 'Toggle navigation' })}
            onClick={toggleLeftNav}
            size="large"
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Logo />
            <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
              {t('app.name', { defaultValue: 'App' })}
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TopNavRight />

            <Tooltip title={t('usermenu.open', { defaultValue: 'Open user menu' })}>
              <IconButton
                color="inherit"
                onClick={e => setUserMenuAnchorEl(e.currentTarget)}
                aria-label={t('usermenu.open', { defaultValue: 'Open user menu' })}
                size="large"
              >
                {/* keep using the icon in config, but provide a fallback */}
                {APP_USER_MENU_ITEMS?.[0]?.icon ?? null}
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={userMenuAnchorEl}
              open={userMenuOpen}
              onClose={() => setUserMenuAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {APP_USER_MENU_ITEMS.map(item => (
                <MenuItem
                  key={item.route}
                  onClick={() => {
                    setUserMenuAnchorEl(null);
                    navigate(item.route);
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                  <ListItemText>{t(item.i18nKey)}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={leftNavVariant}
        open={leftNavOpen}
        onClose={closeLeftNavIfTemporary}
        PaperProps={{
          sx: {
            width: leftNavWidth,
            overflowX: 'hidden',
            whiteSpace: 'nowrap',
            borderRight: `1px solid ${theme.palette.divider}`
          }
        }}
      >
        <Toolbar sx={{ minHeight: 56 }} />
        <Divider />

        <List dense sx={{ py: 1 }}>
          {entries.map(entry => {
            if (entry.type === 'divider') return <Divider key={`div-${Math.random()}`} sx={{ my: 1 }} />;

            if (!shouldShow(entry.element.userPropValidators)) return null;

            if (entry.type === 'item') {
              return (
                <ListItemButton
                  key={entry.element.id}
                  selected={isSelectedRoute(entry.element.route)}
                  onClick={() => {
                    if (entry.element.route) navigate(entry.element.route);
                    closeLeftNavIfTemporary();
                  }}
                  sx={{
                    px: leftNavOpen ? 2 : 1,
                    justifyContent: leftNavOpen ? 'flex-start' : 'center'
                  }}
                >
                  {entry.element.icon && (
                    <ListItemIcon sx={{ minWidth: leftNavOpen ? 36 : 'auto', justifyContent: 'center' }}>
                      {entry.element.icon}
                    </ListItemIcon>
                  )}
                  {leftNavOpen && <ListItemText primary={t(entry.element.i18nKey)} />}
                </ListItemButton>
              );
            }

            const groupOpen = openGroups[entry.element.id] ?? true;

            return (
              <Box key={entry.element.id}>
                <ListItemButton
                  selected={isSelectedRoute(entry.element.route)}
                  onClick={() => setGroupOpen(entry.element.id, !groupOpen)}
                  sx={{
                    px: leftNavOpen ? 2 : 1,
                    justifyContent: leftNavOpen ? 'flex-start' : 'center'
                  }}
                >
                  {entry.element.icon && (
                    <ListItemIcon sx={{ minWidth: leftNavOpen ? 36 : 'auto', justifyContent: 'center' }}>
                      {entry.element.icon}
                    </ListItemIcon>
                  )}
                  {leftNavOpen && <ListItemText primary={t(entry.element.i18nKey)} />}
                </ListItemButton>

                <Collapse in={leftNavOpen && groupOpen} timeout="auto" unmountOnExit>
                  <List dense disablePadding>
                    {entry.element.items
                      .filter(it => shouldShow(it.userPropValidators))
                      .map(child => (
                        <ListItemButton
                          key={child.id}
                          selected={isSelectedRoute(child.route)}
                          onClick={() => {
                            if (child.route) navigate(child.route);
                            closeLeftNavIfTemporary();
                          }}
                          sx={{ pl: 4 }}
                        >
                          {child.icon && <ListItemIcon sx={{ minWidth: 32 }}>{child.icon}</ListItemIcon>}
                          <ListItemText primary={t(child.i18nKey)} />
                        </ListItemButton>
                      ))}
                  </List>
                </Collapse>
              </Box>
            );
          })}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          pl: leftNavVariant === 'permanent' ? `${leftNavWidth}px` : 0
        }}
      >
        <Toolbar sx={{ minHeight: 56 }} />
        <Box sx={{ p: 2 }}>{children}</Box>
      </Box>
    </Box>
  );
});

AppLayout.displayName = 'AppLayout';
