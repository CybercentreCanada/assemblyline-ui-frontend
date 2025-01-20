/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import type { AppThemeConfigs } from 'commons/components/app/AppConfigs';
import { useEffect, useMemo, useState } from 'react';
import THEME from '../../../public/theme.json';

const ANALYTICAL_PLATFORM_THEME: AppThemeConfigs = {
  components: {
    MuiPaper: {
      styleOverrides: {
        elevation: {
          backgroundImage: 'none'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minWidth: '145px'
        }
      }
    }
  },
  palette: {
    dark: {
      background: {
        default: '#202020',
        paper: '#303030'
      },
      primary: {
        main: '#7DA1DB'
      },
      secondary: {
        main: '#C0DEEC'
      },
      divider: '#414141'
    },
    light: {
      background: {
        default: '#FAFAFA',
        paper: '#FFFFFF'
      },
      primary: {
        main: '#0062BF'
      },
      secondary: {
        main: '#5189A3'
      }
    }
  },
  appbar: {
    dark: {
      backgroundColor: '#303030'
    },
    light: {
      color: '#000000',
      backgroundColor: '#FFFFFF'
    }
  }
};

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
