import {
  Divider,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  Switch,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import useAppBreadcrumbs from 'commons/components/app/hooks/useAppBreadcrumbs';
import useAppConfigs from 'commons/components/app/hooks/useAppConfigs';
import useAppLanguage from 'commons/components/app/hooks/useAppLanguage';
import useAppLayout from 'commons/components/app/hooks/useAppLayout';
import useAppQuickSearch from 'commons/components/app/hooks/useAppQuickSearch';
import useHybridReports from 'components/hooks/useHybridReports';
import useSafeResults from 'components/hooks/useSafeResults';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { APP_STORAGE_PREFIX } from '../app/AppConstants';
import useAppBar from '../app/hooks/useAppBar';
import useAppTheme from '../app/hooks/useAppTheme';
import useLocalStorage from '../utils/hooks/useLocalStorage';

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
  const localStorage = useLocalStorage(APP_STORAGE_PREFIX);
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const { showSafeResults, toggleShowSafeResults } = useSafeResults();
  const { showHybridReports, toggleShowHybridReports } = useHybridReports();

  const clearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div>
      {configs.preferences.allowTranslate && (
        <List dense subheader={<ListSubheader disableSticky>{t('app.language')}</ListSubheader>}>
          <ListItem dense button onClick={language.toggle}>
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
          </ListItem>
        </List>
      )}
      {configs.preferences.allowTranslate && configs.allowPersonalization && <Divider />}
      {configs.allowPersonalization && (
        <List dense subheader={<ListSubheader disableSticky>{t('personalization')}</ListSubheader>}>
          {configs.preferences.allowThemeSelection && (
            <ListItem button onClick={appTheme.toggle}>
              <ListItemText>{t('personalization.dark')}</ListItemText>
              <ListItemSecondaryAction>
                <Switch edge="end" onChange={appTheme.toggle} checked={theme.palette.mode === 'dark'} />
              </ListItemSecondaryAction>
            </ListItem>
          )}
          {configs.preferences.allowLayoutSelection && (
            <ListItem button onClick={layout.toggle}>
              <ListItemText>{t('personalization.sticky')}</ListItemText>
              <ListItemSecondaryAction onClick={layout.toggle}>
                <Switch edge="end" checked={layout.current === 'top'} />
              </ListItemSecondaryAction>
            </ListItem>
          )}
          {configs.preferences.allowQuickSearch && (
            <ListItem button onClick={quicksearch.toggle}>
              <ListItemText>{t('personalization.quicksearch')}</ListItemText>
              <ListItemSecondaryAction>
                <Switch edge="end" checked={quicksearch.show} onClick={quicksearch.toggle} />
              </ListItemSecondaryAction>
            </ListItem>
          )}
          {configs.preferences.allowAutoHideTopbar && (
            <ListItem button disabled={layout.current === 'top'} onClick={appbar.toggleAutoHide}>
              <ListItemText>{t('personalization.autohideappbar')}</ListItemText>
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  disabled={layout.current === 'top'}
                  checked={appbar.autoHide && layout.current !== 'top'}
                  onClick={appbar.toggleAutoHide}
                />
              </ListItemSecondaryAction>
            </ListItem>
          )}
          {configs.preferences.allowBreadcrumbs && !isSmDown && (
            <>
              <ListItem button onClick={breadcrumbs.toggle}>
                <ListItemText>{t('personalization.showbreadcrumbs')}</ListItemText>
                <ListItemSecondaryAction>
                  <Switch edge="end" checked={breadcrumbs.show} onClick={breadcrumbs.toggle} />
                </ListItemSecondaryAction>
              </ListItem>
            </>
          )}

          {configs.preferences.allowShowSafeResults && (
            <ListItem button onClick={toggleShowSafeResults}>
              <ListItemText>{t('personalization.showsaferesults')}</ListItemText>
              <ListItemSecondaryAction>
                <Switch edge="end" checked={showSafeResults} onClick={toggleShowSafeResults} />
              </ListItemSecondaryAction>
            </ListItem>
          )}

          {configs.preferences.allowHybribReports && (
            <ListItem button onClick={toggleShowHybridReports}>
              <ListItemText>{t('personalization.showhybridreports')}</ListItemText>
              <ListItemSecondaryAction>
                <Switch edge="end" checked={showHybridReports} onClick={toggleShowHybridReports} />
              </ListItemSecondaryAction>
            </ListItem>
          )}
        </List>
      )}

      {(configs.preferences.allowTranslate || configs.allowPersonalization) && configs.preferences.allowReset && (
        <Divider />
      )}

      {configs.preferences.allowReset && (
        <List dense>
          <ListItem dense button onClick={clearStorage}>
            <ListItemText>{t('personalization.reset_text')}</ListItemText>
          </ListItem>
        </List>
      )}
    </div>
  );
};

export default memo(ThemeSelection);
