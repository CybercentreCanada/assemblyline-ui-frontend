import type { Components, PaletteOptions, Theme, TypographyVariantsOptions } from '@mui/material';
import type { CSSProperties } from 'react';

/**
 * Subset of CSS values used by the app bar theme model.
 */
type AppBarColorValue = CSSProperties['color'];
type AppBarBackgroundValue = CSSProperties['backgroundColor'];

/**
 * Style tokens that can be configured per app bar color mode.
 */
export type AppBarStyles = {
  /** Text/icon color applied to the app bar. */
  color?: AppBarColorValue;
  /** Surface color applied to the app bar. */
  backgroundColor?: AppBarBackgroundValue;
};

/**
 * App bar-specific theme configuration used by the app shell.
 */
export type AppBarThemeConfigs = {
  /** Shadow depth for the app bar. Typically relevant for top layouts. */
  elevation?: number;
  /** App bar colors when the active palette mode is `light`. */
  light?: AppBarStyles;
  /** App bar colors when the active palette mode is `dark`. */
  dark?: AppBarStyles;
};

/**
 * Palette overrides by color mode.
 * Each value is forwarded to MUI `createTheme({ palette })`.
 */
export type AppThemePalette = {
  /** Palette overrides for light mode. */
  light?: PaletteOptions;
  /** Palette overrides for dark mode. */
  dark?: PaletteOptions;
};

/**
 * Root theme contract consumed by the app-level theme provider.
 */
export type AppTheme = {
  /** App bar visual configuration by mode. */
  appbar?: AppBarThemeConfigs;
  /** Component-level MUI overrides (`theme.components`). */
  components?: Components<Omit<Theme, 'components'>>;
  /** Palette overrides split by light and dark mode. */
  palette?: AppThemePalette;
  /** Typography variant overrides (`theme.typography`). */
  typography?: TypographyVariantsOptions;
};
