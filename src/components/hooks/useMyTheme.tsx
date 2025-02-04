import type { AppThemeConfigs } from 'commons/components/app/AppConfigs';
import { useEffect, useMemo, useState } from 'react';

export const useMyTheme = () => {
  const [theme, setTheme] = useState<AppThemeConfigs>({});

  useEffect(() => {
    fetch('/theme.json')
      .then(response => response.json())
      .then(data => setTheme(data as AppThemeConfigs))
      // eslint-disable-next-line no-console
      .catch(error => console.error('Error fetching the JSON theme file:', error));
  }, []);

  return useMemo((): AppThemeConfigs => theme, [theme]);
};

export default useMyTheme;
