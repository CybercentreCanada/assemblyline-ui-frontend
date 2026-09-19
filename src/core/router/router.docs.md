# Core/Router

## 1. Purpose

`core/router` is the typed navigation and route-state layer for the application. It combines route definitions, path/search/hash codecs, parsed location snapshots, multi-panel navigation, blockers, cached page rendering, and browser URL synchronization.

The application uses React Router for browser history and location changes, while this module owns the application-level route registry, page placement, navigation operations, and route context exposed to components.

## 2. Features

- **Typed route definitions** - Creates routes with path, search, hash, metadata, and guard configuration.
- **Typed parameters** - Parses and serializes path, search, and hash values through the feature codecs.
- **Multi-panel navigation** - Supports `from`, `here`, `to`, and `at` navigation targets.
- **Page persistence** - Keeps page component trees mounted through reverse-portal nodes.
- **Navigation blockers** - Supports unsaved changes, data-loss risk, and external navigation blockers.
- **Location synchronization** - Synchronizes navigation state with React Router and protects against duplicate processing with revision IDs.
- **Route context hooks** - Exposes current route, path params, search values, search snapshots, hash values, and page keys.
- **State sanitization** - Removes orphaned pages, missing nodes, empty panels, and entries over configured limits.
- **Browser links** - Provides `AppLink` and `AppNavigate` for normal links and programmatic navigation.
- **Document titles** - Derives titles from route metadata and supports overrides and truncation.

## 3. Concepts

### Route Definition

A route is created with `createAppRoute`. It combines a path pattern with optional `params`, `search`, and `hash` codecs, presentation metadata, and guard callbacks. Required presentation callbacks are `shortname`, `fullname`, `shorticon`, and `fullicon`.

The route factory creates the rendered route element and wraps it with error, disabled, and forbidden boundaries.

### Path, Search, And Hash Parameters

- **Path parameters** are declared by `:param` segments and resolved through `features/path-params`.
- **Search parameters** are declared with `features/search-params` blueprints and support defaults, snapshots, deltas, and serialization.
- **Hash parameters** are declared with `features/hash-params` blueprints and resolve a single typed hash value.

### Page

An `AppRouterPage` is a concrete stored page instance. It contains the serialized `href`, durable `state`, transient state, identity `digest`, eviction `age`, and saved `scroll` position. Page keys identify instances; route paths identify route definitions.

### Panel

An `AppRouterPanel` identifies the active page in a visible panel. Panel `0` is the primary panel; additional panels display neighboring views according to router preferences.

### Node

An `AppRouterNode` owns a reverse portal for a page. Cached nodes preserve mounted component trees while their pages are inactive.

### Router And Navigation Stores

- `AppRouterStore` contains committed pages, panels, and nodes used for rendering.
- `AppNavigationStore` contains staged navigation requests, options, and blockers.

Navigation updates the navigation store first. Synchronization commits the request to React Router and reconciles the router store.

### Location Snapshots

`AppLocationParamStore` contains the canonical route registry and parsed location snapshots keyed by page key. These snapshots provide the resolved path, search, hash, and route values used by route hooks and metadata callbacks.

## 4. Configuration

Panel and node limits are read from application preferences under `router`:

```ts
type RouterPreferences = {
  maxPanels: number;
  maxNodes: number;
  navigation: 'push' | 'loop';
};
```

- `maxPanels` limits visible panels.
- `maxNodes` limits cached page nodes.
- `navigation: 'push'` advances into another panel.
- `navigation: 'loop'` cycles through available panels.

`AppNavigateOptions` controls individual navigations:

- `replace` - Replaces the current browser history entry.
- `resetScroll` - Resets the destination scroll position.
- `ignoreBlocker` - Bypasses registered blockers.
- `reloadDocument` - Performs a full document navigation.
- `nextTitle` - Overrides the next document title.
- `hashScrollIntoView` - Scrolls to a matching hash element.
- `viewTransition` - Enables a browser view transition when supported.

### Defining A Route

```tsx
import { createAppRoute } from 'core/router';
import { memo } from 'react';

const SubmitPage = memo(() => <div>Submit</div>);
SubmitPage.displayName = 'SubmitPage';

export const SubmitRoute = createAppRoute({
  component: <SubmitPage />,
  path: '/submit',
  ancestor: null,
  shortname: () => ['app_route.submit.shortname'],
  fullname: () => ['app_route.submit.fullname'],
  shorticon: () => null,
  fullicon: () => null,
  disabled: () => false,
  forbidden: () => false
});
```

A parameterized route can define path and search codecs:

```tsx
export const AlertRoute = createAppRoute({
  component: <AlertDetailPage />,
  path: '/alert/:id',
  params: blueprints => ({ id: blueprints.string() }),
  search: blueprints => ({ tab: blueprints.enum(['details', 'history'], 'details') }),
  ancestor: '/alerts',
  shortname: location => ['app_route.alert.shortname', { id: location.path.id }],
  fullname: location => ['app_route.alert.fullname', { id: location.path.id }],
  shorticon: () => <AlertIcon />,
  fullicon: () => <AlertIcon />,
  disabled: () => false,
  forbidden: (_location, config) => !config.user.roles.includes('alert_view')
});
```

## 5. Usage

### Navigation

`useAppNavigate` provides `from()`, `here()`, `to()`, and `at(panelKey)` targets. Each target supports operations such as `create`, `update`, `search`, `only`, and `closePanel`.

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
```

### Links

Use `AppLink` with a `nav` callback. Pass `navDeps` whenever the callback closes over changing values:

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

Use `AppNavigate` for programmatic navigation rendered as a component.

### Reading Route Values

```tsx
import { useAppHashParams, useAppPathParams, useAppSearchSnapshot } from 'core/router';

