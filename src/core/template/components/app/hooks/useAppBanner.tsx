import { useApp, useAppConfigs } from 'core/template/components/app/hooks';

export function useAppBanner() {
  const { theme } = useApp();
  const { preferences } = useAppConfigs();
  return theme === 'dark' ? preferences.bannerDark : preferences.bannerLight;
}
