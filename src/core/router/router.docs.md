# Core/Router

## 1. Purpose

The router is the application's typed, multi-panel navigation layer. It sits on top of React Router and keeps the active page for each panel in Zustand stores. Pages can remain mounted through cached portal nodes, allowing navigation between panels without unnecessarily losing component state.

The route registry and route-parameter logic live in `core/routes`. The router owns page placement, navigation operations, blockers, node caching, URL synchronization, and browser document navigation.

## 2. Features

- Typed route navigation with path parameters, search parameters, hash values, and navigation options.
- Multiple visible panels with `from`, `here`, `to`, and `at` navigation targets.
- Portal-backed page nodes that preserve mounted component trees while pages are cached.
- Navigation blockers for unsaved changes, possible data loss, and external navigation risk.
- URL and `location.state` synchronization with revision IDs to prevent processing the same navigation twice.
- Automatic sanitization of orphaned pages, missing nodes, empty panels, and over-capacity node caches.
- Browser-compatible links through `AppLink`, including external href generation and normal link behavior.
- Document title generation from route metadata, including optional title overrides and truncation.

## 3. Concepts

### Page

An `AppRouterPage` is a resolved location entry:

- `href` — serialized pathname, search, and hash.
- `state` — durable location state.
- `transient` — transient location state.
- `digest` — identity hash derived from the page location and state.
- `age` — eviction priority, recomputed during sanitization.
- `scroll` — saved scroll position.

Pages are stored in `AppRouterStore.pages` and `AppNavigationStore.pages`, keyed by generated page keys.

### Panel

An `AppRouterPanel` contains the `pageKey` for its active page. Panel order determines the visible split layout: panel `0` is the primary panel and later panels are additional views.

### Node

An `AppRouterNode` owns a reverse portal for a page. The node cache keeps page component trees mounted while they are not currently active. `sanitizeRouterStore` removes orphaned pages, creates missing nodes, and removes old nodes according to router preferences.

### Router and Navigation Stores

The router uses two related stores:

- `AppRouterStore` — committed router state used to render pages and nodes.
- `AppNavigationStore` — staged navigation request, including blockers and navigation options.

Navigation operations update the navigation store first. Synchronization commits the request to React Router and reconciles the committed router store.

## 4. Configuration

Panel and node limits are read from application preferences under `router`:

```ts
type RouterPreferences = {
  maxPanels: number;
  maxNodes: number;
  navigation: 'push' | 'loop';
};
```

- `maxPanels` limits the number of visible panels.
- `maxNodes` controls additional cached nodes.
- `navigation: 'push'` advances to another panel.
- `navigation: 'loop'` cycles through available panels.

`AppNavigateOptions` controls individual navigations:

- `replace` — replace the browser history entry.
- `resetScroll` — reset the destination scroll position.
- `ignoreBlocker` — bypass registered navigation blockers.
- `reloadDocument` — perform a full document navigation.
- `nextTitle` — override the next document title.
- `hashScrollIntoView` — scroll to a matching hash element.
- `viewTransition` — enable a browser view transition when supported.

## 5. Usage

### Navigation

`useAppNavigate` returns four panel-targeting functions:

- `from()` — target the previous panel according to the configured navigation mode.
- `here()` — target the panel containing the requesting page.
- `to()` — target the next panel according to the configured navigation mode.
- `at(panelKey)` — target an explicit panel index.

Each target returns these operations:

- `create` — create a new page and assign it to the target panel.
- `update` — update the existing target page.
- `search` — update only the route's typed search snapshot.
- `only` — create a page and make it the only visible panel.
- `closePanel` — remove the target panel and create a fallback page when necessary.

```tsx
const navigate = useAppNavigate<'/alerts'>();

navigate.to().create({
  route: '/submission/detail/:id',
  path: { id: submissionId }
});

navigate.here<'/alerts'>().update(state => ({
  ...state,
  search: { ...state.search, offset: 0 }
}));

navigate.at(0).only({ route: '/submit' });
```

