// import { AppApiConfig, AppApiSettingsSchema } from 'core/api/api.config';
// import { AppLayoutConfig, AppLayoutSettingsSchema } from 'core/layout/layout.config';
// import { AppRouterConfig, AppRouterSettingsSchema } from 'core/router/router.config';
// import { AppSnackbarConfig } from 'core/snackbar/snackbar.config';
import { ClassificationAliases, ClassificationDefinition } from 'features/classification/classificationParser';
// import { AppAuthConfig, AppAuthSettingsSchema } from 'layout/auth/auth.config';
import type { CustomUser, Indexes, SystemMessage } from 'models/api/user';
import type { Configuration } from 'models/base/config';
import type { UserSettings } from 'models/base/user_settings';
import { z } from 'zod';

//*****************************************************************************************
// System Config — read-only after bootstrap, set by backend/environment
//*****************************************************************************************

export type AppSystemConfig = {
  // api: AppApiConfig;
  quota: { api: number; submission: number };
  // snackbar: AppSnackbarConfig;

  c12nDef?: ClassificationDefinition;
  classificationAliases?: ClassificationAliases;
  configuration?: Configuration;
  flattenedProps?: any;
  indexes?: Indexes;
  systemMessage?: SystemMessage;
};

export const DEFAULT_APP_SYSTEM_CONFIG: AppSystemConfig = {
  // api: {
  //   staleTime: 1_000,
  //   gcTime: 1_000,
  //   retryTime: 10_000,
  //   invalidateDelay: 1_000,
  //   showDevtools: false
  // },
  quota: {
    api: null,
    submission: null
  }
  // snackbar: {
  //   dense: true,
  //   maxSnack: 3
  // }
};

//*****************************************************************************************
// Legacy AppConfig — deprecated, use AppSystemConfig + AppPreferences + module stores
//*****************************************************************************************

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

/** @deprecated Use AppPreferencesSchema from core/preferences instead */
export const AppSettingsSchema = z
  .object({
    // api: AppApiSettingsSchema.optional().nullable(),
    // auth: AppAuthSettingsSchema.optional().nullable(),
    // layout: AppLayoutSettingsSchema.optional().nullable(),
    // router: AppRouterSettingsSchema.optional().nullable()
    // theme: AppThemeSettingsSchema.optional().nullable()
  })
  .nullable()
  .optional();

/** @deprecated Use AppPreferences from core/preferences instead */
export type AppSettings = z.infer<typeof AppSettingsSchema>;

/** @deprecated Use AppSystemConfig + AppPreferences + module stores instead */
export type AppConfig = {
  api: { staleTime?: number; gcTime?: number; retryTime?: number; invalidateDelay?: number; showDevtools?: boolean };
  quota: { api: number; submission: number };

  c12nDef?: ClassificationDefinition;
  classificationAliases?: ClassificationAliases;
  configuration?: Configuration;
  flattenedProps?: any;
  indexes?: Indexes;
  settings?: UserSettings;
  systemMessage?: SystemMessage;
  user?: CustomUser;
};

export const APP_CONFIG_LOCAL_STORAGE_KEY = 'al.settings';

export const DEFAULT_APP_CONFIG: AppConfig = {
  api: {
    staleTime: 1_000,
    gcTime: 1_000,
    retryTime: 10_000,
    invalidateDelay: 1_000,
    showDevtools: false
  },
  quota: {
    api: 0,
    submission: 0
  }
};
