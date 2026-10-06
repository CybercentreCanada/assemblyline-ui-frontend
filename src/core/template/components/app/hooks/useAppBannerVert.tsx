import { useApp } from 'core/template/components/app/hooks/useApp';
import { useAppConfigs } from 'core/template/components/app/hooks/useAppConfigs';

export default function useAppBannerVert() {
  const { theme } = useApp();
  const { preferences } = useAppConfigs();
  return theme === 'dark' ? preferences.bannerVertDark : preferences.bannerVertLight;
}
