import { z } from 'zod';

//*****************************************************************************************
// App Layout Settings & Config
//*****************************************************************************************

export const AppLayoutSettingsSchema = z.object({
  mode: z.enum(['top', 'side']).optional(),
  left_nav: z
    .object({
      open: z.boolean().optional(),
      width: z.number().optional()
    })
    .optional()
});

export type AppLayoutSettings = z.infer<typeof AppLayoutSettingsSchema>;

export type AppLayoutConfig = AppLayoutSettings & {
  left_nav?: {
    test?: boolean;
  };
};
