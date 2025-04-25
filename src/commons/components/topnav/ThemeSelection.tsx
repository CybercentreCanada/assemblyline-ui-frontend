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
import useLocalStorage from 'commons/components//utils/hooks/useLocalStorage';
import { APP_STORAGE_PREFIX } from 'commons/components/app/AppConstants';
import { AppThemePicker } from 'commons/components/app/AppThemePicker';
import {
  useAppBar,
  useAppBreadcrumbs,
  useAppConfigs,
  useAppLanguage,
  useAppLayout,
  useAppQuickSearch,
  useAppTheme
} from 'commons/components/app/hooks';
import { AppThemesContext } from 'commons/components/app/providers/AppThemesProvider';
import useSafeResults from 'components/hooks/useSafeResults';
import { memo, useContext } from 'react';
import { useTranslation } from 'react-i18next';

const ThemeSelection = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const configs = useAppConfigs();
  const layout = useAppLayout();
  const breadcrumbs = useAppBreadcrumbs();
  const language = useAppLanguage();
  const appbar = useAppBar();
  const appTheme = useAppTheme();
  const quicksearch = useAppQuickSearch();
  const { themes } = useContext(configs.overrides?.providers?.themesProvider?.context ?? AppThemesContext);
  const localStorage = useLocalStorage(APP_STORAGE_PREFIX);
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const { showSafeResults, toggleShowSafeResults } = useSafeResults();

  const clearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div>
      {configs.preferences.allowTranslate && (
        <List dense subheader={<ListSubheader disableSticky>{t('app.language')}</ListSubheader>}>
          <ListItemButton dense onClick={language.toggle} id="language">
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
                  <Switch checked={language.isFR()} name="langSwitch" />
                </div>
                <Typography component="div" variant="body2">
                  Français
                </Typography>
              </div>
            </ListItemText>
          </ListItemButton>
        </List>
      )}
      {configs.preferences.allowTranslate && configs.allowPersonalization && <Divider />}
      {configs.allowPersonalization && (
        <List dense subheader={<ListSubheader disableSticky>{t('personalization')}</ListSubheader>}>
          {configs.preferences.allowLayoutSelection && (
            <ListItem
              disablePadding
              secondaryAction={<Switch edge="end" checked={layout.current === 'top'} onClick={layout.toggle} />}
            >
              <ListItemButton onClick={layout.toggle} id="personalization-sticky">
                <ListItemText>{t('personalization.sticky')}</ListItemText>
              </ListItemButton>
            </ListItem>
          )}
          {configs.preferences.allowQuickSearch && !isSmDown && (
            <ListItem
              disablePadding
              secondaryAction={<Switch edge="end" checked={quicksearch.show} onClick={quicksearch.toggle} />}
            >
              <ListItemButton onClick={quicksearch.toggle}>
                <ListItemText>{t('personalization.quicksearch')}</ListItemText>
              </ListItemButton>
            </ListItem>
          )}
          {configs.preferences.allowAutoHideTopbar && (
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
          {configs.preferences.allowBreadcrumbs && !isSmDown && (
            <ListItem
              disablePadding
              secondaryAction={<Switch edge="end" checked={breadcrumbs.show} onClick={breadcrumbs.toggle} />}
            >
              <ListItemButton onClick={breadcrumbs.toggle} id="personalization-showbreadcrumbs">
                <ListItemText>{t('personalization.showbreadcrumbs')}</ListItemText>
              </ListItemButton>
            </ListItem>
          )}
          {configs.preferences.allowShowSafeResults && (
            <ListItem
              disablePadding
              secondaryAction={<Switch edge="end" checked={showSafeResults} onClick={toggleShowSafeResults} />}
            >
              <ListItemButton onClick={toggleShowSafeResults} id="personalization-showsaferesults">
                <ListItemText>{t('personalization.showsaferesults')}</ListItemText>
              </ListItemButton>
            </ListItem>
          )}
        </List>
      )}

      {configs.preferences.allowThemeSelection && (
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
              secondaryAction={<Switch edge="end" onChange={appTheme.toggle} checked={theme.palette.mode === 'dark'} />}
            >
              <ListItemButton onClick={appTheme.toggle} id="personalization -dark">
                <ListItemText>{t('personalization.dark')}</ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}

      {(configs.preferences.allowThemeSelection ||
        configs.preferences.allowTranslate ||
        configs.allowPersonalization) &&
        configs.preferences.allowReset && <Divider />}

      {configs.preferences.allowReset && (
        <List dense>
          <ListItemButton dense onClick={clearStorage} id="personalization-reset">
            <ListItemText>{t('personalization.reset_text')}</ListItemText>
          </ListItemButton>
        </List>
      )}
    </div>
  );
};

export default memo(ThemeSelection);
