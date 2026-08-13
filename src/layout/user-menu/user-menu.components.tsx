import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {
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
import { AppAvatar, AppUserAvatar, useAppTheme } from '@tui/core';
import { useAppConfig } from 'core/config';
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import { useAppPreferenceStore, useAppSetPreferenceStore } from 'core/preference';
import { useAppSafeResults } from 'layout/safe-results';
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
    const setTemplateStore = useAppSetInterfaceStore();

    const displayName = useMemo<string>(
      () =>
        name
          .split(' ', 2)
          .map(n => n[0].toUpperCase())
          .join(''),
      [name]
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
          setTemplateStore(s => {
            s.usermenu.open = !s.usermenu.open;
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
  const theme = useTheme();

  const usedPercent = useMemo<number>(() => (total > 0 ? ((total - remaining) / total) * 100 : 0), [remaining, total]);

  const getProgressColor = (percent: number): 'success' | 'warning' | 'error' => {
    if (percent < QUOTA_COLOR_THRESHOLDS.warning) return 'success';
    if (percent < QUOTA_COLOR_THRESHOLDS.critical) return 'warning';
    return 'error';
  };

  return (
    <Tooltip title={`${remaining} remaining`} placement="left">
      <ListItem>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: theme.spacing(2) }}>
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
        </div>
      </ListItem>
    </Tooltip>
  );
});

QuotaBar.displayName = 'QuotaBar';

