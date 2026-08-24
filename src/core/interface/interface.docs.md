# core/interface

Application-wide UI interface state store. Holds ephemeral session state for global UI concerns — panel visibility, modal states, loading indicators, and cross-module coordination flags. Resets on page refresh or logout.

## Responsibilities

- Global ephemeral UI state (drawer open/closed, usermenu visibility, notification panel state)
- Store creation via `createAppStore` factory with devtools integration
- Provider for mounting the store at the app root
- Selector-based subscriptions to prevent unnecessary re-renders

## Key Files

- `interface.providers.tsx` — `AppInterfaceStoreProvider`, `useAppInterfaceStore`, `useAppSetInterfaceStore`
- `index.ts` — Public API barrel exports

## Architecture

The interface store is distinct from:

- **AppConfig** — Read-only backend data (user, configuration, classification)
- **AppPreference** — User-controlled persistent preferences (theme, language, density)
- **Module stores** — Feature-scoped state (route store, form store)

The interface store holds **session/runtime state** that is:

- Ephemeral (not persisted to localStorage or backend)
- Global (shared across modules — e.g., notifications, usermenu, auth mode)
- UI-focused (controls visibility, loading, and interaction states)

## Store Shape

The `AppInterface` type (declared globally in `app/core.interface.tsx`) defines the store shape. Example fields:

- `notifications.open` — Notification drawer visibility
- `notifications.items` — Fetched notification feed items
- `notifications.loading` — Feed loading state
- `usermenu.open` — User profile popover visibility
- `auth.mode` — Current auth screen (`'login'` | `'logout'` | `'locked'` | etc.)
- `quota.api` / `quota.submission` — Remaining quota counts

## Usage

```typescript
import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';

// Read with selector
const isOpen = useAppInterfaceStore(s => s.notifications.open);

// Write with immer-style updater
const setInterface = useAppSetInterfaceStore();
setInterface(s => {
  s.notifications.open = true;
  return s;
});
```
