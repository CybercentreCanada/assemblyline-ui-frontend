# `@tui/notis`

**Notifications** module for TemplateUI v4.

---

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Feed Data Model](#feed-data-model)
- [Custom Rendering](#custom-rendering)
- [Integration](#integration)
- [Troubleshooting](#troubleshooting)
- [Related Documentation](#related-documentation)

---

## Overview

This module provides:

- A notification **service provider** + **hook** so your app can supply feed URLs and/or a custom renderer
- A ready-to-use **TopNav notification button** + **right-side drawer** UI
- A default notification item renderer for JSON feed data
- Automatic "new" badge tracking using `localStorage`

Use this module when you want to display announcements, release notes, service updates, or other feed-based notifications to users.

Exports live in [`@tui/notis`](src/index.ts). The module i18n namespace constant is [`MODULE_NAME`](src/name.ts) (`tui.notis`).

---

## Installation

### 1) Configure npm registry

Create or update `~/.npmrc`:

```ini
@tui:registry=https://bagofholding.cse-cst.gc.ca/repository/npm-ap/
```

### 2) Install the package

```bash
pnpm add @tui/notis
```

---

## Quick Start

### 1) Register translations (required)

`@tui/notis` ships with built-in `en`/`fr` strings. Register them on your i18n instance **before** rendering any notification components:

```ts
import i18n from './i18n'; // your i18next instance
import { addTranslations as addNotisTranslations } from '@tui/notis';

addNotisTranslations(i18n);
```

Function: [`addTranslations`](src/i18n/index.ts)

---

### 2) Add the provider (required)

Mount [`AppNotificationServiceProvider`](src/providers/AppNotificationProvider.tsx) and pass an [`AppNotificationService`](src/AppNotificationService.ts):

```tsx
import type { PropsWithChildren } from 'react';
import { AppNotificationServiceProvider, type AppNotificationService } from '@tui/notis';

const notis: AppNotificationService = {
  feedUrls: ['https://discover.dev.analysis.cyber.gc.ca/icons/assemblyline/dev-testing.json']
};

export function MyAppProvider({ children }: PropsWithChildren) {
  return <AppNotificationServiceProvider service={notis}>{children}</AppNotificationServiceProvider>;
}
```

The template app uses this pattern in [`useMyNotification`](../template/app/hooks/useMyNotifications.tsx).

---

### 3) Render the notification button in your TopNav (recommended)

Add [`AppNotifications`](src/AppNotifications.tsx) to your TopNav's right-side slot:

```tsx
import { AppNotifications } from '@tui/notis';
import type { AppPreferenceConfigs } from '@tui/core';

export const preferences: AppPreferenceConfigs = {
  // ...existing preferences...
  topnav: {
    slots: {
      right: [<AppNotifications key="notis" />]
    }
  }
};
```

If you already have items in `slots.right` (theme picker, app switcher, etc.), append `<AppNotifications />` to the array.

---

## API Reference

### `AppNotificationServiceProvider`

The context provider that holds notification service configuration.

**Props:**

| Prop       | Type                     | Description                                                       |
| ---------- | ------------------------ | ----------------------------------------------------------------- |
| `service`  | `AppNotificationService` | Configuration object with feed URLs and optional custom renderer. |
| `children` | `ReactNode`              | Child components.                                                 |

**Example:**

```tsx
<AppNotificationServiceProvider service={{ feedUrls: ['/api/feed.json'] }}>
  <App />
</AppNotificationServiceProvider>
```

Source: [`AppNotificationServiceProvider`](src/providers/AppNotificationProvider.tsx)

---

### `AppNotificationService`

The configuration object for the notification service.

**Fields:**

| Field                  | Type                                          | Required | Description                                          |
| ---------------------- | --------------------------------------------- | -------- | ---------------------------------------------------- |
| `feedUrls`             | `string[]`                                    | No       | Array of JSON feed URLs to fetch notifications from. |
| `notificationRenderer` | `(props: ItemComponentProps) => ReactElement` | No       | Custom component to render each notification item.   |

**Example:**

```ts
const service: AppNotificationService = {
  feedUrls: ['https://example.com/announcements.json', 'https://example.com/releases.json']
};
```

Source: [`AppNotificationService`](src/AppNotificationService.ts)

---

### `AppNotifications`

The main UI component: renders a TopNav button that opens a notification drawer.

**Props:** None (reads from context via [`useAppNotification`](src/hooks/useAppNotification.tsx)).

**Behavior:**

- Fetches all configured feed URLs and merges items into a single list
- Displays a badge with count of "new" items
- Auto-opens drawer if new items exist (configurable)
- Marks items as "read" when drawer closes (persisted to `localStorage`)

**Example:**

```tsx
import { AppNotifications } from '@tui/notis';

export function TopNav() {
  return (
    <div>
      {/* other nav items */}
      <AppNotifications />
    </div>
  );
}
```

Source: [`AppNotifications`](src/AppNotifications.tsx)

---

### `useAppNotification`

Hook to access notification service and state.

**Returns:** [`AppNotificationServiceContextType`](src/providers/AppNotificationProvider.tsx)

| Field      | Type                          | Description                                      |
| ---------- | ----------------------------- | ------------------------------------------------ |
| `provided` | `boolean`                     | Whether a service was explicitly provided.       |
| `service`  | `AppNotificationService`      | The notification service configuration.          |
| `state`    | `AppNotificationServiceState` | Runtime state (URLs can be updated dynamically). |

**Example — Dynamic URL updates:**

```tsx
import { useEffect } from 'react';
import { useAppNotification } from '@tui/notis';

export function DynamicFeedLoader() {
  const { state } = useAppNotification();

  useEffect(() => {
    // Update feed URLs at runtime
    state.set({
      ...state,
      urls: ['/api/user-specific-feed.json']
    });
  }, []);

  return null;
}
```

Source: [`useAppNotification`](src/hooks/useAppNotification.tsx)

---

### `addTranslations`

Registers the module's i18n resources (`en`/`fr`) on your i18next instance.

**Signature:**

```ts
function addTranslations(i18n: i18n): void;
```

**Example:**

```ts
import i18n from './i18n';
import { addTranslations } from '@tui/notis';

addTranslations(i18n);
```

Source: [`addTranslations`](src/i18n/index.ts)

---

## Feed Data Model

The module expects JSON feeds following the [JSON Feed](https://www.jsonfeed.org/) specification (with some extensions).

### `Feed`

Top-level feed structure:

| Field      | Type           | Description                  |
| ---------- | -------------- | ---------------------------- |
| `version`  | `string`       | JSON Feed version.           |
| `title`    | `string`       | Feed title.                  |
| `feed_url` | `string`       | URL of the feed itself.      |
| `items`    | `FeedItem[]`   | Array of notification items. |
| `authors`  | `FeedAuthor[]` | Optional feed-level authors. |

Source: [`Feed`](src/FeedModels.ts)

---

### `FeedItem`

Individual notification item:

| Field            | Type           | Description                                              |
| ---------------- | -------------- | -------------------------------------------------------- |
| `id`             | `string`       | Unique identifier.                                       |
| `title`          | `string`       | Notification title.                                      |
| `url`            | `string`       | Link to full content.                                    |
| `date_published` | `Date`         | Publication date (used for sorting and "new" detection). |
| `content_html`   | `string`       | HTML content (sanitized before rendering).               |
| `content_text`   | `string`       | Plain text content.                                      |
| `content_md`     | `string`       | Markdown content.                                        |
| `image`          | `string`       | Optional image URL.                                      |
| `authors`        | `FeedAuthor[]` | Item authors.                                            |
| `tags`           | `string[]`     | Tags for categorization.                                 |
| `_isNew`         | `boolean`      | Internal flag set by the module.                         |

**Supported tags:**

| Tag       | Color            |
| --------- | ---------------- |
| `new`     | Info (blue)      |
| `current` | Success (green)  |
| `dev`     | Warning (orange) |
| `service` | Secondary        |
| `blog`    | Default          |

Source: [`FeedItem`](src/FeedModels.ts), [`TAG_COLOR`](src/elements/item/NotificationItemTag.tsx)

---

### `FeedAuthor`

Author information:

| Field    | Type     | Description              |
| -------- | -------- | ------------------------ |
| `name`   | `string` | Author name.             |
| `url`    | `string` | Author profile URL.      |
| `avatar` | `string` | Author avatar image URL. |

Source: [`FeedAuthor`](src/FeedModels.ts)

---

### Example Feed JSON

```json
{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "My App Announcements",
  "feed_url": "https://example.com/feed.json",
  "items": [
    {
      "id": "1",
      "title": "New Feature Released",
      "date_published": "2024-01-15T10:00:00Z",
      "content_text": "We've added a new dashboard feature.",
      "tags": ["new"],
      "authors": [
        {
          "name": "Dev Team",
          "avatar": "https://example.com/team-avatar.png"
        }
      ]
    }
  ]
}
```

---

## Custom Rendering

### Provide a custom notification item renderer

Override how each notification item is displayed by setting `notificationRenderer` on the service:

```tsx
import type { ReactElement } from 'react';
import { AppNotificationServiceProvider, type AppNotificationService, type ItemComponentProps } from '@tui/notis';
import { Typography, Card, CardContent } from '@mui/material';

function MyCustomNotificationItem({ item }: ItemComponentProps): ReactElement {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" color="textSecondary">
          {item?.date_published?.toLocaleDateString()}
        </Typography>
        <Typography variant="h6">{item?.title}</Typography>
        <Typography variant="body2">{item?.content_text}</Typography>
      </CardContent>
    </Card>
  );
}

const notis: AppNotificationService = {
  feedUrls: ['https://example.com/feed.json'],
  notificationRenderer: MyCustomNotificationItem
};

export function MyAppProvider({ children }: { children: React.ReactNode }) {
  return <AppNotificationServiceProvider service={notis}>{children}</AppNotificationServiceProvider>;
}
```

Type: [`ItemComponentProps`](src/AppNotificationService.ts)

---

### Default item renderer components

If you don't provide a custom renderer, the default [`NotificationItem`](src/elements/item/NotificationItem.tsx) is used, composed of:

| Component                                                                  | Description                           |
| -------------------------------------------------------------------------- | ------------------------------------- |
| [`NotificationItemDate`](src/elements/item/NotificationItemDate.tsx)       | Relative date (e.g., "2 days ago")    |
| [`NotificationItemTitle`](src/elements/item/NotificationItemTitle.tsx)     | Clickable title with "new" indicator  |
| [`NotificationItemContent`](src/elements/item/NotificationItemContent.tsx) | Renders HTML, Markdown, or plain text |
| [`NotificationItemImage`](src/elements/item/NotificationItemImage.tsx)     | Optional image                        |
| [`NotificationItemAuthor`](src/elements/item/NotificationItemAuthor.tsx)   | Author name and avatar                |
| [`NotificationItemTag`](src/elements/item/NotificationItemTag.tsx)         | Colored tag chips                     |

---

## Integration

### Recommended placement in TemplateUI v4

```tsx
import type { PropsWithChildren } from 'react';
import { AppNotificationServiceProvider } from '@tui/notis';
import { useMyNotification } from './hooks/useMyNotification';

export function MyAppProvider({ children }: PropsWithChildren) {
  const notis = useMyNotification();

  return <AppNotificationServiceProvider service={notis}>{children}</AppNotificationServiceProvider>;
}
```

See [docs/guides/configuration-guide.md](../../docs/guides/configuration-guide.md) for the recommended provider layering.

---

### Using a hook to define the service

A common pattern is to define the notification service in a dedicated hook:

```tsx
// hooks/useMyNotification.tsx
import type { AppNotificationService } from '@tui/notis';

export function useMyNotification(): AppNotificationService {
  return {
    feedUrls: ['https://example.com/announcements.json', 'https://example.com/releases.json']
  };
}
```

See the template implementation: [`useMyNotification`](../template/app/hooks/useMyNotifications.tsx).

---

## Troubleshooting

### No button appears in the TopNav

**Possible causes:**

1. **Provider not mounted** — Ensure [`AppNotificationServiceProvider`](src/providers/AppNotificationProvider.tsx) wraps your app.

2. **No feed URLs configured** — The component doesn't render if `feedUrls` is empty:

   ```tsx
   const notis: AppNotificationService = {
     feedUrls: [] // ❌ Empty — nothing will render
   };
   ```

3. **Not rendered in TopNav** — Ensure you added `<AppNotifications />` to `topnav.slots.right`.

---

### Drawer opens but shows an error

**Cause:** The feed returned no usable items or the request failed.

**Solution:**

1. Check browser DevTools Network tab for failed requests
2. Verify the feed URL is accessible (CORS configured)
3. Ensure the feed returns valid JSON matching the expected schema
4. Check that items have `date_published` within the last year (older items are filtered out)

---

### Missing translation keys

**Cause:** Translations were not registered before rendering.

**Solution:** Call [`addTranslations`](src/i18n/index.ts) during app initialization:

```ts
import { addTranslations } from '@tui/notis';
addTranslations(i18n);
```

---

### "New" badges never reset

**Cause:** The "last opened" timestamp is stored in `localStorage` under `notification.lastTimeOpen`.

**Solution:**

1. Verify `localStorage` is accessible (not blocked by browser settings)
2. Clear `localStorage` to reset: `localStorage.removeItem('notification.lastTimeOpen')`
3. Check that the feed items have valid `date_published` values

---

### Items appear in wrong order

**Cause:** Items are sorted by `date_published` descending (newest first).

**Solution:** Ensure your feed items have accurate `date_published` values in ISO 8601 format:

```json
{
  "date_published": "2024-01-15T10:00:00Z"
}
```

---

### Custom renderer not being used

**Cause:** `notificationRenderer` is not set correctly on the service.

**Solution:** Verify the function signature matches [`ItemComponentProps`](src/AppNotificationService.ts):

```tsx
// ✅ Correct signature
const renderer = ({ item }: ItemComponentProps): ReactElement => {
  return <div>{item?.title}</div>;
};

const service: AppNotificationService = {
  feedUrls: [...],
  notificationRenderer: renderer,
};
```

---

## Related Documentation

- [Configuration Guide](../../docs/guides/configuration-guide.md) — How to configure your TemplateUI app
- [JSON Feed Specification](https://www.jsonfeed.org/) — Feed format reference
- [@tui/core](../core/README.md) — Core module documentation
- [@tui/drawer](../drawer/README.md) — Drawer module
- [@tui/a11y](../a11y/README.md) — Accessibility module
- [@tui/apps](../apps/README.md) — App switcher module
- [@tui/classi](../classi/README.md) — Classification module
