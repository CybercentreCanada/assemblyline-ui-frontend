import { z } from 'zod';

declare global {
  type AppPreference = z.infer<typeof APP_PREFERENCE_SCHEMA>;
}

const API_PREFERENCE_SCHEMA = z.object({
  gcTime: z.number().catch(1_000),
  invalidateDelay: z.number().catch(1_000),
  retryTime: z.number().catch(10_000),
  staleTime: z.number().catch(1_000)
});

const AUTH_PREFERENCE_SCHEMA = z.object({
  preferredMethod: z.string().catch(null),
  redirectTo: z.string().catch(null)
});

const LAYOUT_PREFERENCE_SCHEMA = z.object({
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

const ROUTER_ROUTER_SCHEMA = z.object({
  maxPanels: z.number().catch(2),
  maxNodes: z.number().catch(2),
  navigation: z.enum(['push', 'loop']).catch('push')
});

const SNACKBAR_PREFERENCE_sCHEMA = z.object({
  dense: z.boolean().catch(true),
  maxSnack: z.number().catch(3)
});

const THEME_PREFERENCE_SCHEMA = z.object({
  mode: z.enum(['system', 'light', 'dark']).catch('system'),
  variant: z.enum(['default']).catch('default')
});

export const APP_PREFERENCE_SCHEMA = z.object({
  api: API_PREFERENCE_SCHEMA.catch(API_PREFERENCE_SCHEMA.parse({})),
  auth: AUTH_PREFERENCE_SCHEMA.catch(AUTH_PREFERENCE_SCHEMA.parse({})),
  layout: LAYOUT_PREFERENCE_SCHEMA.catch(LAYOUT_PREFERENCE_SCHEMA.parse({})),
  router: ROUTER_ROUTER_SCHEMA.catch(ROUTER_ROUTER_SCHEMA.parse({})),
  snackbar: SNACKBAR_PREFERENCE_sCHEMA.catch(SNACKBAR_PREFERENCE_sCHEMA.parse({})),
  theme: THEME_PREFERENCE_SCHEMA.catch(THEME_PREFERENCE_SCHEMA.parse({}))
});
