# `@tui/apps`

**App Switcher** module for TemplateUI v4.

---

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Integration](#integration)
- [Troubleshooting](#troubleshooting)
- [Related Documentation](#related-documentation)

---

## Overview

This module provides:

- A context **provider** that holds the list of switchable apps
- An **App Switcher** UI component (icon button + popper menu)
- A **hook** to read/update the app list at runtime

Use this module when your application is part of a suite of related apps and you want users to quickly navigate between them.

Exports live in [`@tui/apps`](src/index.ts). The module namespace constant is [`MODULE_NAME`](src/name.ts) (`tui.apps`).

---

## Installation

### 1) Configure npm registry

Create or update `~/.npmrc`:

```ini
@tui:registry=https://bagofholding.cse-cst.gc.ca/repository/npm-ap/
```

### 2) Install the package

```bash
pnpm add @tui/apps
```

---

## Quick Start

### 1) Add the provider (required)

Mount [`AppSwitcherProvider`](src/providers/AppSwitcherProvider.tsx) above any component that renders [`AppSwitcher`](src/elements/AppSwitcher.tsx):

```tsx
import type { PropsWithChildren } from 'react';
import { AppSwitcherProvider, type AppSwitcherItem } from '@tui/apps';

const apps: AppSwitcherItem[] = [
  {
    alt: 'AL',
    name: 'Assemblyline',
    img_d: '/branding/assemblyline/swoosh-dark.svg',
    img_l: '/branding/assemblyline/swoosh-light.svg',
    route: '/assemblyline'
  },
  {
    alt: 'Docs',
    name: 'Documentation',
    img_d: '/branding/docs/dark.svg',
    img_l: '/branding/docs/light.svg',
    route: 'https://example.com/docs',
    newWindow: true
  }
];

export function MyAppProvider({ children }: PropsWithChildren) {
  return <AppSwitcherProvider apps={apps}>{children}</AppSwitcherProvider>;
}
```

The template app demonstrates this pattern in [`useMyApps`](../template/app/hooks/useMyApps.tsx).

---

### 2) Render the switcher in the TopNav (recommended)

Add [`AppSwitcher`](src/elements/AppSwitcher.tsx) to your TopNav's right-side slot:

```tsx
import { AppSwitcher } from '@tui/apps';
import type { AppPreferenceConfigs } from '@tui/core';

export const preferences: AppPreferenceConfigs = {
  // ...existing preferences...
  topnav: {
    // ...existing topnav config...
    slots: {
      right: [<AppSwitcher key="app-switcher" />]
    }
  }
};
```

If you already have items in `slots.right` (theme picker, notifications, etc.), append `<AppSwitcher />` to the array.

---

## API Reference

### `AppSwitcherProvider`

The context provider that holds the app list.

**Props:**

| Prop       | Type                | Description                                      |
| ---------- | ------------------- | ------------------------------------------------ |
| `apps`     | `AppSwitcherItem[]` | Initial list of apps to display in the switcher. |
| `children` | `ReactNode`         | Child components.                                |

**Behavior:**

- If the list is empty, [`AppSwitcher`](src/elements/AppSwitcher.tsx) renders nothing.
- The provider tracks an `empty` flag internally (see source: [`AppSwitcherProvider`](src/providers/AppSwitcherProvider.tsx)).

**Example:**

```tsx
<AppSwitcherProvider apps={myApps}>
  <App />
</AppSwitcherProvider>
```

---

### `AppSwitcher`

The UI component: an icon button that opens a popper menu of apps.

**Props:** None (reads from context).

**Behavior:**

- Renders a grid icon button (from `@mui/icons-material`)
- Opens a `Popper` menu on click
- Closes on click-away
- Automatically uses `img_d` or `img_l` based on the current MUI theme mode
- Responsive: uses smaller max-width at small breakpoints

**Example:**

```tsx
import { AppSwitcher } from '@tui/apps';

export function TopNav() {
  return (
    <div>
      {/* other nav items */}
      <AppSwitcher />
    </div>
  );
}
```

---

### `useAppSwitcher`

Hook to read and update the app list at runtime.

**Returns:**

| Field      | Type                                          | Description                |
| ---------- | --------------------------------------------- | -------------------------- |
| `items`    | `AppSwitcherItem[]`                           | Current list of apps.      |
| `setItems` | `Dispatch<SetStateAction<AppSwitcherItem[]>>` | Update the app list.       |
| `empty`    | `boolean`                                     | Whether the list is empty. |

**Example — Add an app dynamically:**

```tsx
import { useEffect } from 'react';
import { useAppSwitcher, type AppSwitcherItem } from '@tui/apps';

export function DynamicAppLoader() {
  const { items, setItems } = useAppSwitcher();

  useEffect(() => {
    // Fetch apps from an API or add conditionally
    const newApp: AppSwitcherItem = {
      alt: 'New',
      name: 'New App',
      img_d: '/branding/new/dark.svg',
      img_l: '/branding/new/light.svg',
      route: '/new-app'
    };

    if (!items.some(app => app.route === newApp.route)) {
      setItems(prev => [...prev, newApp]);
    }
  }, [items, setItems]);

  return null;
}
```

---

### `AppSwitcherItem`

The shape of an app entry in the switcher.

**Fields:**

| Field       | Type                     | Required | Description                                    |
| ----------- | ------------------------ | -------- | ---------------------------------------------- |
| `alt`       | `string`                 | Yes      | Avatar alt text (often a short abbreviation).  |
| `name`      | `string`                 | Yes      | Display name shown in the menu.                |
| `img_d`     | `ReactElement \| string` | Yes      | Icon/image for dark mode.                      |
| `img_l`     | `ReactElement \| string` | Yes      | Icon/image for light mode.                     |
| `route`     | `string`                 | Yes      | Navigation target (relative path or full URL). |
| `newWindow` | `boolean`                | No       | If `true`, opens in a new tab/window.          |

**Example:**

```ts
const app: AppSwitcherItem = {
  alt: 'AL',
  name: 'Assemblyline',
  img_d: '/branding/assemblyline/swoosh-dark.svg',
  img_l: '/branding/assemblyline/swoosh-light.svg',
  route: '/assemblyline'
};
```

---

## Integration

### Recommended placement in TemplateUI v4

If your app follows the recommended layering in [docs/guides/configuration-guide.md](../../docs/guides/configuration-guide.md):

1. Mount [`AppSwitcherProvider`](src/providers/AppSwitcherProvider.tsx) alongside other optional module providers (drawer, notis, a11y, classi) in your `MyAppProvider`.

2. Render [`AppSwitcher`](src/elements/AppSwitcher.tsx) in the TopNav via preferences.

```tsx
import type { PropsWithChildren } from 'react';
import { AppDrawerProvider } from '@tui/drawer';
import { AppSwitcherProvider } from '@tui/apps';
import { useMyApps } from './hooks/useMyApps';

export function MyAppProvider({ children }: PropsWithChildren) {
  const apps = useMyApps();

  return (
    <AppDrawerProvider>
      <AppSwitcherProvider apps={apps}>{children}</AppSwitcherProvider>
    </AppDrawerProvider>
  );
}
```

### Using a hook to define apps

A common pattern is to define the app list in a dedicated hook (easier to maintain and test):

```tsx
// hooks/useMyApps.tsx
import type { AppSwitcherItem } from '@tui/apps';

export function useMyApps(): AppSwitcherItem[] {
  return [
    {
      alt: 'AL',
      name: 'Assemblyline',
      img_d: '/branding/assemblyline/swoosh-dark.svg',
      img_l: '/branding/assemblyline/swoosh-light.svg',
      route: '/assemblyline'
    },
    {
      alt: 'HW',
      name: 'Howler',
      img_d: '/branding/howler/swoosh-dark.svg',
      img_l: '/branding/howler/swoosh-light.svg',
      route: '/howler'
    }
  ];
}
```

See the template implementation: [`useMyApps`](../template/app/hooks/useMyApps.tsx).

---

## Troubleshooting

### Switcher doesn't show up

**Possible causes:**

1. **Provider not mounted** — Ensure [`AppSwitcherProvider`](src/providers/AppSwitcherProvider.tsx) is mounted above components rendering [`AppSwitcher`](src/elements/AppSwitcher.tsx).

2. **Empty list** — The switcher renders nothing when `apps` is empty. Verify your list has items:

   ```tsx
   const { items } = useAppSwitcher();
   console.log('App count:', items.length);
   ```

3. **Not rendered in TopNav** — Ensure you added `<AppSwitcher />` to `topnav.slots.right` in your preferences.

---

### Icons don't render

**Cause:** Invalid `img_d` or `img_l` values.

**Solution:** Ensure:

- Paths are valid and accessible (e.g., `/branding/app/dark.svg` exists in your `public/` folder)
- If using React elements, they render correctly on their own

---

### Clicking an app does nothing

**Cause:** The `route` value may be invalid or navigation isn't set up.

**Solution:**

- For internal routes, ensure your router handles the path
- For external URLs, ensure they start with `http://` or `https://`
- If opening in a new window, set `newWindow: true`

---

### Menu doesn't close after selecting an app

**Cause:** This is expected behavior for internal navigation—the component closes on click-away, not on selection.

**Solution:** If you need custom close behavior, use [`useAppSwitcher`](src/hooks/useAppSwitcher.tsx) and manage state manually.

---

## Related Documentation

- [Configuration Guide](../../docs/guides/configuration-guide.md) — How to configure your TemplateUI app
- [@tui/core](../core/README.md) — Core module documentation
- [@tui/drawer](../drawer/README.md) — Drawer module
- [@tui/a11y](../a11y/README.md) — Accessibility module
- [@tui/classi](../classi/README.md) — Classification module
- [@tui/notis](../notis/README.md) — Notifications module
