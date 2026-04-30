# Architecture Overview

## Purpose

This architecture was redesigned to move away from a **technology-based structure** (grouping by technical role: `components/`, `hooks/`, `utils/`, `types/`) into a **feature-based structure** (grouping by domain resource).

**The problem with technology-based architecture:**
- Related files scattered across distant folders (`components/Alert.tsx`, `hooks/useAlert.ts`, `types/alert.ts`, `utils/alert.ts`)
- Constantly navigating back to the top of the tree to find sibling files
- The "separation of concerns" by file role breaks down at scale — with a big application, it's far better to have everything related to a resource in one location

**The solution:**
- All files related to a feature/resource live together in a single folder
- You never leave that folder when working on a feature
- File naming makes the role explicit: `<primary>-<secondary>.<role>.<ext>`
- No `index` files as root elements — they obscure what the file actually does

## Technology Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18+ (StrictMode, memo, Activity API) |
| State | Zustand (vanilla store + devtools) |
| Server State | TanStack React Query (persisted, lz-string compressed) |
| Routing | react-router v6 + custom multi-panel system |
| Styling | MUI v5+ (styled components, theme system) |
| Validation | Zod (settings persistence, schema parsing) |
| i18n | i18next (per-module JSON files, en/fr) |
| Build | Vite + SWC, pnpm workspace |
| Testing | Vitest (unit), Playwright (e2e) |

## Application Layers

This is the core of the architecture. The application is divided into layers with clear responsibilities. Each layer has a specific role, and dependencies flow strictly downward — a layer can only import from layers below it, never above.

### `app/` — Application Shell

The entry point and top-level configuration of the application. This layer bootstraps everything.Nothing domain-specific lives here — it's purely infrastructure that wires the app together on startup.

**Contains:**
- `app.tsx` — Root component that composes all providers
- `app.api.tsx` — API client configuration (base URL, interceptors, query client)
- `app.configs.tsx` — Global configuration constants and defaults
- `app.routes.tsx` — Route registration (maps paths to page components)
- `app.themes.tsx` — MUI theme definition (light/dark, palette, typography)
- `app.i18n.tsx` — i18next initialization and language detection
- `app.i18n.en.json` / `app.i18n.fr.json` — App-level translation strings
- `layout.*.tsx` — Layout scaffolding components (breadcrumbs, navigation, preferences)

### `core/` — Framework-Level Modules

The foundational systems that the entire application depends on. These are framework-level concerns that are domain-agnostic — they provide capabilities that any feature or page can consume. Core modules are heavily tested and rarely change.

**Contains:**
- [`api/`](../core/api/api.docs.md) — HTTP client abstraction, request/response interceptors, query/mutation factories
- [`auth/`](../core/auth/auth.docs.md) — Authentication flow, token management, session handling
- [`config/`](../core/config/config.docs.md) — Global Zustand store (`AppConfig`), selectors, setters
- [`error/`](../core/error/error.docs.md) — Error boundary components, error state management
- [`layout/`](../core/layout/layout.docs.md) — Core layout state and configuration
- [`router/`](../core/router/router.docs.md) — Custom multi-panel router system (panels, nodes, LRU cache, reverse portals, navigation utilities)
- [`routes/`](../core/routes/routes.docs.md) — Route definitions, route guards, lazy loading configuration
- [`snackbar/`](../core/snackbar/snackbar.docs.md) — Toast notification system (success, error, info messages)
- [`theme/`](../core/theme/theme.docs.md) — Theme provider, dark/light mode toggle, theme utilities

### `features/` — Reusable Domain-Agnostic Capabilities

Self-contained, reusable modules that provide a specific capability to the application. Unlike `core/`, these are opt-in — a page or layout component uses them when it needs that specific functionality. Each feature is independently testable and has no knowledge of the pages that consume it.

**Contains:**
- [`classification/`](../features/classification/classification.docs.md) — Classification banner and marking system
- [`form/`](../features/form/form.docs.md) — TanStack Form integration, form field components, validation patterns
- `hash-params/` — URL hash parameter reading and writing
- [`path-params/`](../features/path-params/path-params.docs.md) — URL path parameter extraction and typing
- [`portal/`](../features/portal/portal.docs.md) — React portal management for rendering outside the DOM tree
- [`prop-provider/`](../features/prop-provider/prop-provider.docs.md) — Prop injection without prop drilling (provider pattern)
- [`search-params/`](../features/search-params/search-params.docs.md) — URL search parameter state management
- [`store/`](../features/store/store.docs.md) — `createAppStore` factory for feature-scoped Zustand stores
- [`table-of-content/`](../features/table-of-content/table-of-content.docs.md) — Table of contents generation and navigation

### `layout/` — Layout-Level UI

Components that form the application's visual structure and chrome — everything the user sees that isn't page-specific content. These components compose features and core modules into the actual UI shell.

