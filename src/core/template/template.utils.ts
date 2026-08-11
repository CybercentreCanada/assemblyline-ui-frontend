import type { ThemeOptions } from '@mui/material';
import { deepmerge } from '@mui/utils';
import type { AppTheme } from '@tui/core';
import { TUI_THEMES } from '@tui/core';
import type { AppLegacyTheme } from 'core/template';

// TUI_THEMES[0] is the library's DEFAULT_THEME, not individually exported.
const [DEFAULT_THEME] = TUI_THEMES;

/** Baseline `ThemeOptions` shared by every mode, ported from the legacy `createTuiTheme`. */
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
 * it over `BASE_THEME_CONFIG` (the legacy `createTuiTheme` baseline) and the library's
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
