import { z } from 'zod';

export const APP_PREFERENCE_STORAGE_KEY = 'al.settings';

/** React Query cache timing settings. */
const API_PREFERENCE_SCHEMA = z.object({
  /** How long cached data is retained after all subscribers unmount (ms). */
  gcTime: z.number().catch(1_000),
  /** Delay after a mutation before dependent queries are invalidated (ms). */
  invalidateDelay: z.number().catch(1_000),
  /** Backoff interval between failed query retries (ms). */
  retryTime: z.number().catch(10_000),
  /** Duration before cached data is considered stale (ms). */
  staleTime: z.number().catch(1_000)
});

/** Login provider and post-login redirect preferences. */
const AUTH_PREFERENCE_SCHEMA = z.object({
  /** Last selected authentication method. */
  preferredMethod: z.string().catch(null),
  /** Path to redirect to after successful login. */
  redirectTo: z.string().catch(null)
});

/** Panel layout and navigation behaviour settings. */
const ROUTER_PREFERENCE_SCHEMA = z.object({
  /** Maximum number of nested route nodes allowed per panel. */
  maxNodes: z.number().catch(2),
  /** Maximum number of side-by-side panels allowed. */
  maxPanels: z.number().catch(2),
  /** How navigation behaves when reaching the end of the stack. */
  navigation: z.enum(['push', 'loop']).catch('push')
});

/** Controls visibility of safe/benign analysis results. */
const SAFE_RESULTS_PREFERENCE_SCHEMA = z.object({
  /** Whether safe results are shown by default. */
  show: z.boolean().catch(true)
});

/** Toast notification display settings. */
const SNACKBAR_PREFERENCE_SCHEMA = z.object({
  /** Whether notifications use compact (dense) layout. */
  dense: z.boolean().catch(true),
  /** Maximum number of notifications shown simultaneously. */
  maxSnack: z.number().catch(3)
});

/** Global UI template and appearance settings. */
const TEMPLATE_PREFERENCE_SCHEMA = z.object({
  /** Allow the translation. */
  allowTranslate: z.boolean().catch(true),
  /** Whether the appbar hides on scroll. */
  autoHideAppbar: z.boolean().catch(false),
  /** Component spacing density. */
  density: z.enum(['comfortable', 'compact', 'dense']).catch('comfortable'),
  /** Whether the side drawer is open by default. */
  drawerOpen: z.boolean().catch(true),
  /** Active UI language code. */
  lang: z.string().catch('en'),
  /** Whether the navigation bar is positioned on the side or top. */
  layout: z.enum(['side', 'top']).catch('side'),
  /** Light/dark/system colour mode. */
  mode: z.enum(['system', 'light', 'dark']).catch('system'),
  /** Whether breadcrumb navigation is visible. */
  showBreadcrumbs: z.boolean().catch(true),
  /** Whether the top quick-search bar is visible. */
  showQuickSearch: z.boolean().catch(true),
  /** Active theme identifier. */
  theme: z.string().catch('theme.default')
});

/** Root schema combining all preference slices. */
export const APP_PREFERENCE_SCHEMA = z.object({
  /** React Query cache timing configuration. */
  api: API_PREFERENCE_SCHEMA.catch(() => API_PREFERENCE_SCHEMA.parse({})),
  /** Login provider and redirect preferences. */
  auth: AUTH_PREFERENCE_SCHEMA.catch(() => AUTH_PREFERENCE_SCHEMA.parse({})),
  /** Panel layout and navigation behaviour. */
  router: ROUTER_PREFERENCE_SCHEMA.catch(() => ROUTER_PREFERENCE_SCHEMA.parse({})),
  /** Safe/benign result visibility. */
  safeResults: SAFE_RESULTS_PREFERENCE_SCHEMA.catch(() => SAFE_RESULTS_PREFERENCE_SCHEMA.parse({})),
  /** Toast notification display settings. */
  snackbar: SNACKBAR_PREFERENCE_SCHEMA.catch(() => SNACKBAR_PREFERENCE_SCHEMA.parse({})),
  /** Global UI template and appearance settings. */
  template: TEMPLATE_PREFERENCE_SCHEMA.catch(() => TEMPLATE_PREFERENCE_SCHEMA.parse({}))
});

export const DEFAULT_APP_PREFERENCE_STORE = APP_PREFERENCE_SCHEMA.parse({});

declare global {
  type AppPreferenceStore = z.infer<typeof APP_PREFERENCE_SCHEMA>;
}