export const UserQuota = memo(() => {
  const { t } = useTranslation();

  const enforceQuota = useAppConfig(s => s.configuration.ui.enforce_quota);
  const apiDailyQuota = useAppConfig(s => s.user.api_daily_quota);
  const submissionDailyQuota = useAppConfig(s => s.user.submission_daily_quota);
  const apiQuotaRemaining = useAppInterfaceStore(s => s.quota.api);
  const submissionQuotaRemaining = useAppInterfaceStore(s => s.quota.submission);

  const hasUserQuota = apiDailyQuota !== 0 && apiQuotaRemaining !== null;
  const hasSubmissionQuota = submissionDailyQuota !== 0 && submissionQuotaRemaining !== null;
  const shouldRender = enforceQuota && (hasUserQuota || hasSubmissionQuota);

  return !shouldRender ? null : (
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
  const theme = useTheme();

  const lang = useAppPreferenceStore(s => s?.template?.lang);
  const allowTranslate = useAppPreferenceStore(s => s?.template?.allowTranslate);
  const setPreferenceStore = useAppSetPreferenceStore();

  return !allowTranslate ? null : (
    <>
      <Divider />
      <List dense subheader={<ListSubheader disableSticky>{t('app.language')}</ListSubheader>}>
        <ListItemButton
          id="language"
          dense
          onClick={() =>
            setPreferenceStore(s => {
              s.template.lang = s.template.lang === 'fr' ? 'en' : 'fr';
              return s;
            })
          }
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              justifyContent: 'space-between',
              gap: theme.spacing(2)
            }}
          >
            <Typography variant="body2">English</Typography>
            <Switch checked={lang === 'fr'} name="langSwitch" />
            <Typography variant="body2">Français</Typography>
          </div>
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

  const layoutMode = useAppPreferenceStore(s => s.template.layout);
  const autoHideAppbar = useAppPreferenceStore(s => s.template.autoHideAppbar);
  const showQuickSearch = useAppPreferenceStore(s => s.template.showQuickSearch);
  const showBreadcrumbs = useAppPreferenceStore(s => s.template.showBreadcrumbs);
  const { showSafeResults, toggleShowSafeResults } = useAppSafeResults();

  const setPreferenceStore = useAppSetPreferenceStore();
  const setInterfaceStore = useAppSetInterfaceStore();

  const toggleLayoutMode = useCallback(() => {
    setPreferenceStore(s => {
      s.template.layout = s.template.layout === 'top' ? 'side' : 'top';
      return s;
    });
    setInterfaceStore(s => {
      s.usermenu.open = false;
      return s;
    });
  }, [setPreferenceStore, setInterfaceStore]);

  const toggleShowQuickSearch = useCallback(() => {
    setPreferenceStore(s => {
      s.template.showQuickSearch = !s.template.showQuickSearch;
      return s;
    });
  }, [setPreferenceStore]);

  const toggleAutoHideAppbar = useCallback(() => {
    setPreferenceStore(s => {
      s.template.autoHideAppbar = !s.template.autoHideAppbar;
      return s;
    });
  }, [setPreferenceStore]);

  const toggleShowBreadcrumbs = useCallback(() => {
    setPreferenceStore(s => {
      s.template.showBreadcrumbs = !s.template.showBreadcrumbs;
      return s;
    });
  }, [setPreferenceStore]);

  return (
    <>
      <Divider />
      <List dense subheader={<ListSubheader disableSticky>{t('personalization')}</ListSubheader>}>
        <ListItem
          disablePadding
          secondaryAction={<Switch edge="end" checked={layoutMode === 'top'} onClick={toggleLayoutMode} />}
        >
          <ListItemButton id="personalization-sticky" onClick={toggleLayoutMode}>
            <ListItemText>{t('personalization.sticky')}</ListItemText>
          </ListItemButton>
        </ListItem>

        <ListItem
          disablePadding
          secondaryAction={<Switch edge="end" checked={showQuickSearch} onClick={toggleShowQuickSearch} />}
        >
          <ListItemButton onClick={toggleShowQuickSearch} id="personalization-quicksearch">
            <ListItemText>{t('personalization.quicksearch')}</ListItemText>
          </ListItemButton>
        </ListItem>

        <ListItem
          disablePadding
          secondaryAction={
            <Switch
              edge="end"
              disabled={layoutMode === 'top'}
              checked={autoHideAppbar && layoutMode !== 'top'}
              onClick={toggleAutoHideAppbar}
            />
          }
        >
          <ListItemButton
            disabled={layoutMode === 'top'}
            onClick={toggleAutoHideAppbar}
            id="personalization-autohideappbar"
          >
            <ListItemText>{t('personalization.autohideappbar')}</ListItemText>
          </ListItemButton>
        </ListItem>

        <ListItem
          disablePadding
          secondaryAction={<Switch edge="end" checked={showBreadcrumbs} onClick={toggleShowBreadcrumbs} />}
        >
          <ListItemButton onClick={toggleShowBreadcrumbs} id="personalization-showbreadcrumbs">
            <ListItemText>{t('personalization.showbreadcrumbs')}</ListItemText>
          </ListItemButton>
        </ListItem>

        <ListItem
          disablePadding
          secondaryAction={<Switch edge="end" checked={showSafeResults} onClick={toggleShowSafeResults} />}
        >
          <ListItemButton onClick={toggleShowSafeResults} id="personalization-showsaferesults">
            <ListItemText>{t('personalization.showsaferesults')}</ListItemText>
          </ListItemButton>
        </ListItem>
      </List>
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

  const themeMode = useAppPreferenceStore(s => s.template.mode);

  const setPreferenceStore = useAppSetPreferenceStore();

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const handleModeChange = useCallback(
    (event: SelectChangeEvent<'system' | 'light' | 'dark'>) => {
      const value = event.target.value as 'system' | 'light' | 'dark';
      if (value === themeMode) return;

      setPreferenceStore(s => {
        s.template.mode = value;
        return s;
      });

      const requestedMode = value === 'system' ? (prefersDarkMode ? 'dark' : 'light') : value;

      if (requestedMode !== mode) {
        toggleThemeMode();
      }
    },
    [mode, prefersDarkMode, setPreferenceStore, themeMode, toggleThemeMode]
  );

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

  const setTemplateStore = useAppSetInterfaceStore();
  const setInterfaceStore = useAppSetInterfaceStore();

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
        <div
          style={{
            display: 'flex',
            paddingTop: theme.spacing(2),
            paddingBottom: 0,
            paddingLeft: theme.spacing(3),
            paddingRight: theme.spacing(3),
            alignItems: 'center'
          }}
        >
          <AppAvatar sx={{ width: theme.spacing(8), height: theme.spacing(8) }} alt={name} url={avatar} email={email}>
            {displayName}
          </AppAvatar>
          <div style={{ paddingLeft: theme.spacing(2) }}>
            <Typography variant="body1" noWrap sx={{ fontWeight: 'bold' }}>
              {name}
            </Typography>
            <Typography variant="caption" noWrap>
              {email}
            </Typography>
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <IconButton
                nav={nav => nav.to().only({ route: '/account' })}
                size="large"
                tooltip={t('usermenu.account')}
                sx={{ color: theme.palette.text.primary }}
                onClick={() => {
                  setInterfaceStore(s => {
                    s.usermenu.open = false;
                    return s;
                  });
                }}
              >
                <AccountCircleOutlinedIcon />
              </IconButton>
              <IconButton
                nav={nav => nav.to().only({ route: '/settings/:tab', path: { tab: 'interface' } })}
                size="large"
                tooltip={t('usermenu.settings')}
                sx={{ color: theme.palette.text.primary }}
                onClick={() => {
                  setInterfaceStore(s => {
                    s.usermenu.open = false;
                    return s;
                  });
                }}
              >
                <SettingsOutlinedIcon />
              </IconButton>
              <IconButton
                size="large"
                tooltip={t('usermenu.logout')}
                onClick={() => {
                  setInterfaceStore(s => {
                    s.auth.mode = 'logout';
                    return s;
                  });
                  setTemplateStore(s => {
                    s.usermenu.open = false;
                    return s;
                  });
                }}
                sx={{ color: theme.palette.text.primary }}
              >
                <ExitToAppIcon />
              </IconButton>
            </div>
          </div>
        </div>
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

  const open = useAppInterfaceStore(s => s.usermenu.open);

  const setTemplateStore = useAppSetInterfaceStore();

  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <UserAvatar ref={anchorRef} />

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => {
          setTemplateStore(s => {
            s.usermenu.open = false;
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
