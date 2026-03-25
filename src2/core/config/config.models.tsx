import { AppAPIConfig, AppAPISettingsSchema } from 'core/api/api.config';
import { AppAuthConfig } from 'core/auth';
import { AppLayoutConfig, AppLayoutSettingsSchema } from 'core/layout';
import { AppRouterConfig, AppRouterSettingsSchema } from 'core/router';
import { AppSnackbarConfig } from 'core/snackbar';
import { AppThemeConfig, AppThemeSettingsSchema } from 'core/theme';
import type { ClassificationDefinition } from 'helpers/classificationParser';
import type { Configuration } from 'models/base/config';
import type { UserSettings } from 'models/base/user_settings';
import type { CustomUser, Indexes, SystemMessage } from 'models/ui/user';
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
    layout: AppLayoutSettingsSchema.optional().nullable(),
    router: AppRouterSettingsSchema.optional().nullable(),
    theme: AppThemeSettingsSchema.optional().nullable()
  })
  .nullable()
  .optional();

export type AppSettings = z.infer<typeof AppSettingsSchema>;

export type AppConfig = {
  app: {
    name: string;
    link: string;
  };
  api: AppAPIConfig;
  auth: AppAuthConfig;
  layout: AppLayoutConfig;
  quota: { api: number; submission: number };
  router: AppRouterConfig;
  snackbar: AppSnackbarConfig;
  theme: AppThemeConfig;

  c12nDef: ClassificationDefinition;
  classificationAliases: ClassificationAliases;
  configuration: Configuration;
  flattenedProps: any;
  indexes: Indexes;
  settings: UserSettings;
  systemMessage: SystemMessage;
  user: CustomUser;
};
