import type { ThemeOptions } from '@mui/material';

export type AppThemeConfigs = {
  global?: Partial<ThemeOptions>;
  light?: Partial<ThemeOptions>;
  dark?: Partial<ThemeOptions>;
};

export type AppTheme = {
  i18n: Record<string, string>;
  configs: AppThemeConfigs;
};

export type AppThemes = Record<string, AppTheme>;
