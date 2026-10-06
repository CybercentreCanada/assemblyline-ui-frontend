import { useApp } from 'core/template/components/app/hooks/useApp';
import { useAppConfigs } from 'core/template/components/app/hooks/useAppConfigs';
import { useMemo } from 'react';

export const useAppLogo = () => {
  const { theme } = useApp();
  const { preferences } = useAppConfigs();
  return useMemo(() => (theme === 'dark' ? preferences.appIconDark : preferences.appIconLight), [theme, preferences]);
};