**Contains:**
- [`apps/`](../layout/apps/apps.docs.md) — Application switcher and app registry UI
- [`auth/`](../layout/auth/auth.docs.md) — Login, logout, session expired screens
- `carousel/` — Carousel/slideshow layout components
- [`drawer/`](../layout/drawer/drawer.docs.md) — Side drawers (settings, filters, details panels)
- [`notifications/`](../layout/notifications/notifications.docs.md) — Notification feed, badges, preference panels
- [`router/`](../layout/router/router.docs.md) — Router panel layout, split views, tab bars, panel chrome
- [`routes/`](../layout/routes/routes.docs.md) — Route transition animations and route-level layout wrappers
- [`template/`](../layout/template/template.docs.md) — Page template components (headers, footers, content wrappers)

### `models/` — TypeScript Types and Domain Entities

Pure type definitions with zero runtime code and zero internal dependencies. This is the single source of truth for data shapes used across the application.

**Contains:**
- `api/` — Request input and response output types for API calls (will be auto-generated from OpenAPI)
- `base/` — Mirror of assemblyline-base backend models (must match exactly)
- `messages/` — Mirror of backend message models from assemblyline-base
- `ontology/` — Mirror of backend ontology models from assemblyline-base

### `pages/` — Route-Level Components

The leaf nodes of the application. Each page is the component rendered when the user navigates to a specific route. Pages are thin orchestrators — they compose layout components, read from stores, and wire up mutations. Complex logic is pushed down into utilities and hooks; the page itself stays focused on assembly.

**Contains:**
- One file (or folder) per route
- Pages compose components from `layout/`, `features/`, and `ui/`
- Each page primarily affects a **resource** and secondarily performs an **action**
- Static pages (help, not-found, forbidden) live in their own folders

### `shared/` — Cross-Cutting Utilities and Hooks

Generic code that are used across multiple layers but don't belong to any specific feature or core module. These are small, general-purpose building blocks that have no domain knowledge.

**Contains:**
- `hooks/` — Generic reusable hooks (debounce, throttle, media queries, etc.)
- `models/` — Generic TypeScript utility types (mapped types, conditional types)
- `utils/` — Generic utility functions (formatting, parsing, string manipulation)

### `ui/` — Design System Primitives

The lowest-level UI building blocks. These are thin wrappers around MUI components that enforce consistent styling, accessibility patterns, and API conventions across the application. They have no business logic and no knowledge of the application's domain.

### `tests/` — Test Infrastructure

Shared test utilities, fixtures, mocks, and setup files used across unit and E2E tests. This is not where tests live (those are co-located with their source) — this is where test support code lives.

**Contains:**
- `vitest/` — Vitest setup, global mocks, test utilities, custom matchers
- `playwright/` — Playwright configuration, global setup/teardown, shared fixtures

## Dependency Rules

Dependencies flow **downward only**:

```
pages → layout → features → core → models
         ↓         ↓         ↓
        app       shared     ui
```

- `pages/` can import from any layer below it
- `layout/` can import from `core/`, `features/`, `models/`, `ui/`
- `core/` can only import from `models/` and `ui/`
- `models/` has zero internal dependencies
- `features/` are self-contained; they may import from `core/` and `models/`

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│                     Browser                          │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  React Router (BrowserRouter)                        │
│  └─ AppRouterLayout (multi-panel system)            │
│     └─ Panels → Nodes → Pages                      │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  State Layer                                         │
│  ├─ Zustand Store (AppConfig) → UI + session state  │
│  ├─ React Query (TanStack) → Server/async state     │
│  └─ URL (search params, path params) → Navigation   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│  API Layer (fetch → /api/v4/*)                       │
└─────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

### Single Global Store

One Zustand store (`AppConfig`) holds all application-wide state. Components access it via selector hooks (`useAppConfig`) and mutate via `useAppSetConfig`. This eliminates prop drilling and context providers for shared state.

See `core/config/config.docs.md` for full rationale and usage patterns.

### Multi-Panel Router

The router supports concurrent panels (split views), each with its own navigation stack. Panels render into LRU-cached nodes to preserve component state across navigations. Reverse portals prevent unmounting.

See `core/router/router.docs.md` for full rationale and usage patterns.

### Inline Mutations

Components own their mutations directly rather than importing pre-built hook abstractions. This makes data flow visible at the component level and prevents premature abstraction.

See `core/api/api.docs.md` for full rationale and usage patterns.

### Feature-Sliced Structure

Files are co-located by domain/resource, not by technical role. Everything about a feature lives together — its components, hooks, config, i18n, models, utils, POMs, and specs all reside in the same folder. You never leave that folder when working on a feature.

Each page primarily affects a **resource** and secondarily performs an **action**. This is reflected in the file naming (`<resource>-<action>.<role>.<ext>`) and in folder organization.

See `docs/conventions/modules.md` for detailed module organization patterns.

