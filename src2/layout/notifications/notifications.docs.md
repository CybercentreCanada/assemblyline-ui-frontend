# layout/notifications

Notification feed system with badge indicators, preference management, and feed display. Includes full i18n support and utilities for feed item processing.

## Responsibilities

- Notification feed display (list of notification items)
- Unread badge count and indicators
- Notification preferences panel (enable/disable, frequency)
- Feed item parsing and processing (mark as read, filter new items)
- Provider for notification state initialization and polling

## Key Files

- `notifications.components.tsx` — Notification UI components (feed, badges, items)
- `notifications.config.tsx` — Notification configuration and defaults
- `notifications.hooks.tsx` — Hooks for notification state and actions
- `notifications.models.ts` — Notification type definitions
- `notifications.providers.tsx` — Notification state provider and feed polling
- `notifications.utils.tsx` — Feed item processing utilities
- `notifications.utils.test.tsx` — Unit tests for notification utilities
- `notifications.i18n.en.json` / `notifications.i18n.fr.json` — Translations
