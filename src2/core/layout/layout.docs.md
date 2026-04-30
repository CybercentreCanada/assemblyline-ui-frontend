# core/layout

Layout state management — stores configuration for the app's visual structure (drawers, app bar, density, mode, notifications, breadcrumbs). Uses Zod schemas to validate layout settings persisted to localStorage.

## Responsibilities

- Layout state shape definition (drawer open/closed, density, mode, breadcrumbs visibility)
- Zod schemas for validating persisted layout settings
- Hooks for reading derived layout state (e.g., `useAppLayoutThemeMode`)
- Provider that initializes layout configuration on startup

## Key Files

- `layout.config.ts` — Layout state shape and Zod validation schemas
- `layout.hooks.tsx` — Layout-specific selector hooks
- `layout.providers.tsx` — Layout state initialization provider
