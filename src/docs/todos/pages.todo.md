# TODO — Pages

Tasks related to `src/pages/` (page components, route definitions, page-specific logic).

## Pending

- [ ] **Deprecate MUI `useMediaQuery`** — Replace all usages of `useMediaQuery` from `@mui/material` with a custom `useAppMediaQuery` hook. MUI's version measures the full viewport, which is incorrect in a multi-panel layout (a single panel vs two panels side-by-side have different available widths). The new hook must:
  - Accept a container ref (the component's own panel/window element)
  - Use `ResizeObserver` on the referenced container instead of `window.matchMedia`
  - Support the same breakpoint syntax (or a simplified version)
  - Live in a new core module (e.g., `core/media-query/` or similar)

## Completed
