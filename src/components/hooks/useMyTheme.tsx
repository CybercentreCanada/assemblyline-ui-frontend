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
    }
  },
  palette: {
    dark: {
      background: {
        default: 'rgb(48, 48, 48)',
        paper: 'rgb(66, 66, 66)'
      },
      primary: {
        main: 'rgb(124, 147, 185)'
      },
      secondary: {
        main: 'rgb(146, 156, 173)'
      }
    },
    light: {
      background: {
        default: '#fafafa',
        paper: '#fff'
      },
      primary: {
        main: 'rgb(11, 101, 161)'
      },
      secondary: {
        main: '#939DAC'
      }
    }
  },
  appbar: {
    dark: {
      backgroundColor: 'rgb(86, 102, 129)'
    },
    light: {
      backgroundColor: 'rgb(7, 70, 112)'
    }
  }
};

const useMyTheme = () => useMemo((): AppThemeConfigs => AL_THEME, []);
export default useMyTheme;
