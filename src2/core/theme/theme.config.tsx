import z from 'zod';

export const AppThemeSettingsSchema = z.object({
  mode: z.enum(['system', 'light', 'dark']).optional(),
  variant: z.enum(['default']).optional()
});

export type AppThemeSettings = z.infer<typeof AppThemeSettingsSchema>;

export type AppThemeConfig = AppThemeSettings & {
  injectFirst?: boolean;
};
