import { ZoomOutMap } from '@mui/icons-material';
import {
  Box,
  ClickAwayListener,
  Divider,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Paper,
  Popper,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppLayout, useAppPreferences, useAppUser } from '../../app/hooks';
import { useAppRouter } from '../../app/hooks/useAppRouter';
import { AppAvatar, AppUserAvatar } from '../../display/AppAvatar';
import { MODULE_NAME } from '../../name';
import type { AppBarUserMenuElement } from '../../topnav';
import ThemeSelection from '../../topnav/theme/ThemeSelection';

type AppBarUserMenuType = 'usermenu' | 'adminmenu';

export const UserProfile = () => {
  const theme = useTheme();
  const anchorRef = useRef<HTMLButtonElement>(undefined);
  const layout = useAppLayout();

  const { location, Link } = useAppRouter();
  const { t: clientT } = useTranslation();
  const { t } = useTranslation(MODULE_NAME);
  const { user } = useAppUser();
  const { allowPersonalization, allowTranslate, allowReset, allowFocusMode, topnav } = useAppPreferences();

  const [open, setOpen] = useState<boolean>(false);

  const renderThemeSelection = useCallback(
    (enabled: boolean) => {
      if (enabled && (allowPersonalization || allowTranslate || allowReset)) {
        return (
          <div>
            <Divider />
            <ThemeSelection />
          </div>
        );
      }
      return null;
    },
    [allowPersonalization, allowTranslate, allowReset]
  );

  const renderMenu = useCallback(
    (type: AppBarUserMenuType, menuItems: AppBarUserMenuElement[], title: string, i18nKey: string) => {
      if (menuItems !== undefined && menuItems !== null && menuItems.length !== 0) {
        return (
          <div>
            <Divider />
            <List dense subheader={<ListSubheader disableSticky>{i18nKey ? clientT(i18nKey) : title}</ListSubheader>}>
              {type === 'usermenu' && allowFocusMode && (
                <Tooltip title={t('personalization.focus.mode.tooltip')} placement="top">
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => layout.setFocus(_focus => !_focus)} id="personalization-focusmode">
                      <ListItemIcon>
                        <ZoomOutMap />
                      </ListItemIcon>
                      <ListItemText>{t('personalization.focus.mode.label')}</ListItemText>
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
              )}

              {menuItems.map((a, i) =>
                a.element ? (
                  <ListItem key={`${type}-${i}`}>{a.element}</ListItem>
                ) : (
                  <ListItemButton component={Link} to={a.route} key={`${type}-${i}`}>
                    {a.icon && <ListItemIcon>{a.icon}</ListItemIcon>}
                    <ListItemText>{a.i18nKey ? clientT(a.i18nKey) : a.title}</ListItemText>
                  </ListItemButton>
                )
              )}
            </List>
          </div>
        );
      }
      return null;
    },
    [t, clientT, allowFocusMode, layout, Link]
  );

  useEffect(() => {
    // This effect checks to see if the result of pressing a button was a navigation
    // if so, close the settings bar.
    if (open) {
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      <IconButton
        ref={anchorRef}
        edge="end"
        sx={{
          padding: 0,
          marginLeft: theme.spacing(1),
          marginRight: theme.spacing(1)
        }}
        onClick={() => setOpen(!open)}
        onMouseUp={e => e.stopPropagation()}
        size="large"
      >
        <AppUserAvatar alt={user.name} url={user.avatar} email={user.email} id="user-avatar">
          {user.name
            .split(' ', 2)
            .map(n => n[0].toUpperCase())
            .join('')}
        </AppUserAvatar>
      </IconButton>
      <ClickAwayListener onClickAway={() => setOpen(false)} mouseEvent="onMouseUp">
        <Popper
          sx={{ zIndex: theme.zIndex.appBar + 200, minWidth: '280px' }}
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom-end"
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={250}>
              <Paper style={{ padding: theme.spacing(1) }} elevation={4}>
                <List disablePadding>
                  <ListItem disableGutters dense>
                    <Box
                      sx={{
                        display: 'flex',
                        paddingTop: 2,
                        paddingBottom: 2,
                        paddingLeft: 3,
                        paddingRight: 3,
                        alignItems: 'center'
                      }}
                    >
                      <AppAvatar
                        sx={{ width: theme.spacing(8), height: theme.spacing(8) }}
                        alt={user.name}
                        url={user.avatar}
                        email={user.email}
                      >
                        {user.name
                          .split(' ', 2)
                          .map(n => n[0].toUpperCase())
                          .join('')}
                      </AppAvatar>
                      <Box sx={{ paddingLeft: 2 }}>
                        <Typography variant="body1" noWrap>
                          <b>{user.name}</b>
                        </Typography>
                        <Typography variant="caption" noWrap>
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                </List>
                {renderMenu(
                  'usermenu',
                  topnav.profile?.menus?.user?.slot,
                  topnav.profile?.menus?.user?.title,
                  topnav.profile?.menus?.user?.i18nKey
                )}
                {user.is_admin &&
                  renderMenu(
                    'adminmenu',
                    topnav.profile?.menus?.admin?.slot,
                    topnav.profile?.menus?.admin?.title,
                    topnav.profile?.menus?.admin?.i18nKey
                  )}
                {renderThemeSelection(topnav.themeSelectionMode === 'profile')}
              </Paper>
            </Fade>
          )}
        </Popper>
      </ClickAwayListener>
    </>
  );
};
