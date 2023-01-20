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
import useApp from 'commons/components/hooks/useAppContext';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import useSafeResults from 'components/hooks/useSafeResults';
import i18n from 'i18next';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export enum Lang {
  EN = 'en',
  FR = 'fr'
}

const isLang = (lang: Lang): boolean => i18n.language === lang.valueOf();

const ThemeSelection = () => {
  const theme = useTheme();
  const isXSDown = useMediaQuery(theme.breakpoints.down('xs'));
  const { t } = useTranslation();
  const { toggleTheme } = useApp();
  const {
    currentLayout,
    showQuickSearch,
    autoHideAppbar,
    layoutProps,
    breadcrumbsEnabled,
    breadcrumbsState,
    toggleLayout,
    toggleQuickSearch,
    toggleAutoHideAppbar,
    toggleShowBreadcrumbs,
    toggleBreadcrumbsState
  } = useAppLayout();
  const { showSafeResults, toggleShowSafeResults } = useSafeResults();

  const onToggleLanguage = () => {
    i18n.changeLanguage(isLang(Lang.EN) ? Lang.FR.valueOf() : Lang.EN.valueOf());
  };

  const clearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  const allowPersonalization =
    layoutProps.allowAutoHideTopbar ||
    layoutProps.allowBreadcrumbs ||
    layoutProps.allowQuickSearch ||
    layoutProps.allowReset ||
    layoutProps.allowThemeSelection ||
    layoutProps.allowTopbarModeSelection;

  return (
    <div>
      {layoutProps.allowTranslate && (
        <List dense subheader={<ListSubheader disableSticky>{t('app.language')}</ListSubheader>}>
          <ListItem dense button onClick={onToggleLanguage}>
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
                  <Switch checked={isLang(Lang.FR)} name="langSwitch" />
                </div>
                <Typography component="div" variant="body2">
                  Français
                </Typography>
              </div>
            </ListItemText>
          </ListItem>
        </List>
      )}
      {layoutProps.allowTranslate && allowPersonalization && <Divider />}
      {allowPersonalization && (
        <List dense subheader={<ListSubheader disableSticky>{t('personalization')}</ListSubheader>}>
          {layoutProps.allowThemeSelection && (
            <ListItem button onClick={toggleTheme}>
              <ListItemText>{t('personalization.dark')}</ListItemText>
              <ListItemSecondaryAction>
                <Switch edge="end" onChange={toggleTheme} checked={theme.palette.mode === 'dark'} />
              </ListItemSecondaryAction>
            </ListItem>
          )}
          {layoutProps.allowTopbarModeSelection && (
            <ListItem button onClick={toggleLayout}>
              <ListItemText>{t('personalization.sticky')}</ListItemText>
              <ListItemSecondaryAction onClick={toggleLayout}>
                <Switch edge="end" checked={currentLayout === 'top'} />
              </ListItemSecondaryAction>
            </ListItem>
          )}
          {layoutProps.allowQuickSearch && !isXSDown && (
            <ListItem button onClick={toggleQuickSearch}>
              <ListItemText>{t('personalization.quicksearch')}</ListItemText>
              <ListItemSecondaryAction>
                <Switch edge="end" checked={showQuickSearch} onClick={toggleQuickSearch} />
              </ListItemSecondaryAction>
            </ListItem>
          )}
          {layoutProps.allowAutoHideTopbar && (
            <ListItem button disabled={currentLayout === 'top'} onClick={toggleAutoHideAppbar}>
              <ListItemText>{t('personalization.autohideappbar')}</ListItemText>
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  disabled={currentLayout === 'top'}
                  checked={autoHideAppbar && currentLayout !== 'top'}
                  onClick={toggleAutoHideAppbar}
                />
              </ListItemSecondaryAction>
            </ListItem>
          )}
          {layoutProps.allowBreadcrumbs && !isXSDown && (
            <>
              <ListItem button onClick={toggleShowBreadcrumbs}>
                <ListItemText>{t('personalization.showbreadcrumbs')}</ListItemText>
                <ListItemSecondaryAction>
                  <Switch edge="end" checked={breadcrumbsEnabled} onClick={toggleShowBreadcrumbs} />
                </ListItemSecondaryAction>
              </ListItem>
              {layoutProps.allowBreadcrumbsMinimize && (
                <ListItem button onClick={toggleBreadcrumbsState} disabled={!breadcrumbsEnabled}>
                  <ListItemText>{t('personalization.minimizebreadcrumbs')}</ListItemText>
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      disabled={!breadcrumbsEnabled}
                      checked={breadcrumbsEnabled && !breadcrumbsState}
                      onClick={toggleBreadcrumbsState}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              )}
            </>
          )}

          <ListItem button onClick={toggleShowSafeResults}>
            <ListItemText>{t('personalization.showsaferesults')}</ListItemText>
            <ListItemSecondaryAction>
              <Switch edge="end" checked={showSafeResults} onClick={toggleShowSafeResults} />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      )}

      {(layoutProps.allowTranslate || allowPersonalization) && layoutProps.allowReset && <Divider />}

      {layoutProps.allowReset && (
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
