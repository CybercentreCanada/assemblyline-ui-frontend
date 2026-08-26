import type { infer as zInfer } from 'zod';
import { boolean as zBoolean, enum as zEnum, number as zNumber, object as zObject, string as zString } from 'zod';

export const APP_PREFERENCE_STORAGE_KEY = 'Assemblyline.preferences';

/** React Query cache timing settings. */
const API_PREFERENCE_SCHEMA = zObject({
  /** How long cached data is retained after all subscribers unmount (ms). */
  gcTime: zNumber().catch(1_000),
  /** Delay after a mutation before dependent queries are invalidated (ms). */
  invalidateDelay: zNumber().catch(1_000),
  /** Backoff interval between failed query retries (ms). */
  retryTime: zNumber().catch(10_000),
  /** Duration before cached data is considered stale (ms). */
  staleTime: zNumber().catch(1_000)
});

/** Login provider and post-login redirect preferences. */
const AUTH_PREFERENCE_SCHEMA = zObject({
  /** Last selected authentication method. */
  preferredMethod: zString().catch(null),
  /** Path to redirect to after successful login. */
  redirectTo: zString().catch(null)
});

/** Panel layout and navigation behaviour settings. */
const ROUTER_PREFERENCE_SCHEMA = zObject({
  /** Maximum number of nested route nodes allowed per panel. */
  maxNodes: zNumber().catch(2),
  /** Maximum number of side-by-side panels allowed. */
  maxPanels: zNumber().catch(2),
  /** How navigation behaves when reaching the end of the stack. */
  navigation: zEnum(['push', 'loop']).catch('push')
});

/** Controls visibility of safe/benign analysis results. */
const SAFE_RESULTS_PREFERENCE_SCHEMA = zObject({
  /** Whether safe results are shown by default. */
  show: zBoolean().catch(true)
});

/** Toast notification display settings. */
const SNACKBAR_PREFERENCE_SCHEMA = zObject({
  /** Whether notifications use compact (dense) layout. */
  dense: zBoolean().catch(true),
  /** Maximum number of notifications shown simultaneously. */
  maxSnack: zNumber().catch(3)
});

/** Global UI template and appearance settings. */
const TEMPLATE_PREFERENCE_SCHEMA = zObject({
  /** Allow the translation. */
  allowTranslate: zBoolean().catch(true),
  /** Whether the appbar hides on scroll. */
  autoHideAppbar: zBoolean().catch(false),
  /** Component spacing density. */
  density: zEnum(['comfortable', 'compact', 'dense']).catch('comfortable'),
  /** Whether the side drawer is open by default. */
  drawerOpen: zBoolean().catch(true),
  /** Active UI language code. */
  lang: zString().catch('en'),
  /** Whether the navigation bar is positioned on the side or top. */
  layout: zEnum(['side', 'top']).catch('side'),
  /** Light/dark/system colour mode. */
  mode: zEnum(['system', 'light', 'dark']).catch('system'),
  /** Whether breadcrumb navigation is visible. */
  showBreadcrumbs: zBoolean().catch(true),
  /** Whether the top quick-search bar is visible. */
  showQuickSearch: zBoolean().catch(true),
  /** Active theme identifier. */
  theme: zString().catch('theme.default')
});

/** Notification max age filtering schema for tags. */
const NOTIFICATION_MAX_AGE_SCHEMA = zObject({
  /** Timespan in ms to show community-tagged notifications (default 1 year). */
  community: zNumber().catch(365 * 24 * 60 * 60 * 1000),
  /** Timespan in ms to show dev-tagged notifications (default 30 days). */
  dev: zNumber().catch(30 * 24 * 60 * 60 * 1000),
  /** Timespan in ms to show service-tagged notifications (default 1 year). */
  service: zNumber().catch(365 * 24 * 60 * 60 * 1000),
  /** Timespan in ms to show stable/general notifications (default 90 days). */
  stable: zNumber().catch(90 * 24 * 60 * 60 * 1000)
});

/** Notification filtering, timespan and timestamp preferences. */
const NOTIFICATION_PREFERENCE_SCHEMA = zObject({
  /** Timestamp (ms) when notifications were last opened. */
  lastOpenedAt: zNumber().catch(0),
  /** Max age filtering preferences by tag in ms. */
  maxAge: NOTIFICATION_MAX_AGE_SCHEMA.catch(() => NOTIFICATION_MAX_AGE_SCHEMA.parse({}))
});

/** Root schema combining all preference slices. */
export const APP_PREFERENCE_SCHEMA = zObject({
  /** React Query cache timing configuration. */
  api: API_PREFERENCE_SCHEMA.catch(() => API_PREFERENCE_SCHEMA.parse({})),
  /** Login provider and redirect preferences. */
  auth: AUTH_PREFERENCE_SCHEMA.catch(() => AUTH_PREFERENCE_SCHEMA.parse({})),
  /** Notification display, filtering, and timestamp settings. */
  notifications: NOTIFICATION_PREFERENCE_SCHEMA.catch(() => NOTIFICATION_PREFERENCE_SCHEMA.parse({})),
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
  type AppPreferenceStore = zInfer<typeof APP_PREFERENCE_SCHEMA>;
}
