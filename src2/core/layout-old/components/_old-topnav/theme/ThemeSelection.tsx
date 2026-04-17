import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Switch,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAppBar,
  useAppBreadcrumbs,
  useAppLanguage,
  useAppLayout,
  useAppPreferences,
  useAppQuickSearch,
  useAppTheme
} from '../../app/hooks';
import { useCookiesStore } from '../../cookies';
import { MODULE_NAME } from '../../name';
import { AppThemePicker } from '../../themes/elements/AppThemePicker';

const ThemeSelection = () => {
  const theme = useTheme();
  const layout = useAppLayout();
  const breadcrumbs = useAppBreadcrumbs();
  const appbar = useAppBar();
  const quicksearch = useAppQuickSearch();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const { t } = useTranslation(MODULE_NAME);
  const { isFR, toggle: toggleLanguage } = useAppLanguage();
  const { themes, toggleMode: toggleThemeMode } = useAppTheme();
  const resetCookies = useCookiesStore(store => store.reset);

  const {
    allowTranslate,
    allowPersonalization,
    allowLayoutSelection,
    allowQuickSearch,
    allowBreadcrumbs,
    allowAutoHideTopbar,
    allowReset,
    allowThemeSelection
  } = useAppPreferences();

  return (
    <div>
      {allowTranslate && (
        <List dense subheader={<ListSubheader disableSticky>{t('app.language')}</ListSubheader>}>
          <ListItemButton dense onClick={toggleLanguage} id="language">
            <ListItemText style={{ margin: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'row',
                  width: '100%',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <Typography component="div" variant="body2">
                  English
                </Typography>
                <div style={{ flexGrow: 1 }}>
                  <Switch checked={isFR()} name="langSwitch" />
                </div>
                <Typography component="div" variant="body2">
                  Français
                </Typography>
              </div>
            </ListItemText>
          </ListItemButton>
        </List>
      )}
      {allowPersonalization && <Divider />}
      {allowPersonalization && (
        <List dense subheader={<ListSubheader disableSticky>{t('personalization')}</ListSubheader>}>
          {allowLayoutSelection && (
            <ListItem
              disablePadding
              secondaryAction={<Switch edge="end" checked={layout.current === 'top'} onClick={layout.toggle} />}
            >
              <ListItemButton onClick={layout.toggle} id="personalization-sticky">
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
        </List>
      )}

      {allowThemeSelection && (
        <>
          <Divider />
          <List dense subheader={<ListSubheader disableSticky>{t('thememenu')}</ListSubheader>}>
            {themes?.length > 1 && (
              <ListItem sx={{ mb: 1 }}>
                <AppThemePicker />
              </ListItem>
            )}
            <ListItem
              disablePadding
              secondaryAction={<Switch edge="end" onChange={toggleThemeMode} checked={theme.palette.mode === 'dark'} />}
            >
              <ListItemButton onClick={toggleThemeMode} id="personalization-dark">
                <ListItemText>{t('personalization.dark')}</ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}

      {allowPersonalization && allowReset && <Divider />}

      {allowPersonalization && allowReset && (
        <List dense>
          <ListItemButton dense onClick={resetCookies} id="personalization-reset">
            <ListItemText>{t('personalization.reset_text')}</ListItemText>
          </ListItemButton>
        </List>
      )}
    </div>
  );
};

export default memo(ThemeSelection);
