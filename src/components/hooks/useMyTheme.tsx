/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO: Switch to the new theme ?
import { AppThemeConfigs } from 'commons/components/app/AppConfigs';
import { useMemo } from 'react';

const LEGACY_THEME: AppThemeConfigs = {
  palette: {
    dark: {
      background: {
        default: 'rgb(48, 48, 48)',
        // paper: 'rgb(66, 66, 66)'
        // default: 'rgb(66, 66, 66)'
        paper: 'rgb(48, 48, 48)'
      },
      primary: {
        main: 'rgb(124, 147, 185)'
      },
      secondary: {
        main: 'rgb(146, 156, 173)'
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
