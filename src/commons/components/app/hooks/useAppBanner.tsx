import { useApp, useAppConfigs } from 'commons/components/app/hooks';
import { AppThemesContext } from 'commons/components/app/providers/AppThemesProvider';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useAppBanner() {
  const { t } = useTranslation();
  const { theme } = useApp();
  const configs = useAppConfigs();
  const { current, themes } = useContext(configs.overrides?.providers?.themesProvider?.context ?? AppThemesContext);
  const { preferences } = useAppConfigs();

  const currentId = useMemo(() => themes?.findIndex(_theme => _theme.configs === current), [current, themes]);

  if (currentId === 1)
    return theme === 'dark' ? (
      <img
        style={{ display: 'inline-block', width: '100%', margin: '2rem 0' }}
        src="/nostalgia/banner_dark.svg"
        alt={t('banner.alt')}
      />
    ) : (
      <img
        style={{ display: 'inline-block', width: '100%', margin: '2rem 0' }}
        src="/nostalgia/banner_dark.svg"
        alt={t('banner.alt')}
      />
    );
  else return theme === 'dark' ? preferences.bannerDark : preferences.bannerLight;
}
