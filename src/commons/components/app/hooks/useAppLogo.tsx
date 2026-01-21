import { useApp } from 'commons/components/app/hooks/useApp';
import { useAppConfigs } from 'commons/components/app/hooks/useAppConfigs';
import { AppThemesContext } from 'commons/components/app/providers/AppThemesProvider';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useAppLogo = () => {
  const { t } = useTranslation();
  const { theme } = useApp();
  const configs = useAppConfigs();
  const { current, themes } = useContext(configs.overrides?.providers?.themesProvider?.context ?? AppThemesContext);
  const { preferences } = useAppConfigs();

  const currentId = useMemo(() => themes?.findIndex(_theme => _theme.configs === current), [current, themes]);

  return useMemo(
    () =>
      currentId === 1 ? (
        theme === 'dark' ? (
          <img alt={t('logo.alt')} src="/nostalgia/al_dark.svg" width="40" height="32" style={{ marginLeft: '-8px' }} />
        ) : (
          <img alt={t('logo.alt')} src="/nostalgia/al.svg" width="40" height="32" style={{ marginLeft: '-8px' }} />
        )
      ) : theme === 'dark' ? (
        preferences.appIconDark
      ) : (
        preferences.appIconLight
      ),
    [currentId, theme, t, preferences.appIconDark, preferences.appIconLight]
  );
};
