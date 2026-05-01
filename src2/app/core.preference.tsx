import { z } from 'zod';

declare global {
  type AppPreference = z.infer<typeof AppPreferenceSchema>;
}

const ApiPreferenceSchema = z.object({
  gcTime: z.number().catch(1_000),
  invalidateDelay: z.number().catch(1_000),
  retryTime: z.number().catch(10_000),
  staleTime: z.number().catch(1_000)
});

const LayoutPreferenceSchema = z.object({
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

const ThemePreferenceSchema = z.object({
  mode: z.enum(['system', 'light', 'dark']).catch('system'),
  variant: z.enum(['default']).catch('default')
});

export const PreferenceSchema = z.object({
  api: ApiPreferenceSchema.catch(ApiPreferenceSchema.parse({})),
  layout: LayoutPreferenceSchema.catch(LayoutPreferenceSchema.parse({})),
  theme: ThemePreferenceSchema.catch(ThemePreferenceSchema.parse({}))
});

export const AppPreferenceSchema = PreferenceSchema;
