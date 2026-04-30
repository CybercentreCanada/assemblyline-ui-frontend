# Core/Routes

## 1. Purpose

The route definition system that provides compile-time type safety for all navigation in the application. It defines every page route as a typed object with encoded path params, search params, and hash — so that navigating, reading params, and building URLs are all statically checked by TypeScript. If a route changes its params, every usage breaks at compile time rather than at runtime.

## 2. Features

- **Type-safe route factories** — Define routes with typed path params, search params, and hash via `createAppRoute`
- **Param codecs** — Path params are parsed and stringified through codec functions, ensuring URL segments are always valid
- **Search param engine** — Search params use a delta-based system that tracks only changed values, keeping URLs minimal
- **Route guards** — Per-route `disabled` and `forbidden` boundaries with customizable fallback components
- **Error boundaries** — Each route is wrapped in an `ErrorBoundary` that catches render errors without crashing the app
- **Route metadata** — Optional `meta` field for title, breadcrumbs, icons, permissions
- **Selector-based param access** — Hooks use selectors to subscribe to specific param slices, preventing unnecessary re-renders

## 3. Concepts

### Route Factory

`createAppRoute` takes a path string and optional param/search/hash definitions, then returns a route object containing:
- The path pattern (e.g., `/alerts/:id`)
- A `params` codec (parse URL segments → typed object, stringify typed object → URL segments)
- A `search` engine (parse query string → typed snapshot, delta → minimal query string)
- A `hash` codec (parse/stringify hash value)
- An `element` — the route's component wrapped in ErrorBoundary → DisabledBoundary → ForbiddenBoundary → AppRouteProvider

### Param Codecs

Path params use blueprint-based codecs from `features/path-params`. Each param key in the path (`:id`, `:sha256`) is mapped to a codec that handles parsing from the URL and stringifying back. This means params are not just strings — they can be validated and transformed.

### Search Param Engine

Search params use `features/search-params` which provides:
- **Blueprints** — Define each param's type, default value, and serialization
- **Delta** — Only non-default values are serialized to the URL, keeping it clean
- **Snapshots** — A frozen object representing current search param state
- **Location sync** — The engine reads from `location.search` and writes back via `toLocationSearch()` / `toLocationState()`

### Route Store

Each mounted route gets its own scoped store (`AppRouteStore`) via `AppRouteProvider`. This store holds the current `params`, `search`, and `hash` parsed from the URL. Hooks read from this store using selectors, so components only re-render when their specific param changes.

### Route Key

Each route instance in the router system is identified by a UUID (`routeKey`). The `AppRouteKeyProvider` makes this key available to the route's component tree, allowing it to identify which router store entry it belongs to.

## 4. Configuration

### Defining Routes

Routes are defined in `app/app.routes.tsx` using the factory:

```typescript
import { createAppRoute } from 'core/routes';
import { AlertDetailPage } from 'pages/AlertDetail';

export const APP_ROUTES = [
  createAppRoute({
    path: '/alerts/:id',
    params: blueprints => ({ id: blueprints.string() }),
    search: blueprints => ({ tab: blueprints.enum(['details', 'history']) }),
    component: AlertDetailPage,
    forbidden: () => !hasPermission('alert_view'),
  }),

  createAppRoute({
    path: '/submit',
    component: SubmitPage,
  }),
] as const;
```

### Route Options

| Option | Purpose |
|--------|---------|
| `path` | URL pattern with `:param` segments |
| `params` | Path param blueprints — defines codec for each `:param` |
| `search` | Search param blueprints — defines typed query params |
| `hash` | Hash codec function |
| `disabled` | Boolean or function — shows disabled fallback when true |
| `forbidden` | Boolean or function — shows forbidden fallback when true |
| `loading` | Boolean or function — shows loading fallback when true |
| `component` | The page component to render |
| `disabledComponent` | Custom fallback for disabled state |
| `forbiddenComponent` | Custom fallback for forbidden state |
| `errorComponent` | Custom fallback for render errors |
| `meta` | Metadata (title, breadcrumb, icon) |

## 5. Usage (Consumer API)

### Reading Path Params

```typescript
import { useAppPathParams } from 'core/routes';

// Selector-based — only re-renders when `id` changes
const id = useAppPathParams('/alerts/:id', params => params.id);
```

### Reading Search Params

```typescript
import { useAppSearchParams } from 'core/routes';

// Selector-based — only re-renders when `tab` changes
const tab = useAppSearchParams('/alerts/:id', search => search.tab);
```

### Reading Hash

```typescript
import { useAppHashParams } from 'core/routes';

const hash = useAppHashParams('/alerts/:id', hash => hash);
```

### Reading Multiple Params at Once

```typescript
import { useAppRoute } from 'core/routes';

const { id, tab } = useAppRoute('/alerts/:id', store => ({
  id: store.params.id,
  tab: store.search.tab
}));
```

### Getting the Current Route Key

```typescript
import { useAppRouteKey } from 'core/routes';

// Returns the UUID key for this route instance in the router store
const routeKey = useAppRouteKey();
```

### Building Hrefs (in hooks/utils)

```typescript
import { buildRouteLocation } from 'core/routes';
import { APP_ROUTES } from 'app/app.routes';

const { href, state } = buildRouteLocation(APP_ROUTES, {
  path: '/alerts/:id',
  params: { id: '123' },
  search: { tab: 'details' }
});
// href = "/alerts/123?tab=details"
```

## 6. Codebase (Internals)

### Key Files

| File | Role |
|------|------|
| `routes.models.ts` | Type definitions: `AppRoute`, `CreatedAppRoute`, `CreatedAppRouteParamsMap`, `AppRouteLocation` |
| `routes.factories.tsx` | `createAppRoute` — builds a route object from path + options |
| `routes.hooks.tsx` | `useAppPathParams`, `useAppSearchParams`, `useAppHashParams`, `useAppRoute` |
| `routes.providers.tsx` | `AppRouteProvider` (per-route store), `AppRouteKeyProvider` (route identity) |
| `routes.components.tsx` | `DisabledBoundary`, `ForbiddenBoundary` — route guard components |
| `routes.utils.tsx` | `findAppRoute`, `buildRoutePathname`, `buildRouteSearch`, `buildRouteHash`, `buildRouteLocation` |
| `routes.utils.test.tsx` | Unit tests for route building utilities |

### Utility Functions

| Function | Purpose |
|----------|---------|
| `findAppRoute` | Finds a route definition matching a typed destination |
| `buildRoutePathname` | Resolves `:param` segments into actual values via codec |
| `buildRouteSearch` | Serializes search params via delta (only non-default values) |
| `buildRouteHash` | Normalizes hash value through codec |
| `buildRouteState` | Builds `location.state` from search delta for state-based navigation |
| `buildRouteLocation` | Composes all of the above into a final `{ href, state }` payload |

### Related Modules

- `core/router/` — The navigation engine that uses these route definitions
- `features/path-params/` — Path param codec system (blueprints, parsing, stringifying)
- `features/search-params/` — Search param engine (blueprints, delta, snapshot, serialization)
- `app/app.routes.tsx` — The route registry where all pages are declared
