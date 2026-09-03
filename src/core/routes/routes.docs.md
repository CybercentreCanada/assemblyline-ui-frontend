# Core/Routes

## 1. Purpose

`core/routes` is the typed route-definition and location-state layer for the application. It registers route factories, creates codecs for path/search/hash values, resolves stored pages to route locations, and exposes hooks for reading the current route context.

The module works with `core/router`: the router owns page and panel navigation, while `core/routes` owns route definitions, parameter schemas, parsed location snapshots, and href construction.

## 2. Features

- Type-safe route definitions created with `createAppRoute`.
- Path parameter codecs that parse and stringify values in route paths.
- Search parameter engines with defaults, deltas, full snapshots, transient values, and ephemeral values.
- Hash parameter codecs for typed hash fragments.
- Route metadata resolvers for short names, full names, and icons.
- Disabled and forbidden route boundaries with configurable route guards.
- Per-page location snapshots keyed by router page keys.
- Typed hooks for path parameters, search parameters, search snapshots, hashes, route definitions, and neighboring panels.
- Route and location utilities for page resolution, route registration, URL serialization, and router synchronization.

## 3. Concepts

### Route Definition

A route definition is created with `createAppRoute`. It combines a path pattern with optional parameter codecs, search schemas, hash schemas, presentation metadata, and guard callbacks. The resulting route includes an `element` wrapped by `AppErrorProvider`, `DisabledBoundary`, and `ForbiddenBoundary`.

Route presentation callbacks are required:

- `shortname` — compact route name used by navigation and breadcrumbs.
- `fullname` — full route name used for document titles and detailed labels.
- `shorticon` — compact route icon.
- `fullicon` — full route icon.

Each callback receives a typed route location and the current `AppConfigStore`.

### Path Parameters

Path parameters are declared from the keys in a route path, such as `:id` in `/submission/detail/:id`. `features/path-params` supplies the blueprint map and codec that parse URL segments into typed values and stringify values back into a pathname.

### Search Parameters

Search parameters are declared with `features/search-params` blueprints. A route search engine can:

- parse serialized query values;
- provide default values;
- produce a full typed snapshot with `full()`;
- produce a delta containing values that differ from defaults;
- serialize values for location search, location state, or transient state.

The current route hooks expose both parsed search values and a search snapshot. Use a snapshot when updating search through the router navigation API.

### Hash Parameters

A route can declare a typed hash codec through the `hash` option. Hash values are parsed and normalized by `features/hash-params` and can be read with `useAppHashParams`.

### Route and Location Stores

`AppLocationParamStore` contains two maps:

- `routes` — the canonical application route registry keyed by route path.
- `locations` — parsed location snapshots keyed by router page key.

`AppLocationParamProvider` registers the application routes and synchronizes page locations from the router. `AppPageKeyProvider` supplies the current page key to a rendered route tree.

### Guards and Boundaries

`disabled` and `forbidden` callbacks receive the current route location and app configuration. `DisabledBoundary` and `ForbiddenBoundary` subscribe to the current page location and render their fallback when the corresponding callback returns true.

## 4. Configuration

### Defining a Route

Routes are normally declared in route modules under `src/routes` and collected in the application route registry:

```tsx
import { createAppRoute } from 'core/routes';
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

A route with parameters and search values can define codecs through blueprint callbacks:

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

`createAppRoute` also accepts `hash`, `ancestor`, `loader`, `disabled`, and `forbidden`. `loader` is retained in the route shape but is not currently executed by the route factory.

### Provider Setup

The application supplies the complete route registry to `AppLocationParamProvider` and wraps route rendering with `AppPageKeyProvider` and `AppRouteLayoutProvider` as required by the router layout:

```tsx
<AppLocationParamProvider routes={APP_ROUTES}>
  <AppRouterProvider>
    <AppLayout />
  </AppRouterProvider>
