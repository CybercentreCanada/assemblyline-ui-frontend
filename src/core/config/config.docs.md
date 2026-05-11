# core/config

Application configuration store — **read-only after bootstrap**. Holds the `AppConfig` data received from the backend during authentication. Auth fetches `/api/v4/user/whoami/`, normalizes the response, and pushes it into this store. All other modules subscribe read-only.

## Architecture (3-layer model)

| Layer | Store | Mutability | Persistence | Owner |
| ----- | ----- | ---------- | ----------- | ----- |
| **App Config** | `useAppConfig` | Read-only after auth sets it | None (from backend via auth) | Auth (populates), Config (stores) |
| **System Config** | `useSystemConfig` | Read-only after bootstrap | None (from backend/env) | Backend/Admin |
| **User Preferences** | `usePreferences` | User-writable | Backend API + localStorage | User |
| **Session State** | Module-owned stores | Ephemeral | None | Each module |

### App Config (`core/config/`)

The main application data from the `/api/v4/user/whoami/` response. Set by the auth process after successful authentication. Components subscribe with `useAppConfig(s => s.field)`.

Shape (`AppConfig`): `c12nDef`, `classificationAliases`, `configuration`, `flattenedProps`, `indexes`, `systemMessage`, `user`, `settings`.

### System Config (`core/config/`)

Infrastructure-level values (API timing, quotas, snackbar config). Set once during bootstrap. Components subscribe with `useSystemConfig(s => s.field)`.

### User Preferences (`core/preferences/`)

Data the **user controls** about how the app looks/behaves for them. Persisted to backend (eventually) and localStorage as fallback.

Examples: theme mode, density, language, layout style, drawer default, router panel count.

### Session/Runtime State (module-owned)

Ephemeral UI state that resets on refresh/logout. Each module declares its own store.

Examples: auth mode, current user, drawer open/closed, usermenu visibility, notification panel state.

## Key Files

- `config.providers.tsx` — `useAppConfig`, `useAppSetConfig`, `useSystemConfig`, `useSetSystemConfig`, `AppConfigProvider`
- `config.hooks.tsx` — Legacy hooks for saving/loading config to localStorage
- `config.utils.ts` — LocalStorage persistence utilities (save/load with Zod validation)
- `index.ts` — Public API barrel

## Data Flow

```
/api/v4/user/whoami/ (200)
  → auth normalizes response (normalizeWhoAmI)
  → auth calls useAppSetConfig({ ...normalizedData })
  → config store updates
  → consumers re-render via useAppConfig(selector)
```

## Store API

### Reading

```typescript
import { useAppConfig } from 'core/config';

// Subscribe to a specific field
const configuration = useAppConfig(s => s.configuration);
const user = useAppConfig(s => s.user);
const c12nDef = useAppConfig(s => s.c12nDef);
```

### Writing (auth only)

```typescript
import { useAppSetConfig } from 'core/config';

const setConfig = useAppSetConfig();

// Set after successful whoami
setConfig(normalizedWhoAmI);

// Partial update
setConfig(prev => ({ ...prev, user: updatedUser }));
```

### Outside React

```typescript
import { getAppConfigState } from 'core/config';

const current = getAppConfigState();
```

## Legacy Hooks

These still exist for backward compatibility during migration:

- `useSaveAppConfig` — saves current store to localStorage
- `useLoadAppConfig` — loads from localStorage into store
- `useSaveSettings` / `useLoadSettings` — same with pending state

## What NOT to Do

- **Fetch data in the config module** — Auth owns the fetch. Config just stores.
- **Mutate config from feature modules** — Only auth sets config. Everyone else reads.
- **Use React Context for shared state** — Use Zustand stores. Context causes full-subtree re-renders.
- **Prop drill config beyond 2 levels** — Use `useAppConfig(selector)` directly.
