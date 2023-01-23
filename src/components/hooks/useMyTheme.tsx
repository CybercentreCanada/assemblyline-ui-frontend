/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO: Switch to the new theme ?
import { AppThemeConfigs } from 'commons/components/app/AppConfigs';
import { useMemo } from 'react';

const LEGACY_THEME: AppThemeConfigs = {
  palette: {
    dark: {
      background: {
        default: '#303030',
        paper: '#303030'
      },
      secondary: {
        main: '#fd5d1c'
      }
    }
  },
  appbar: {
    dark: {
      backgroundColor: 'rgb(76, 89, 122)'
    }
  }
};

const DARK_BLUE_THEME: AppThemeConfigs = {
  palette: {
    dark: {
      background: {
        default: 'rgb(0, 30, 60)',
        paper: 'rgb(0, 30, 60)'
      },
      secondary: {
        main: '#fd5d1c'
      }
    }
  }
};

const DEFAULT_THEME: AppThemeConfigs = {
  palette: {
    dark: {
      background: { default: '#0d1117', paper: '#0d1117' }
    }
  },
  appbar: {
    light: {
      color: 'black',
      backgroundColor: 'white'
    }
  }
};
const useMyTheme = () => useMemo((): AppThemeConfigs => LEGACY_THEME, []);
export default useMyTheme;
