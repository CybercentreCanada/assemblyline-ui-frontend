import { AppThemeConfigs } from 'commons/components/app/AppConfigs';
import { useMemo } from 'react';

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

const useMyTheme = () => useMemo((): AppThemeConfigs => ANALYTICAL_PLATFORM_THEME, []);
export default useMyTheme;
