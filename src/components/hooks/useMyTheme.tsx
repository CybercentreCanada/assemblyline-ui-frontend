import { AppThemeConfigs } from 'commons/components/app/AppConfigs';
import { useMemo } from 'react';

const AL_THEME: AppThemeConfigs = {
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
        default: 'rgb(32, 32, 32)',
        paper: 'rgb(48, 48, 48)'
      },
      primary: {
        main: '#83A0D2'
      },
      secondary: {
        main: '#C0DEEC'
      },
      divider: '#414141'
    },
    light: {
      background: {
        default: '#fafafa',
        paper: '#fff'
      },
      primary: {
        main: '#1565C0'
      },
      secondary: {
        main: '#7C889A'
      }
    }
  },
  appbar: {
    dark: {
      backgroundColor: 'rgb(48, 48, 48)'
    },
    light: {
      color: '#000000',
      backgroundColor: '#fff'
    }
  }
};

const DEFAULT_THEME: AppThemeConfigs = {};

const useMyTheme = () => useMemo((): AppThemeConfigs => AL_THEME, []);
export default useMyTheme;
