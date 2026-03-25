import z from 'zod';

export const AppSnackbarSettingsSchema = z.object({
  dense: z.boolean().default(true).optional(),
  maxSnack: z.number().default(3).optional()
});

export type AppSnackbarSettings = z.infer<typeof AppSnackbarSettingsSchema>;

export type AppSnackbarConfig = AppSnackbarSettings & {};
