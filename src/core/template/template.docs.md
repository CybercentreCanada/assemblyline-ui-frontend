# core/template

Main application template layout that wraps the entire authenticated app. Integrates all layout hooks (preferences, router management, user info) and provides the structural skeleton for page content. Also owns theme initialization: fetching `/theme.json`, converting it from its legacy shape, and feeding it to TUI's `AppRoot` as the active theme.

## Responsibilities

- Top-level app layout structure (app bar, content area, footer)
- Integration of layout hooks (preferences, router, user info)
- Common layout components shared across all pages
- Page content wrapper with consistent spacing and constraints
- Legacy `/theme.json` fetching, conversion, and `AppRoot` theme wiring

## Key Files

- `template.providers.tsx` — Main template layout and provider components
- `components/` — Shared template components (headers, footers, wrappers)
- `template.hooks.tsx` — Template hooks (preferences loading, router init, user info)
- `template.models.ts` — Legacy theme type definitions
- `template.utils.ts` — `parseAppThemeFromLegacy` conversion utility
