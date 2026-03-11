import type { ThemeOptions } from '@mui/material';
import { z } from 'zod';

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

//*****************************************************************************************
// App Theme Settings & Config
//*****************************************************************************************

export const AppThemeSettingsSchema = z.object({
  mode: z.enum(['system', 'light', 'dark']).optional(),
  variant: z.enum(['default']).optional()
});

export type AppThemeSettings = z.infer<typeof AppThemeSettingsSchema>;

export type AppThemeConfig = AppThemeSettings & {
  injectFirst?: boolean;
};
