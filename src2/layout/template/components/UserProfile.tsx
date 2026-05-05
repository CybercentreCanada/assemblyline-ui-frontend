import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {
  Box,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  MenuItem,
  Paper,
  Popover,
  Select,
  Switch,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  AppAvatar,
  AppUserAvatar,
  useAppBar,
  useAppBreadcrumbs,
  useAppLanguage,
  useAppLayout,
  useAppPreferences,
  useAppQuickSearch,
  useAppTheme
} from '@tui/core';
import { useAppConfig, useAppSetConfig } from 'core/config';
import { forwardRef, memo, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'ui/buttons/IconButton';

//*****************************************************************************************
// UserAvatar
//*****************************************************************************************
const UserAvatar = memo(
  forwardRef<HTMLButtonElement, {}>((props, ref) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const name = useAppConfig(s => s?.user?.name);
    const avatar = useAppConfig(s => s?.user?.avatar);
    const email = useAppConfig(s => s?.user?.email);
    const setConfig = useAppSetConfig();

    const displayName = useMemo<string>(
      () =>
        name
          .split(' ', 2)
          .map(n => n[0].toUpperCase())
          .join(''),
      []
    );

    return (
      <IconButton
        ref={ref}
        edge="end"
        size="large"
        tooltip={t('usermenu')}
        sx={{
          padding: 0,
          marginLeft: theme.spacing(1),
          marginRight: theme.spacing(1)
        }}
        onClick={() =>
          setConfig(s => {
            s.layout.usermenu.open = !s.layout.usermenu.open;
            return s;
          })
        }
        onMouseUp={e => e.stopPropagation()}
      >
        <AppUserAvatar id="user-avatar" alt={name} url={avatar} email={email}>
          {displayName}
        </AppUserAvatar>
      </IconButton>
    );
  })
);

UserAvatar.displayName = 'UserAvatar';

//*****************************************************************************************
// AP Quota
//*****************************************************************************************

const QUOTA_COLOR_THRESHOLDS = {
  warning: 65,
  critical: 90
};

type QuotaBarProps = {
  label: string;
  remaining: number;
  total: number;
};

const QuotaBar = memo(({ label, remaining, total }: QuotaBarProps) => {
  const usedPercent = useMemo<number>(() => (total > 0 ? ((total - remaining) / total) * 100 : 0), [remaining, total]);

  const getProgressColor = (percent: number): 'success' | 'warning' | 'error' => {
    if (percent < QUOTA_COLOR_THRESHOLDS.warning) return 'success';
    if (percent < QUOTA_COLOR_THRESHOLDS.critical) return 'warning';
    return 'error';
  };

  return (
    <Tooltip title={`${remaining} remaining`} placement="left">
      <ListItem disableGutters>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap', minWidth: 'fit-content' }}>
            {label}
          </Typography>
          <LinearProgress
            variant="determinate"
            color={getProgressColor(usedPercent)}
            value={usedPercent}
            sx={{ flex: 1, height: 6 }}
            aria-label={`${label}: ${usedPercent.toFixed(0)}% used`}
          />
        </Box>
      </ListItem>
    </Tooltip>
  );
});

QuotaBar.displayName = 'QuotaBar';

export const UserQuota = memo(() => {
  const { t } = useTranslation();

  const enforceQuota = useAppConfig(s => s.configuration.ui.enforce_quota);
  const apiDailyQuota = useAppConfig(s => s.user.apiDailyQuota);
  const submissionDailyQuota = useAppConfig(s => s.user.submissionDailyQuota);
  const apiQuotaRemaining = useAppConfig(s => s.quota.api);
  const submissionQuotaRemaining = useAppConfig(s => s.quota.submission);

  const hasUserQuota = apiDailyQuota !== 0 && apiQuotaRemaining !== null;
  const hasSubmissionQuota = submissionDailyQuota !== 0 && submissionQuotaRemaining !== null;
  const shouldRender = enforceQuota && (hasUserQuota || hasSubmissionQuota);

  if (!shouldRender) return null;

  return (
    <>
      <Divider />
      <List dense subheader={<ListSubheader disableSticky>{t('quotas')}</ListSubheader>}>
        {hasUserQuota && <QuotaBar label={t('quotas.api')} remaining={apiQuotaRemaining} total={apiDailyQuota} />}
        {hasSubmissionQuota && (
          <QuotaBar label={t('quotas.submission')} remaining={submissionQuotaRemaining} total={submissionDailyQuota} />
        )}
      </List>
    </>
  );
});

UserQuota.displayName = 'UserQuota';

