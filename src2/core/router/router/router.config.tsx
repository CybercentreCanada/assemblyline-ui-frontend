import { z } from 'zod';

export const AppRouterSettingsSchema = z.object({
  maxPanels: z.number().min(1).optional(),
  maxNodes: z.number().min(0).optional()
});

export type AppRouterSettings = z.infer<typeof AppRouterSettingsSchema>;

export type AppRouterConfig = AppRouterSettings & {};
