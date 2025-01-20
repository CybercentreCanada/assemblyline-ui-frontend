/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import type { AppThemeConfigs } from 'commons/components/app/AppConfigs';
import { useEffect, useMemo, useState } from 'react';
import THEME from '../../../public/theme.json';

export const useMyTheme = () => {
  const [theme, setTheme] = useState<AppThemeConfigs>(THEME);

  useEffect(() => {
    fetch('/theme.json')
      .then(response => response.json())
      .then(data => setTheme(data as AppThemeConfigs))
      .catch(error => console.error('Error fetching the JSON theme file:', error));
  }, []);

  return useMemo((): AppThemeConfigs => theme, [theme]);
};

// const useMyTheme = () =>
//   useMemo((): AppThemeConfigs => require('json!/theme.json') || (ANALYTICAL_PLATFORM_THEME as AppThemeConfigs), []);
export default useMyTheme;
