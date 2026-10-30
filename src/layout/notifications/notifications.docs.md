# layout/notifications

Notification feed system with drawer navigation, system announcements, badge indicators, Zod-validated JSON feed parsing, tag-based timespan filtering, and user preference persistence.

## Responsibilities

- **Notification Feed Drawer**: Drawer UI displaying JSON Feed notifications and system announcements with relative timestamp formatting.
- **Unread Badge & Indicators**: Badge count for new/unread feed items and severity-colored indicators for active system messages.
- **System Announcements**: Support for CRUD operations (create, edit, delete) on admin system messages with severity levels (`info`, `warning`, `error`, `success`).
- **Zod-based Feed Validation**: Strict Zod schema validation (`JSON_FEED_SCHEMA`, `JSON_FEED_ITEM_SCHEMA`) for external RSS/JSON feeds with automatic HTML decoding and ISO date normalization.
- **Tag-based Timespan Filtering**: Configurable maximum age filtering by notification tags (`dev`, `service`, `community`, `stable`).
- **Preference Persistence**: Last-opened timestamp (`lastOpenedAt`) and tag-specific `maxAge` settings persisted automatically via `AppPreferenceStore`.

## Key Files

| File | Purpose |
| --- | --- |
| `notifications.components.tsx` | UI components (`Notifications`, `NotificationIconButton`, `AnnouncementSection`, `NotificationItem`, dialogs) |
| `notifications.hooks.tsx` | Custom hooks (`useNotificationFeed`, `useNotificationClose`, `useNotificationOpen`, `useNotificationNewCount`) |
| `notifications.models.ts` | Zod schemas (`JSON_FEED_SCHEMA`, `JSON_FEED_ITEM_SCHEMA`, etc.), TypeScript types, and HTML/date utilities |
| `notifications.utils.ts` | Feed processing, version comparison, service checking, max-age filtering, and network fetchers |
| `notifications.i18n.en.json` / `notifications.i18n.fr.json` | Translations for headers, actions, severities, and status messages |
| `index.ts` | Public API barrel export for components, hooks, models, schemas, and utilities |

## Exports

| Export | Type | Description |
| --- | --- | --- |
| `Notifications` | Component | Main wrapper rendering the icon button, announcement dialogs, and drawer |
| `NotificationIconButton` | Component | Appbar icon button with unread badge counter and severity styling |
| `AnnouncementSection` | Component | System message header, content display, and admin action controls |
| `useNotificationFeed` | Hook | Fetches feed URLs, executes service check queries, applies filtering rules, and hydrates state |
| `useNotificationClose` | Hook | Closes drawer, marks items as read, updates `lastOpenedAt` in preference store, and persists timestamp |
| `useNotificationOpen` | Hook | Opens the notification drawer |
| `useNotificationNewCount` | Hook | Returns count of unread (`_isNew`) notification items |
| `JSON_FEED_SCHEMA` | Schema | Root Zod schema for validating JSON Feed Version 1.1 documents |
| `JSON_FEED_ITEM_SCHEMA` | Schema | Zod schema for individual feed items with field preprocessing and date formatting |
| `applyLegacyNotificationRules` | Utility | Filters feed items by max age, admin role, version match, and service status |
| `parseJSONFeed` | Utility | Safe-parses raw JSON feed data through `JSON_FEED_SCHEMA` |
