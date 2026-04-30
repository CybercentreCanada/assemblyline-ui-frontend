# Architecture Rules

## Layer Hierarchy

The codebase has strict dependency layers (top imports from bottom, never reverse):

```
pages → layout → features → core → models → ui
```

- `pages/` may import from: `layout/`, `features/`, `core/`, `models/`, `ui/`, `app/`
- `layout/` may import from: `core/`, `features/`, `models/`, `ui/`
- `features/` may import from: `core/`, `models/`
- `core/` may import from: `models/`, `ui/`
- `models/` has zero internal imports
- `ui/` has zero internal imports (only external: MUI, React)

## Forbidden Patterns

These patterns are NOT allowed in this codebase:

1. **React Context for shared state** — Use Zustand (`useAppConfig`) instead
2. **Wrapper hooks for single-use mutations** — Keep mutations inline in the component
3. **Prop drilling beyond 2 levels** — Use the store
4. **Default exports** — Use named exports only
5. **Redux or any Redux-like library** — We use Zustand
6. **MUI `sx` prop** — Use MUI's `styled()` for reusable styles, raw HTML + `style` prop for single-use/lists
7. **MUI layout components (`Box`, `Stack`, `Grid`) for layout** — Use raw HTML elements. MUI is only for behavior (ripple, Dialog, Typography, etc.)
8. **Relative imports crossing module boundaries** — Use path aliases (`core/`, `features/`, etc.)
9. **Barrel re-exports from parent folders** — Each module's `index.ts` exports only its own public API
10. **`lazy()` or dynamic `import()` for code splitting** — The entire app is bundled upfront. No lazy loading.
11. **Default imports** — Always destructure (`import { memo } from 'react'`, not `import React from 'react'`)
12. **`interface` keyword** — Use `type` for all type declarations
13. **`any` type** — Never use `any`

## Required Patterns

1. **All exported components must be wrapped in `memo()`**
2. **Components read state via `useAppConfig(selector)`** — not props for shared state
3. **Components write state via `useAppSetConfig()`** — shallow merge patches
4. **API mutations use `useAPIMutation()`** — not raw fetch or axios
5. **API queries use `useAPIQuery()`** — not raw useQuery
6. **Translation keys come from per-module i18n files** — no inline strings for user-visible text
7. **Feature files use dot-prefix naming** — `notifications.components.tsx`, not `Components.tsx`
8. **Types live in `*.models.ts`** — not scattered in component files
9. **Zod validates localStorage config only** — API responses are trusted (backend validates). URL params use Zod via route factories.
10. **Use `import type {}` for type-only imports** — keeps them separate from runtime code
11. **All component-internal functions use `useCallback`**
12. **Every component sets `.displayName`** — for React DevTools

## Core Principles

1. **Co-location over separation** — Related code lives together in one folder
2. **Explicitness over magic** — Data flow should be traceable by reading the component
3. **Deletion over deprecation** — Remove unused code, don't mark it deprecated
4. **Composition over inheritance** — Small components composed together, no class hierarchies
5. **Type safety at boundaries** — Validate at system edges (API, localStorage, URL), trust internally
