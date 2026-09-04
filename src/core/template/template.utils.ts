import type { PaletteMode, PaletteOptions, ThemeOptions } from '@mui/material';
import { deepmerge } from '@mui/utils';
import type { AppTheme } from '@tui/core';
import type { AppLegacyTheme } from 'core/template';

const APP_PALETTE = {
  dark: {
    action: {
      activatedOpacity: 0.24,
      active: '#fff',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
      disabledOpacity: 0.38,
      focus: 'rgba(255, 255, 255, 0.12)',
      focusOpacity: 0.12,
      hover: 'rgba(255, 255, 255, 0.08)',
      hoverOpacity: 0.08,
      selected: 'rgba(255, 255, 255, 0.16)',
      selectedOpacity: 0.16
    },
    background: { default: '#202020', paper: '#303030' },
    divider: '#414141',
    mode: 'dark',
    primary: { main: '#7DA1DB' },
    secondary: { main: '#C0DEEC' },
    text: {
      disabled: 'rgba(255, 255, 255, 0.5)',
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.7)'
    }
  },
  light: {
    action: {
      activatedOpacity: 0.12,
      active: 'rgba(0, 0, 0, 0.54)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
      disabledOpacity: 0.38,
      focus: 'rgba(0, 0, 0, 0.12)',
      focusOpacity: 0.12,
      hover: 'rgba(0, 0, 0, 0.04)',
      hoverOpacity: 0.04,
      selected: 'rgba(0, 0, 0, 0.08)',
      selectedOpacity: 0.08
    },
    background: { default: '#FAFAFA', paper: '#FFFFFF' },
    divider: 'rgba(0, 0, 0, 0.12)',
    mode: 'light',
    primary: { main: '#0062BF' },
    secondary: { main: '#5189A3' },
    text: {
      disabled: 'rgba(0, 0, 0, 0.38)',
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)'
    }
  }
} satisfies Record<PaletteMode, PaletteOptions>;

const SCROLLBAR_STYLES: Partial<ThemeOptions> = {
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#6D6D6D transparent',
          '&::-webkit-scrollbar': { width: '8px', height: '8px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#6D6D6D',
            borderRadius: '4px',
            border: '2px solid #6D6D6D'
          }
        }
      }
    }
  }
};

const DEFAULT_THEME: AppTheme = {
  configs: {
    dark: { palette: APP_PALETTE.dark, ...SCROLLBAR_STYLES },
    light: { palette: APP_PALETTE.light }
  },
  default: true,
  i18nKey: 'theme.default.label',
  id: 'theme.default'
};

const BASE_THEME_CONFIG: Partial<ThemeOptions> & { cssVariables?: boolean } = {
  breakpoints: {
    values: { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '#root': { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
        body: {
          fontSize: '0.875rem',
          height: '100%',
          letterSpacing: '0.01071em',
          lineHeight: 1.43,
          width: '100%'
        },
        html: { height: '100%', width: '100%' }
      }
    },
    MuiUseMediaQuery: { defaultProps: { noSsr: true } }
  },
  cssVariables: true
};

//*****************************************************************************************
// Theme Configs
//*****************************************************************************************

/**
 * @name parseAppThemeFromLegacy
 * @description Converts a legacy `AppLegacyTheme` (mode-split palette/appbar, mode-agnostic
 * components/typography) into the `AppTheme` shape expected by `@tui/core`, then deep merges
 * it over `BASE_THEME_CONFIG` (the legacy `createTuiTheme` baseline) and the app's own
 * `DEFAULT_THEME`, so the legacy config always takes precedence.
 * @param theme - The legacy theme to convert
 * @returns An `AppTheme` object with its `configs` split into `global`, `light`, and `dark` buckets
 */
export const parseAppThemeFromLegacy = ({ id, i18nKey, default: isDefault, configs }: AppLegacyTheme): AppTheme => {
  const { appbar, components, palette, typography } = configs;

  const buildModeConfig = (mode: 'light' | 'dark'): Partial<ThemeOptions> => {
    const appBarStyles = appbar?.[mode];
    const legacy: Partial<ThemeOptions> = {
      ...(appBarStyles ? { components: { MuiAppBar: { styleOverrides: { root: appBarStyles } } } } : {}),
      ...(palette?.[mode] ? { palette: palette[mode] } : {})
    };

    return deepmerge(DEFAULT_THEME.configs[mode] || {}, legacy);
  };

  const legacyGlobal: Partial<ThemeOptions> = {
    ...(components ? { components } : {}),
    ...(typography ? { typography } : {})
  };

  return {
    configs: {
      dark: buildModeConfig('dark'),
      global: deepmerge(deepmerge(DEFAULT_THEME.configs.global || {}, BASE_THEME_CONFIG), legacyGlobal),
      light: buildModeConfig('light')
    },
    default: isDefault,
    i18nKey,
    id
  };
};
