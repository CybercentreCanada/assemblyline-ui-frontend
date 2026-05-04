# Architecture Rules

## Layer Hierarchy

The codebase has strict dependency layers (top imports from bottom, never reverse):

```text
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
6. **`style` prop on MUI components / `sx` on raw HTML** — Use `sx` on MUI components, `style` on raw HTML elements, `styled()` for reusable styles. For performance, prefer raw HTML + `style` over MUI components.
7. **MUI layout components (`Box`, `Stack`, `Grid`) for layout** — Use raw HTML elements. MUI is only for behavior (ripple, Dialog, Typography, etc.)
8. **Relative imports crossing module boundaries** — Use path aliases (`core/`, `features/`, etc.)
9. **Barrel re-exports from parent folders** — Each module's `index.ts` exports only its own public API
10. **`lazy()` or dynamic `import()` for code splitting** — The entire app is bundled upfront. No lazy loading.
11. **Default imports** — Always destructure (`import { memo } from 'react'`, not `import React from 'react'`)
12. **`interface` keyword** — Use `type` for all type declarations
13. **`any` type** — Never use `any`. Use `unknown` with type narrowing when the type is truly unknown.
14. **TypeScript `enum`** — Use `const` arrays with derived types instead
15. **`React.FC` or `React.FunctionComponent`** — Type props directly in the function signature
16. **Early returns for conditional rendering** — Always return a single JSX expression
17. **Inline object/array creation in JSX props** — Breaks `memo()`. Use `useMemo`, `useCallback`, or module-level constants.
18. **`useEffect` for derived state** — Use `useMemo` instead
19. **Hardcoded colors, spacing, or breakpoints** — Always use theme tokens

## Required Patterns

1. **All exported components must be wrapped in `memo()`** — including `styled()` components
2. **Every component sets `.displayName`** — for React DevTools
3. **All component-internal functions use `useCallback`**
4. **Components read state via `useAppConfig(selector)`** — not props for shared state
5. **Components write state via `useAppSetConfig()`** — callback form with manual nested spreading
6. **API mutations use `useAPIMutation()`** — not raw fetch or axios
7. **API queries use `useAPIQuery()`** — not raw useQuery
8. **Translation keys come from per-module i18n files** — no inline strings for user-visible text
9. **Feature files use dot-prefix naming** — `notifications.components.tsx`, not `Components.tsx`
10. **Types live in `*.models.ts`** — not scattered in component files
11. **Zod validates localStorage config only** — API responses are trusted (backend validates). URL params use Zod via route factories.
12. **Use `import type {}` for type-only imports** — the `type` keyword goes on the import statement, NOT on individual specifiers
13. **Every shared model type has a `DEFAULT_<MODEL>` constant** — defined directly below its type
14. **Stable references for props** — objects/arrays wrapped in `useMemo`, functions in `useCallback`, or defined as module-level constants
15. **Empty array/object constants declared outside components** — prevents new reference creation on every render

## Core Principles

1. **Co-location over separation** — Related code lives together in one folder
2. **Explicitness over magic** — Data flow should be traceable by reading the component
3. **Deletion over deprecation** — Remove unused code, don't mark it deprecated
4. **Composition over inheritance** — Small components composed together, no class hierarchies
5. **Type safety at boundaries** — Validate at system edges (API, localStorage, URL), trust internally
6. **Performance first** — Minimize re-renders, minimize DOM nodes, minimize JavaScript execution
7. **Small components over monoliths** — Break UI into focused `memo()`-wrapped pieces to limit re-render scope
