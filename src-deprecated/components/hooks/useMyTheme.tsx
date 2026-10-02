import type { AppTheme } from 'commons/components/app/AppConfigs';
import { useEffect, useMemo, useState } from 'react';

export const useMyTheme = (): AppTheme[] => {
  const [theme, setTheme] = useState<AppTheme>({
    id: 'theme.default',
    i18nKey: 'theme.default.label',
    default: true,
    configs: {}
  });

  useEffect(() => {
    fetch('/theme.json')
      .then(response => response.json())
      .then(data =>
        setTheme({
          id: 'theme.default',
          i18nKey: 'theme.default.label',
          default: true,
          configs: data
        })
      )
      // eslint-disable-next-line no-console
      .catch(error => console.error('Error fetching the JSON theme file:', error));
  }, []);

  return useMemo((): AppTheme[] => [theme], [theme]);
};

export default useMyTheme;
