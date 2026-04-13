import type { AppBarStyles, AppBarThemeConfigs, AppTheme, AppThemePalette } from './theme.models';

/**
 * Baseline app bar styles for light mode.
 */
export const DEFAULT_APP_BAR_LIGHT_STYLES: AppBarStyles = {
  color: '#1f2937',
  backgroundColor: '#ffffff'
};

/**
 * Baseline app bar styles for dark mode.
 */
export const DEFAULT_APP_BAR_DARK_STYLES: AppBarStyles = {
  color: '#f9fafb',
  backgroundColor: '#111827'
};

/**
 * Baseline app bar configuration.
 */
export const DEFAULT_APP_BAR_THEME_CONFIGS: AppBarThemeConfigs = {
  elevation: 1,
  light: DEFAULT_APP_BAR_LIGHT_STYLES,
  dark: DEFAULT_APP_BAR_DARK_STYLES
};

/**
 * Baseline palette overrides by mode.
 */
export const DEFAULT_APP_THEME_PALETTE: AppThemePalette = {
  light: {
    mode: 'light',
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    }
  },
  dark: {
    mode: 'dark',
    background: {
      default: '#0b1220',
      paper: '#111827'
    }
  }
};

/**
 * Baseline theme configuration used when no app-specific overrides are provided.
 */
export const DEFAULT_APP_THEME: AppTheme = {
  appbar: DEFAULT_APP_BAR_THEME_CONFIGS,
  palette: DEFAULT_APP_THEME_PALETTE,
  components: {},
  typography: {}
};
