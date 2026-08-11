# layout/template

Main application template layout that wraps the entire authenticated app. Integrates all layout hooks (preferences, router management, user info) and provides the structural skeleton for page content. Also owns theme initialization: fetching `/theme.json`, converting it from its legacy shape, and feeding it to TUI's `AppRoot` as the active theme.

## Responsibilities

- Top-level app layout structure (app bar, content area, footer)
- Integration of layout hooks (preferences, router, user info)
- Common layout components shared across all pages
- Page content wrapper with consistent spacing and constraints
- Legacy `/theme.json` fetching, conversion, and `AppRoot` theme wiring

## Key Files

- `AppTemplateLayout.tsx` — Main template layout component
- `components/` — Shared layout components (headers, footers, wrappers)
- `hooks/` — Layout-level hooks (preferences loading, router init, user info)
- `template.hooks.tsx` — `useAppThemeInitializer`, fetches/converts the legacy theme
- `template.models.ts` — Legacy theme type definitions
- `template.utils.ts` — `parseAppThemeFromLegacy` conversion utility
