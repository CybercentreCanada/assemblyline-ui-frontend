import { createTheme, CSSObject } from '@mui/material/styles';
import { useMemo } from 'react';

export type AppThemeProps = {
  background?: {
    dark?: {
      default: string;
      paper: string;
    };
    light?: {
      default: string;
      paper: string;
    };
  };
  darkPrimary?: string;
  darkSecondary?: string;
  lightPrimary?: string;
  lightSecondary?: string;
  appbar?: {
    sticky?: {
      elevation?: number;
      dark?: {
        backgroundColor: string;
      };
      light?: {
        backgroundColor: string;
      };
    };
  };
};

const useAppTheme = (isDark: boolean, colors: AppThemeProps) => {
  const theme = useMemo(() => {
    const { background, darkPrimary, darkSecondary, lightPrimary, lightSecondary } = colors;

    const primaryMain = isDark ? darkPrimary : lightPrimary;
    const secondaryMain = isDark ? darkSecondary : lightSecondary;

    const palette = {
      primary: {
        main: primaryMain
      },
      secondary: {
        main: secondaryMain
      },
      type: isDark ? 'dark' : 'light'
    };

    if (background) {
      if (isDark && background.dark) {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        palette['background'] = background.dark;
      } else if (!isDark && background.light) {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        palette['background'] = background.light;
      }
    }

    return createTheme({
      components: {
        ...theme.components,
        MuiCssBaseline: {
          ...(theme.components?.MuiCssBaseline || {}),
          styleOverrides: {
            ...((theme.components.MuiCssBaseline?.styleOverrides as CSSObject) || {}),
            html: {
              width: '100%',
              height: '100%'
            },
            body: {
              width: '100%',
              height: '100%'
            },
            '#root': {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }
          }
        },
        MuiUseMediaQuery: {
          ...(theme.components.MuiUseMediaQuery || {}),
          defaultProps: {
            noSsr: true
          }
        }
      },
      palette
    });
  }, [colors, isDark]);
  return [theme];
};
export default useAppTheme;
