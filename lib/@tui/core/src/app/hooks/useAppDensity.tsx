import { useCookiesStore } from '../../cookies';
import type { AppDensityMode } from '../AppConfigs';

export const useAppDensity = (): {
  density: AppDensityMode;
  setDensity: (density: AppDensityMode) => void;
} => {
  const density = useCookiesStore(state => state.density);
  const setDensity = useCookiesStore(state => state.setDensity);
  return { density, setDensity };
};
