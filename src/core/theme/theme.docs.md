# core/theme

MUI theme management with support for light and dark modes. Defines palettes, typography, component overrides, and provides hooks to read and toggle theme preferences.

## Responsibilities

- MUI theme creation (palette, typography, spacing, shape, breakpoints)
- Light/dark mode definitions and toggling
- Component style overrides (global MUI component defaults)
- Theme preference hooks for reading current mode
- Theme utilities for dynamic palette access

## Key Files

- `theme.config.tsx` — Theme option definitions and mode configuration
- `theme.defaults.ts` — Default palette values for light and dark modes
- `theme.hooks.tsx` — Hooks for reading theme preferences
- `theme.models.ts` — Theme-related type definitions
- `theme.utils.tsx` — Utilities for palette access and color manipulation
- `themes/` — Theme variant definitions
