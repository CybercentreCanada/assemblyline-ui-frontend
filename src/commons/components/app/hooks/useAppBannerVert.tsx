import useApp from './useApp';
import useAppConfigs from './useAppConfigs';

export default function useAppBannerVert() {
  const { theme } = useApp();
  const { preferences } = useAppConfigs();
  return theme === 'dark' ? preferences.bannerVertDark : preferences.bannerVertLight;
}
