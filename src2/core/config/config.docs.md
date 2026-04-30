# core/config

Global application state management via a single Zustand store (`AppConfig`). This is the central nervous system of the app — all shared UI state flows through here.

## Responsibilities

- Single global Zustand store holding all application-wide state
- `useAppConfig(selector)` — read specific slices of state with focused re-renders
- `useAppSetConfig()` — write to the store via shallow merge
- Persistence of user settings to localStorage (with Zod validation on read)
- Deep merge utilities for initializing and restoring defaults
- Provider that hydrates the store on app startup

## Key Files

- `config.hooks.tsx` — `useAppConfig`, `useAppSetConfig`, and derived selector hooks
- `config.providers.tsx` — Store initialization and hydration provider
- `config.utils.ts` — Deep merge, persistence read/write, default generation

## Why a Single Store

The application needs to share state across deeply nested component trees — auth status, layout preferences, server-derived configuration, and transient UI state (drawers, modals, etc.).

Options considered:

1. **React Context** — Causes full subtree re-renders on any change
2. **Redux** — Heavy boilerplate, overkill for our needs
3. **Multiple Zustand stores** — Clean separation but harder cross-store coordination
4. **Single Zustand store with selectors** — Simple, performant, one mental model

The single-store approach won because selector-based subscriptions prevent unnecessary re-renders, there's a single source of truth (easy to debug with devtools), and zero boilerplate to add new state (just extend the type).

**Tradeoffs:**

- Mixes concerns: UI state, server-derived state, and persisted preferences live together
- Nested updates require manual spreading (no immer)
- Risk of "god object" if discipline isn't maintained

**Mitigations:**

- Config is typed — adding fields requires touching the type definition
- Each domain (layout, router, theme, auth) owns a nested subtree
- Server-derived state is being progressively moved to React Query cache
- Persisted preferences are validated by Zod schema on load

## State Philosophy

State is categorized by **ownership and lifecycle**:

| Category | Owner | Lifetime | Storage |
| -------- | ----- | -------- | ------- |
| UI State | Client | Session | Zustand (AppConfig) |
| Server State | API | Cache TTL | React Query |
| Navigation State | URL | Page visit | react-router / search params |
| Persisted Preferences | User | Permanent | localStorage (via Zod schema) |

The goal is to keep each category in the tool best suited for it. In practice, the AppConfig store currently handles UI state + persisted preferences + some server state.

## Store Structure

```typescript
type AppConfig = {
  // Static/boot config
  api: AppAPIConfig;
  auth: AppAuthConfig;
  router: AppRouterConfig;
  snackbar: AppSnackbarConfig;
  theme: AppThemeConfig;

  // UI layout state
  layout: AppLayoutConfig;
  quota: { api: number; submission: number };

  // Server-derived state (populated after auth)
  c12nDef?: ClassificationDefinition;
  configuration?: Configuration;
  indexes?: Indexes;
  settings?: UserSettings;
  systemMessage?: SystemMessage;
  user?: CustomUser;
};
```

## Access Patterns

**Reading state** — Use `useAppConfig` with a selector:

```typescript
const drawerOpen = useAppConfig(c => c.layout.notifications.open);
const isAdmin = useAppConfig(c => c.user?.is_admin ?? false);
```

Selectors are memoized via `useShallow` internally. Components only re-render when their selected slice changes.

**Writing state** — Use `useAppSetConfig` which returns a setter that shallow-merges:

```typescript
const setConfig = useAppSetConfig();
setConfig({ layout: { ...config.layout, notifications: { ...config.layout.notifications, open: true } } });
```

For nested updates, always spread the intermediate objects to avoid clobbering sibling properties.

## Persistence

A subset of the config store is persisted to localStorage on change. The `AppSettingsSchema` (Zod) defines which fields are saved and validates them on load. Invalid stored data falls back to `DEFAULT_APP_CONFIG`.

Key: `al.settings`

## React Query (TanStack)

All API data fetching and caching uses React Query. Query results are:

- Cached with configurable `staleTime` and `gcTime`
- Persisted to sessionStorage via `PersistQueryClientProvider`
- Compressed with lz-string to reduce storage size

After mutations, invalidate related queries explicitly. Do not rely on automatic refetching. See `core/api/api.docs.md` for query/mutation patterns.

## Per-Feature Stores

For feature-local state that doesn't belong in AppConfig, use `createAppStore` (Zustand wrapper in `features/store/`). This creates a context-scoped store with the same selector pattern.

Use when:

- State is feature-private (no other feature needs it)
- State has complex update logic (reducers, computed values)
- State lifecycle is tied to a component tree (mount/unmount)

## What NOT to Use

- **React Context for shared state** — Use Zustand instead. Context causes full-subtree re-renders.
- **Redux** — Not used. Zustand provides the same capability with less boilerplate.
- **Component-local state for shared concerns** — If two components need the same state, lift it to the store.
- **Prop drilling beyond 2 levels** — Use the store instead.
