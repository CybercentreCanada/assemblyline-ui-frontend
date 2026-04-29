import { AppTheme } from '@tui/core';
import z from 'zod';

export const AppThemeSettingsSchema = z.object({
  mode: z.enum(['system', 'light', 'dark']).optional(),
  variant: z.enum(['default']).optional()
});

export type AppThemeSettings = z.infer<typeof AppThemeSettingsSchema>;

export type AppThemeConfig = AppThemeSettings & {
  initialized?: boolean;
  injectFirst?: boolean;
  skin?: AppTheme;
};
