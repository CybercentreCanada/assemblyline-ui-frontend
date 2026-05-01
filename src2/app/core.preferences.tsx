import { z } from 'zod';

declare global {
  type AppPreferences = z.infer<typeof AppPreferencesSchema>;
}

const ApiPreferencesSchema = z.object({
  gcTime: z.number().catch(1_000),
  invalidateDelay: z.number().catch(1_000),
  retryTime: z.number().catch(10_000),
  staleTime: z.number().catch(1_000)
});

const LayoutPreferencesSchema = z.object({
  autoHideAppbar: z.boolean().catch(true),
  density: z.enum(['comfortable', 'compact', 'dense']).catch('comfortable'),
  drawerOpen: z.boolean().catch(true),
  lang: z.string().catch('en'),
  layout: z.enum(['side', 'top']).catch('side'),
  mode: z.enum(['system', 'light', 'dark']).catch('system'),
  showBreadcrumbs: z.boolean().catch(true),
  showQuickSearch: z.boolean().catch(true),
  theme: z.string().catch('theme.default')
});

const ThemePreferencesSchema = z.object({
  mode: z.enum(['system', 'light', 'dark']).catch('system'),
  variant: z.enum(['default']).catch('default')
});

export const PreferencesSchema = z.object({
  api: ApiPreferencesSchema.catch(ApiPreferencesSchema.parse({})),
  layout: LayoutPreferencesSchema.catch(LayoutPreferencesSchema.parse({})),
  theme: ThemePreferencesSchema.catch(ThemePreferencesSchema.parse({}))
});

export const AppPreferencesSchema = PreferencesSchema;
