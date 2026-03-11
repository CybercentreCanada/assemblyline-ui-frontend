import { AppAPIConfig, AppAPISettingsSchema } from 'core/api/api.models';
import { AppRouterConfig, AppRouterSettingsSchema } from 'core/router/router/router.models';
import { AppThemeConfig, AppThemeSettingsSchema } from 'core/theme/theme.models';
import { z } from 'zod';

// export type AppAPIConfig = {
//   staleTime: number;
//   gcTime: number;
//   showDevtools: boolean;
// };

// export const AppAPIConfigSchema = z.object({
//   staleTime: z.number(),
//   gcTime: z.number(),
//   showDevtools: z.boolean()
// });

// export type AppRuntimeConfig = {
//   storageKey: string;
// };

// export const AppRuntimeConfigSchema = z.object({
//   storageKey: z.string()
// });

// export type AppConfigStore = {
//   api: AppAPIConfig;
//   config: AppRuntimeConfig;
//   router: AppRouterConfig;
//   theme: AppThemeConfig;
// };

// export const AppConfigSchema = z.object({
//   api: AppAPIConfigSchema,
//   config: AppRuntimeConfigSchema,
//   router: AppRouterConfigSchema,
//   theme: z.custom<AppThemeConfig>(value => value != null, { message: 'Invalid theme config' })
// });

export const AppSettingsSchema = z
  .object({
    api: AppAPISettingsSchema.optional().nullable(),
    router: AppRouterSettingsSchema.optional().nullable(),
    theme: AppThemeSettingsSchema.optional().nullable()
  })
  .nullable()
  .optional();

export type AppSettings = z.infer<typeof AppSettingsSchema>;

export type AppConfig = {
  api: AppAPIConfig;
  quota: { api: number; submission: number };
  router: AppRouterConfig;
  theme: AppThemeConfig;
};
