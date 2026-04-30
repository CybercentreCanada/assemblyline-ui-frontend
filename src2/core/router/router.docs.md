# Core/Router

## 1. Purpose

The router is a custom multi-panel navigation engine built on top of react-router v6. It manages concurrent split views where each panel operates independently, and preserves component state across navigations using LRU-cached nodes with reverse portals. The URL is the single source of truth — the complete panel/route state is serialized into query parameters and `location.state`, making any view reproducible from a link.

## 2. Features

- **Multi-panel split views** — Up to N concurrent panels rendered side-by-side, each with independent navigation
- **LRU node caching** — Recently visited routes stay mounted in the background; oldest are evicted when capacity is exceeded
- **Reverse portal rendering** — Component trees rendered through React portals so they survive DOM relocation without unmounting
- **Tabbed routes per panel** — Each panel can have temporary, tabbed (persistent), and pinned routes
- **Type-safe navigation** — Route factories encode path params, search params, and hash; navigation and reading are fully typed
- **URL-state synchronization** — Router state is serialized into query parameters (`?p=...&p=...`) and also passed through `location.state` for full-fidelity restoration
- **Automatic garbage collection** — Orphaned routes, empty panels, and stale nodes are cleaned up on every navigation via sanitization passes
- **Navigation styles** — Configurable behavior: `push` (opens in next panel) or `loop` (cycles within current panel)
- **Route guards** — `disabled`, `forbidden`, and `loading` boundaries per route with customizable fallback components

## 3. Concepts

### Store

The router maintains its own Zustand store (`AppRouterStore`) separate from AppConfig. This store holds three collections:

- **`routes`** — A flat map of all known routes (`Record<string, { href, state, age }>`). Each entry is a URL + optional state with an age counter for LRU ordering.
- **`panels`** — An ordered array of panel descriptors. Each panel tracks its active route, temporary route, tabbed routes, and pinned routes via route keys.
- **`nodes`** — A map of cached render slots (`Record<string, { routeKey, portal }>`). Each node holds a reference to a reverse portal that keeps a component tree alive.

### Panels

A panel is a viewport slot. The `panels` array determines what's visible — panel[0] is the leftmost view, panel[1] is the right split, etc. Each panel has:

- `routeKey` — The currently active/displayed route
- `temporaryRouteKey` — A transient route that will be replaced on next navigation (like Chrome's "preview" tab)
- `tabbedRouteKeys` — Permanent tabs that persist until explicitly closed
- `pinnedRouteKeys` — Pinned tabs that cannot be evicted and sort to the left

### Nodes

A node is the rendering unit. Each node owns a **reverse portal** — a React portal node that allows a component subtree to be rendered into different DOM locations without unmounting. Nodes are associated with routes. When a panel displays a route, it renders through that route's node. If the user navigates away but the node hasn't been evicted, the component tree stays alive in memory.

Node count is bounded by `maxPanels + maxNodes`. When exceeded, the oldest node (by route age) is evicted and its component tree unmounts.

### Routes

Routes are immutable URL entries stored by UUID key. Each route tracks an `href` (pathname + search + hash), optional navigation `state`, and an `age` counter. Age is recomputed on every navigation — displayed routes always have the lowest age (youngest), ensuring they're never evicted.

### Navigation Flow

1. User calls `useAppNavigate()` with a typed route descriptor
2. The hook resolves the route to an `href` via route factories
3. A new route entry is created in the store
4. Based on the navigation style (`push`/`replace`/`to`), the target panel is determined
5. The store is sanitized (orphaned routes removed, empty panels collapsed, missing nodes added, excess nodes evicted)
6. The store is serialized to `location.state` and `?p=` query params
7. react-router's `navigate()` is called with the serialized state
8. On the receiving end, `AppRouterStoreSync` reads the location and hydrates the store

## 4. Configuration

### Provider Setup

At the application root, wrap your app in `AppRouterProvider`:

```typescript
// app/app.tsx
import { AppRouterProvider } from 'core/router';

const App = memo(() => (
  <AppRouterProvider>
    <AppLayout />
  </AppRouterProvider>
));
```

`AppRouterProvider` composes:
1. `BrowserRouter` (react-router's base with `basename="/"`)
2. `AppRouterStoreSync` — reads `useLocation()` on every navigation and hydrates the router store from either `location.state` (preferred, full fidelity) or `location.search` (fallback, query params only)

### AppConfig Settings

Router configuration lives in `AppConfig.router` and is read by the store sync:

```typescript
type AppRouterConfig = {
  maxPanels?: number;     // Max concurrent panels (default: 2)
  maxNodes?: number;      // Extra cached nodes beyond active panels (default: 2)
  navigation?: 'push' | 'loop';  // Navigation style (default: 'push')
};
```

| Setting | Effect |
|---------|--------|
| `maxPanels: 1` | Single panel, no split view. Navigating always replaces the current view. |
| `maxPanels: 2` | Two panels max. Navigating opens a split to the right; if already at 2, the leftmost is collapsed. |
| `maxNodes: 0` | No background caching. Only active panel routes stay mounted. Navigating away always unmounts. |
| `maxNodes: 2` | Two extra routes stay mounted beyond what's currently displayed. Navigating back to a recent route is instant. |
| `navigation: 'push'` | New navigations open in the next panel to the right (or create one if below `maxPanels`). |
| `navigation: 'loop'` | (Planned) New navigations cycle within the current panel. |

The total number of mounted component trees at any time is `maxPanels + maxNodes`.

### Zod Validation

Settings are validated on load via `AppRouterSettingsSchema`:

```typescript
const AppRouterSettingsSchema = z.object({
  maxPanels: z.number().min(1).optional(),
  maxNodes: z.number().min(0).optional(),
  navigation: z.enum(['push', 'loop']).optional()
});
```

## 5. Usage (Consumer API)

These are the hooks and components available to pages and layout code.

### Navigation

```typescript
import { useAppNavigate } from 'core/router';

const navigate = useAppNavigate();

// Open in next panel (default 'open' variant)
navigate({ path: '/alerts/:id', params: { id: '123' } });

// Replace current panel's route
navigate({ path: '/alerts/:id', params: { id: '123' }, variant: 'replace' });

// Open in a specific panel index
navigate({ path: '/alerts/:id', params: { id: '123' }, variant: 'to', panel: 0 });
```

### Link Component

```typescript
import { AppLink } from 'core/router';

<AppLink to={{ path: '/alerts/:id', params: { id: alert.id } }}>
  View Alert
</AppLink>

// With navigation variant
<AppLink to={{ path: '/submit', variant: 'replace' }}>
  Submit
</AppLink>
```

`AppLink` renders a real `<a>` tag (for accessibility and right-click/open-in-new-tab) but intercepts clicks to route through the panel system.

### Reading Route State

Route params and search params are accessed through `core/routes` hooks (separate from `core/router`):

```typescript
import { useAppPathParams, useAppSearchParams } from 'core/routes';

// Path params — typed by route path
const id = useAppPathParams('/alerts/:id', params => params.id);

// Search params — typed by route search schema
const tab = useAppSearchParams('/alerts/:id', search => search.tab);
```

### Store Access (Advanced)

For layout code that needs to read router state directly (e.g., rendering panel tabs):

```typescript
import { useAppRouterStore } from 'core/router';

// Read panels
const panels = useAppRouterStore(s => s.panels);

// Read a specific route
const route = useAppRouterStore(s => s.routes[routeKey]);

// Write to router store (for panel/tab management UI)
const setStore = useAppRouterSetStore();
```

## 6. Codebase (Internals)

### Key Files

| File | Role |
|------|------|
| `router.models.tsx` | Type definitions: `AppRouterPanel`, `AppRouterNode`, `AppRouterRoute`, `AppRouterStore`, `AppLinkProps` |
| `router.config.tsx` | Zod schema for config validation, `AppRouterConfig` type |
| `router.defaults.tsx` | Default values for panels, nodes, routes, store; example store for fallback |
| `router.providers.tsx` | `AppRouterProvider` (BrowserRouter + store sync), `useAppRouterStore`, `useAppRouterSetStore` |
| `router.hooks.tsx` | `useAppNavigate` (main navigation hook), `useAppRouteLocation` (href builder) |
| `router.components.tsx` | `AppLink` — type-safe link component |
| `router.utils.tsx` | Pure functions for all store operations (panels, nodes, routes, tabs, serialization) |
| `router.utils.test.tsx` | Unit tests for utility functions |

### Related Modules

- `core/routes/` — Route factories, typed param/search hooks, route providers
- `layout/router/` — The UI shell that renders panels using this engine
- `features/portal/` — Reverse portal implementation (`createReversePortalNode`, `InPortal`, `OutPortal`)
- `app/app.routes.tsx` — Route registry where all pages are declared

## 7. Improvements Over Legacy Drawer

The previous implementation used a "Drawer" component for side-by-side viewing. Every page managed the Drawer's state (what page was open in it, its actions, its transitions), creating massive coupling. Some states were stored only in component memory and couldn't be reproduced from the URL, so shared links were broken. The hash (`#sha256=...`) was used as a partial workaround but only covered a few variables.

| Legacy Limitation | New Router Solution |
|-------------------|--------------------|
| Pages managed each other's state via Drawer | Pages have zero awareness of other panels — router handles orchestration |
| States not reproducible from URL | Full state serialized into query params + `location.state` |
| Navigation unmounts previous view | LRU nodes keep views mounted; navigation is instant |
| Each new page required Drawer integration code | Pages just render content — placement is automatic |
| Hash-based partial state hacks | Type-safe route factories with full param/search encoding |