const { id } = useAppPathParams<'/submission/detail/:id'>();
const hash = useAppHashParams<'/submission/detail/:id'>();
const search = useAppSearchSnapshot<'/alerts'>();
const offset = search.get('offset');
```

Use `useAppLocation` when selecting a route location or targeting another panel. Use `useAppRoute` when the route definition itself is needed.

### Blockers

```tsx
useAppBlocker('unsaved_changes', [isDirty]);
```

Supported reasons are `unsaved_changes`, `data_loss_on_leave`, and `external_leave_risk`. `useAppBlockNavigation` observes staged navigation while blockers differ from the committed router state.

### Store Access

```tsx
import { useAppNavigationStore, useAppRouterStore } from 'core/router';

const panels = useAppRouterStore(state => state.panels);
const pages = useAppRouterStore(state => state.pages);
const pendingNavigationId = useAppNavigationStore(state => state.id);
```

Most application code should use typed route hooks, `useAppNavigate`, and `AppLink` instead of mutating stores directly.

## 6. Codebase (Internals)

### Components

- `components/AppLink.tsx` - Browser-compatible typed link.
- `components/AppNavigate.tsx` - Programmatic navigation component.
- `components/AppNavigationBlocker.tsx` - Blocker confirmation behavior.
- `components/AppRouterLayout.tsx` - Page and node rendering layout.
- `components/AppRouterPanelLayout.tsx` - Panel rendering layout.
- `components/AppRouteLayout.tsx` - Route-level scroll and hash layout behavior.
- `components/AppRouteName.tsx` - Localized route-name rendering.

### Hooks

- `hooks/useAppNavigate.tsx` - Navigation targets and operations.
- `hooks/useAppLocation.tsx` - Location snapshot selection.
- `hooks/useAppRoute.tsx` - Route definition selection.
- `hooks/useAppPathParams.tsx` - Current path parameter access.
- `hooks/useAppSearchParams.tsx` - Current parsed search access.
- `hooks/useAppSearchSnapshot.tsx` - Current search snapshot access.
- `hooks/useAppHashParams.tsx` - Current hash access.
- `hooks/useAppBlocker.tsx` and `hooks/useAppBlockNavigation.tsx` - Navigation blocking.
- `hooks/useAppSyncNavigationStoreFromLocation.tsx` and `hooks/useAppSyncRouterStoreFromNavigation.tsx` - Location synchronization.

### Models

- `models/router.models.ts` - Router pages, panels, nodes, and stores.
- `models/navigation.models.ts` - Navigation options and operation types.
- `models/location.models.ts` - Route and location inference types.
- `models/react-router.models.ts` - React Router location state types.
- `models/blocked-page.models.ts` - Blocked page types.
- `models/not-found.models.ts` - Not-found diagnostics types.
- `models/legacy.models.ts` - Legacy location resolution types.

### Providers

- `providers/AppRouterProvider.tsx` - Browser router and router store.
- `providers/AppNavigationProvider.tsx` - Navigation store and synchronization hooks.
- `providers/AppLocationParamProvider.tsx` - Route registry and location snapshot store.
- `providers/AppPageKeyProvider.tsx` - Current page-key context.
- `providers/AppRouteLayoutProvider.tsx` - Page scroll restoration and hash scrolling.

### Utilities And Tests

- `utils/router-node.utils.ts` - Node lifecycle and sanitization.
- `utils/router-page.utils.ts` - Page lifecycle, scroll state, and page sanitization.
- `utils/router-panel.utils.ts` - Panel lifecycle and panel sanitization.
- `utils/navigation.utils.ts` - Navigation intent and dispatch.
- `utils/location.utils.ts` - Router/location state conversion.
- `utils/routes.utils.ts` - Route registry, route lookup, and location conversion.
- `utils/blocked-page.utils.ts` - Blocked-page state operations.
- `utils/not-found.utils.ts` - Not-found page and diagnostic helpers.
- `utils/legacy.utils.ts` - Legacy URL resolution.
- `utils/media-query.utils.ts` - Container media-query parsing.
- `tests/*.utils.test.ts` - Focused utility tests.

### Data Flow And Boundaries

1. `AppRouterProvider` mounts React Router and the router store.
2. `AppNavigationProvider` stages navigation requests and runs blocker/synchronization hooks.
3. `AppLocationParamProvider` registers route definitions and synchronizes parsed location snapshots.
4. Navigation codecs serialize typed path, search, and hash values into a browser location.
5. `AppRouterStore` commits pages, panels, and nodes used by the rendering layout.
6. Sanitization removes orphaned or over-capacity state while preserving active pages.

## 7. Related Modules

- `features/path-params` - Path parameter codecs.
- `features/search-params` - Search parameter engines and snapshots.
- `features/hash-params` - Hash parameter codecs.
- `features/portal` - Reverse portal nodes used for cached pages.
- `core/config` - Application preferences and route guard configuration.
- `src/app/core.routes.tsx` - Canonical application route registry.

## Maintenance Rules

- Use `createAppRoute` and typed codecs instead of assembling hrefs manually.
- Use `navDeps` when a navigation callback closes over changing values.
- Preserve revision-ID synchronization guards when changing navigation or location flow.
- Sanitize after direct page, panel, or node mutations.
- Keep page keys distinct from route paths: page keys identify instances, while route paths identify definitions.
- Keep route-definition and location-snapshot logic in this merged module; do not reintroduce a parallel `core/routes` implementation.
