# `@tui/notis`

Notifications module for TemplateUI v4.

This module adds a bell to the top navigation and a drawer behind it, filled from one or more JSON feeds. Use it for
announcements, release notes, and service updates — anything you want to tell users about without emailing them.

You publish a feed; the module fetches it, merges it with any others, sorts it, tracks which items the user has
already seen, and badges the button when something is new.

The module namespace is `tui.notis` — see [MODULE_NAME](src/name.ts). Everything public is exported from
[src/index.ts](src/index.ts).

## Install

Point npm at the BoH registry:

```ini
# ~/.npmrc
@tui:registry=https://bagofholding.cse-cst.gc.ca/repository/npm-ap/
```

Then install:

```bash
pnpm add @tui/notis
```

## Setting it up

### Register translations

The module ships `en` and `fr` strings. Register them on your i18n instance before anything renders, or the drawer will
show raw keys:

```ts
import { addTranslations as addNotisTranslations } from '@tui/notis';
import i18n from './i18n';

addNotisTranslations(i18n);
```

### Describe the service and mount the provider

The service object is where you list your feeds. Keeping it in a hook makes it easy to vary the feeds per user or
environment later:

```tsx
// hooks/useMyNotifications.tsx
import type { AppNotificationService } from '@tui/notis';

export const useMyNotifications = (): AppNotificationService => ({
  feedUrls: ['https://example.com/announcements.json', 'https://example.com/releases.json']
});
```

Then mount the provider with your other module providers, between `AppRoot` and `AppProvider` — see
[Optional modules](../../docs/configuration.md#optional-modules):

```tsx
import { AppNotificationServiceProvider } from '@tui/notis';
import type { PropsWithChildren } from 'react';
import { useMyNotifications } from './hooks/useMyNotifications';

export const MyAppProvider = ({ children }: PropsWithChildren) => {
  const notis = useMyNotifications();

  return <AppNotificationServiceProvider service={notis}>{children}</AppNotificationServiceProvider>;
};
```

The template app follows this pattern in [useMyNotifications](../template/app/hooks/useMyNotifications.tsx).

### Render the button

`AppNotifications` reads everything from context. Add it to a top-nav right-side slot:

```tsx
import type { AppPreferenceConfigs } from '@tui/core';
import { AppNotifications } from '@tui/notis';

export const preferences: AppPreferenceConfigs = {
  topnav: {
    slots: {
      right: [<AppNotifications key="notis" />]
    }
  }
};
```

## The feed format

Feeds follow the [JSON Feed](https://www.jsonfeed.org/) specification. A minimal one looks like this:

```json
{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "My App Announcements",
  "feed_url": "https://example.com/feed.json",
  "items": [
    {
      "id": "1",
      "title": "New feature released",
      "date_published": "2024-01-15T10:00:00Z",
      "content_text": "We've added a new dashboard feature.",
      "tags": ["new"],
      "authors": [{ "name": "Dev Team", "avatar": "https://example.com/team-avatar.png" }]
    }
  ]
}
```

`date_published` does more work than it looks: items are sorted by it, "new" is decided from it, and items older than a
year are dropped. Use ISO 8601.

Each item can carry `content_html`, `content_md`, or `content_text` — the default renderer handles all three, and HTML
is sanitized before it is rendered. `image`, `authors`, and `tags` are optional.

Five tag values are recognised and coloured: `new` (blue), `current` (green), `dev` (orange), `service` (secondary),
and `blog` (default). Other tags still render, in the default colour.

The full shapes are in [FeedModels.ts](src/FeedModels.ts).

## How "new" is tracked

The module records when the user last opened the drawer in `localStorage`, under `notification.lastTimeOpen`. Anything
published after that timestamp counts as new and contributes to the badge; opening the drawer resets it.

This is one of the few places in TemplateUI that uses `localStorage` rather than a cookie, because the value is not
needed to render the first paint.

## Rendering items yourself

If the default item layout does not fit, pass your own component as `notificationRenderer` on the service. It receives
one `item` prop:

```tsx
import { Card, CardContent, Typography } from '@mui/material';
import type { AppNotificationService, ItemComponentProps } from '@tui/notis';

const MyNotificationItem = ({ item }: ItemComponentProps) => (
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

export const service: AppNotificationService = {
  feedUrls: ['https://example.com/feed.json'],
  notificationRenderer: MyNotificationItem
};
```

Otherwise the default [NotificationItem](src/elements/item/NotificationItem.tsx) is used, built from smaller pieces you
can also read for reference: the relative date, the clickable title with its new indicator, the content, the image, the
author, and the tag chips — all under [src/elements/item](src/elements/item).

To change feeds at runtime, use `useAppNotification` — see the
[notifications hooks reference](../../docs/reference/hooks/notis.md).

## Troubleshooting

| Symptom                      | Likely cause                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| No bell in the top nav       | `feedUrls` is empty, the provider is not mounted, or the button was never added to a slot |
| The drawer shows an error    | The request failed or the feed is not valid JSON — check the Network tab and CORS         |
| The drawer is empty          | Every item is older than a year, or `date_published` is missing or unparseable            |
| Raw translation keys         | `addTranslations` was never called, or ran after the first render                         |
| Badges never clear           | `localStorage` is blocked; clear `notification.lastTimeOpen` to reset                     |
| Items in the wrong order     | `date_published` is missing or not ISO 8601 — sorting is newest first                     |
| A custom renderer is ignored | It is not set on the same service object passed to the provider                           |

## Related

- **[Notifications hooks reference](../../docs/reference/hooks/notis.md)** — the `useAppNotification` signature.
- **[Configuration](../../docs/configuration.md)** — where module providers and top-nav slots belong.
- **[JSON Feed specification](https://www.jsonfeed.org/)** — the feed format this module consumes.
- **[useMyNotifications](../template/app/hooks/useMyNotifications.tsx)** — a working example in the template app.
