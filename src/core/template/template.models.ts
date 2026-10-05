import type { Components, PaletteOptions, Theme, TypographyVariantsOptions } from '@mui/material';
import type { CSSProperties } from 'react';

//*****************************************************************************************
// App Palette Legacy Configs
//*****************************************************************************************

/** Customizes the default MaterialUI 'light' and 'dark' palettes. */
export type AppPaletteLegacyConfigs = {
  /** MaterialUI dark theme configuration object. */
  dark?: PaletteOptions;
  /** MaterialUI light theme configuration object. */
  light?: PaletteOptions;
};

export const DEFAULT_APP_PALETTE_LEGACY_CONFIGS: AppPaletteLegacyConfigs = {
  dark: {},
  light: {}
};

//*****************************************************************************************
// App Bar Legacy Styles
//*****************************************************************************************

/** Describes which appbar styles are configurable. */
export type AppBarLegacyStyles = {
  /** Configures the appbar's css background-color style. */
  backgroundColor?: CSSProperties['backgroundColor'];
  /** Configures the appbar's css color style. */
  color?: CSSProperties['color'];
};

export const DEFAULT_APP_BAR_LEGACY_STYLES: AppBarLegacyStyles = {
  backgroundColor: '',
  color: ''
};

//*****************************************************************************************
// App Bar Legacy Theme Configs
//*****************************************************************************************

/** Appbar theme/style configuration, split by palette mode. */
export type AppBarLegacyThemeConfigs = {
  /** Appbar dark theme style configuration. */
  dark?: AppBarLegacyStyles;
  /** Appbar elevation. Only applies when layout is 'top'. */
  elevation?: number;
  /** Appbar light theme style configuration. */
  light?: AppBarLegacyStyles;
};

export const DEFAULT_APP_BAR_LEGACY_THEME_CONFIGS: AppBarLegacyThemeConfigs = {
  dark: DEFAULT_APP_BAR_LEGACY_STYLES,
  elevation: 0,
  light: DEFAULT_APP_BAR_LEGACY_STYLES
};

//*****************************************************************************************
// App Legacy Theme Configs
//*****************************************************************************************

/** Specification for the AppProvider's 'theme' attribute. */
export type AppLegacyThemeConfigs = {
  /** Appbar theme/style configuration. */
  appbar?: AppBarLegacyThemeConfigs;
  /** Overrides MaterialUI components styles. */
  components?: Components<Omit<Theme, 'components'>>;
  /** MaterialUI theme.palette configuration object. */
  palette?: AppPaletteLegacyConfigs;
  /** MaterialUI theme.typography configuration object. */
  typography?: TypographyVariantsOptions;
};

export const DEFAULT_APP_LEGACY_THEME_CONFIGS: AppLegacyThemeConfigs = {
  appbar: DEFAULT_APP_BAR_LEGACY_THEME_CONFIGS,
  components: {},
  palette: DEFAULT_APP_PALETTE_LEGACY_CONFIGS,
  typography: {}
};

//*****************************************************************************************
// App Legacy Theme
//*****************************************************************************************

/** Specification for a supported application theme. */
export type AppLegacyTheme = {
  /** MaterialUI theme configs. */
  configs: AppLegacyThemeConfigs;
  /** Indicates if the theme should be the default. */
  default?: boolean;
  /** An i18nKey to use as the option displayed in the select menu. */
  i18nKey: string;
  /** Unique identifier for the application theme. */
  id: string;
};

export const DEFAULT_APP_LEGACY_THEME: AppLegacyTheme = {
  configs: DEFAULT_APP_LEGACY_THEME_CONFIGS,
  default: false,
  i18nKey: '',
  id: ''
};