### Links

Use `AppLink` with a `nav` callback. It computes an external href for browser behavior such as opening a link in a new tab, while left-click navigation is routed through the panel engine. Pass `navDeps` when the callback closes over changing values:

```tsx
<AppLink
  nav={navigate =>
    navigate.to().create({
      route: '/submission/detail/:id',
      path: { id: submissionId }
    })
  }
  navDeps={[submissionId]}
>
  Open submission
</AppLink>
```

Use `AppNavigate` when navigation should occur from a rendered component rather than a user link.

### Reading Route State

Route definitions and typed parameter hooks are provided by `core/routes`:

```tsx
import { useAppPathParams, useAppSearchSnapshot } from 'core/routes';

const { id } = useAppPathParams<'/submission/detail/:id'>();
const search = useAppSearchSnapshot<'/alerts'>();
const offset = search.get('offset');
```

Use `useAppSearchSnapshot` when reading or updating a route search schema through `useAppNavigate().here().search()` or `.update()`.

### Blockers

Pages can register a navigation blocker with `useAppBlocker`:

```tsx
useAppBlocker('unsaved_changes', [isDirty]);
```

Supported reasons are `unsaved_changes`, `data_loss_on_leave`, and `external_leave_risk`. `useAppBlockNavigation` detects staged navigation while blockers differ from the committed router state and asks the user for confirmation.

### Store Access

Read committed state with selectors:

```tsx
import { useAppNavigationStore, useAppRouterStore } from 'core/router';

const panels = useAppRouterStore(state => state.panels);
const pages = useAppRouterStore(state => state.pages);
const pendingNavigationId = useAppNavigationStore(state => state.id);
```

For non-React integrations, use the store API helpers:

```tsx
import { getAppRouterStateFromApi, useAppRouterStoreApi } from 'core/router';

const routerStoreApi = useAppRouterStoreApi();
const router = getAppRouterStateFromApi(routerStoreApi);
```

Most application code should use `useAppNavigate`, `AppLink`, and typed `core/routes` hooks instead of mutating stores directly.

## 6. Codebase

### Providers and stores

- `router.providers.tsx` — Zustand providers, store APIs, defaults, and `AppRouterProvider`.
- `router.models.tsx` — Router, navigation, page, panel, node, blocker, and operation types.

### Navigation and rendering

- `router.hooks.tsx` — `useAppNavigate`, external href generation, synchronization, and blocker hooks.
- `router.components.tsx` — `AppLink`, `AppNavigate`, and `AppNavigationBlocker`.
- `router.layout.tsx` — Router, panel, page, and node rendering layouts.

### Utilities and related modules

- `router.utils.tsx` — Page, panel, node, blocker, sanitization, serialization, and document-title utilities.
- `router.utils.test.tsx` — Unit tests for router utilities.
- `core/routes` — Route factories, path parameters, search schemas, and location snapshots.
- `features/portal` — Reverse portal implementation.
- `layout/router` — Application-specific panel presentation.

### Synchronization flow

`AppRouterProvider` composes the React Router provider and router store providers. `useAppSyncNavigationStoreFromLocation` reads locations and hydrates the navigation store from location state, the `/v1` hash, or legacy locations. `useAppSyncRouterStoreFromNavigation` writes `/v1` plus serialized panel fragments to React Router, updates the document title, and reconciles the committed router store.

The location state carries an `id`, panel descriptors, and page location data. The revision ID prevents a location written by the router from being processed as a new navigation request when it returns through React Router.

### Maintenance rules

- Use route factories and typed route params rather than assembling href strings manually.
- Use `navDeps` whenever a `nav` callback closes over changing values.
- Preserve the revision-ID synchronization guard when changing location or navigation flow.
- Run sanitization after direct page, panel, or node mutations.
- Do not confuse page keys with route paths: page keys identify stored page instances, while route paths identify route definitions.
