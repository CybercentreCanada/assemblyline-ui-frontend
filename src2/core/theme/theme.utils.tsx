import type { CSSObject, PaletteOptions } from '@mui/material';
import { createTheme } from '@mui/material';
import type { Localization } from '@mui/material/locale';
import { enUS } from '@mui/material/locale';
import { DEFAULT_APP_THEME } from './theme.defaults';
import type { AppTheme } from './theme.models';

export const DEFAULT_THEME_LOCALE = enUS;

export const mergeAppTheme = (theme?: AppTheme): AppTheme => ({
  ...DEFAULT_APP_THEME,
  ...theme,
  appbar: {
    ...DEFAULT_APP_THEME.appbar,
    ...theme?.appbar,
    light: {
      ...DEFAULT_APP_THEME.appbar?.light,
      ...theme?.appbar?.light
    },
    dark: {
      ...DEFAULT_APP_THEME.appbar?.dark,
      ...theme?.appbar?.dark
    }
  },
  palette: {
    ...DEFAULT_APP_THEME.palette,
    ...theme?.palette,
    light: {
      ...DEFAULT_APP_THEME.palette?.light,
      ...theme?.palette?.light
    },
    dark: {
      ...DEFAULT_APP_THEME.palette?.dark,
      ...theme?.palette?.dark
    }
  },
  components: {
    ...DEFAULT_APP_THEME.components,
    ...theme?.components
  },
  typography: {
    ...DEFAULT_APP_THEME.typography,
    ...theme?.typography
  }
});

export const createAppTheme = (
  config: AppTheme,
  palette: PaletteOptions,
  locale: Localization = DEFAULT_THEME_LOCALE
) =>
  createTheme(
    {
      cssVariables: true,
      breakpoints: {
        values: {
          xs: 0,
          sm: 600,
          md: 960,
          lg: 1280,
          xl: 1920
        }
      },
      components: {
        ...config.components,
        MuiAppBar: {
          ...(config.components?.MuiAppBar || {}),
          defaultProps: {
            ...config.components?.MuiAppBar?.defaultProps,
            elevation: config.appbar?.elevation ?? config.components?.MuiAppBar?.defaultProps?.elevation
          },
          styleOverrides: {
            ...((config.components?.MuiAppBar?.styleOverrides as CSSObject) || {}),
            root: {
              ...((((config.components?.MuiAppBar?.styleOverrides as CSSObject) || {}).root as CSSObject) || {}),
              ...(palette.mode === 'dark' ? config.appbar?.dark : config.appbar?.light)
            }
          }
        },
        MuiCssBaseline: {
          ...(config.components?.MuiCssBaseline || {}),
          styleOverrides: {
            ...((config.components?.MuiCssBaseline?.styleOverrides as CSSObject) || {}),
            html: {
              width: '100%',
              height: '100%'
            },
            body: {
              fontSize: '0.875rem',
              lineHeight: 1.43,
              letterSpacing: '0.01071em',
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
          ...(config.components?.MuiUseMediaQuery || {}),
          defaultProps: {
            ...config.components?.MuiUseMediaQuery?.defaultProps,
            noSsr: true
          }
        }
      },
      typography: {
        ...config.typography
      },
      palette
    },
    locale
  );
