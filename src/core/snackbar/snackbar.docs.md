# core/snackbar

Centralized toast notification system built on Notistack. Provides hooks for showing success, error, warning, and info messages to the user.

## Responsibilities

- Snackbar/toast notification display (success, error, warning, info)
- Notistack provider configuration (max visible, auto-hide duration, positioning)
- Typed hook for enqueuing notifications from anywhere in the app
- Variant-specific styling and icons

## Key Files

- `snackbar.config.tsx` — Notistack configuration (duration, position, max count)
- `snackbar.hooks.tsx` — `useSnackbar` hook for enqueuing messages
- `snackbar.models.tsx` — Snackbar variant types and options
- `snackbar.providers.tsx` — Notistack provider wrapper
