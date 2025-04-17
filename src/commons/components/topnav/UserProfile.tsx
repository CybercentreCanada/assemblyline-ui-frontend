import { SelfImprovement } from '@mui/icons-material';
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
  styled,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import type { AppBarUserMenuElement } from 'commons/components//app/AppConfigs';
import { useAppConfigs, useAppLayout, useAppUser } from 'commons/components/app/hooks';
import AppAvatar from 'commons/components/display/AppAvatar';
import ThemeSelection from 'commons/components/topnav/ThemeSelection';
import { memo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export const AppUserAvatar = styled(AppAvatar)(({ theme }) => ({
  width: theme.spacing(5),
  height: theme.spacing(5),
  [theme.breakpoints.down('sm')]: {
    width: theme.spacing(4),
    height: theme.spacing(4)
  }
}));

type AppBarUserMenuType = 'usermenu' | 'adminmenu';

const UserProfile = () => {
  const theme = useTheme();
  const anchorRef = useRef<HTMLButtonElement>(undefined);
  const configs = useAppConfigs();
  const layout = useAppLayout();
  const { t } = useTranslation();
  const { user } = useAppUser();
  const [open, setOpen] = useState<boolean>(false);
  const onProfileClick = useCallback(() => setOpen(_open => !_open), []);
  const onClickAway = useCallback(() => setOpen(false), []);
  const renderThemeSelection = useCallback(
    (enabled: boolean) => {
      if (
        enabled &&
        (configs.allowPersonalization || configs.preferences.allowTranslate || configs.preferences.allowReset)
      ) {
        return (
          <div>
            <Divider />
            <ThemeSelection />
          </div>
        );
      }
      return null;
    },
    [configs.allowPersonalization, configs.preferences.allowTranslate, configs.preferences.allowReset]
  );

  const renderMenu = useCallback(
    (type: AppBarUserMenuType, menuItems: AppBarUserMenuElement[], title: string, i18nKey: string) => {
      if (menuItems !== undefined && menuItems !== null && menuItems.length !== 0) {
        return (
          <div>
            <Divider />
            <List dense subheader={<ListSubheader disableSticky>{i18nKey ? t(i18nKey) : title}</ListSubheader>}>
              {type === 'usermenu' && configs.preferences.allowFocusMode && (
                <Tooltip title={t('personalization.focus.mode.tooltip')}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => layout.setFocus(_focus => !_focus)} id="personalization-focusmode">
                      <ListItemIcon>
                        <SelfImprovement />
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
                    <ListItemText>{a.i18nKey ? t(a.i18nKey) : a.title}</ListItemText>
                  </ListItemButton>
                )
              )}
            </List>
          </div>
        );
      }
      return null;
    },
    [t, configs.preferences.allowFocusMode, layout]
  );

  return (
    <ClickAwayListener onClickAway={onClickAway} mouseEvent="onMouseUp">
      <IconButton
        ref={anchorRef}
        edge="end"
        sx={{
          padding: 0,
          marginLeft: theme.spacing(1),
          marginRight: theme.spacing(1)
        }}
        onClick={onProfileClick}
        size="large"
      >
        <AppUserAvatar alt={user.name} url={user.avatar} email={user.email} id="user-avatar">
          {user.name
            .split(' ', 2)
            .map(n => n[0].toUpperCase())
            .join('')}
        </AppUserAvatar>
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
                  configs.preferences.topnav.userMenu,
                  configs.preferences.topnav.userMenuTitle,
                  configs.preferences.topnav.userMenuI18nKey
                )}
                {user.is_admin &&
                  renderMenu(
                    'adminmenu',
                    configs.preferences.topnav.adminMenu,
                    configs.preferences.topnav.adminMenuTitle,
                    configs.preferences.topnav.adminMenuI18nKey
                  )}
                {renderThemeSelection(configs.preferences.topnav.themeSelectionMode === 'profile')}
              </Paper>
            </Fade>
          )}
        </Popper>
      </IconButton>
    </ClickAwayListener>
  );
};

export default memo(UserProfile);
