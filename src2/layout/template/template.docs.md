# layout/template

Main application template layout that wraps the entire authenticated app. Integrates all layout hooks (preferences, router management, user info) and provides the structural skeleton for page content.

## Responsibilities

- Top-level app layout structure (app bar, content area, footer)
- Integration of layout hooks (preferences, router, user info)
- Common layout components shared across all pages
- Page content wrapper with consistent spacing and constraints

## Key Files

- `AppTemplateLayout.tsx` — Main template layout component
- `components/` — Shared layout components (headers, footers, wrappers)
- `hooks/` — Layout-level hooks (preferences loading, router init, user info)
