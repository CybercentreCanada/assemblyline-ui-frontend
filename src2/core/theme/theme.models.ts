import type { Components, PaletteOptions, ThemeOptions, TypographyVariantsOptions } from '@mui/material';

export type AppBarStyles = {
  color: string;
  backgroundColor: string;
};

export type AppBarThemeConfigs = {
  elevation?: number;
  light?: AppBarStyles;
  dark?: AppBarStyles;
};

export type AppThemePalette = {
  light?: PaletteOptions;
  dark?: PaletteOptions;
};

export type AppThemeConfigs = {
  global?: Partial<ThemeOptions>;
  light?: Partial<ThemeOptions>;
  dark?: Partial<ThemeOptions>;
};

export type AppTheme = {
  appbar?: AppBarThemeConfigs;
  palette?: AppThemePalette;
  components?: Components;
  typography?: TypographyVariantsOptions;
};

export type AppThemes = Record<string, AppTheme>;
