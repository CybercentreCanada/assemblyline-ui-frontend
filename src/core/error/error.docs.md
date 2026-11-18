# core/error

Application-level error boundary that catches unhandled runtime errors and displays a fallback UI instead of a blank screen.

## Responsibilities

- React Error Boundary wrapping the application tree
- Error fallback component with user-friendly messaging
- Error reset strategy (window reload)
- i18n support for error messages

## Key Files

- `error.components.tsx` — Error fallback UI component
- `error.providers.tsx` — Error boundary provider wrapper
- `error.i18n.en.json` / `error.i18n.fr.json` — Translated error messages
