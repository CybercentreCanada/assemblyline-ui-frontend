# `@tui/apps`

App Switcher module for **TemplateUI v4**.

This module provides:

- [`AppSwitcherProvider`](packages/apps/src/providers/AppSwitcherProvider.tsx) — holds the app list in context
- [`AppSwitcher`](packages/apps/src/elements/AppSwitcher.tsx) — top-nav button + popper menu UI
- [`useAppSwitcher`](packages/apps/src/hooks/useAppSwitcher.tsx) — access/update switcher items at runtime
- Type [`AppSwitcherItem`](packages/apps/src/index.ts) — the shape of a switcher entry

Exports live in [`@tui/apps`](packages/apps/src/index.ts). The module namespace constant is [`MODULE_NAME`](packages/apps/src/name.ts) (`tui.apps`).

---

## Installation

Create a `.npmrc` under `$HOME`:

```ini
@tui:registry=https://bagofholding.cse-cst.gc.ca/repository/npm-ap/
```

Install:

```bash
pnpm add @tui/apps
```

---

## Quick start

### 1) Provide the list of apps (required)

Mount [`AppSwitcherProvider`](packages/apps/src/providers/AppSwitcherProvider.tsx) above any component that renders [`AppSwitcher`](packages/apps/src/elements/AppSwitcher.tsx):

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

The template app uses this pattern via [`useMyApps`](packages/template/app/hooks/useMyApps.tsx) and mounts the provider in [packages/template/app/root.tsx](packages/template/app/root.tsx).

---

### 2) Render the switcher in the TopNav (recommended)

TemplateUI’s `AppBar` exposes configurable slots through preferences (see [`AppTopNavConfigs.slots`](packages/core/src/app/AppConfigs.ts) and how `AppBar` renders `topnav.slots?.right` in [`AppBar`](packages/core/src/topnav/AppBar.tsx)).

Add [`AppSwitcher`](packages/apps/src/elements/AppSwitcher.tsx) into your app preferences `topnav.slots.right`:

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

If you already have right-side items (theme picker, notifications, etc.), just append `<AppSwitcher />` to that array.

---

## API

### `AppSwitcherProvider`

Export: [`AppSwitcherProvider`](packages/apps/src/index.ts)
Source: [`AppSwitcherProvider`](packages/apps/src/providers/AppSwitcherProvider.tsx)

Props:

- `apps?: AppSwitcherItem[]` — initial list of apps
- `children: ReactNode`

Behavior notes:

- If the list is empty, the switcher UI won’t render (see `empty` logic in [`AppSwitcherProvider`](packages/apps/src/providers/AppSwitcherProvider.tsx) and guard in [`AppSwitcher`](packages/apps/src/elements/AppSwitcher.tsx)).

---

### `AppSwitcher`

Export: [`AppSwitcher`](packages/apps/src/index.ts)
Source: [`AppSwitcher`](packages/apps/src/elements/AppSwitcher.tsx)

Renders an icon button (apps grid icon) that opens a `Popper` menu of configured apps.

Notable behavior (see source):

- Closes on click-away
- Uses responsive layout (smaller max width at small breakpoints)
- Uses `img_d`/`img_l` based on the current MUI theme mode

---

### `useAppSwitcher`

Export: [`useAppSwitcher`](packages/apps/src/index.ts)
Source: [`useAppSwitcher`](packages/apps/src/hooks/useAppSwitcher.tsx)

Use this to read/update the list at runtime:

```tsx
import { useEffect } from 'react';
import { useAppSwitcher, type AppSwitcherItem } from '@tui/apps';

export function SwitcherUpdater() {
  const { items, setItems } = useAppSwitcher();

  useEffect(() => {
    const extra: AppSwitcherItem = {
      alt: 'New',
      name: 'New App',
      img_d: '/branding/new/dark.svg',
      img_l: '/branding/new/light.svg',
      route: '/new'
    };

    if (!items.some(i => i.route === extra.route)) {
      setItems([...items, extra]);
    }
  }, [items, setItems]);

  return null;
}
```

---

### `AppSwitcherItem`

Exported type: [`AppSwitcherItem`](packages/apps/src/index.ts)

Fields:

- `alt: string` — avatar alt text (and often short label)
- `name: string` — display name
- `img_d: ReactElement | string` — dark-mode icon/image
- `img_l: ReactElement | string` — light-mode icon/image
- `route: string` — navigation target
- `newWindow?: boolean` — open in a new tab/window

---

## Suggested integration point in a TemplateUI v4 app

If your app follows the recommended layering in [docs/guides/configuration-guide.md](docs/guides/configuration-guide.md):

1. Mount [`AppSwitcherProvider`](packages/apps/src/providers/AppSwitcherProvider.tsx) alongside other optional module providers (drawer/notis/a11y/classi) in your `MyAppProvider`.
2. Render [`AppSwitcher`](packages/apps/src/elements/AppSwitcher.tsx) in the TopNav via preferences using [`AppTopNavConfigs.slots`](packages/core/src/app/AppConfigs.ts).

---

## Troubleshooting

- **Switcher doesn’t show up**:
  - Ensure [`AppSwitcherProvider`](packages/apps/src/providers/AppSwitcherProvider.tsx) is mounted above the TopNav.
  - Ensure the list isn’t empty (`apps` prop or `setItems`).
  - Ensure you actually rendered [`AppSwitcher`](packages/apps/src/elements/AppSwitcher.tsx) (typically via `topnav.slots.right`).
- **Icons don’t render**: confirm your `img_d`/`img_l` values are valid URLs/paths or React elements (type: [`AppSwitcherItem`](packages/apps/src/index.ts)).
