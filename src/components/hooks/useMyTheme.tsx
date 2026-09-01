import type { AppTheme } from 'commons/components/app/AppConfigs';
import { useEffect, useMemo, useState } from 'react';

export const useMyTheme = (): AppTheme[] => {
  const [theme, setTheme] = useState<AppTheme>({
    id: 'theme.default',
    i18nKey: 'theme.default.label',
    default: true,
    configs: {}
  });

  const [nostalgiaTheme, setNostalgiaTheme] = useState<AppTheme>({
    id: 'theme.nostalgia',
    i18nKey: 'theme.nostalgia.label',
    default: false,
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

  useEffect(() => {
    fetch('/nostalgia/theme.json')
      .then(response => response.json())
      .then(data =>
        setNostalgiaTheme({
          id: 'theme.nostalgia',
          i18nKey: 'theme.nostalgia.label',
          default: true,
          configs: data
        })
      )
      // eslint-disable-next-line no-console
      .catch(error => console.error('Error fetching the JSON theme file:', error));
  }, []);

  return useMemo((): AppTheme[] => [theme, nostalgiaTheme], [nostalgiaTheme, theme]);
};

export default useMyTheme;