//*****************************************************************************************
// User Language
//*****************************************************************************************
export const UserLanguage = memo(() => {
  const { t } = useTranslation();

  const { isFR, toggle: toggleLanguage } = useAppLanguage();
  const { allowTranslate } = useAppPreferences();

  if (!allowTranslate) return null;

  return (
    <>
      <Divider />
      <List dense subheader={<ListSubheader disableSticky>{t('app.language')}</ListSubheader>}>
        <ListItemButton id="language" dense onClick={toggleLanguage}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="body2">English</Typography>
            <Switch checked={isFR()} name="langSwitch" />
            <Typography variant="body2">Français</Typography>
          </Box>
        </ListItemButton>
      </List>
    </>
  );
});

UserLanguage.displayName = 'UserLanguage';

//*****************************************************************************************
// User Personalization
//*****************************************************************************************
export const UserPersonalization = memo(() => {
  const { t } = useTranslation();
  const theme = useTheme();

  const quicksearch = useAppQuickSearch();
  const layout = useAppLayout();
  const breadcrumbs = useAppBreadcrumbs();
  const appbar = useAppBar();
  const {
    allowTranslate,
    allowPersonalization,
    allowLayoutSelection,
    allowQuickSearch,
    allowBreadcrumbs,
    allowAutoHideTopbar,
    allowReset,
    allowThemeSelection,
    allowDensitySelection
  } = useAppPreferences();

  const setAppConfig = useAppSetConfig();

  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  if (!allowPersonalization) return null;

  return (
    <>
      <>
        <Divider />
        <List dense subheader={<ListSubheader disableSticky>{t('personalization')}</ListSubheader>}>
          {allowLayoutSelection && (
            <ListItem
              disablePadding
              secondaryAction={
                <Switch
                  edge="end"
                  checked={layout.current === 'top'}
                  onClick={() => {
                    layout.toggle();
                    setAppConfig(s => {
                      s.layout.usermenu.open = false;
                      return s;
                    });
                  }}
                />
              }
            >
              <ListItemButton
                id="personalization-sticky"
                onClick={() => {
                  layout.toggle();
                  setAppConfig(s => {
                    s.layout.usermenu.open = false;
                    return s;
                  });
                }}
              >
                <ListItemText>{t('personalization.sticky')}</ListItemText>
              </ListItemButton>
            </ListItem>
          )}
          {allowQuickSearch && !isSmDown && (
            <ListItem
              disablePadding
              secondaryAction={<Switch edge="end" checked={quicksearch.show} onClick={quicksearch.toggle} />}
            >
              <ListItemButton onClick={quicksearch.toggle}>
                <ListItemText>{t('personalization.quicksearch')}</ListItemText>
              </ListItemButton>
            </ListItem>
          )}
          {allowAutoHideTopbar && (
            <ListItem
              disablePadding
              secondaryAction={
                <Switch
                  edge="end"
                  disabled={layout.current === 'top'}
                  checked={appbar.autoHide && layout.current !== 'top'}
                  onClick={appbar.toggleAutoHide}
                />
              }
            >
              <ListItemButton
                disabled={layout.current === 'top'}
                onClick={appbar.toggleAutoHide}
                id="personalization-autohideappbar"
              >
                <ListItemText>{t('personalization.autohideappbar')}</ListItemText>
              </ListItemButton>
            </ListItem>
          )}
          {allowBreadcrumbs && !isSmDown && (
            <ListItem
              disablePadding
              secondaryAction={<Switch edge="end" checked={breadcrumbs.show} onClick={breadcrumbs.toggle} />}
            >
              <ListItemButton onClick={breadcrumbs.toggle} id="personalization-showbreadcrumbs">
                <ListItemText>{t('personalization.showbreadcrumbs')}</ListItemText>
              </ListItemButton>
            </ListItem>
          )}
          {allowBreadcrumbs && !isSmDown && (
            <ListItem
              disablePadding
              secondaryAction={<Switch edge="end" checked={breadcrumbs.show} onClick={breadcrumbs.toggle} />}
            >
              <ListItemButton onClick={breadcrumbs.toggle} id="personalization-showsaferesults">
                <ListItemText>{t('personalization.showsaferesults')}</ListItemText>
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </>
    </>
  );
});

UserPersonalization.displayName = 'UserPersonalization';

//*****************************************************************************************
// User Theme
//*****************************************************************************************
export const UserTheme = memo(() => {
  const { t } = useTranslation();

  const { mode, toggleMode: toggleThemeMode } = useAppTheme();

  const { allowThemeSelection } = useAppPreferences();

  const themeMode = useAppConfig(s => s.theme.mode);

  const setConfig = useAppSetConfig();

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const handleModeChange = useCallback(
    (event: SelectChangeEvent<'system' | 'light' | 'dark'>) => {
      const value = event.target.value as 'system' | 'light' | 'dark';
      if (value === themeMode) return;

      setConfig(s => {
        s.theme.mode = value;
        return s;
      });

      const requestedMode = value === 'system' ? (prefersDarkMode ? 'dark' : 'light') : value;

      if (requestedMode !== mode) {
        toggleThemeMode();
      }
    },
    [mode, prefersDarkMode, setConfig, themeMode, toggleThemeMode]
  );

  if (!allowThemeSelection) return null;

  return (
    <>
      <Divider />
      <List dense subheader={<ListSubheader disableSticky>{t('thememenu')}</ListSubheader>}>
        <ListItem
          sx={{ justifyContent: 'space-between' }}
          secondaryAction={
            <Select size="small" value={themeMode} onChange={handleModeChange}>
              <MenuItem value="system">{t('personalization.theme.mode.system')}</MenuItem>
              <MenuItem value="light">{t('personalization.theme.mode.light')}</MenuItem>
              <MenuItem value="dark">{t('personalization.theme.mode.dark')}</MenuItem>
            </Select>
          }
        >
          <ListItemText primary={t('personalization.theme.mode')} />
        </ListItem>
      </List>
    </>
  );
});

UserTheme.displayName = 'UserTheme';

//*****************************************************************************************
// User Menu
//*****************************************************************************************
const UserMenuHeader = memo(() => {
  const { t } = useTranslation();
  const theme = useTheme();

  const name = useAppConfig(s => s?.user?.name);
  const avatar = useAppConfig(s => s?.user?.avatar);
  const email = useAppConfig(s => s?.user?.email);

  const displayName = useMemo<string>(
    () =>
      name
        .split(' ', 2)
        .map(n => n[0].toUpperCase())
        .join(''),
    [name]
  );

  const setConfig = useAppSetConfig();

  return (
    <List
      disablePadding
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1,
        boxShadow: 0,
        borderRadius: 0,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
      component={Paper}
      elevation={4}
    >
      <ListItem disableGutters dense>
        <Box
          sx={{
            display: 'flex',
            paddingTop: 2,
            paddingBottom: 0,
            paddingLeft: 3,
            paddingRight: 3,
            alignItems: 'center'
          }}
        >
          <AppAvatar sx={{ width: theme.spacing(8), height: theme.spacing(8) }} alt={name} url={avatar} email={email}>
            {displayName}
          </AppAvatar>
          <Box sx={{ paddingLeft: 2 }}>
            <Typography variant="body1" noWrap sx={{ fontWeight: 'bold' }}>
              {name}
            </Typography>
            <Typography variant="caption" noWrap>
              {email}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'end' }}>
              <IconButton
                to={{ path: '/account' }}
                size="large"
                tooltip={t('usermenu.account')}
                sx={{ color: theme.palette.text.primary }}
              >
                <AccountCircleOutlinedIcon />
              </IconButton>
              <IconButton
                to={{ path: '/settings' }}
                size="large"
                tooltip={t('usermenu.settings')}
                sx={{ color: theme.palette.text.primary }}
              >
                <SettingsOutlinedIcon />
              </IconButton>
              <IconButton
                size="large"
                tooltip={t('usermenu.logout')}
                onClick={() => {
                  setConfig(s => {
                    s.auth.mode = 'logout';
                    s.layout.usermenu.open = false;
                    return s;
                  });
                }}
                sx={{ color: theme.palette.text.primary }}
              >
                <ExitToAppIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </ListItem>
    </List>
  );
});

UserMenuHeader.displayName = 'UserMenuHeader';

export const UserMenu = memo(() => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        padding: theme.spacing(1),
        maxHeight: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column'
      }}
      elevation={4}
    >
      <UserMenuHeader />
      <UserQuota />
      <UserLanguage />
      <UserPersonalization />
      <UserTheme />
    </Paper>
  );
});

UserMenu.displayName = 'UserMenu';

//*****************************************************************************************
// UserProfile
//*****************************************************************************************
export const UserProfile = memo(() => {
  const theme = useTheme();

  const open = useAppConfig(s => s?.layout?.usermenu?.open);

  const setConfig = useAppSetConfig();

  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <UserAvatar ref={anchorRef} />

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => {
          setConfig(s => {
            s.layout.usermenu.open = false;
            return s;
          });
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        slotProps={{ paper: { sx: { mt: 1, zIndex: theme.zIndex.appBar + 200, minWidth: '280px' } } }}
      >
        <UserMenu />
      </Popover>
    </>
  );
});

UserProfile.displayName = 'UserProfile';