</AppLocationParamProvider>
```

The exact provider nesting is established by `src/app/app.tsx`; consumers should use the existing application composition rather than creating additional route stores.

## 5. Usage

### Reading Path Parameters

```tsx
import { useAppPathParams } from 'core/routes';

const path = useAppPathParams<'/alert/:id'>();
const alertId = path?.id;
```

`useAppPathParams` reads the current page context. It does not take a selector argument. Use `useAppLocation` when a selected value or a different panel target is needed.

### Reading Search Parameters

```tsx
import { useAppSearchParams, useAppSearchSnapshot } from 'core/routes';

const searchParams = useAppSearchParams<'/alerts'>();
const filters = searchParams?.filters;

const search = useAppSearchSnapshot<'/alerts'>();
const query = search.get('query');
```

### Reading Hash and Location

```tsx
import { useAppHashParams, useAppLocation } from 'core/routes';

const hash = useAppHashParams<'/file/detail/:id'>();
const location = useAppLocation<'/alerts'>() ;
const alertRoute = location(route => route.route);
```

`useAppLocation` and `useAppRoute` accept a panel target of `from`, `here`, `to`, or `at`. For `at`, pass the panel index as the second argument:

```tsx
const neighboringLocation = useAppLocation<'/alerts'>('to');
const panelLocation = useAppLocation<'/alerts'>('at', 1);
```

Both hooks return a selector function. The selector receives the resolved typed route or location object.

### Reading the Current Page Key

```tsx
import { useAppPageKey } from 'core/routes';

const pageKey = useAppPageKey();
```

The page key identifies the stored page instance in the router store. It is not the route path.

### Registering and Resolving Routes

Application route registration is normally performed by `AppLocationParamProvider`. Low-level utilities are available when integrating a route registry or resolving router pages:

```tsx
import { findAppRouteFromPath, getPageFromParam } from 'core/routes';

const route = findAppRouteFromPath(locationStore, '/alerts');
const page = getPageFromParam(locationStore, {
  route: '/alerts',
  search: { query: '' }
});
```

Prefer `createAppRoute`, `AppLink`, and `useAppNavigate` for normal application navigation. Avoid constructing hrefs manually when a typed route descriptor can express the destination.

### Container-Scoped Media Queries

```tsx
import { useAppMediaQuery } from 'core/routes';

const isCompact = useAppMediaQuery(theme => theme.breakpoints.down('md'));
```

`useAppMediaQuery` evaluates the query against the route layout container using `ResizeObserver`, rather than against the browser viewport.

## 6. Codebase

### Route definitions and types

- `routes.models.ts` — route, location, parameter, search, hash, and guard types.
- `routes.factories.tsx` — `createAppRoute` and route element composition.
- `routes.components.tsx` — `AppRouteName`, `DisabledBoundary`, and `ForbiddenBoundary`.

### Providers and hooks

- `routes.providers.tsx` — location-param store, route registry synchronization, and page-key provider.
- `routes.hooks.tsx` — `useAppRoute`, `useAppLocation`, `useAppPathParams`, `useAppSearchParams`, `useAppSearchSnapshot`, `useAppHashParams`, and `useAppMediaQuery`.
- `routes.layout.tsx` — `AppRouteLayoutProvider` and route layout context.

### Utilities and tests

- `routes.utils.tsx` — route registration, lookup, page resolution, location parsing, href generation, media-query parsing, and router synchronization.
- `routes.utils.test.tsx` — tests for route registration, parameter resolution, location conversion, and utility behavior.
- `index.ts` — explicit public exports for route components, factories, hooks, providers, models, and utilities.

### Related modules

- `core/router` — panel navigation, page/node stores, navigation operations, and router synchronization.
- `features/path-params` — path parameter blueprints and codecs.
- `features/search-params` — search blueprints, engines, deltas, and snapshots.
- `features/hash-params` — hash codecs and values.
- `app/app.routes.tsx` — application route registry where present in the current app composition.
