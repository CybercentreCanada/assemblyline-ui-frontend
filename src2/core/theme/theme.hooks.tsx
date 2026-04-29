import { useAppSetConfig } from 'core/config';
import { useEffect } from 'react';

export const useAppTheme = () => {
  const setConfig = useAppSetConfig();

  useEffect(() => {
    fetch('/theme.json')
      .then(response => response.json())
      .then(data =>
        setConfig(s => {
          s.theme.initialized = true;
          s.theme.skin = {
            id: 'theme.default',
            i18nKey: 'theme.default.label',
            default: true,
            configs: data
          };

          return s;
        })
      )
      // eslint-disable-next-line no-console
      .catch(error => console.error('Error fetching the JSON theme file:', error));
  }, []);
};
