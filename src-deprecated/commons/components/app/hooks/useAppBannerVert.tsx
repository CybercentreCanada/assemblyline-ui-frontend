import { useApp } from 'commons/components/app/hooks/useApp';
import { useAppConfigs } from 'commons/components/app/hooks/useAppConfigs';

export default function useAppBannerVert() {
  const { theme } = useApp();
  const { preferences } = useAppConfigs();
  return theme === 'dark' ? preferences.bannerVertDark : preferences.bannerVertLight;
}
